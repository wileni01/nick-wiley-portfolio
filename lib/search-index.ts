import { getAllCaseStudies } from "./mdx";

export interface SearchItem {
  title: string;
  url: string;
  type: "work" | "page";
  summary: string;
  /** Extra lowercase terms (tags, client, stack) matched by the search box. */
  keywords: string;
}

const pages: SearchItem[] = [
  {
    title: "Side Quests",
    url: "/",
    type: "page",
    summary: "Pirate games, car software, and projects in Gettysburg",
    keywords: "home personal independent projects",
  },
  {
    title: "Professional Work",
    url: "/work",
    type: "page",
    summary: "Public-sector, client, and VisiTime case studies",
    keywords: "case studies portfolio",
  },
  {
    title: "More projects",
    url: "/projects",
    type: "page",
    summary: "Additional builds and prototypes",
    keywords: "projects products portfolio gettysburg tours leadership casekit assessment scott search",
  },
  {
    title: "Résumé",
    url: "/resume",
    type: "page",
    summary: "Experience at BCG and IBM, education, and patents",
    keywords: "cv experience education certifications pdf",
  },
  {
    title: "About",
    url: "/about",
    type: "page",
    summary: "Background and selected work",
    keywords: "bio background",
  },
  {
    title: "Contact",
    url: "/contact",
    type: "page",
    summary: "Get in touch",
    keywords: "email linkedin",
  },
];

/**
 * Builds the client search index from case studies and top-level pages.
 */
export function getSearchIndex(): SearchItem[] {
  const work: SearchItem[] = getAllCaseStudies().map((study) => ({
    title: study.title,
    url: `/work/${study.slug}`,
    type: "work",
    summary: study.summary,
    keywords: [study.cardTitle ?? study.title, study.client, ...study.tags, ...study.languages, ...study.stack]
      .join(" ")
      .toLowerCase(),
  }));

  return [...pages, ...work];
}
