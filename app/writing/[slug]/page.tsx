import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWritingPostBySlug, getWritingPostSlugs } from "@/lib/mdx";
import { MdxContent } from "@/components/mdx/mdx-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getWritingPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getWritingPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/writing/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Nicholas A. Wiley"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getWritingPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="article-shell page-space">
      <Link href="/writing" className="text-link"><ArrowLeft size={15} aria-hidden="true" /> All writing</Link>
      <article>
        <header className="page-heading case-heading">
          <time className="eyebrow" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
          </time>
          <h1>{post.title}</h1>
        </header>
        <div className="prose article-body"><MdxContent source={post.content} /></div>
      </article>
    </div>
  );
}
