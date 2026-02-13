"use client";

import { useMemo } from "react";
import { CalendarClock, Check, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { useTransientState } from "./use-transient-state";
import {
  getInterviewDateSummary,
} from "@/lib/adaptive/interview-date";
import {
  buildInterviewGoogleCalendarEvents,
  buildInterviewGoogleCalendarUrl,
  buildInterviewPrepCalendarIcs,
} from "@/lib/adaptive/interview-calendar";
import { buildInterviewDateOffsetValue } from "@/lib/adaptive/interview-date-actions";
import { sanitizeFileToken, triggerDownload } from "@/lib/download";

export function InterviewDateTracker() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const { interviewDate, setInterviewDate } = useModeInterviewDate({
    companyId,
    personaId,
  });
  const [downloadState, setDownloadState] = useTransientState<
    "idle" | "done" | "error"
  >("idle", 1800);

  const summary = useMemo(
    () => getInterviewDateSummary(interviewDate),
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
  const interviewEventUrl =
    googleCalendarEvents.find((event) => event.id === "interview")?.url ?? "";

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

    const downloaded = triggerDownload({
      content: icsContent,
      mimeType: "text/calendar;charset=utf-8",
      filename: `interview-prep-calendar-${sanitizeFileToken(
        activeCompanyId,
        "company"
      )}-${sanitizeFileToken(activePersonaId, "persona")}.ics`,
    });
    setDownloadState(downloaded ? "done" : "error");
  }

  function openGoogleCalendar() {
    const url =
      interviewEventUrl ||
      (interviewDate
        ? buildInterviewGoogleCalendarUrl({
            companyName,
            personaName,
            interviewDate,
          })
        : "");
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function setDateOffset(daysFromNow: number) {
    setInterviewDate(buildInterviewDateOffsetValue(daysFromNow));
  }

  function openGoogleCalendarCheckpoint(url: string) {
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
          value={interviewDate ?? ""}
          onChange={(event) => setInterviewDate(event.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          aria-label="Set interview date"
        />
        <Button size="sm" variant="ghost" onClick={() => setInterviewDate(null)}>
          Clear date
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={openGoogleCalendar}
          disabled={!interviewEventUrl}
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
          ) : downloadState === "error" ? (
            <>
              <Download className="h-3.5 w-3.5" />
              Download failed
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
            {googleCalendarEvents.map((event) => (
              <Button
                key={event.id}
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                onClick={() => openGoogleCalendarCheckpoint(event.url)}
              >
                {event.id === "prep-2d"
                  ? "T-2 anchor review"
                  : event.id === "prep-1d"
                    ? "T-1 pressure mock"
                    : "Interview day"}
              </Button>
            ))}
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
      {downloadState === "error" && (
        <p className="text-xs text-muted-foreground">
          Could not start calendar download automatically. Try again after
          interacting with the page.
        </p>
      )}
    </div>
  );
}
