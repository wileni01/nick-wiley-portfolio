import type { MetadataRoute } from "next";
import { getAllWritingPosts, getCaseStudySlugs } from "@/lib/mdx";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // lastModified is only reported where a real date exists; a build
  // timestamp on every URL tells crawlers nothing useful.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: "monthly" },
    { url: `${baseUrl}/work`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${baseUrl}/resume`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${baseUrl}/writing`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/projects`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: "yearly" },
    { url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: "yearly" },
  ];

  const caseStudies: MetadataRoute.Sitemap = getCaseStudySlugs().map(
    (slug) => ({
      url: `${baseUrl}/work/${slug}`,
      priority: 0.8,
      changeFrequency: "yearly",
    })
  );

  const writingPosts: MetadataRoute.Sitemap = getAllWritingPosts().map(
    (post) => ({
      url: `${baseUrl}/writing/${post.slug}`,
      lastModified: new Date(post.date),
      priority: 0.7,
      changeFrequency: "yearly",
    })
  );

  return [...staticPages, ...caseStudies, ...writingPosts];
}
