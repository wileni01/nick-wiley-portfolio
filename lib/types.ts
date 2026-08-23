import { z } from "zod";

// ── Case Study Frontmatter ──────────────────────────────────────
export const caseStudySchema = z.object({
  title: z.string(),
  slug: z.string(),
  client: z.string(),
  timeframe: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  image: z.string().optional(),
  /** How the image was produced; drives the caption under the hero image. */
  imageKind: z.enum(["screenshot", "recreation", "photo"]).optional(),
  /** Optional override for the caption shown under the hero image. */
  imageCaption: z.string().optional(),
  /** Public URL of the shipped product, when one exists. */
  liveUrl: z.string().url().optional(),
  executiveSummary: z.string(),
  builderSummary: z.string(),
});

export type CaseStudyFrontmatter = z.infer<typeof caseStudySchema>;

export interface CaseStudy extends CaseStudyFrontmatter {
  content: string;
}

// ── Writing Post Frontmatter ────────────────────────────────────
export const writingSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
});

export type WritingFrontmatter = z.infer<typeof writingSchema>;

export interface WritingPost extends WritingFrontmatter {
  content: string;
}

// ── Search Index Entry ──────────────────────────────────────────
export interface SearchEntry {
  title: string;
  url: string;
  type: "work" | "writing" | "page";
  summary: string;
  tags: string[];
  body: string;
}
