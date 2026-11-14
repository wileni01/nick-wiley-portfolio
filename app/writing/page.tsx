import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllWritingPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on releasing software and working with coding assistants.",
  alternates: { canonical: "/writing" },
};

export default function WritingPage() {
  const posts = getAllWritingPosts().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="article-shell page-space">
      <header className="page-heading"><h1>Writing</h1></header>
      <ul className="work-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/writing/${post.slug}`} className="work-list-link">
              <div>
                <time className="eyebrow" dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</time>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>
              <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
