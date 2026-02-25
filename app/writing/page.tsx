import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllWritingPosts } from "@/lib/mdx";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on AI solution architecture, governance in regulated environments, delivery leadership, and what building real systems teaches you.",
};

export default function WritingPage() {
  const posts = getAllWritingPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Writing</h1>
          <p className="text-lg text-muted-foreground">
            Notes from architecting and delivering AI systems in regulated
            environments. Most of what I write about comes down to
            governance, adoption, and what it takes to make these systems
            trustworthy enough that the people accountable for outcomes
            actually use them.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/writing/${post.slug}`}
              className="group block"
            >
              <Card className="hover:border-primary/30 hover:shadow-md transition-all duration-200">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <time className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                        <div className="flex gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="muted"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
