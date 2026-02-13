"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { buildInterviewDayPlan } from "@/lib/adaptive/interview-day-plan";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";
import { parseInterviewDate } from "@/lib/adaptive/interview-date";

export function InterviewDayPlanPanel() {
  const { companyId, personaId } = useInterviewMode();
  const [interviewDate, setInterviewDate] = useState<string | null>(null);

  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  useEffect(() => {
    if (!activeCompanyId || !activePersonaId) {
      setInterviewDate(null);
      return;
    }

    const key = getInterviewDateStorageKey(activeCompanyId, activePersonaId);

    function refresh() {
      setInterviewDate(parseInterviewDate(localStorage.getItem(key)));
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
  }, [activeCompanyId, activePersonaId]);

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
