"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";
import {
  buildInterviewGoogleCalendarEvents,
  buildInterviewGoogleCalendarUrl,
  buildInterviewPrepCalendarIcs,
} from "@/lib/adaptive/interview-calendar";
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
  const companyName = company?.name ?? companyId ?? "Target Company";
  const personaName = persona?.name ?? personaId ?? "Interviewer";
  const googleCalendarEvents = useMemo(
    () =>
      companyId && personaId && interviewDate
        ? buildInterviewGoogleCalendarEvents({
            companyName,
            personaName,
            interviewDate,
          })
        : [],
    [companyId, companyName, interviewDate, personaId, personaName]
  );

  if (!companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  function downloadCalendarPlan() {
    if (!interviewDate) return;
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

  function openGoogleCalendar() {
    if (!interviewDate) return;
    const url = buildInterviewGoogleCalendarUrl({
      companyName,
      personaName,
      interviewDate,
    });
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function setDateOffset(daysFromNow: number) {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + daysFromNow);
    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");
    setInterviewDate(`${year}-${month}-${day}`);
  }

  function openGoogleCalendarCheckpoint(id: "prep-2d" | "prep-1d" | "interview") {
    const url = googleCalendarEvents.find((event) => event.id === id)?.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openAllGoogleCalendarCheckpoints() {
    if (!googleCalendarEvents.length) return;
    googleCalendarEvents.forEach((event) => {
      window.open(event.url, "_blank", "noopener,noreferrer");
    });
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
          onClick={openGoogleCalendar}
          disabled={!interviewDate}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Google Calendar
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

      {googleCalendarEvents.length > 0 && (
        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium">Google Calendar checkpoints</p>
            <Button size="sm" variant="ghost" onClick={openAllGoogleCalendarCheckpoints}>
              <ExternalLink className="h-3.5 w-3.5" />
              Open all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => openGoogleCalendarCheckpoint("prep-2d")}
            >
              T-2 anchor review
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => openGoogleCalendarCheckpoint("prep-1d")}
            >
              T-1 pressure mock
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => openGoogleCalendarCheckpoint("interview")}
            >
              Interview day
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] text-muted-foreground">Quick set:</p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          onClick={() => setDateOffset(3)}
        >
          In 3 days
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          onClick={() => setDateOffset(7)}
        >
          In 1 week
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          onClick={() => setDateOffset(14)}
        >
          In 2 weeks
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Set your interview date to contextualize readiness and prep urgency, then
        export a calendar plan with prep checkpoints or launch interview + prep
        checkpoint events in Google Calendar.
      </p>
    </div>
  );
}
