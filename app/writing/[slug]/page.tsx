import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWritingPostBySlug, getWritingPostSlugs } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-3">
          <Link href="/writing">
            <ArrowLeft className="h-4 w-4" />
            All Writing
          </Link>
        </Button>

        {/* Header */}
        <header className="space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <time className="text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <div className="flex gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="muted" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="prose max-w-none">
          <MdxContent source={post.content} />
        </article>
      </div>
    </div>
  );
}
