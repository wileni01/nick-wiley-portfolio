import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Smaller projects and prototypes — RAG pipelines, embedding notebooks, governance toolkits, and more.",
};

const projects = [
  {
    title: "RAG Pipeline Prototype",
    description:
      "A retrieval-augmented generation pipeline using embedding-based search over a local document corpus. Built to explore how RAG can support curated Q&A experiences without exposing sensitive data.",
    stack: ["Python", "LangChain (conceptual)", "FAISS", "Embeddings"],
    availability: "Code available on request",
  },
  {
    title: "Embedding + Clustering Notebook Template",
    description:
      "A reusable Jupyter notebook workflow for encoding text with transformer embeddings and exploring clustering approaches (HDBSCAN, k-means). Designed as a starting point for NLP exploration projects.",
    stack: ["Python", "Jupyter", "scikit-learn", "sentence-transformers"],
    availability: "Code available on request",
  },
  {
    title: "Tableau Governance Checklist",
    description:
      "A starter kit for teams adopting Tableau in regulated environments. Covers naming conventions, data source management, accessibility standards, refresh monitoring, and publishing workflows.",
    stack: ["Tableau", "Documentation", "Governance"],
    availability: "Available on request",
  },
  {
    title: "Portfolio Site (this site)",
    description:
      "A production-grade portfolio built with Next.js, TypeScript, and Tailwind CSS. Features MDX-driven content, global search, dark mode, print-ready resume, and accessibility-first design.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
    availability: "Source available",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Smaller projects, prototypes, and toolkits. These complement the
            larger case studies and reflect how I explore ideas outside of
            client delivery.
          </p>
        </div>

        {/* Project cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.title}
              className="h-full hover:border-primary/20 transition-colors"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="muted"
                      className="text-[10px]"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {project.availability}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
