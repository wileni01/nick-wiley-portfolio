import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { caseStudySchema, type CaseStudy } from "./types";

const WORK_DIR = path.join(process.cwd(), "content", "work");

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
    .filter((study): study is CaseStudy => study !== null)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  const studies = getAllCaseStudies();
  return studies.find((s) => s.slug === slug) ?? null;
}

export function isSideQuest(study: CaseStudy): boolean {
  return study.client === "Independent project" || study.client === "Independent product";
}

export function getCaseStudySlugs(): string[] {
  return getAllCaseStudies().map((s) => s.slug);
}
