import { z } from "zod";
import { generateText } from "ai";
import {
  applyResolvedAIProviderHeaders,
  getModel,
  resolveAIProvider,
} from "@/lib/ai";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import {
  buildApiResponseHeaders,
} from "@/lib/api-rate-limit";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createRequestId } from "@/lib/request-id";
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
          .regex(/^(\/|https?:\/\/)/i),
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
          .regex(/^(\/|https?:\/\/)/i),
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
  return /^(\/|https?:\/\/)/i.test(normalized) ? normalized : "/";
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  let responseHeaders = new Headers({ "X-Request-Id": requestId });
  try {
    const ip = getRequestIp(req);

    const limit = rateLimit(`interview-mode:${ip}`, INTERVIEW_MODE_RATE_LIMIT);
    responseHeaders = buildApiResponseHeaders({
      config: INTERVIEW_MODE_RATE_LIMIT,
      snapshot: limit,
      requestId,
    });

    if (!limit.success) {
      return jsonResponse(
        {
          error: "Rate limit exceeded. Please try again shortly.",
          resetIn: Math.ceil(limit.resetIn / 1000),
        },
        429,
        buildApiResponseHeaders({
          config: INTERVIEW_MODE_RATE_LIMIT,
          snapshot: limit,
          requestId,
          includeRetryAfter: true,
        })
      );
    }

    const parsed = await parseJsonRequest(req, requestSchema, {
      invalidPayloadMessage: "Invalid interview mode payload.",
      invalidContentTypeMessage:
        "Interview mode requests must use application/json.",
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

    if (executionProvider) {
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
        }
      } catch {
        narrativeSource = "deterministic";
      }
    }
    responseHeaders.set("X-AI-Narrative-Source", narrativeSource);

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
      console.error("Interview mode response validation error:", validatedResponse.error);
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
    console.error("Interview mode API error:", error);
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
