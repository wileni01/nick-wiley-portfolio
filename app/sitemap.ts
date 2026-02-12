import type { MetadataRoute } from "next";
import { getCaseStudySlugs } from "@/lib/mdx";
import { getWritingPostSlugs } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nickwiley.dev";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/work`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/writing`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/resume`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.6 },
  ];

  const caseStudies = getCaseStudySlugs().map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const writingPosts = getWritingPostSlugs().map((slug) => ({
    url: `${baseUrl}/writing/${slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticPages, ...caseStudies, ...writingPosts];
}
