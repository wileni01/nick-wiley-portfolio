import { z } from "zod";
import { generateText } from "ai";
import { getModel, type AIProvider } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
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

function hasProviderKey(provider: AIProvider): boolean {
  if (provider === "anthropic") {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const limit = rateLimit(`interview-mode:${ip}`, {
      maxRequests: 40,
      windowMs: 3600000,
    });

    if (!limit.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again shortly.",
          resetIn: Math.ceil(limit.resetIn / 1000),
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid interview mode payload." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { companyId, personaId, provider } = parsed.data;
    const contextNote = sanitizeInput(parsed.data.contextNote ?? "").slice(0, 300);

    const company = getCompanyProfileById(companyId);
    const persona = getPersonaById(companyId, personaId);
    const bundle = getInterviewRecommendationBundle(companyId, personaId);

    if (!company || !persona || !bundle) {
      return new Response(
        JSON.stringify({ error: "Unknown company or interviewer persona." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deterministicNarrative = buildDeterministicNarrative(
      companyId,
      personaId
    );

    let aiNarrative: string | undefined;
    let narrativeSource: "deterministic" | "ai" = "deterministic";

    if (hasProviderKey(provider)) {
      try {
        const topRecommendations = bundle.topRecommendations
          .slice(0, 4)
          .map(
            (recommendation) =>
              `- ${recommendation.asset.title} (${recommendation.asset.kind}): ${recommendation.reason}`
          )
          .join("\n");

        const { text } = await generateText({
          model: getModel(provider),
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

        const cleaned = sanitizeInput(text).slice(0, 1200);
        if (cleaned) {
          aiNarrative = cleaned;
          narrativeSource = "ai";
        }
      } catch {
        narrativeSource = "deterministic";
      }
    }

    const response: InterviewModeResponse = {
      mode: { companyId, personaId },
      companyName: company.name,
      personaName: persona.name,
      personaRole: persona.role,
      deterministicNarrative,
      aiNarrative,
      narrativeSource,
      recommendations: bundle.topRecommendations.map((recommendation) => ({
        title: recommendation.asset.title,
        url: recommendation.asset.url,
        kind: recommendation.asset.kind,
        reason: recommendation.reason,
      })),
      supportingRecommendations: bundle.supportingRecommendations.map(
        (recommendation) => ({
          title: recommendation.asset.title,
          url: recommendation.asset.url,
          kind: recommendation.asset.kind,
          reason: recommendation.reason,
        })
      ),
      talkingPoints: bundle.talkingPoints,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Interview mode API error:", error);
    return new Response(
      JSON.stringify({
        error:
          "Could not generate interview briefing. Please retry or use deterministic recommendations.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
