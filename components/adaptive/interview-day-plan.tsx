"use client";

import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import { buildInterviewDayPlan } from "@/lib/adaptive/interview-day-plan";

export function InterviewDayPlanPanel() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });

  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  if (!activeCompanyId || !activePersonaId) return null;

  const plan = buildInterviewDayPlan(activeCompanyId, activePersonaId, {
    interviewDate,
  });
  if (!plan) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{plan.title}</h3>
        </div>
        <Badge variant="muted" className="text-[10px]">
          {plan.timelineLabel}
        </Badge>
      </div>

      <ul className="space-y-2">
        {plan.blocks.map((block) => (
          <li key={block.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium">{block.objective}</p>
              <Badge variant="outline" className="text-[10px]">
                {block.phase}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{block.action}</p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Fallback:</span>{" "}
        {plan.fallbackPrompt}
      </p>
    </div>
  );
}
