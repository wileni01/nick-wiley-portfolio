"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { parsePrepHistory, getPrepHistoryStorageKey } from "@/lib/adaptive/prep-history";
import { buildTargetedDrills } from "@/lib/adaptive/drills";
import { getDrillStateStorageKey } from "@/lib/adaptive/storage-keys";

export function TargetedDrills() {
  const { companyId, personaId } = useInterviewMode();
  const [themes, setThemes] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const drills = useMemo(() => buildTargetedDrills({ themes }), [themes]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const historyKey = getPrepHistoryStorageKey(activeCompanyId, activePersonaId);

    function refreshThemes() {
      const history = parsePrepHistory(localStorage.getItem(historyKey));
      setThemes(history[0]?.topThemes ?? []);
    }

    refreshThemes();

    function onStorage(event: StorageEvent) {
      if (event.key === historyKey) refreshThemes();
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === historyKey) refreshThemes();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const key = getDrillStateStorageKey(activeCompanyId, activePersonaId);

    function refreshChecked() {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setChecked({});
        return;
      }
      try {
        setChecked(JSON.parse(raw) as Record<string, boolean>);
      } catch {
        setChecked({});
        localStorage.removeItem(key);
      }
    }

    refreshChecked();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refreshChecked();
    }

    function onDrillStateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refreshChecked();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-drill-state-updated", onDrillStateUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-drill-state-updated",
        onDrillStateUpdate
      );
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const key = getDrillStateStorageKey(activeCompanyId, activePersonaId);
    localStorage.setItem(key, JSON.stringify(checked));
  }, [checked, companyId, personaId]);

  if (!companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  const completed = drills.filter((drill) => checked[drill.id]).length;

  function toggleDrill(drillId: string) {
    setChecked((prev) => ({ ...prev, [drillId]: !prev[drillId] }));
  }

  function resetDrills() {
    setChecked({});
    const key = getDrillStateStorageKey(activeCompanyId, activePersonaId);
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("adaptive-drill-state-updated", { detail: { key } })
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          Targeted drills
        </h3>
        <Badge variant="outline">
          {completed}/{drills.length} practiced
        </Badge>
      </div>

      <ul className="space-y-2">
        {drills.map((drill) => {
          const isDone = Boolean(checked[drill.id]);
          return (
            <li key={drill.id} className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium inline-flex items-center gap-1.5">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : null}
                  {drill.title}
                </p>
                <Badge variant="muted" className="text-[10px]">
                  {drill.theme}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{drill.instruction}</p>
              <p className="mt-1 text-xs text-muted-foreground italic">
                Starter: {drill.starterPrompt}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-xs"
                onClick={() => toggleDrill(drill.id)}
              >
                {isDone ? "Mark unpracticed" : "Mark practiced"}
              </Button>
            </li>
          );
        })}
      </ul>

      <Button size="sm" variant="ghost" onClick={resetDrills}>
        Reset drills
      </Button>
    </div>
  );
}
