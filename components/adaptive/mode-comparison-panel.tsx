"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getInterviewRecommendationBundle } from "@/lib/adaptive/recommendations";
import { getPersonaById } from "@/lib/adaptive/profiles";
import type { CompanyId } from "@/lib/adaptive/types";

interface TargetMode {
  companyId: CompanyId;
  personaId: string;
  label: string;
}

function getComparisonTarget(companyId: CompanyId): TargetMode {
  if (companyId === "anthropic") {
    return {
      companyId: "kungfu-ai",
      personaId: "kungfu-cto",
      label: "KUNGFU.AI CTO mode",
    };
  }

  return {
    companyId: "anthropic",
    personaId: "anthropic-ceo",
    label: "Anthropic CEO mode",
  };
}

export function ModeComparisonPanel() {
  const { companyId, personaId, setCompanyId, setPersonaId } = useInterviewMode();

  const currentBundle = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewRecommendationBundle(companyId, personaId);
  }, [companyId, personaId]);

  const comparisonTarget = useMemo(() => {
    if (!companyId) return null;
    return getComparisonTarget(companyId);
  }, [companyId]);

  const comparisonBundle = useMemo(() => {
    if (!comparisonTarget) return null;
    return getInterviewRecommendationBundle(
      comparisonTarget.companyId,
      comparisonTarget.personaId
    );
  }, [comparisonTarget]);

  if (!currentBundle || !comparisonTarget || !comparisonBundle) {
    return null;
  }

  function switchToComparisonMode() {
    setCompanyId(comparisonTarget.companyId);
    const persona = getPersonaById(
      comparisonTarget.companyId,
      comparisonTarget.personaId
    );
    if (persona) {
      setPersonaId(persona.id);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          Mode comparison
        </h3>
        <Button size="sm" variant="outline" onClick={switchToComparisonMode}>
          Switch to {comparisonTarget.label}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="space-y-1">
            <p className="text-xs font-medium">{currentBundle.company.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentBundle.persona.name} — {currentBundle.persona.role}
            </p>
            <Badge variant="outline" className="text-[10px]">
              Current mode
            </Badge>
          </div>
          <ul className="space-y-1">
            {currentBundle.topRecommendations.slice(0, 3).map((recommendation) => (
              <li key={recommendation.asset.id}>
                <Link
                  href={recommendation.asset.url}
                  className="text-xs text-primary hover:underline"
                >
                  {recommendation.asset.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="space-y-1">
            <p className="text-xs font-medium">{comparisonBundle.company.name}</p>
            <p className="text-xs text-muted-foreground">
              {comparisonBundle.persona.name} — {comparisonBundle.persona.role}
            </p>
            <Badge variant="outline" className="text-[10px]">
              Comparison target
            </Badge>
          </div>
          <ul className="space-y-1">
            {comparisonBundle.topRecommendations
              .slice(0, 3)
              .map((recommendation) => (
                <li key={recommendation.asset.id}>
                  <Link
                    href={recommendation.asset.url}
                    className="text-xs text-primary hover:underline"
                  >
                    {recommendation.asset.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
