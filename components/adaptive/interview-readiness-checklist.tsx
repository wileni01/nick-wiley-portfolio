"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getReadinessChecklist } from "@/lib/adaptive/readiness-checklist";

function getChecklistStorageKey(companyId: string, personaId: string) {
  return `adaptive.readiness.${companyId}.${personaId}`;
}

export function InterviewReadinessChecklist() {
  const { companyId, personaId } = useInterviewMode();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const checklistItems = useMemo(() => {
    if (!companyId || !personaId) return [];
    return getReadinessChecklist(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !checklistItems.length) return;

    const storedRaw = localStorage.getItem(
      getChecklistStorageKey(companyId, personaId)
    );
    if (!storedRaw) {
      setChecked({});
      return;
    }

    try {
      const parsed = JSON.parse(storedRaw) as Record<string, boolean>;
      setChecked(parsed);
    } catch {
      localStorage.removeItem(getChecklistStorageKey(companyId, personaId));
      setChecked({});
    }
  }, [checklistItems.length, companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !checklistItems.length) return;
    localStorage.setItem(
      getChecklistStorageKey(companyId, personaId),
      JSON.stringify(checked)
    );
  }, [checked, checklistItems.length, companyId, personaId]);

  if (!companyId || !personaId || !checklistItems.length) return null;

  const completedCount = checklistItems.filter((item) => checked[item.id]).length;
  const completionPct = Math.round((completedCount / checklistItems.length) * 100);

  function toggleItem(itemId: string) {
    setChecked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function resetChecklist() {
    setChecked({});
    if (companyId && personaId) {
      localStorage.removeItem(getChecklistStorageKey(companyId, personaId));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Interview readiness checklist
        </h3>
        <Badge variant="outline">
          {completedCount}/{checklistItems.length} complete ({completionPct}%)
        </Badge>
      </div>

      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${completionPct}%` }}
          aria-hidden="true"
        />
      </div>

      <ul className="space-y-2">
        {checklistItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <li key={item.id}>
              <label className="flex items-start gap-2 rounded-md border border-border bg-background p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <div className="space-y-1">
                  <p className="text-xs font-medium inline-flex items-center gap-1">
                    {isChecked ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : null}
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.helper}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <Button size="sm" variant="ghost" onClick={resetChecklist}>
        Reset checklist
      </Button>
    </div>
  );
}
