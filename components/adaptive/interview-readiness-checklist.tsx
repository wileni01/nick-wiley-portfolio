"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import {
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "@/lib/adaptive/readiness-checklist";
import {
  areBooleanStateRecordsEqual,
  serializeBooleanStateRecord,
} from "@/lib/adaptive/boolean-state";

export function InterviewReadinessChecklist() {
  const { companyId, personaId } = useInterviewMode();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const checklistItems = useMemo(() => {
    if (!companyId || !personaId) return [];
    return getReadinessChecklist(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !checklistItems.length) return;
    const storageKey = getReadinessStorageKey(companyId, personaId);

    function refresh() {
      const storedRaw = localStorage.getItem(storageKey);
      if (!storedRaw) {
        setChecked((prev) => (Object.keys(prev).length ? {} : prev));
        return;
      }

      const parsed = parseReadinessState(storedRaw);
      if (!Object.keys(parsed).length && storedRaw) {
        localStorage.removeItem(storageKey);
        setChecked((prev) => (Object.keys(prev).length ? {} : prev));
        return;
      }
      setChecked((prev) =>
        areBooleanStateRecordsEqual(prev, parsed) ? prev : parsed
      );
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === storageKey) refresh();
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === storageKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
    };
  }, [checklistItems.length, companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !checklistItems.length) return;
    const storageKey = getReadinessStorageKey(companyId, personaId);
    const serialized = serializeBooleanStateRecord(checked, {
      truthyOnly: true,
    });
    if (serialized === "{}") {
      if (localStorage.getItem(storageKey) === null) return;
      localStorage.removeItem(storageKey);
      window.dispatchEvent(
        new CustomEvent("adaptive-readiness-updated", { detail: { key: storageKey } })
      );
      return;
    }

    if (localStorage.getItem(storageKey) === serialized) return;
    localStorage.setItem(storageKey, serialized);
    window.dispatchEvent(
      new CustomEvent("adaptive-readiness-updated", { detail: { key: storageKey } })
    );
  }, [checked, checklistItems.length, companyId, personaId]);

  if (!companyId || !personaId || !checklistItems.length) return null;

  const { completedCount, completionPct } = getReadinessCompletion(
    checklistItems,
    checked
  );

  function toggleItem(itemId: string) {
    setChecked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function resetChecklist() {
    setChecked((prev) => (Object.keys(prev).length ? {} : prev));
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
