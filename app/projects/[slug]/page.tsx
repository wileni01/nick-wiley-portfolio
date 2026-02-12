import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects, getProjectBySlug } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // We need to handle this synchronously for static generation
  return params.then(({ slug }) => {
    const project = getProjectBySlug(slug);
    if (!project) return { title: "Project Not Found" };
    return {
      title: project.title,
      description: project.description,
    };
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const isTemplate = project.status === "template";

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Template Banner */}
        {isTemplate && (
          <div className="mb-8 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-500">
                  Template Project — Fill In Your Details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This is a placeholder for a {project.agency} project. Replace the
                  [FILL IN] markers with your actual project details. Edit the
                  project data in <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/projects.ts</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {project.category.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
            {project.agency && (
              <Badge variant="outline">{project.agency}</Badge>
            )}
            <Badge
              variant={
                project.status === "completed"
                  ? "default"
                  : project.status === "template"
                  ? "muted"
                  : "secondary"
              }
            >
              {project.status === "completed"
                ? "Completed"
                : project.status === "template"
                ? "Template"
                : "In Progress"}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {project.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {project.live && (
              <Button asChild>
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Site
                </a>
              </Button>
            )}
            {project.github && (
              <Button asChild variant="outline">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Image */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          {project.image ? (
            <div className="relative h-64 sm:h-96">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center sm:h-80">
              <span className="text-6xl font-bold text-primary/10">
                {project.title.replace(/[\[\]]/g, "").charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Problem / Solution / Impact */}
        {(project.problem || project.solution || project.impact) && (
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {project.problem && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="font-semibold">Problem</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.problem}
                </p>
              </div>
            )}
            {project.solution && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="font-semibold">Solution</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.solution}
                </p>
              </div>
            )}
            {project.impact && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-semibold">Impact</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.impact}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Long Description */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <h2>About This Project</h2>
          {project.longDescription.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph.trim()}</p>
          ))}
        </div>

        {/* Technologies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="px-4 py-2 text-sm"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-border pt-8">
          <Button asChild variant="outline">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to All Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
