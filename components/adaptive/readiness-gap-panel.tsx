"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import {
  getIncompleteReadinessItems,
  getReadinessChecklist,
  getReadinessStorageKey,
  parseReadinessState,
  type ReadinessChecklistItem,
} from "@/lib/adaptive/readiness-checklist";
import { getLaunchpadStorageKey } from "@/lib/adaptive/storage-keys";

interface ResourceGap {
  id: string;
  title: string;
  url: string;
  reason: string;
}

export function ReadinessGapPanel() {
  const { companyId, personaId } = useInterviewMode();
  const [incompleteItems, setIncompleteItems] = useState<ReadinessChecklistItem[]>([]);
  const [resourceGaps, setResourceGaps] = useState<ResourceGap[]>([]);

  const bundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId || !bundle) {
      setIncompleteItems([]);
      setResourceGaps([]);
      return;
    }
    const activeCompanyId = companyId;
    const activePersonaId = personaId;
    const activeBundle = bundle;

    const keys = {
      readiness: getReadinessStorageKey(activeCompanyId, activePersonaId),
      launchpad: getLaunchpadStorageKey(activeCompanyId, activePersonaId),
    };

    function refresh() {
      const checklist = getReadinessChecklist(activeCompanyId, activePersonaId);
      const readinessState = parseReadinessState(
        localStorage.getItem(keys.readiness)
      );
      setIncompleteItems(getIncompleteReadinessItems(checklist, readinessState));

      let launchpadState: Record<string, boolean> = {};
      const rawLaunchpad = localStorage.getItem(keys.launchpad);
      if (rawLaunchpad) {
        try {
          launchpadState = JSON.parse(rawLaunchpad) as Record<string, boolean>;
        } catch {
          launchpadState = {};
        }
      }

      const gaps = activeBundle.topRecommendations
        .filter((recommendation) => !launchpadState[recommendation.asset.id])
        .slice(0, 4)
        .map((recommendation) => ({
          id: recommendation.asset.id,
          title: recommendation.asset.title,
          url: recommendation.asset.url,
          reason: recommendation.reason,
        }));
      setResourceGaps(gaps);
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === keys.readiness || event.key === keys.launchpad) refresh();
    }

    function onReadinessUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.readiness) refresh();
    }

    function onLaunchpadUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === keys.launchpad) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-readiness-updated", onReadinessUpdate);
    window.addEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-readiness-updated", onReadinessUpdate);
      window.removeEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    };
  }, [bundle, companyId, personaId]);

  if (!companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  function markResourceOpened(resourceId: string) {
    const key = getLaunchpadStorageKey(activeCompanyId, activePersonaId);
    let state: Record<string, boolean> = {};
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        state = JSON.parse(raw) as Record<string, boolean>;
      } catch {
        state = {};
      }
    }
    state[resourceId] = true;
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent("adaptive-launchpad-updated", { detail: { key } })
    );
  }

  const gapCount = incompleteItems.length + resourceGaps.length;
  if (!gapCount) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">
          Gap check: no major readiness gaps detected right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Readiness gaps
        </h3>
        <Badge variant="outline">{gapCount} open</Badge>
      </div>

      {incompleteItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Checklist items still open</p>
          <ul className="space-y-1">
            {incompleteItems.slice(0, 4).map((item) => (
              <li key={item.id} className="text-xs text-muted-foreground">
                • {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resourceGaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Recommended resources not opened</p>
          <ul className="space-y-2">
            {resourceGaps.map((resource) => (
              <li
                key={resource.id}
                className="rounded-md border border-border bg-background p-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{resource.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {resource.reason}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      window.open(resource.url, "_blank", "noopener,noreferrer");
                      markResourceOpened(resource.id);
                    }}
                  >
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
