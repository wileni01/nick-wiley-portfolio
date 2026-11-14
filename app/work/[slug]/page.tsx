import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/mdx";
import { PressMentions } from "@/components/work/press-mentions";
import { StartupPreview } from "@/components/work/startup-preview";
import { MdxContent } from "@/components/mdx/mdx-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = getCaseStudyBySlug((await params).slug);
  if (!study) return {};
  const url = `/work/${study.slug}`;
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: study.title,
      description: study.summary,
      url,
      images: [{ url: study.image ?? "/og-image.png", alt: study.imageAlt ?? study.title }],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const study = getCaseStudyBySlug((await params).slug);
  if (!study) notFound();

  const cover = study.image && (
    <div className={study.imageKind === "illustrative" ? "project-image project-image-illustration" : "project-image"}>
      <Image
        src={study.image}
        alt={study.imageAlt ?? (study.imageKind === "recreation" ? `Illustrative recreation of ${study.title}` : study.title)}
        fill
        sizes="(min-width: 880px) 800px, 100vw"
        className={study.imageKind === "recreation" ? "object-cover object-top" : "object-cover"}
        preload
      />
    </div>
  );

  return (
    <div className="article-shell page-space">
      <Link href="/work" className="text-link"><ArrowLeft size={15} aria-hidden="true" /> All work</Link>
      <article>
        <header className="page-heading case-heading">
          <p className="eyebrow">{study.client}</p>
          <h1>{study.title}</h1>
          <p className="article-intro">{study.summary}</p>
          <div className="case-meta">
            <span>{study.role}</span>
            {study.timeframe && <span>{study.timeframe}</span>}
            {study.status && <span>{study.status}</span>}
          </div>
        </header>
        {cover && (
          <figure className="case-figure">
            {study.slug === "car-infotainment" ? <StartupPreview>{cover}</StartupPreview> : cover}
            {(study.imageCaption || study.imageKind === "recreation") && (
              <figcaption>{study.imageCaption ?? "Interface recreation with sample data."}</figcaption>
            )}
          </figure>
        )}
        <div className="prose article-body"><MdxContent source={study.content} /></div>
        {study.liveUrl && <a className="text-link mt-4" href={study.liveUrl}>Visit the site <ArrowUpRight size={15} aria-hidden="true" /></a>}
        {study.slug === "visitime-ar" && <PressMentions />}
      </article>
    </div>
  );
}
