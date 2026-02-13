"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Crosshair, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import {
  buildPrepBriefMarkdown,
  buildPrepPacketMarkdown,
} from "@/lib/adaptive/prep-brief";
import {
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "@/lib/adaptive/readiness-checklist";
import { buildNextActions } from "@/lib/adaptive/next-actions";
import { buildTargetedDrills } from "@/lib/adaptive/drills";
import { buildInterviewDayPlan } from "@/lib/adaptive/interview-day-plan";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
} from "@/lib/adaptive/prep-history";
import { getPrepNotesStorageKey } from "@/lib/adaptive/storage-keys";

export function PrepCockpitSummary() {
  const { companyId, personaId, focusNote, company, persona } = useInterviewMode();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [downloadState, setDownloadState] = useState<"idle" | "done">("idle");
  const [packetState, setPacketState] = useState<"idle" | "done">("idle");
  const [checklistCompletion, setChecklistCompletion] = useState({
    completedCount: 0,
    completionPct: 0,
    total: 0,
  });
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestConfidence, setLatestConfidence] = useState<number | null>(null);
  const [latestThemes, setLatestThemes] = useState<string[]>([]);
  const [prepNotes, setPrepNotes] = useState("");

  const recommendationBundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;

    const readinessKey = getReadinessStorageKey(companyId, personaId);
    const historyKey = getPrepHistoryStorageKey(companyId, personaId);
    const notesKey = getPrepNotesStorageKey(companyId, personaId);

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
      setLatestThemes(history[0]?.topThemes ?? []);
      setPrepNotes((localStorage.getItem(notesKey) ?? "").slice(0, 1200));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (
        event.key === readinessKey ||
        event.key === historyKey ||
        event.key === notesKey
      ) {
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

    function onPrepNotesUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === notesKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    window.addEventListener("adaptive-prep-notes-updated", onPrepNotesUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
      window.removeEventListener("adaptive-prep-notes-updated", onPrepNotesUpdate);
    };
  }, [companyId, personaId]);

  if (!companyId || !personaId || !company || !persona || !recommendationBundle) {
    return null;
  }

  const prepBriefMarkdown = buildPrepBriefMarkdown({
    generatedAt: new Date().toISOString(),
    companyName: company.name,
    personaName: persona.name,
    personaRole: persona.role,
    personaGoal: recommendationBundle.persona.recommendationGoal,
    focusNote,
    prepNotes,
    readiness: {
      completed: checklistCompletion.completedCount,
      total: checklistCompletion.total,
      percentage: checklistCompletion.completionPct,
    },
    latestScore,
    latestConfidence,
    topResources: recommendationBundle.topRecommendations.slice(0, 3).map(
      (recommendation) => ({
        title: recommendation.asset.title,
        url: recommendation.asset.url,
        reason: recommendation.reason,
      })
    ),
    talkingPoints: recommendationBundle.talkingPoints,
  });

  const prepPacketMarkdown = buildPrepPacketMarkdown({
    generatedAt: new Date().toISOString(),
    companyName: company.name,
    personaName: persona.name,
    personaRole: persona.role,
    personaGoal: recommendationBundle.persona.recommendationGoal,
    focusNote,
    prepNotes,
    readiness: {
      completed: checklistCompletion.completedCount,
      total: checklistCompletion.total,
      percentage: checklistCompletion.completionPct,
    },
    latestScore,
    latestConfidence,
    topResources: recommendationBundle.topRecommendations.slice(0, 3).map(
      (recommendation) => ({
        title: recommendation.asset.title,
        url: recommendation.asset.url,
        reason: recommendation.reason,
      })
    ),
    talkingPoints: recommendationBundle.talkingPoints,
    nextActions: buildNextActions({
      readinessPct: checklistCompletion.completionPct,
      readinessCompleted: checklistCompletion.completedCount,
      readinessTotal: checklistCompletion.total,
      latestScore,
      latestConfidence,
      latestThemes,
      topResourceTitle: recommendationBundle.topRecommendations[0]?.asset.title,
    }),
    drills: buildTargetedDrills({ themes: latestThemes }),
    dayPlan: buildInterviewDayPlan(companyId, personaId),
  });

  async function copyPrepSnapshot() {
    try {
      await navigator.clipboard.writeText(prepBriefMarkdown);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  function downloadPrepBrief() {
    const safeCompany = companyId.replace(/[^a-z0-9-]/gi, "-");
    const safePersona = personaId.replace(/[^a-z0-9-]/gi, "-");
    const blob = new Blob([prepBriefMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-prep-brief-${safeCompany}-${safePersona}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadState("done");
    setTimeout(() => setDownloadState("idle"), 1800);
  }

  function downloadFullPacket() {
    const safeCompany = companyId.replace(/[^a-z0-9-]/gi, "-");
    const safePersona = personaId.replace(/[^a-z0-9-]/gi, "-");
    const blob = new Blob([prepPacketMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-prep-packet-${safeCompany}-${safePersona}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setPacketState("done");
    setTimeout(() => setPacketState("idle"), 1800);
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

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={copyPrepSnapshot}>
          {copyState === "copied" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied prep brief
            </>
          ) : (
            <>
              <ClipboardCopy className="h-3.5 w-3.5" />
              Copy prep brief
            </>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={downloadPrepBrief}>
          {downloadState === "done" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Downloaded brief
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download .md brief
            </>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={downloadFullPacket}>
          {packetState === "done" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Downloaded packet
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download full packet
            </>
          )}
        </Button>
      </div>
      {copyState === "error" && (
        <p className="text-xs text-muted-foreground">
          Could not copy automatically. Try again after interacting with the page.
        </p>
      )}
    </div>
  );
}
