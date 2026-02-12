"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Github, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const isTemplate = project.status === "template";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/projects/${project.slug}`}>
        <div
          className={`group relative h-full overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
            isTemplate
              ? "border-dashed border-amber-500/50 hover:border-amber-500 hover:shadow-amber-500/5"
              : "border-border hover:border-primary/50 hover:shadow-primary/5"
          }`}
        >
          {/* Image / Gradient Header */}
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-primary/10">
                  {project.title.replace(/[\[\]]/g, "").charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              {project.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="backdrop-blur-sm text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
            {isTemplate && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-500/90 text-white backdrop-blur-sm text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Template
                </Badge>
              </div>
            )}
            {project.agency && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="outline" className="backdrop-blur-sm text-xs border-white/20 text-white/80">
                  {project.agency}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="muted" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 4 && (
                <Badge variant="muted" className="text-xs">
                  +{project.technologies.length - 4}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                {isTemplate ? "Edit Template" : "View Details"}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="flex items-center gap-2">
                {project.github && <Github className="h-4 w-4" />}
                {project.live && <ExternalLink className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
