"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useAdaptiveMaybe } from "./adaptive-provider";
import { Badge } from "@/components/ui/badge";

/**
 * Shows a contextual skills highlight card when adaptive mode is active.
 * Displays the persona's focus tags and recommendation goal.
 */
export function SkillsHighlight() {
  const adaptive = useAdaptiveMaybe();

  if (!adaptive?.isActive || !adaptive.company || !adaptive.persona) {
    return null;
  }

  const { company, persona } = adaptive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-semibold text-foreground">
          Skills relevant to {company.name}
        </p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {persona.recommendationGoal}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {persona.focusTags.map((tag) => (
          <Badge
            key={tag}
            variant="muted"
            className="text-[10px] border-primary/20"
          >
            {tag.replace(/-/g, " ")}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {company.priorityTags
          .filter((t) => !persona.focusTags.includes(t))
          .slice(0, 4)
          .map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px]">
              {tag.replace(/-/g, " ")}
            </Badge>
          ))}
      </div>
    </motion.div>
  );
}
