import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaseStudyDetailClient } from "@/components/work/case-study-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};

  return {
    title: study.title,
    description: study.executiveSummary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) notFound();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-3">
          <Link href="/work">
            <ArrowLeft className="h-4 w-4" />
            All Case Studies
          </Link>
        </Button>

        {/* Header */}
        <header className="space-y-4 mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {study.client}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
            {study.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{study.role}</span>
            <span className="text-border">·</span>
            <span>{study.timeframe}</span>
          </div>

          {/* Executive / Builder toggle summary */}
          <CaseStudyDetailClient
            executiveSummary={study.executiveSummary}
            builderSummary={study.builderSummary}
          />

          {/* Stack */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {study.stack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </header>

        {/* MDX Content */}
        <article className="prose max-w-none">
          <MdxContent content={study.content} />
        </article>
      </div>
    </div>
  );
}

// Simple MDX-to-HTML renderer using basic markdown parsing
// We parse the MDX content on the server without needing next-mdx-remote for simple markdown
function MdxContent({ content }: { content: string }) {
  // Convert markdown to HTML (basic conversion for common patterns)
  const html = markdownToHtml(content);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function markdownToHtml(md: string): string {
  let html = md;

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Unordered lists
  html = html.replace(
    /(?:^- .+$\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => `<li>${line.replace(/^- /, "")}</li>`)
        .join("\n");
      return `<ul>${items}</ul>`;
    }
  );

  // Paragraphs - wrap remaining text blocks
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      // Don't wrap if it's already HTML
      if (trimmed.startsWith("<")) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}
