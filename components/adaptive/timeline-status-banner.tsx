"use client";

import { AlertTriangle, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { getInterviewDateSummary } from "@/lib/adaptive/interview-date";
import { TimelineQuickFixActions } from "./timeline-quick-fix-actions";

export function TimelineStatusBanner() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });

  if (!companyId || !personaId) return null;
  const summary = getInterviewDateSummary(interviewDate);

  if (summary.daysUntil !== null && summary.daysUntil > 2) return null;

  const mode: "set" | "reset" =
    summary.daysUntil === null ? "set" : summary.daysUntil < 0 ? "reset" : "set";
  const isImminent = summary.daysUntil !== null && summary.daysUntil >= 0 && summary.daysUntil <= 2;
  const severityClass =
    isImminent
      ? "border-rose-400/60 bg-rose-50/40 dark:bg-rose-950/20"
      : "border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20";

  const detail =
    summary.daysUntil === null
      ? "Set your interview date to unlock countdown-aware pacing and timeline-specific prep guidance."
      : summary.daysUntil < 0
        ? "Your tracked interview date has passed. Reset to your next target to reactivate timeline guidance."
        : summary.daysUntil === 0
          ? "Interview is today. Run one final pressure-mode rehearsal and tighten your opening + closing statements."
          : "Interview is within 48 hours. Prioritize one full pressure-mode run and close the top readiness gaps.";

  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${severityClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium inline-flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Timeline status
        </p>
        <Badge variant="outline" className="text-[10px]">
          <CalendarClock className="mr-1 h-3 w-3" />
          {summary.label}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
      {(summary.daysUntil === null || summary.daysUntil < 0) && (
        <TimelineQuickFixActions
          companyId={companyId}
          personaId={personaId}
          mode={mode}
          showOpenTrackerButton={false}
        />
      )}
      <div className="flex flex-wrap gap-1.5">
        {isImminent ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => scrollToSection("adaptive-mock-session")}
            >
              Go to mock session
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => scrollToSection("adaptive-interview-day-plan")}
            >
              Open day plan
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={() => scrollToSection("adaptive-interview-date-tracker")}
          >
            Open date tracker
          </Button>
        )}
      </div>
    </div>
  );
}
