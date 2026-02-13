"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { TimelineQuickFixActions } from "./timeline-quick-fix-actions";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
  type PrepSessionSnapshot,
} from "@/lib/adaptive/prep-history";
import {
  defaultPrepGoal,
  getPrepGoalStorageKey,
  parsePrepGoalState,
} from "@/lib/adaptive/prep-goals";
import {
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "@/lib/adaptive/readiness-checklist";
import { getInterviewDateSummary } from "@/lib/adaptive/interview-date";
import { evaluatePrepCadence } from "@/lib/adaptive/prep-cadence";

function formatDateLabel(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

export function PrepInsights() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });
  const [history, setHistory] = useState<PrepSessionSnapshot[]>([]);
  const [weeklyTarget, setWeeklyTarget] = useState(defaultPrepGoal.weeklyTarget);
  const [readinessPct, setReadinessPct] = useState(0);

  const storageKey = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getPrepHistoryStorageKey(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!storageKey) {
      setHistory([]);
      return;
    }
    const activeStorageKey = storageKey;

    function loadHistory() {
      const parsed = parsePrepHistory(localStorage.getItem(activeStorageKey));
      setHistory(parsed);
    }

    loadHistory();

    function onStorage(event: StorageEvent) {
      if (event.key === activeStorageKey) {
        loadHistory();
      }
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key || detail.key === activeStorageKey) {
        loadHistory();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
    };
  }, [storageKey]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const goalKey = getPrepGoalStorageKey(companyId, personaId);

    function refreshGoal() {
      const parsed = parsePrepGoalState(localStorage.getItem(goalKey));
      setWeeklyTarget(parsed.weeklyTarget);
    }

    refreshGoal();

    function onStorage(event: StorageEvent) {
      if (event.key === goalKey) refreshGoal();
    }

    function onGoalUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === goalKey) refreshGoal();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-prep-goal-updated", onGoalUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-prep-goal-updated", onGoalUpdate);
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const goalKey = getPrepGoalStorageKey(companyId, personaId);
    localStorage.setItem(goalKey, JSON.stringify({ weeklyTarget }));
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-goal-updated", { detail: { key: goalKey } })
    );
  }, [companyId, personaId, weeklyTarget]);

  useEffect(() => {
    if (!companyId || !personaId) {
      setReadinessPct(0);
      return;
    }
    const activeCompanyId = companyId;
    const activePersonaId = personaId;

    const readinessKey = getReadinessStorageKey(activeCompanyId, activePersonaId);

    function refresh() {
      const checklistItems = getReadinessChecklist(activeCompanyId, activePersonaId);
      const readinessState = parseReadinessState(localStorage.getItem(readinessKey));
      const completion = getReadinessCompletion(checklistItems, readinessState);
      setReadinessPct(completion.completionPct);
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === readinessKey) {
        refresh();
      }
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === readinessKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
    };
  }, [companyId, personaId]);

  const prepCalendar = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const offset = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - offset);
    startOfWeek.setHours(0, 0, 0, 0);

    let thisWeekCount = 0;
    const daySet = new Set<string>();
    history.forEach((entry) => {
      const date = new Date(entry.timestamp);
      if (date >= startOfWeek) {
        thisWeekCount += 1;
      }
      daySet.add(date.toISOString().slice(0, 10));
    });

    let streakDays = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!daySet.has(key)) break;
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { thisWeekCount, streakDays };
  }, [history]);

  if (!companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  const latest = history[0];
  const previous = history[1];
  const best = history.reduce<PrepSessionSnapshot | null>((acc, current) => {
    if (!acc || current.averageScore > acc.averageScore) return current;
    return acc;
  }, null);

  const trendValue =
    latest && previous ? latest.averageScore - previous.averageScore : 0;
  const latestConfidence = latest?.averageConfidence ?? null;
  const confidenceCalibration =
    latestConfidence !== null && latest
      ? Number((latest.averageScore / 20 - latestConfidence).toFixed(1))
      : null;

  const recurringThemes = (() => {
    const counts = new Map<string, number>();
    history.forEach((entry) => {
      entry.topThemes.forEach((theme) => {
        counts.set(theme, (counts.get(theme) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  })();
  const interviewTimeline = getInterviewDateSummary(interviewDate);
  const cadence = evaluatePrepCadence({
    daysUntilInterview: interviewTimeline.daysUntil,
    readinessPct,
    latestScore: latest?.averageScore ?? null,
    latestSessionTimestamp: latest?.timestamp ?? null,
  });
  const isTimelineMissing = interviewTimeline.daysUntil === null;
  const shouldShowTimelineQuickActions = cadence.status === "none";

  const timelineQuickActions = shouldShowTimelineQuickActions ? (
    <TimelineQuickFixActions
      companyId={activeCompanyId}
      personaId={activePersonaId}
      mode={isTimelineMissing ? "set" : "reset"}
    />
  ) : null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Prep insights
        </h3>
        <Badge variant="outline">{history.length} session(s)</Badge>
      </div>

      {!history.length ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Complete at least one mock session to see trend insights.
          </p>
          <div className="rounded-md border border-border bg-background p-3 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium">Interview pacing status</p>
              <Badge
                variant="outline"
                className={
                  cadence.status === "urgent"
                    ? "border-rose-400/60 text-rose-700 dark:text-rose-300"
                    : cadence.status === "watch"
                      ? "border-amber-400/60 text-amber-700 dark:text-amber-300"
                      : "text-muted-foreground"
                }
              >
                {cadence.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{interviewTimeline.label}</p>
            <p className="text-xs text-muted-foreground">{cadence.detail}</p>
            {timelineQuickActions}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-background p-2">
              <p className="text-[11px] text-muted-foreground">Latest score</p>
              <p className="text-sm font-semibold">{latest?.averageScore ?? 0}/100</p>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <p className="text-[11px] text-muted-foreground">Best score</p>
              <p className="text-sm font-semibold">{best?.averageScore ?? 0}/100</p>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <p className="text-[11px] text-muted-foreground">Trend</p>
              <p className="text-sm font-semibold inline-flex items-center gap-1">
                {trendValue >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {previous ? `${trendValue >= 0 ? "+" : ""}${trendValue}` : "N/A"}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <p className="text-[11px] text-muted-foreground">Confidence</p>
              <p className="text-sm font-semibold">
                {latestConfidence !== null ? `${latestConfidence}/5` : "N/A"}
              </p>
              {confidenceCalibration !== null && (
                <p className="text-[11px] text-muted-foreground">
                  Calibration: {confidenceCalibration >= 0 ? "+" : ""}
                  {confidenceCalibration}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium">Weekly prep target</p>
              <select
                value={weeklyTarget}
                onChange={(event) =>
                  setWeeklyTarget(Number(event.target.value) || defaultPrepGoal.weeklyTarget)
                }
                className="h-7 rounded border border-border bg-background px-2 text-xs"
                aria-label="Select weekly prep target"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((target) => (
                  <option key={target} value={target}>
                    {target}/week
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              This week: {prepCalendar.thisWeekCount}/{weeklyTarget} sessions
            </p>
            <p className="text-xs text-muted-foreground">
              Current daily streak: {prepCalendar.streakDays} day
              {prepCalendar.streakDays === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-md border border-border bg-background p-3 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium">Interview pacing status</p>
              <Badge
                variant="outline"
                className={
                  cadence.status === "urgent"
                    ? "border-rose-400/60 text-rose-700 dark:text-rose-300"
                    : cadence.status === "watch"
                      ? "border-amber-400/60 text-amber-700 dark:text-amber-300"
                      : cadence.status === "on-track"
                        ? "border-emerald-400/60 text-emerald-700 dark:text-emerald-300"
                        : "text-muted-foreground"
                }
              >
                {cadence.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{interviewTimeline.label}</p>
            <p className="text-xs text-muted-foreground">{cadence.detail}</p>
            <p className="text-[11px] text-muted-foreground">
              Suggested reps remaining: {cadence.sessionsNeeded}
              {cadence.recencyDays !== null
                ? ` · Last session ${cadence.recencyDays} day${
                    cadence.recencyDays === 1 ? "" : "s"
                  } ago`
                : " · No recent session logged"}
            </p>
            {timelineQuickActions}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Recent attempts</p>
            <ul className="space-y-1">
              {history.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                >
                  <span className="text-muted-foreground">
                    {formatDateLabel(entry.timestamp)}
                  </span>
                  <span className="font-medium">
                    {entry.averageScore}/100
                    {entry.averageConfidence !== null &&
                    entry.averageConfidence !== undefined
                      ? ` · C${entry.averageConfidence}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {recurringThemes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Recurring coaching themes</p>
              <ul className="space-y-1">
                {recurringThemes.map(([theme, count]) => (
                  <li key={theme} className="text-xs text-muted-foreground">
                    • {theme} ({count} session{count > 1 ? "s" : ""})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
