"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";

export function InterviewDateTracker() {
  const { companyId, personaId } = useInterviewMode();
  const [interviewDate, setInterviewDate] = useState<string>("");

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getInterviewDateStorageKey(companyId, personaId);

    function refresh() {
      const parsed = parseInterviewDate(localStorage.getItem(key));
      setInterviewDate(parsed ?? "");
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refresh();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refresh();
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
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getInterviewDateStorageKey(companyId, personaId);
    if (interviewDate) {
      localStorage.setItem(key, interviewDate);
    } else {
      localStorage.removeItem(key);
    }
    window.dispatchEvent(
      new CustomEvent("adaptive-interview-date-updated", { detail: { key } })
    );
  }, [companyId, interviewDate, personaId]);

  const summary = useMemo(
    () => getInterviewDateSummary(interviewDate || null),
    [interviewDate]
  );

  if (!companyId || !personaId) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Interview date tracker
        </h3>
        <Badge variant="outline">{summary.label}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={interviewDate}
          onChange={(event) => setInterviewDate(event.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          aria-label="Set interview date"
        />
        <Button size="sm" variant="ghost" onClick={() => setInterviewDate("")}>
          Clear date
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Set your interview date to contextualize readiness and prep urgency.
      </p>
    </div>
  );
}
