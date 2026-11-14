import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CaseStudyCard } from "@/components/work/case-study-card";
import { getAllCaseStudies } from "@/lib/mdx";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  const studies = getAllCaseStudies();
  const personal = studies.filter((study) => study.featured && ["Independent project", "Independent product"].includes(study.client));
  const previews: Partial<Record<string, "startup" | "harbor">> = {
    "car-infotainment": "startup",
    "pc-game-restoration": "harbor",
  };
  const professional = studies.filter((study) => study.featured && !personal.includes(study));

  return (
    <div className="site-shell">
      <section className="masthead" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">{siteConfig.location}</p>
          <h1 id="home-title">Nick Wiley</h1>
        </div>
        <div className="masthead-intro">
          <p>I’m a Lead IT Architect at Boston Consulting Group. My work includes independent software projects, analytics tools for public agencies, and an interactive tour of Gettysburg.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a className="text-link" href="#selected-work">Selected work <ArrowDown size={15} aria-hidden="true" /></a>
            <Link className="text-link" href="/resume">Résumé <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section id="selected-work" className="portfolio-section scroll-mt-6" aria-labelledby="selected-heading">
        <div className="section-heading">
          <h2 id="selected-heading">Independent projects</h2>
          <Link href="/work" className="text-link">All work <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="portfolio-grid">
          {personal.map((study) => (
            <CaseStudyCard key={study.slug} study={study} preview={previews[study.slug]} />
          ))}
        </div>
      </section>

      <section className="portfolio-section" aria-labelledby="other-heading">
        <div className="section-heading"><h2 id="other-heading">More work</h2></div>
        <div className="portfolio-grid">
          {professional.map((study) => <CaseStudyCard key={study.slug} study={study} />)}
        </div>
      </section>
    </div>
  );
}
