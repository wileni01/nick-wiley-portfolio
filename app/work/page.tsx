import type { Metadata } from "next";
import { getAllCaseStudies } from "@/lib/mdx";
import { WorkIndexClient } from "@/components/work/work-index-client";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies in AI solution architecture and delivery: NLP pipelines, data platforms, governance frameworks, and decision-support systems for federal agencies.",
};

export default function WorkPage() {
  const studies = getAllCaseStudies();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Work</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Each case study covers the problem, what I built, and what
            changed. You can toggle between Executive and Builder views
            depending on whether you care more about impact or implementation.
          </p>
        </div>

        <WorkIndexClient
          studies={studies.map((s) => ({
            title: s.title,
            slug: s.slug,
            client: s.client,
            timeframe: s.timeframe,
            role: s.role,
            stack: s.stack,
            tags: s.tags,
            featured: s.featured,
            image: s.image,
            executiveSummary: s.executiveSummary,
            builderSummary: s.builderSummary,
          }))}
        />
      </div>
    </div>
  );
}
