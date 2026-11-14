import { getAllCaseStudies, getAllWritingPosts } from "./mdx";

export interface SearchItem {
  title: string;
  url: string;
  type: "work" | "writing" | "page";
  summary: string;
  /** Extra lowercase terms (tags, client, stack) matched by the search box. */
  keywords: string;
}

const pages: SearchItem[] = [
  {
    title: "Home",
    url: "/",
    type: "page",
    summary: "Independent projects and consulting work",
    keywords: "home overview",
  },
  {
    title: "Work",
    url: "/work",
    type: "page",
    summary: "Independent projects and client case studies",
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
    title: "Writing",
    url: "/writing",
    type: "page",
    summary: "Notes on building software and using coding assistants",
    keywords: "blog posts essays",
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
 * Builds the global search index from the real content directories, so a
 * new case study or post is searchable the moment it is added. Runs on the
 * server at build time; the result is passed to the client search dialog.
 */
export function getSearchIndex(): SearchItem[] {
  const work: SearchItem[] = getAllCaseStudies().map((study) => ({
    title: study.title,
    url: `/work/${study.slug}`,
    type: "work",
    summary: study.summary,
    keywords: [study.client, ...study.tags, ...study.stack]
      .join(" ")
      .toLowerCase(),
  }));

  const writing: SearchItem[] = getAllWritingPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      title: post.title,
      url: `/writing/${post.slug}`,
      type: "writing",
      summary: post.description,
      keywords: post.tags.join(" ").toLowerCase(),
    }));

  return [...pages, ...work, ...writing];
}
