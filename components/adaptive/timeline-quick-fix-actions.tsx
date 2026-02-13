"use client";

import { Button } from "@/components/ui/button";
import { setInterviewDateOffsetForMode } from "@/lib/adaptive/interview-date-actions";

interface TimelineQuickFixActionsProps {
  companyId: string;
  personaId: string;
  mode: "set" | "reset";
  showOpenTrackerButton?: boolean;
}

export function TimelineQuickFixActions({
  companyId,
  personaId,
  mode,
  showOpenTrackerButton = true,
}: TimelineQuickFixActionsProps) {
  function applyOffset(daysFromNow: number) {
    setInterviewDateOffsetForMode(companyId, personaId, daysFromNow);
  }

  function scrollToDateTracker() {
    if (typeof document === "undefined") return;
    const target = document.getElementById("adaptive-interview-date-tracker");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-[11px]"
        onClick={() => applyOffset(7)}
      >
        {mode === "set" ? "Set +7d" : "Reset +7d"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-[11px]"
        onClick={() => applyOffset(14)}
      >
        {mode === "set" ? "Set +14d" : "Reset +14d"}
      </Button>
      {showOpenTrackerButton ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px]"
          onClick={scrollToDateTracker}
        >
          Open tracker
        </Button>
      ) : null}
    </div>
  );
}
