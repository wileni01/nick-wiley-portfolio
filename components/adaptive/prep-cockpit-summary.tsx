"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Crosshair, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { useTransientState } from "./use-transient-state";
import { TimelineQuickFixActions } from "./timeline-quick-fix-actions";
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
import {
  getInterviewDateSummary,
} from "@/lib/adaptive/interview-date";
import { buildInterviewGoogleCalendarEvents } from "@/lib/adaptive/interview-calendar";
import { buildInterviewDayPlan } from "@/lib/adaptive/interview-day-plan";
import { calculatePreflightScore } from "@/lib/adaptive/preflight";
import { buildPracticeReminders } from "@/lib/adaptive/practice-reminders";
import { evaluatePrepCadence } from "@/lib/adaptive/prep-cadence";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
} from "@/lib/adaptive/prep-history";
import {
  getLaunchpadStorageKey,
  getPrepNotesStorageKey,
} from "@/lib/adaptive/storage-keys";
import { copyTextToClipboard } from "@/lib/clipboard";
import { sanitizeFileToken, triggerDownload } from "@/lib/download";
import {
  parseBooleanStateRecord,
  summarizeBooleanStateRecord,
} from "@/lib/adaptive/boolean-state";

export function PrepCockpitSummary() {
  const { companyId, personaId, focusNote, company, persona } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });
  const [copyState, setCopyState] = useTransientState<
    "idle" | "copied" | "error"
  >("idle", 1800);
  const [downloadState, setDownloadState] = useTransientState<
    "idle" | "done" | "error"
  >("idle", 1800);
  const [packetState, setPacketState] = useTransientState<
    "idle" | "done" | "error"
  >("idle", 1800);
  const [checklistCompletion, setChecklistCompletion] = useState({
    completedCount: 0,
    completionPct: 0,
    total: 0,
  });
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestConfidence, setLatestConfidence] = useState<number | null>(null);
  const [latestSessionTimestamp, setLatestSessionTimestamp] = useState<string | null>(
    null
  );
  const [launchpadPct, setLaunchpadPct] = useState(0);
  const [latestThemes, setLatestThemes] = useState<string[]>([]);
  const [prepNotes, setPrepNotes] = useState("");

  const recommendationBundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;

    const readinessKey = getReadinessStorageKey(activeCompanyId, activePersonaId);
    const historyKey = getPrepHistoryStorageKey(activeCompanyId, activePersonaId);
    const notesKey = getPrepNotesStorageKey(activeCompanyId, activePersonaId);
    const launchpadKey = getLaunchpadStorageKey(activeCompanyId, activePersonaId);

    function refresh() {
      const checklistItems = getReadinessChecklist(activeCompanyId, activePersonaId);
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
      setLatestSessionTimestamp(history[0]?.timestamp ?? null);
      setLatestThemes(history[0]?.topThemes ?? []);
      setPrepNotes((localStorage.getItem(notesKey) ?? "").slice(0, 1200));

      const rawLaunchpad = localStorage.getItem(launchpadKey);
      if (!rawLaunchpad) {
        setLaunchpadPct(0);
      } else {
        const parsed = parseBooleanStateRecord(rawLaunchpad);
        setLaunchpadPct(summarizeBooleanStateRecord(parsed).percentage);
      }
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (
        event.key === readinessKey ||
        event.key === historyKey ||
        event.key === notesKey ||
        event.key === launchpadKey
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

    function onLaunchpadUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === launchpadKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    window.addEventListener("adaptive-prep-notes-updated", onPrepNotesUpdate);
    window.addEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
      window.removeEventListener("adaptive-prep-notes-updated", onPrepNotesUpdate);
      window.removeEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    };
  }, [companyId, personaId]);

  if (!companyId || !personaId || !company || !persona || !recommendationBundle) {
    return null;
  }
  const activeCompanyId = companyId;
  const activePersonaId = personaId;
  const interviewTimeline = getInterviewDateSummary(interviewDate);
  const cadence = evaluatePrepCadence({
    daysUntilInterview: interviewTimeline.daysUntil,
    readinessPct: checklistCompletion.completionPct,
    latestScore,
    latestSessionTimestamp,
  });
  const shouldShowTimelineQuickFix = cadence.status === "none";
  const calendarLinks = interviewDate
    ? buildInterviewGoogleCalendarEvents({
        companyName: company.name,
        personaName: persona.name,
        interviewDate,
      }).map((event) => ({
        label: `Google Calendar: ${event.label}`,
        url: event.url,
      }))
    : [];

  const prepBriefMarkdown = buildPrepBriefMarkdown({
    generatedAt: new Date().toISOString(),
    companyName: company.name,
    personaName: persona.name,
    personaRole: persona.role,
    personaGoal: recommendationBundle.persona.recommendationGoal,
    interviewDate,
    focusNote,
    prepNotes,
    readiness: {
      completed: checklistCompletion.completedCount,
      total: checklistCompletion.total,
      percentage: checklistCompletion.completionPct,
    },
    latestScore,
    latestConfidence,
    preflight: calculatePreflightScore({
      readinessPct: checklistCompletion.completionPct,
      latestScore,
      latestSessionTimestamp,
      launchpadPct,
      hasNotes: Boolean(prepNotes.trim()),
      hasFocusNote: Boolean(focusNote.trim()),
      interviewDate,
    }),
    cadence,
    topResources: recommendationBundle.topRecommendations.slice(0, 3).map(
      (recommendation) => ({
        title: recommendation.asset.title,
        url: recommendation.asset.url,
        reason: recommendation.reason,
      })
    ),
    talkingPoints: recommendationBundle.talkingPoints,
    reminders: buildPracticeReminders({
      now: new Date(),
      latestScore,
      readinessPct: checklistCompletion.completionPct,
      launchpadPct,
      interviewDate,
    }),
    calendarLinks,
  });

  const prepPacketMarkdown = buildPrepPacketMarkdown({
    generatedAt: new Date().toISOString(),
    companyName: company.name,
    personaName: persona.name,
    personaRole: persona.role,
    personaGoal: recommendationBundle.persona.recommendationGoal,
    interviewDate,
    focusNote,
    prepNotes,
    readiness: {
      completed: checklistCompletion.completedCount,
      total: checklistCompletion.total,
      percentage: checklistCompletion.completionPct,
    },
    latestScore,
    latestConfidence,
    preflight: calculatePreflightScore({
      readinessPct: checklistCompletion.completionPct,
      latestScore,
      latestSessionTimestamp,
      launchpadPct,
      hasNotes: Boolean(prepNotes.trim()),
      hasFocusNote: Boolean(focusNote.trim()),
      interviewDate,
    }),
    cadence,
    topResources: recommendationBundle.topRecommendations.slice(0, 3).map(
      (recommendation) => ({
        title: recommendation.asset.title,
        url: recommendation.asset.url,
        reason: recommendation.reason,
      })
    ),
    talkingPoints: recommendationBundle.talkingPoints,
    reminders: buildPracticeReminders({
      now: new Date(),
      latestScore,
      readinessPct: checklistCompletion.completionPct,
      launchpadPct,
      interviewDate,
    }),
    calendarLinks,
    nextActions: buildNextActions({
      readinessPct: checklistCompletion.completionPct,
      readinessCompleted: checklistCompletion.completedCount,
      readinessTotal: checklistCompletion.total,
      latestScore,
      latestConfidence,
      latestThemes,
      topResourceTitle: recommendationBundle.topRecommendations[0]?.asset.title,
      latestSessionTimestamp,
      interviewDate,
    }),
    drills: buildTargetedDrills({ themes: latestThemes }),
    dayPlan: buildInterviewDayPlan(companyId, personaId, { interviewDate }),
  });

  async function copyPrepSnapshot() {
    try {
      const copied = await copyTextToClipboard(prepBriefMarkdown);
      setCopyState(copied ? "copied" : "error");
    } catch {
      setCopyState("error");
    }
  }

  function downloadPrepBrief() {
    if (!companyId || !personaId) return;
    const downloaded = triggerDownload({
      content: prepBriefMarkdown,
      mimeType: "text/markdown;charset=utf-8",
      filename: `interview-prep-brief-${sanitizeFileToken(
        companyId,
        "company"
      )}-${sanitizeFileToken(personaId, "persona")}.md`,
    });
    setDownloadState(downloaded ? "done" : "error");
  }

  function downloadFullPacket() {
    if (!companyId || !personaId) return;
    const downloaded = triggerDownload({
      content: prepPacketMarkdown,
      mimeType: "text/markdown;charset=utf-8",
      filename: `interview-prep-packet-${sanitizeFileToken(
        companyId,
        "company"
      )}-${sanitizeFileToken(personaId, "persona")}.md`,
    });
    setPacketState(downloaded ? "done" : "error");
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
      <div className="rounded-md border border-border bg-background p-2">
        <p className="text-[11px] text-muted-foreground">Pacing status</p>
        <p className="text-xs font-medium">{cadence.label}</p>
        <p className="text-[11px] text-muted-foreground">
          {interviewTimeline.label} · reps remaining: {cadence.sessionsNeeded}
        </p>
        {shouldShowTimelineQuickFix && (
          <div className="mt-2">
            <TimelineQuickFixActions
              companyId={activeCompanyId}
              personaId={activePersonaId}
              mode={interviewTimeline.daysUntil === null ? "set" : "reset"}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={copyPrepSnapshot}>
          {copyState === "copied" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied prep brief
            </>
          ) : copyState === "error" ? (
            <>
              <ClipboardCopy className="h-3.5 w-3.5" />
              Copy failed
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
          ) : downloadState === "error" ? (
            <>
              <Download className="h-3.5 w-3.5" />
              Brief download failed
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
          ) : packetState === "error" ? (
            <>
              <Download className="h-3.5 w-3.5" />
              Packet download failed
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download full packet
            </>
          )}
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied"
          ? "Prep brief copied."
          : copyState === "error"
            ? "Prep brief copy failed."
            : downloadState === "done"
              ? "Prep brief downloaded."
              : downloadState === "error"
                ? "Prep brief download failed."
                : packetState === "done"
                  ? "Full prep packet downloaded."
                  : packetState === "error"
                    ? "Full prep packet download failed."
                    : ""}
      </span>
      {copyState === "error" && (
        <p className="text-xs text-muted-foreground">
          Could not copy automatically. Try again after interacting with the page.
        </p>
      )}
      {(downloadState === "error" || packetState === "error") && (
        <p className="text-xs text-muted-foreground">
          A download could not start automatically. Try again after interacting with
          the page.
        </p>
      )}
    </div>
  );
}
