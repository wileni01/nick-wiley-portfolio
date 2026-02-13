"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";

export function InterviewCountdownPill() {
  const { companyId, personaId } = useInterviewMode();
  const [interviewDate, setInterviewDate] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewDateStorageKey(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!storageKey) {
      setInterviewDate(null);
      return;
    }
    const activeStorageKey = storageKey;

    function refresh() {
      setInterviewDate(parseInterviewDate(localStorage.getItem(activeStorageKey)));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === activeStorageKey) refresh();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === activeStorageKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-interview-date-updated", onInterviewDateUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-interview-date-updated",
        onInterviewDateUpdate
      );
    };
  }, [storageKey]);

  if (!companyId || !personaId) return null;
  const summary = getInterviewDateSummary(interviewDate);

  if (summary.daysUntil === null) {
    return (
      <Badge variant="muted" className="text-[10px]">
        No date
      </Badge>
    );
  }

  const className =
    summary.daysUntil <= 2 && summary.daysUntil >= 0
      ? "border-rose-400/60 text-rose-700 dark:text-rose-300"
      : summary.daysUntil <= 7 && summary.daysUntil >= 0
        ? "border-amber-400/60 text-amber-700 dark:text-amber-300"
        : "text-muted-foreground";

  return (
    <Badge variant="outline" className={`text-[10px] ${className}`} title={summary.label}>
      {summary.daysUntil >= 0 ? `D-${summary.daysUntil}` : "Passed"}
    </Badge>
  );
}
