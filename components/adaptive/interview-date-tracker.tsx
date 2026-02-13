"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";
import { buildInterviewPrepCalendarIcs } from "@/lib/adaptive/interview-calendar";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";

export function InterviewDateTracker() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [downloadState, setDownloadState] = useState<"idle" | "done">("idle");

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
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  function downloadCalendarPlan() {
    if (!interviewDate) return;
    const companyName = company?.name ?? activeCompanyId;
    const personaName = persona?.name ?? activePersonaId;
    const icsContent = buildInterviewPrepCalendarIcs({
      companyName,
      personaName,
      interviewDate,
    });
    if (!icsContent) return;

    const safeCompany = activeCompanyId.replace(/[^a-z0-9-]/gi, "-");
    const safePersona = activePersonaId.replace(/[^a-z0-9-]/gi, "-");
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-prep-calendar-${safeCompany}-${safePersona}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadState("done");
    setTimeout(() => setDownloadState("idle"), 1800);
  }

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
        <Button
          size="sm"
          variant="ghost"
          onClick={downloadCalendarPlan}
          disabled={!interviewDate}
        >
          {downloadState === "done" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Downloaded .ics
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download .ics plan
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Set your interview date to contextualize readiness and prep urgency, then
        export a calendar plan with prep checkpoints.
      </p>
    </div>
  );
}
