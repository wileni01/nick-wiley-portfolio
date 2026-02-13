"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { PrepCockpitSummary } from "./prep-cockpit-summary";
import { InterviewReadinessChecklist } from "./interview-readiness-checklist";
import { ModeComparisonPanel } from "./mode-comparison-panel";
import { MockInterviewSession } from "./mock-interview-session";
import { MockInterviewerScript } from "./mock-interviewer-script";
import { NextBestActions } from "./next-best-actions";
import { PrepInsights } from "./prep-insights";
import {
  buildDeterministicNarrative,
  getInterviewRecommendationBundle,
} from "@/lib/adaptive/recommendations";
import type { InterviewModeResponse } from "@/lib/adaptive/types";

export function AdaptiveBriefing() {
  const { companyId, personaId, provider, company, persona, setCompanyId } =
    useInterviewMode();
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [narrativeSource, setNarrativeSource] = useState<"deterministic" | "ai">(
    "deterministic"
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const bundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  const deterministicNarrative = useMemo(() => {
    if (!companyId || !personaId) {
      return "Select a company and interviewer persona to generate tailored recommendations and interview talking points.";
    }
    return buildDeterministicNarrative(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) {
      setAiNarrative("");
      setNarrativeSource("deterministic");
      setApiError("");
      return;
    }

    const controller = new AbortController();
    async function fetchNarrative() {
      setLoading(true);
      setApiError("");
      try {
        const response = await fetch("/api/interview-mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            personaId,
            provider,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as InterviewModeResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Could not create tailored briefing.");
        }

        setAiNarrative(payload.aiNarrative || payload.deterministicNarrative);
        setNarrativeSource(payload.narrativeSource);
      } catch (error) {
        if (controller.signal.aborted) return;
        setAiNarrative(deterministicNarrative);
        setNarrativeSource("deterministic");
        setApiError(
          error instanceof Error
            ? error.message
            : "Could not load AI-enhanced narrative."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchNarrative();
    return () => controller.abort();
  }, [companyId, deterministicNarrative, personaId, provider]);

  if (!bundle || !company || !persona) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Adaptive Interview Mode</p>
        </div>
        <p className="text-sm text-muted-foreground">{deterministicNarrative}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setCompanyId("kungfu-ai")}>
            Start with KUNGFU.AI mode
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCompanyId("anthropic")}
          >
            Compare with Anthropic CEO mode
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">
              Tailored for {persona.name} — {persona.role}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Company mode: {company.name}. The recommendations below are scored
            against role priorities and your portfolio content.
          </p>
        </div>
        <Badge variant="muted" className="uppercase tracking-wider text-[10px]">
          {narrativeSource === "ai" ? "AI-enhanced" : "Deterministic"} brief
        </Badge>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Building interviewer briefing...
          </span>
        ) : (
          aiNarrative || deterministicNarrative
        )}
      </div>

      {apiError && (
        <p className="text-xs text-muted-foreground">
          Fallback used: {apiError}
        </p>
      )}

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <h3 className="text-sm font-semibold">Company priorities in this mode</h3>
        <div className="flex flex-wrap gap-1.5">
          {company.priorityTags.map((priority) => (
            <Badge key={priority} variant="outline" className="text-[10px]">
              {priority}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            Company site
            <ExternalLink className="h-3 w-3" />
          </a>
          {company.sources.slice(0, 3).map((source, index) => (
            <a
              key={source}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Source {index + 1}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">What they should see first</h3>
        <ul className="space-y-3">
          {bundle.topRecommendations.map((recommendation) => (
            <li key={recommendation.asset.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Link
                    href={recommendation.asset.url}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary"
                  >
                    {recommendation.asset.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
                </div>
                <Badge variant="outline">{recommendation.asset.kind}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Interview talking points
        </h3>
        <ul className="space-y-2">
          {bundle.talkingPoints.map((talkingPoint) => (
            <li key={talkingPoint} className="text-sm text-muted-foreground">
              • {talkingPoint}
            </li>
          ))}
        </ul>
      </div>

      <ModeComparisonPanel />
      <PrepCockpitSummary />
      <NextBestActions />
      <InterviewReadinessChecklist />
      <PrepInsights />
      <MockInterviewerScript />
      <MockInterviewSession />

      {companyId !== "anthropic" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCompanyId("anthropic")}
          className="text-xs"
        >
          Compare this with Anthropic CEO mode
        </Button>
      )}
    </section>
  );
}
