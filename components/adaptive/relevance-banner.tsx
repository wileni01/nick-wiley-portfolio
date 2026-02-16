"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAdaptiveMaybe } from "./adaptive-provider";
import { getRecommendationBundle } from "@/lib/adaptive/recommendations";
import { Badge } from "@/components/ui/badge";

/**
 * Shows a banner on the work index page when adaptive mode is active,
 * summarizing what's been reordered and why.
 */
export function RelevanceBanner() {
  const adaptive = useAdaptiveMaybe();

  if (!adaptive?.isActive || !adaptive.companyId || !adaptive.personaId) {
    return null;
  }

  const bundle = getRecommendationBundle(
    adaptive.companyId,
    adaptive.personaId
  );
  if (!bundle) return null;

  const topCount = bundle.topRecommendations.length;
  const topTags = [
    ...new Set(
      bundle.topRecommendations
        .flatMap((r) => r.matchedTags)
        .slice(0, 5)
    ),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
    >
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground">
          Sorted for{" "}
          <span className="font-medium text-foreground">
            {adaptive.company?.name}
          </span>
          {" · "}
          {topCount} most relevant projects highlighted
        </span>
      </div>
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pl-5">
          {topTags.map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Small inline badge that can be placed on individual case study cards
 * to indicate relevance.
 */
export function RelevanceBadge({
  slug,
}: {
  slug: string;
}) {
  const adaptive = useAdaptiveMaybe();

  if (!adaptive?.isActive || !adaptive.companyId || !adaptive.personaId) {
    return null;
  }

  const bundle = getRecommendationBundle(
    adaptive.companyId,
    adaptive.personaId
  );
  if (!bundle) return null;

  const isTop = bundle.topRecommendations.some(
    (r) => r.asset.url === `/work/${slug}`
  );

  if (!isTop) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
      <Sparkles className="h-2.5 w-2.5" />
      Relevant
    </span>
  );
}
