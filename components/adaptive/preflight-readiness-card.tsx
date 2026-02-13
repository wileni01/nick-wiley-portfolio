"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
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
import {
  getInterviewDateStorageKey,
  getLaunchpadStorageKey,
  getPrepNotesStorageKey,
} from "@/lib/adaptive/storage-keys";
import { calculatePreflightScore } from "@/lib/adaptive/preflight";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";

export function PreflightReadinessCard() {
  const { companyId, personaId, focusNote } = useInterviewMode();
  const [readinessPct, setReadinessPct] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestSessionTimestamp, setLatestSessionTimestamp] = useState<string | null>(
    null
  );
  const [launchpadPct, setLaunchpadPct] = useState(0);
  const [hasNotes, setHasNotes] = useState(false);
  const [interviewDate, setInterviewDate] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;

    const keys = {
      readiness: getReadinessStorageKey(activeCompanyId, activePersonaId),
      history: getPrepHistoryStorageKey(activeCompanyId, activePersonaId),
      launchpad: getLaunchpadStorageKey(activeCompanyId, activePersonaId),
      notes: getPrepNotesStorageKey(activeCompanyId, activePersonaId),
      interviewDate: getInterviewDateStorageKey(activeCompanyId, activePersonaId),
    };

    function refresh() {
      const checklistItems = getReadinessChecklist(activeCompanyId, activePersonaId);
      const readinessState = parseReadinessState(
        localStorage.getItem(keys.readiness)
      );
      const readiness = getReadinessCompletion(checklistItems, readinessState);
      setReadinessPct(readiness.completionPct);

      const history = parsePrepHistory(localStorage.getItem(keys.history));
      setLatestScore(history[0]?.averageScore ?? null);
      setLatestSessionTimestamp(history[0]?.timestamp ?? null);

      const launchpad = localStorage.getItem(keys.launchpad);
      if (!launchpad) {
        setLaunchpadPct(0);
      } else {
        try {
          const parsed = JSON.parse(launchpad) as Record<string, boolean>;
          const values = Object.values(parsed);
          const opened = values.filter(Boolean).length;
          const pct = values.length ? Math.round((opened / values.length) * 100) : 0;
          setLaunchpadPct(pct);
        } catch {
          setLaunchpadPct(0);
        }
      }

      const notes = localStorage.getItem(keys.notes) ?? "";
      setHasNotes(Boolean(notes.trim()));
      setInterviewDate(parseInterviewDate(localStorage.getItem(keys.interviewDate)));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (Object.values(keys).includes(event.key ?? "")) refresh();
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.readiness) refresh();
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.history) refresh();
    }

    function onLaunchpadUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.launchpad) refresh();
    }

    function onNotesUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.notes) refresh();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.interviewDate) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    window.addEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    window.addEventListener("adaptive-prep-notes-updated", onNotesUpdate);
    window.addEventListener("adaptive-interview-date-updated", onInterviewDateUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
      window.removeEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
      window.removeEventListener("adaptive-prep-notes-updated", onNotesUpdate);
      window.removeEventListener(
        "adaptive-interview-date-updated",
        onInterviewDateUpdate
      );
    };
  }, [companyId, personaId]);

  const preflight = useMemo(
    () =>
      calculatePreflightScore({
        readinessPct,
        latestScore,
        latestSessionTimestamp,
        launchpadPct,
        hasNotes,
        hasFocusNote: Boolean(focusNote.trim()),
        interviewDate,
      }),
    [
      focusNote,
      hasNotes,
      interviewDate,
      latestScore,
      latestSessionTimestamp,
      launchpadPct,
      readinessPct,
    ]
  );
  const interviewDateSummary = useMemo(
    () => getInterviewDateSummary(interviewDate),
    [interviewDate]
  );

  if (!companyId || !personaId) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Preflight readiness
        </h3>
        <Badge variant="outline">{preflight.score}/100</Badge>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${preflight.score}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="text-xs font-medium">{preflight.label}</p>
      <p className="text-xs text-muted-foreground">{preflight.detail}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs text-muted-foreground">
        <span>Readiness: {readinessPct}%</span>
        <span>Latest score: {latestScore ?? "N/A"}</span>
        <span>Launchpad: {launchpadPct}%</span>
        <span>
          Recency:{" "}
          {preflight.recencyDays === null
            ? "no-session"
            : `${preflight.recencyDays}d ago`}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Interview timeline: {interviewDateSummary.label}
      </p>
      <p className="text-[11px] text-muted-foreground">
        Context signals: {hasNotes ? "notes" : "no-notes"} +{" "}
        {focusNote.trim() ? "focus" : "no-focus"}
      </p>
    </div>
  );
}
