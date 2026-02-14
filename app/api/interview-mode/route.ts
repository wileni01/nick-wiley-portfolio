import { z } from "zod";
import { generateText } from "ai";
import {
  applyResolvedAIProviderHeaders,
  getModel,
  resolveAIProvider,
} from "@/lib/ai";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import { buildApiRequestContext } from "@/lib/api-request-context";
import { logServerError, logServerInfo, logServerWarning } from "@/lib/server-error";
import { sanitizeInput } from "@/lib/utils";
import {
  buildDeterministicNarrative,
  getInterviewRecommendationBundle,
} from "@/lib/adaptive/recommendations";
import { getCompanyProfileById, getPersonaById } from "@/lib/adaptive/profiles";
import type { InterviewModeResponse } from "@/lib/adaptive/types";

const requestSchema = z.object({
  companyId: z.enum(["kungfu-ai", "anthropic"]),
  personaId: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/),
  provider: z.enum(["openai", "anthropic"]).default("openai"),
  contextNote: z.string().max(400).optional(),
});
const INTERVIEW_MODE_RATE_LIMIT = {
  maxRequests: 40,
  windowMs: 3600000,
} as const;
const AI_NARRATIVE_TIMEOUT_MS = 9000;
type NarrativeFallbackReason =
  | "none"
  | "no_provider"
  | "generation_error"
  | "generation_timeout"
  | "empty_ai_output";

const responseSchema = z.object({
  mode: z.object({
    companyId: z.enum(["kungfu-ai", "anthropic"]),
    personaId: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/),
  }),
  companyName: z.string().min(1).max(120),
  personaName: z.string().min(1).max(120),
  personaRole: z.string().min(1).max(120),
  deterministicNarrative: z.string().min(1).max(1200),
  aiNarrative: z.string().max(1200).optional(),
  narrativeSource: z.enum(["deterministic", "ai"]),
  recommendations: z
    .array(
      z.object({
        title: z.string().min(1).max(180),
        url: z
          .string()
          .max(400)
          .regex(/^(\/(?!\/)|https:\/\/)/i),
        kind: z.enum(["work", "writing", "project", "resume", "page"]),
        reason: z.string().min(1).max(400),
      })
    )
    .max(8),
  supportingRecommendations: z
    .array(
      z.object({
        title: z.string().min(1).max(180),
        url: z
          .string()
          .max(400)
          .regex(/^(\/(?!\/)|https:\/\/)/i),
        kind: z.enum(["work", "writing", "project", "resume", "page"]),
        reason: z.string().min(1).max(400),
      })
    )
    .max(8),
  talkingPoints: z.array(z.string().min(1).max(400)).max(8),
});

function sanitizeRecommendationUrl(url: string): string {
  const normalized = url.trim().slice(0, 400);
  if (!normalized) return "/";
  if (normalized.startsWith("/") && !normalized.startsWith("//")) {
    return normalized;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:") return "/";
    if (parsed.username || parsed.password) return "/";
    return parsed.toString().slice(0, 400);
  } catch {
    return "/";
  }
}

function isAbortLikeError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || error.name === "TimeoutError";
}

