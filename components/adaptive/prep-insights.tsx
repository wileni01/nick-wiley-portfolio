"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
  type PrepSessionSnapshot,
} from "@/lib/adaptive/prep-history";

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
  const [history, setHistory] = useState<PrepSessionSnapshot[]>([]);

  const storageKey = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getPrepHistoryStorageKey(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!storageKey) {
      setHistory([]);
      return;
    }

    function loadHistory() {
      const parsed = parsePrepHistory(localStorage.getItem(storageKey));
      setHistory(parsed);
    }

    loadHistory();

    function onStorage(event: StorageEvent) {
      if (event.key === storageKey) {
        loadHistory();
      }
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key || detail.key === storageKey) {
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

  if (!companyId || !personaId) return null;

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
        <p className="text-xs text-muted-foreground">
          Complete at least one mock session to see trend insights.
        </p>
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
