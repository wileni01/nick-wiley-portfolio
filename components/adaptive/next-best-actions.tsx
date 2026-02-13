"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import {
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "@/lib/adaptive/readiness-checklist";
import {
  getPrepHistoryStorageKey,
  parsePrepHistory,
} from "@/lib/adaptive/prep-history";
import { buildNextActions } from "@/lib/adaptive/next-actions";

function getPriorityStyle(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return {
      icon: <AlertCircle className="h-3.5 w-3.5 text-primary" />,
      label: "High priority",
    };
  }
  if (priority === "medium") {
    return {
      icon: <ArrowUpRight className="h-3.5 w-3.5 text-primary" />,
      label: "Medium priority",
    };
  }
  return {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />,
    label: "Maintenance",
  };
}

export function NextBestActions() {
  const { companyId, personaId } = useInterviewMode();
  const [readiness, setReadiness] = useState({
    completed: 0,
    total: 0,
    pct: 0,
  });
  const [historyScore, setHistoryScore] = useState<number | null>(null);
  const [historyConfidence, setHistoryConfidence] = useState<number | null>(null);
  const [historyThemes, setHistoryThemes] = useState<string[]>([]);

  const bundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const readinessKey = getReadinessStorageKey(activeCompanyId, activePersonaId);
    const historyKey = getPrepHistoryStorageKey(activeCompanyId, activePersonaId);

    function refresh() {
      const checklistItems = getReadinessChecklist(activeCompanyId, activePersonaId);
      const readinessState = parseReadinessState(localStorage.getItem(readinessKey));
      const completion = getReadinessCompletion(checklistItems, readinessState);
      setReadiness({
        completed: completion.completedCount,
        total: checklistItems.length,
        pct: completion.completionPct,
      });

      const history = parsePrepHistory(localStorage.getItem(historyKey));
      setHistoryScore(history[0]?.averageScore ?? null);
      setHistoryConfidence(history[0]?.averageConfidence ?? null);
      setHistoryThemes(history[0]?.topThemes ?? []);
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === readinessKey || event.key === historyKey) {
        refresh();
      }
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === readinessKey) refresh();
    }

    function onPrepHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === historyKey) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-prep-history-updated", onPrepHistoryUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener(
        "adaptive-prep-history-updated",
        onPrepHistoryUpdate
      );
    };
  }, [companyId, personaId]);

  if (!bundle) return null;

  const actions = buildNextActions({
    readinessPct: readiness.pct,
    readinessCompleted: readiness.completed,
    readinessTotal: readiness.total,
    latestScore: historyScore,
    latestConfidence: historyConfidence,
    latestThemes: historyThemes,
    topResourceTitle: bundle.topRecommendations[0]?.asset.title,
  });

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Next best actions</h3>
        <Badge variant="outline">{actions.length} action(s)</Badge>
      </div>

      <ul className="space-y-2">
        {actions.map((action) => {
          const priorityStyle = getPriorityStyle(action.priority);
          return (
            <li key={action.id} className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium inline-flex items-center gap-1.5">
                  {priorityStyle.icon}
                  {action.title}
                </p>
                <Badge variant="muted" className="text-[10px] uppercase">
                  {priorityStyle.label}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{action.detail}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
