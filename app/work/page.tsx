import type { Metadata } from "next";
import { getAllCaseStudies } from "@/lib/mdx";
import { WorkIndexClient } from "@/components/work/work-index-client";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies from federal analytics, ML decision-support tools, data platforms, and startup product delivery.",
};

export default function WorkPage() {
  const studies = getAllCaseStudies();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Case Studies</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Selected work from federal analytics, ML decision-support tooling,
            data platforms, and startup product delivery. Toggle between
            Executive and Builder views to see different angles.
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
            executiveSummary: s.executiveSummary,
            builderSummary: s.builderSummary,
          }))}
        />
      </div>
    </div>
  );
}
