"use client";

import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { buildInterviewDayPlan } from "@/lib/adaptive/interview-day-plan";

export function InterviewDayPlanPanel() {
  const { companyId, personaId } = useInterviewMode();

  if (!companyId || !personaId) return null;

  const plan = buildInterviewDayPlan(companyId, personaId);
  if (!plan) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Clock3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{plan.title}</h3>
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
