"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAdaptive } from "./adaptive-provider";
import { getRecommendationBundle } from "@/lib/adaptive/recommendations";

export function PersonalizedHero() {
  const { isActive, companyId, personaId, company, persona } = useAdaptive();

  if (!isActive || !companyId || !personaId || !company || !persona) {
    return null;
  }

  const bundle = getRecommendationBundle(companyId, personaId);
  if (!bundle) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Tailored for {company.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Viewing as{" "}
            <span className="font-medium text-foreground">
              {persona.name}
            </span>{" "}
            — {persona.role}
          </p>
        </div>
      </div>

      {bundle.highlights.length > 0 && (
        <div className="space-y-1.5 pl-11">
          {bundle.highlights.map((highlight, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">
              {highlight}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
