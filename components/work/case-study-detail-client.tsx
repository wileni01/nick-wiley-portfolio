"use client";

import { useState } from "react";

interface Props {
  executiveSummary: string;
  builderSummary: string;
}

export function CaseStudyDetailClient({
  executiveSummary,
  builderSummary,
}: Props) {
  const [mode, setMode] = useState<"executive" | "builder">("executive");

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Summary
        </span>
        <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
          <button
            onClick={() => setMode("executive")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              mode === "executive"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={mode === "executive"}
          >
            Executive
          </button>
          <button
            onClick={() => setMode("builder")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              mode === "builder"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={mode === "builder"}
          >
            Builder
          </button>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        {mode === "executive" ? executiveSummary : builderSummary}
      </p>
    </div>
  );
}
