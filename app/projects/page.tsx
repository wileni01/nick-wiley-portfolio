import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Side projects and prototypes: RAG pipelines, embedding notebooks, governance toolkits, and grad school ML experiments.",
};

const projects = [
  {
    title: "RAG pipeline prototype",
    description:
      "Embedding-based search over a local document corpus. I built this to test whether RAG could support curated Q&A without exposing sensitive data in a federal context. Short answer: it can, with caveats around chunk size and overlap that matter more than I expected.",
    stack: ["Python", "LangChain (conceptual)", "FAISS", "Embeddings"],
    availability: "Code available on request",
  },
  {
    title: "Embedding + clustering notebook",
    description:
      "A reusable Jupyter workflow for encoding text with sentence-transformer embeddings and testing clustering approaches (HDBSCAN, K-Means). I use this as a starting point when scoping NLP projects. Saves about a day of setup each time.",
    stack: ["Python", "Jupyter", "scikit-learn", "sentence-transformers"],
    availability: "Code available on request",
  },
  {
    title: "Tableau governance checklist",
    description:
      "A starter kit for teams adopting Tableau in regulated settings: naming conventions, data source management, accessibility standards, refresh monitoring, publishing workflows. I put this together after seeing the same governance gaps on multiple engagements.",
    stack: ["Tableau", "Documentation", "Governance"],
    availability: "Available on request",
  },
  {
    title: "Stack Overflow code language classifier",
    description:
      "Grad school project. I scraped Stack Overflow posts, extracted code snippets, and trained a Keras deep learning model to identify the programming language. Mostly an exercise in NLP applied to source code. The preprocessing ended up being harder than the model.",
    stack: ["Python", "Keras", "SQL", "NLP", "Deep Learning"],
    availability: "Academic project (2017)",
  },
  {
    title: "DC intersection risk scoring",
    description:
      "ML model that scored Washington, DC intersections by accident risk using historical crash data and environmental features. The real lesson was how much feature engineering matters when your raw data is messy government records.",
    stack: ["Python", "scikit-learn", "Pandas", "Machine Learning"],
    availability: "Academic project (2017)",
  },
  {
    title: "This portfolio site",
    description:
      "Next.js, TypeScript, Tailwind CSS. MDX-driven content, global search, adaptive briefing, dark mode, print-ready resume, accessibility-first design. I built it partly as a portfolio and partly to stay current on frontend tooling.",
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
            Side projects, prototypes, and toolkits I&apos;ve built outside
            of client work. Some are reusable starting points for new
            engagements; others are grad school experiments that taught me
            something I still use.
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
