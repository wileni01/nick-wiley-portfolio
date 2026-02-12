"use client";

import { ViewModeProvider, ViewModeToggle } from "./mode-toggle";
import { CaseStudyCard } from "./case-study-card";
import type { CaseStudyFrontmatter } from "@/lib/types";

interface WorkIndexClientProps {
  studies: CaseStudyFrontmatter[];
}

export function WorkIndexClient({ studies }: WorkIndexClientProps) {
  return (
    <ViewModeProvider>
      <div className="space-y-8">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {studies.length} case {studies.length === 1 ? "study" : "studies"}
          </p>
          <ViewModeToggle />
        </div>

        {/* Featured */}
        {studies.some((s) => s.featured) && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Featured
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studies
                .filter((s) => s.featured)
                .map((study) => (
                  <CaseStudyCard key={study.slug} study={study} />
                ))}
            </div>
          </div>
        )}

        {/* All other studies */}
        {studies.some((s) => !s.featured) && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              More work
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studies
                .filter((s) => !s.featured)
                .map((study) => (
                  <CaseStudyCard key={study.slug} study={study} />
                ))}
            </div>
          </div>
        )}
      </div>
    </ViewModeProvider>
  );
}
