"use client";

import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { getInterviewDateSummary } from "@/lib/adaptive/interview-date";

export function InterviewCountdownPill() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });

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
