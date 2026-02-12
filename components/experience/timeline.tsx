"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExperienceEntry } from "@/lib/experience";

const typeIcons = {
  work: Briefcase,
  education: GraduationCap,
  certification: Award,
};

const typeColors = {
  work: "bg-primary/10 text-primary border-primary/30",
  education: "bg-secondary/10 text-secondary border-secondary/30",
  certification: "bg-accent/10 text-accent border-accent/30",
};

interface TimelineEntryProps {
  entry: ExperienceEntry;
  index: number;
}

function TimelineEntry({ entry, index }: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[entry.type];
  const isTemplate = entry.description.includes("[FILL IN]");

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex gap-6"
    >
      {/* Timeline line & dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
            typeColors[entry.type]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="w-0.5 flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 pb-10 group",
        isTemplate && "opacity-70"
      )}>
        <div
          className={cn(
            "rounded-xl border bg-card p-5 transition-all duration-300 cursor-pointer",
            isTemplate
              ? "border-dashed border-amber-500/50 hover:border-amber-500"
              : "border-border hover:border-primary/50 hover:shadow-lg"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {new Date(entry.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  {" — "}
                  {entry.endDate === "Present"
                    ? "Present"
                    : new Date(entry.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                </span>
                {entry.location && (
                  <>
                    <span className="text-border">|</span>
                    <span>{entry.location}</span>
                  </>
                )}
              </div>
              <h3 className="text-lg font-semibold">{entry.title}</h3>
              <p className="text-sm text-primary font-medium">
                {entry.organization}
              </p>
            </div>
            <button className="mt-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-muted-foreground">
            {entry.description}
          </p>

          {/* Expanded Content */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Highlights */}
              {entry.highlights.length > 0 && (
                <ul className="space-y-2">
                  {entry.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}

              {/* Technologies */}
              {entry.technologies && entry.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.technologies.map((tech) => (
                    <Badge key={tech} variant="muted" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TimelineProps {
  entries: ExperienceEntry[];
  title: string;
}

export function Timeline({ entries, title }: TimelineProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="relative">
        {entries.map((entry, index) => (
          <TimelineEntry key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
