import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import {
  getRecommendationBundle,
  buildVisitorNarrative,
  supportedCompanyIds,
} from "@/lib/adaptive/recommendations";
import type { CompanyId, AdaptiveRequest, AdaptiveResponse } from "@/lib/adaptive/types";

// Simple in-memory rate limiter
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = 40;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const log = requestLog.get(ip) ?? [];
  const recent = log.filter((t) => now - t < RATE_WINDOW);
  requestLog.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let body: AdaptiveRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { companyId, personaId, provider } = body;

  if (
    !companyId ||
    !personaId ||
    !supportedCompanyIds.includes(companyId as CompanyId)
  ) {
    return NextResponse.json(
      { error: "Invalid companyId or personaId." },
      { status: 400 }
    );
  }

  const bundle = getRecommendationBundle(companyId as CompanyId, personaId);
  if (!bundle) {
    return NextResponse.json(
      { error: "Could not generate recommendations for this configuration." },
      { status: 404 }
    );
  }

  const deterministicNarrative = buildVisitorNarrative(
    companyId as CompanyId,
    personaId
  );

  // Try AI-enhanced narrative if API keys are available
  let aiNarrative: string | undefined;
  let narrativeSource: "deterministic" | "ai" = "deterministic";

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const selectedProvider = provider ?? (hasAnthropic ? "anthropic" : "openai");
  const hasKey =
    (selectedProvider === "openai" && hasOpenAI) ||
    (selectedProvider === "anthropic" && hasAnthropic);

  if (hasKey) {
    try {
      const model = getModel(selectedProvider);
      const topWork = bundle.topRecommendations
        .slice(0, 4)
        .map(
          (r) =>
            `- ${r.asset.title} (${r.asset.kind}): ${r.reason}`
        )
        .join("\n");

      const { text } = await generateText({
        model,
        system: `You write concise, compelling portfolio narratives for a visitor viewing Nick Wiley's portfolio. 
The visitor is from ${bundle.company.name} and has the perspective of ${bundle.persona.name} (${bundle.persona.role}).
Write 2-3 sentences explaining why Nick's background is a strong fit for their priorities. 
Be specific about the work, not generic. Do not use bullet points. Do not use the word "I" — write in third person about Nick.`,
        prompt: `Company: ${bundle.company.name}
Company focus: ${bundle.company.summary}
Visitor perspective: ${bundle.persona.name}, ${bundle.persona.role}
Goal: ${bundle.persona.recommendationGoal}

Top relevant work:
${topWork}

Write a brief, compelling narrative about why Nick is a great fit.`,
        maxTokens: 200,
      });

      if (text && text.length > 20) {
        aiNarrative = text;
        narrativeSource = "ai";
      }
    } catch {
      // AI generation failed; fall back to deterministic
    }
  }

  const response: AdaptiveResponse = {
    mode: { companyId: companyId as CompanyId, personaId },
    companyName: bundle.company.name,
    personaName: bundle.persona.name,
    personaRole: bundle.persona.role,
    deterministicNarrative,
    aiNarrative,
    narrativeSource,
    recommendations: bundle.topRecommendations.map((r) => ({
      title: r.asset.title,
      url: r.asset.url,
      kind: r.asset.kind,
      reason: r.reason,
    })),
    supportingRecommendations: bundle.supportingRecommendations.map((r) => ({
      title: r.asset.title,
      url: r.asset.url,
      kind: r.asset.kind,
      reason: r.reason,
    })),
    highlights: bundle.highlights,
  };

  return NextResponse.json(response);
}
