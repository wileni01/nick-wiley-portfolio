import type { Metadata } from "next";
import { ProjectStack } from "@/components/work/project-stack";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCaseStudies, isSideQuest } from "@/lib/mdx";
import { CaseStudyCard } from "@/components/work/case-study-card";

export const metadata: Metadata = {
  title: "Professional Work",
  description: "Nick Wiley’s work in public-sector analytics, client software, and VisiTime.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const studies = getAllCaseStudies().filter((study) => !isSideQuest(study));

  return (
    <div className="site-shell page-space">
      <header className="page-heading"><h1>Professional Work</h1></header>
      <section className="portfolio-section" aria-labelledby="featured">
        <div className="section-heading"><h2 id="featured">Selected projects</h2></div>
        <div className="portfolio-grid">
          {studies.filter((study) => study.featured).map((study) => <CaseStudyCard key={study.slug} study={study} />)}
        </div>
      </section>
      <section className="portfolio-section" aria-labelledby="additional">
        <div className="section-heading"><h2 id="additional">Additional case studies</h2></div>
        <ul className="work-list">
          {studies.filter((study) => !study.featured).map((study) => (
            <li key={study.slug}>
              <Link href={`/work/${study.slug}`} className="work-list-link">
                <div>
                  <p className="eyebrow">{study.client}</p>
                  <h3>{study.title}</h3>
                  <p>{study.summary}</p>
                  <ProjectStack languages={study.languages} stack={study.stack} />
                </div>
                <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/projects" className="text-link mt-8">More projects <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
