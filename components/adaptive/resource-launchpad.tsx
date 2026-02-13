"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Rocket, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { useTransientState } from "./use-transient-state";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import { getLaunchpadStorageKey } from "@/lib/adaptive/storage-keys";
import { openExternalUrl } from "@/lib/external-link";

export function ResourceLaunchpad() {
  const { companyId, personaId } = useInterviewMode();
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [openState, setOpenState] = useTransientState<
    "idle" | "opened" | "partial" | "error"
  >("idle", 1800);

  const bundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getLaunchpadStorageKey(companyId, personaId);

    function refresh() {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setOpened({});
        return;
      }
      try {
        setOpened(JSON.parse(raw) as Record<string, boolean>);
      } catch {
        setOpened({});
        localStorage.removeItem(key);
      }
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refresh();
    }

    function onLaunchpadUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-launchpad-updated", onLaunchpadUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-launchpad-updated",
        onLaunchpadUpdate
      );
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getLaunchpadStorageKey(companyId, personaId);
    localStorage.setItem(key, JSON.stringify(opened));
    window.dispatchEvent(
      new CustomEvent("adaptive-launchpad-updated", { detail: { key } })
    );
  }, [companyId, opened, personaId]);

  if (!bundle || !companyId || !personaId) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  const resources = bundle.topRecommendations.slice(0, 5);
  const openedCount = resources.filter((resource) => opened[resource.asset.id]).length;
  const remainingResources = resources.filter(
    (resource) => !opened[resource.asset.id]
  );

  function markOpened(resourceId: string) {
    setOpened((prev) => ({ ...prev, [resourceId]: true }));
  }

  function markAllOpened() {
    const merged = resources.reduce<Record<string, boolean>>((acc, resource) => {
      acc[resource.asset.id] = true;
      return acc;
    }, { ...opened });
    setOpened(merged);
  }

  function openRemaining() {
    if (!remainingResources.length) return;
    const openedIds: string[] = [];
    remainingResources.forEach((resource) => {
      if (openExternalUrl(resource.asset.url)) {
        openedIds.push(resource.asset.id);
      }
    });
    if (openedIds.length) {
      setOpened((prev) => {
        const merged = { ...prev };
        openedIds.forEach((resourceId) => {
          merged[resourceId] = true;
        });
        return merged;
      });
    }
    if (openedIds.length === remainingResources.length) {
      setOpenState("opened");
      return;
    }
    if (openedIds.length > 0) {
      setOpenState("partial");
      return;
    }
    setOpenState("error");
  }

  function resetLaunchpad() {
    setOpened({});
    const key = getLaunchpadStorageKey(activeCompanyId, activePersonaId);
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("adaptive-launchpad-updated", { detail: { key } })
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          Resource launchpad
        </h3>
        <Badge variant="outline">
          {openedCount}/{resources.length} opened
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={openRemaining}
          disabled={!remainingResources.length}
        >
          Open remaining
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={markAllOpened}
          disabled={openedCount === resources.length}
        >
          Mark all opened
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {openState === "opened"
          ? "Remaining resources opened."
          : openState === "partial"
            ? "Some resource pop-ups were blocked."
            : openState === "error"
              ? "Resource pop-up blocked."
              : ""}
      </span>
      {(openState === "partial" || openState === "error") && (
        <p className="text-xs text-muted-foreground">
          Some resource tabs were blocked. Allow pop-ups for this site to open all
          launchpad links automatically.
        </p>
      )}

      <ul className="space-y-2">
        {resources.map((resource) => (
          <li
            key={resource.asset.id}
            className="rounded-md border border-border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-medium inline-flex items-center gap-1.5">
                  {opened[resource.asset.id] ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : null}
                  {resource.asset.title}
                </p>
                <p className="text-xs text-muted-foreground">{resource.reason}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markOpened(resource.asset.id)}
                asChild
              >
                <Link
                  href={resource.asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button size="sm" variant="ghost" onClick={resetLaunchpad}>
        Reset launchpad
      </Button>
    </div>
  );
}
