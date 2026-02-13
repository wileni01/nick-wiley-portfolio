"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { evaluateModeHealth } from "@/lib/adaptive/mode-health";
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

export function ModeHealthPill() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });
  const [readinessPct, setReadinessPct] = useState<number | null>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestConfidence, setLatestConfidence] = useState<number | null>(null);
  const [latestSessionTimestamp, setLatestSessionTimestamp] = useState<string | null>(
    null
  );

  const keys = useMemo(() => {
    if (!companyId || !personaId) return null;
    return {
      readiness: getReadinessStorageKey(companyId, personaId),
      history: getPrepHistoryStorageKey(companyId, personaId),
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !keys) {
      setReadinessPct(null);
      setLatestScore(null);
      setLatestConfidence(null);
      setLatestSessionTimestamp(null);
      return;
    }
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const activeKeys = keys;

    function refresh() {
      const checklistItems = getReadinessChecklist(activeCompanyId, activePersonaId);
      const readinessState = parseReadinessState(
        localStorage.getItem(activeKeys.readiness)
      );
      const readiness = getReadinessCompletion(checklistItems, readinessState);
      const history = parsePrepHistory(localStorage.getItem(activeKeys.history));
      setReadinessPct(readiness.completionPct);
      setLatestScore(history[0]?.averageScore ?? null);
      setLatestConfidence(history[0]?.averageConfidence ?? null);
      setLatestSessionTimestamp(history[0]?.timestamp ?? null);
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (
        event.key === activeKeys.readiness ||
        event.key === activeKeys.history
      ) {
        refresh();
      }
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === activeKeys.readiness) refresh();
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === activeKeys.history) refresh();
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
  }, [companyId, keys, personaId]);

  if (!companyId || !personaId) return null;

  const health = evaluateModeHealth({
    readinessPct,
    latestScore,
    latestConfidence,
    latestSessionTimestamp,
    interviewDate,
  });

  return (
    <Badge
      variant="outline"
      className={`text-[10px] whitespace-nowrap ${health.className}`}
      title={health.detail}
    >
      {health.shortLabel} · {readinessPct ?? 0}% · {latestScore ?? "N/A"}
    </Badge>
  );
}
