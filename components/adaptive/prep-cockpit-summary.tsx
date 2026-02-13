"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import {
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "@/lib/adaptive/readiness-checklist";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
} from "@/lib/adaptive/prep-history";

export function PrepCockpitSummary() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [checklistCompletion, setChecklistCompletion] = useState({
    completedCount: 0,
    completionPct: 0,
    total: 0,
  });
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestConfidence, setLatestConfidence] = useState<number | null>(null);

  const recommendationBundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;

    const readinessKey = getReadinessStorageKey(companyId, personaId);
    const historyKey = getPrepHistoryStorageKey(companyId, personaId);

    function refresh() {
      const checklistItems = getReadinessChecklist(companyId, personaId);
      const readinessState = parseReadinessState(localStorage.getItem(readinessKey));
      const completion = getReadinessCompletion(checklistItems, readinessState);
      setChecklistCompletion({
        completedCount: completion.completedCount,
        completionPct: completion.completionPct,
        total: checklistItems.length,
      });

      const history = parsePrepHistory(localStorage.getItem(historyKey));
      setLatestScore(history[0]?.averageScore ?? null);
      setLatestConfidence(history[0]?.averageConfidence ?? null);
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === readinessKey || event.key === historyKey) {
        refresh();
      }
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === readinessKey) refresh();
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === historyKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
    };
  }, [companyId, personaId]);

  if (!companyId || !personaId || !company || !persona || !recommendationBundle) {
    return null;
  }

  async function copyPrepSnapshot() {
    const topAssets = recommendationBundle.topRecommendations
      .slice(0, 3)
      .map((recommendation, index) => {
        return `${index + 1}. ${recommendation.asset.title} (${recommendation.asset.url})`;
      })
      .join("\n");

    const snapshot = [
      `Interview prep snapshot — ${company.name}`,
      `Persona: ${persona.name} (${persona.role})`,
      `Readiness: ${checklistCompletion.completedCount}/${checklistCompletion.total} items (${checklistCompletion.completionPct}%)`,
      `Latest mock-session score: ${latestScore ?? "N/A"}`,
      `Latest confidence rating: ${
        latestConfidence !== null ? `${latestConfidence}/5` : "N/A"
      }`,
      "",
      "Top resources to open first:",
      topAssets,
      "",
      "Focus prompt:",
      recommendationBundle.persona.recommendationGoal,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(snapshot);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          Prep cockpit summary
        </h3>
        <Badge variant="outline">{company.name}</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-[11px] text-muted-foreground">Persona</p>
          <p className="text-xs font-medium">{persona.role}</p>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-[11px] text-muted-foreground">Readiness</p>
          <p className="text-xs font-medium">
            {checklistCompletion.completedCount}/{checklistCompletion.total} (
            {checklistCompletion.completionPct}%)
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-[11px] text-muted-foreground">Latest session</p>
          <p className="text-xs font-medium">
            {latestScore !== null ? `${latestScore}/100` : "Not started"}
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-[11px] text-muted-foreground">Confidence</p>
          <p className="text-xs font-medium">
            {latestConfidence !== null ? `${latestConfidence}/5` : "N/A"}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {recommendationBundle.persona.recommendationGoal}
      </p>

      <Button size="sm" variant="ghost" onClick={copyPrepSnapshot}>
        {copyState === "copied" ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied prep snapshot
          </>
        ) : (
          <>
            <ClipboardCopy className="h-3.5 w-3.5" />
            Copy prep snapshot
          </>
        )}
      </Button>
      {copyState === "error" && (
        <p className="text-xs text-muted-foreground">
          Could not copy automatically. Try again after interacting with the page.
        </p>
      )}
    </div>
  );
}
