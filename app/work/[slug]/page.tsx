import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaseStudyDetailClient } from "@/components/work/case-study-detail-client";
import { PressMentions } from "@/components/work/press-mentions";
import { MdxContent } from "@/components/mdx/mdx-content";

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

  const image =
    study.image && !study.image.includes("placeholder")
      ? study.image
      : "/og-image.png";

  return {
    title: study.title,
    description: study.executiveSummary,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: {
      type: "article",
      title: study.title,
      description: study.executiveSummary,
      url: `/work/${study.slug}`,
      images: [{ url: image, alt: study.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.executiveSummary,
      images: [image],
    },
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
            {study.liveUrl && (
              <>
                <span className="text-border">·</span>
                <a
                  href={study.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Visit live site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </div>

          {/* Executive / Builder toggle summary */}
          <CaseStudyDetailClient
            executiveSummary={study.executiveSummary}
            builderSummary={study.builderSummary}
          />
        </header>

        {/* Press & Mentions, VisiTime / InSite Gettysburg only */}
        {slug === "visitime-ar" && <PressMentions />}

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 pt-2 mb-10">
          {study.stack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Hero image */}
        {study.image && !study.image.includes("placeholder") && (
          <figure className="mb-10">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              <Image
                src={study.image}
                alt={imageAlt(study)}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover object-top"
                priority
              />
            </div>
            {imageCaption(study) && (
              <figcaption className="mt-2 text-xs text-muted-foreground">
                {imageCaption(study)}
              </figcaption>
            )}
          </figure>
        )}

        {/* MDX Content */}
        <article className="prose max-w-none">
          <MdxContent source={study.content} />
        </article>
      </div>
    </div>
  );
}

function imageAlt(study: { title: string; imageKind?: string }) {
  if (study.imageKind === "recreation") {
    return `Representative recreation of the ${study.title} interface`;
  }
  if (study.imageKind === "photo") return study.title;
  return `Screenshot of ${study.title}`;
}

function imageCaption(study: { imageKind?: string; imageCaption?: string }) {
  if (study.imageCaption) return study.imageCaption;
  if (study.imageKind === "recreation") {
    return "Representative recreation of the interface, built from this case study with illustrative data. The agency's actual systems and data are not publicly shareable.";
  }
  if (study.imageKind === "screenshot") return "Screenshot of the shipped product.";
  return null;
}
