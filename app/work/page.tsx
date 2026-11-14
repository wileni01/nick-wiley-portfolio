import type { Metadata } from "next";
import { ProjectStack } from "@/components/work/project-stack";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCaseStudies } from "@/lib/mdx";
import { CaseStudyCard } from "@/components/work/case-study-card";

export const metadata: Metadata = {
  title: "Work",
  description: "Independent software projects, public-sector case studies, and products built in Gettysburg.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const studies = getAllCaseStudies();

  return (
    <div className="site-shell page-space">
      <header className="page-heading"><h1>Work</h1></header>
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
                  <ProjectStack stack={study.stack} />
                </div>
                <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/projects" className="text-link mt-8">More independent and client builds <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
