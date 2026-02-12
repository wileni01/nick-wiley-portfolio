"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Monitor,
  Server,
  Brain,
  Cloud,
  Shield,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { skillCategories } from "@/lib/skills";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Monitor,
  Server,
  Brain,
  Cloud,
  Shield,
  Database,
};

function SkillBar({ level, name }: { level: number; name: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            level >= 90
              ? "bg-primary"
              : level >= 80
              ? "bg-secondary"
              : "bg-accent"
          )}
        />
      </div>
    </div>
  );
}

export default function SkillsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Skills <span className="gradient-text">Matrix</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technical proficiencies across six core domains, backed by real
            production projects and years of hands-on experience.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category, catIndex) => {
            const Icon = iconMap[category.icon] || Monitor;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{category.name}</h2>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <SkillBar level={skill.level} name={skill.name} />
                      {skill.projectSlugs.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {skill.projectSlugs.slice(0, 2).map((slug) => (
                            <Link
                              key={slug}
                              href={`/projects/${slug}`}
                              className="text-[10px] text-primary hover:underline"
                            >
                              {slug}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-border bg-card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Technology Highlights
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {skillCategories.flatMap((cat) =>
              cat.skills
                .filter((s) => s.level >= 85)
                .map((skill) => (
                  <Badge
                    key={skill.name}
                    variant="outline"
                    className="px-4 py-2 text-sm"
                  >
                    {skill.name}
                  </Badge>
                ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
