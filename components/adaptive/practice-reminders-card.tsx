"use client";

import { useEffect, useMemo, useState } from "react";
import { AlarmClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/lib/adaptive/storage-keys";
import { buildPracticeReminders } from "@/lib/adaptive/practice-reminders";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";
import { setInterviewDateOffsetForMode } from "@/lib/adaptive/interview-date-actions";

function getPriorityBadge(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return (
      <Badge variant="outline" className="text-[10px] border-primary/50">
        High
      </Badge>
    );
  }
  if (priority === "medium") {
    return (
      <Badge variant="outline" className="text-[10px]">
        Medium
      </Badge>
    );
  }
  return (
    <Badge variant="muted" className="text-[10px]">
      Low
    </Badge>
  );
}

export function PracticeRemindersCard() {
  const { companyId, personaId } = useInterviewMode();
  const [readinessPct, setReadinessPct] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [launchpadPct, setLaunchpadPct] = useState(0);
  const [interviewDate, setInterviewDate] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;

    const keys = {
      readiness: getReadinessStorageKey(activeCompanyId, activePersonaId),
      history: getPrepHistoryStorageKey(activeCompanyId, activePersonaId),
      launchpad: getLaunchpadStorageKey(activeCompanyId, activePersonaId),
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

      const rawLaunchpad = localStorage.getItem(keys.launchpad);
      if (!rawLaunchpad) {
        setLaunchpadPct(0);
      } else {
        try {
          const parsed = JSON.parse(rawLaunchpad) as Record<string, boolean>;
          const values = Object.values(parsed);
          const opened = values.filter(Boolean).length;
          setLaunchpadPct(values.length ? Math.round((opened / values.length) * 100) : 0);
        } catch {
          setLaunchpadPct(0);
        }
      }

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

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.interviewDate) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    window.addEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    window.addEventListener("adaptive-interview-date-updated", onInterviewDateUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
      window.removeEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
      window.removeEventListener(
        "adaptive-interview-date-updated",
        onInterviewDateUpdate
      );
    };
  }, [companyId, personaId]);

  const reminders = useMemo(
    () =>
      buildPracticeReminders({
        now: new Date(),
        latestScore,
        readinessPct,
        launchpadPct,
        interviewDate,
      }),
    [interviewDate, latestScore, launchpadPct, readinessPct]
  );
  const interviewDateSummary = useMemo(
    () => getInterviewDateSummary(interviewDate),
    [interviewDate]
  );

  if (!companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  function setInterviewDateOffset(daysFromNow: number) {
    setInterviewDateOffsetForMode(activeCompanyId, activePersonaId, daysFromNow);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <AlarmClock className="h-4 w-4 text-primary" />
          Practice reminders
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{reminders.length} reminder(s)</Badge>
          <Badge variant="muted" className="text-[10px]">
            {interviewDateSummary.label}
          </Badge>
        </div>
      </div>

      <ul className="space-y-2">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium">{reminder.title}</p>
              {getPriorityBadge(reminder.priority)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{reminder.detail}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Due by: {reminder.dueBy}
            </p>
            {(reminder.id === "set-interview-date" ||
              reminder.id === "reset-interview-date") && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setInterviewDateOffset(7)}
                >
                  {reminder.id === "set-interview-date" ? "Set +7d" : "Reset +7d"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setInterviewDateOffset(14)}
                >
                  {reminder.id === "set-interview-date" ? "Set +14d" : "Reset +14d"}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
