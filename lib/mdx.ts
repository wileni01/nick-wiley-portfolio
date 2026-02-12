import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  caseStudySchema,
  writingSchema,
  type CaseStudy,
  type WritingPost,
} from "./types";

const WORK_DIR = path.join(process.cwd(), "content", "work");
const WRITING_DIR = path.join(process.cwd(), "content", "writing");

// ── Case Studies ────────────────────────────────────────────────

export function getAllCaseStudies(): CaseStudy[] {
  if (!fs.existsSync(WORK_DIR)) return [];

  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const parsed = caseStudySchema.safeParse(data);

      if (!parsed.success) {
        console.warn(`Invalid frontmatter in ${file}:`, parsed.error.message);
        return null;
      }

      return { ...parsed.data, content } as CaseStudy;
    })
    .filter(Boolean) as CaseStudy[];
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return getAllCaseStudies().filter((cs) => cs.featured);
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  const studies = getAllCaseStudies();
  return studies.find((s) => s.slug === slug) ?? null;
}

export function getCaseStudySlugs(): string[] {
  return getAllCaseStudies().map((s) => s.slug);
}

// ── Writing Posts ───────────────────────────────────────────────

export function getAllWritingPosts(): WritingPost[] {
  if (!fs.existsSync(WRITING_DIR)) return [];

  const files = fs.readdirSync(WRITING_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(WRITING_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const parsed = writingSchema.safeParse(data);

      if (!parsed.success) {
        console.warn(`Invalid frontmatter in ${file}:`, parsed.error.message);
        return null;
      }

      return { ...parsed.data, content } as WritingPost;
    })
    .filter(Boolean) as WritingPost[];
}

export function getWritingPostBySlug(slug: string): WritingPost | null {
  const posts = getAllWritingPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export function getWritingPostSlugs(): string[] {
  return getAllWritingPosts().map((p) => p.slug);
}
