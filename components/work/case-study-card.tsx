"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useViewMode } from "./mode-toggle";
import { RelevanceBadge } from "@/components/adaptive/relevance-banner";
import type { CaseStudyFrontmatter } from "@/lib/types";

interface CaseStudyCardProps {
  study: CaseStudyFrontmatter;
}

export function CaseStudyCard({ study }: CaseStudyCardProps) {
  const { mode } = useViewMode();
  const hasImage = study.image && !study.image.includes("placeholder");

  return (
    <Link href={`/work/${study.slug}`} className="group block">
      <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {hasImage ? (
            <Image
              src={study.image!}
              alt={study.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                {study.client}
              </span>
            </div>
          )}
          {/* Subtle bottom gradient for depth */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {study.client}
                </p>
                <RelevanceBadge slug={study.slug} />
              </div>
              <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                {study.title}
              </CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {mode === "executive" ? study.executiveSummary : study.builderSummary}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{study.role}</span>
            <span className="text-border">·</span>
            <span>{study.timeframe}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {study.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="muted" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