export async function POST(req: Request) {
  const context = buildApiRequestContext({
    req,
    rateLimitNamespace: "interview-mode",
    rateLimitConfig: INTERVIEW_MODE_RATE_LIMIT,
  });
  const { requestId, responseHeaders, exceededHeaders, rateLimitResult } = context;
  responseHeaders.set("X-AI-Narrative-Source", "deterministic");
  responseHeaders.set("X-AI-Narrative-Fallback", "none");
  exceededHeaders.set("X-AI-Narrative-Source", "deterministic");
  exceededHeaders.set("X-AI-Narrative-Fallback", "rate_limited");
  try {
    if (!rateLimitResult.success) {
      return jsonResponse(
        {
          error: "Rate limit exceeded. Please try again shortly.",
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000),
        },
        429,
        exceededHeaders
      );
    }

    const parsed = await parseJsonRequest(req, requestSchema, {
      invalidPayloadMessage: "Invalid interview mode payload.",
      invalidContentTypeMessage:
        "Interview mode requests must use application/json.",
      emptyBodyMessage: "Interview mode payload is required.",
      maxChars: 10000,
      tooLargeMessage: "Interview mode payload is too large.",
      responseHeaders,
      allowMissingContentType: false,
    });
    if (!parsed.success) {
      return parsed.response;
    }

    const { companyId, personaId, provider } = parsed.data;
    const providerResolution = resolveAIProvider(provider);
    applyResolvedAIProviderHeaders(responseHeaders, providerResolution);
    responseHeaders.set(
      "X-AI-Narrative-Fallback",
      providerResolution.selected ? "none" : "no_provider"
    );
    const executionProvider = providerResolution.selected;
    const contextNote = sanitizeInput(parsed.data.contextNote ?? "", 300);

    const company = getCompanyProfileById(companyId);
    const persona = getPersonaById(companyId, personaId);
    const bundle = getInterviewRecommendationBundle(companyId, personaId);

    if (!company || !persona || !bundle) {
      return jsonResponse(
        { error: "Unknown company or interviewer persona." },
        400,
        responseHeaders
      );
    }

    const deterministicNarrative = sanitizeInput(
      buildDeterministicNarrative(companyId, personaId),
      1200
    );

    let aiNarrative: string | undefined;
    let narrativeSource: "deterministic" | "ai" = "deterministic";
    let narrativeFallbackReason: NarrativeFallbackReason = executionProvider
      ? "none"
      : "no_provider";
    if (!executionProvider) {
      logServerInfo({
        route: "api/interview-mode",
        requestId,
        message: "No AI provider available; using deterministic narrative",
        details: {
          requestedProvider: providerResolution.requested,
        },
      });
    }

    if (executionProvider) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_NARRATIVE_TIMEOUT_MS);
      try {
        const topRecommendations = bundle.topRecommendations
          .slice(0, 4)
          .map(
            (recommendation) =>
              `- ${recommendation.asset.title} (${recommendation.asset.kind}): ${recommendation.reason}`
          )
          .join("\n");

        const { text } = await generateText({
          model: getModel(executionProvider),
          abortSignal: controller.signal,
          temperature: 0.2,
          maxTokens: 320,
          system: `You are generating a focused interviewer briefing for Nick Wiley's portfolio.
Rules:
- Use only provided facts.
- Do not invent achievements or links.
- Keep output concise and practical.
- Return plain text only.`,
          prompt: `Target company: ${company.name}
Interviewer: ${persona.name} (${persona.role})
Persona goal: ${persona.recommendationGoal}
Company priorities: ${company.priorityTags.join(", ")}
Top recommendations:
${topRecommendations}
${contextNote ? `Extra context from user: ${contextNote}` : ""}

Write two short paragraphs:
1) Why these artifacts are relevant for this interviewer.
2) How Nick should frame this conversation.`,
        });

        const cleaned = sanitizeInput(text, 1200);
        if (cleaned) {
          aiNarrative = cleaned;
          narrativeSource = "ai";
          narrativeFallbackReason = "none";
        } else {
          narrativeFallbackReason = "empty_ai_output";
          logServerWarning({
            route: "api/interview-mode",
            requestId,
            message:
              "AI narrative generation returned empty content; falling back to deterministic narrative",
            details: {
              provider: executionProvider,
            },
          });
        }
      } catch (error) {
        narrativeFallbackReason = isAbortLikeError(error)
          ? "generation_timeout"
          : "generation_error";
        logServerWarning({
          route: "api/interview-mode",
          requestId,
          message: "AI narrative generation failed; falling back to deterministic narrative",
          details: {
            provider: executionProvider,
            fallbackReason: narrativeFallbackReason,
            error,
          },
        });
        narrativeSource = "deterministic";
      } finally {
        clearTimeout(timeoutId);
      }
    }
    responseHeaders.set("X-AI-Narrative-Source", narrativeSource);
    if (narrativeFallbackReason !== "none") {
      responseHeaders.set("X-AI-Narrative-Fallback", narrativeFallbackReason);
    } else {
      responseHeaders.set("X-AI-Narrative-Fallback", "none");
    }

    const response: InterviewModeResponse = {
      mode: { companyId, personaId },
      companyName: sanitizeInput(company.name, 120),
      personaName: sanitizeInput(persona.name, 120),
      personaRole: sanitizeInput(persona.role, 120),
      deterministicNarrative,
      aiNarrative,
      narrativeSource,
      recommendations: bundle.topRecommendations.slice(0, 8).map((recommendation) => ({
        title: sanitizeInput(recommendation.asset.title, 180),
        url: sanitizeRecommendationUrl(recommendation.asset.url),
        kind: recommendation.asset.kind,
        reason: sanitizeInput(recommendation.reason, 400),
      })),
      supportingRecommendations: bundle.supportingRecommendations.map(
        (recommendation) => ({
          title: sanitizeInput(recommendation.asset.title, 180),
          url: sanitizeRecommendationUrl(recommendation.asset.url),
          kind: recommendation.asset.kind,
          reason: sanitizeInput(recommendation.reason, 400),
        })
      ),
      talkingPoints: bundle.talkingPoints
        .slice(0, 8)
        .map((point) => sanitizeInput(point, 400))
        .filter(Boolean),
    };
    const validatedResponse = responseSchema.safeParse(response);
    if (!validatedResponse.success) {
      logServerWarning({
        route: "api/interview-mode",
        requestId,
        message: "Interview-mode response validation failed",
        details: {
          issues: validatedResponse.error.issues.slice(0, 5),
        },
      });
      return jsonResponse(
        {
          error:
            "Could not build interview briefing response. Please retry with deterministic recommendations.",
        },
        500,
        responseHeaders
      );
    }

    return jsonResponse(validatedResponse.data, 200, responseHeaders);
  } catch (error) {
    logServerError({
      route: "api/interview-mode",
      requestId,
      error,
    });
    return jsonResponse(
      {
        error:
          "Could not generate interview briefing. Please retry or use deterministic recommendations.",
      },
      500,
      responseHeaders
    );
  }
}
