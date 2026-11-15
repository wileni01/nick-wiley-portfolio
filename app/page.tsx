import type { Metadata } from "next";
import { CaseStudyCard } from "@/components/work/case-study-card";
import { getAllCaseStudies, isSideQuest } from "@/lib/mdx";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  const sideQuests = getAllCaseStudies().filter(isSideQuest);
  const previews: Partial<Record<string, "startup" | "harbor">> = {
    "car-infotainment": "startup",
    "pc-game-restoration": "harbor",
  };
  return (
    <div className="site-shell">
      <header className="masthead">
        <h1>Side Quests</h1>
        <p className="masthead-intro">I’m Nick. I build games, tinker with my car’s software, and make things for people visiting Gettysburg.</p>
      </header>

      <div id="selected-work" className="portfolio-grid scroll-mt-6">
        {sideQuests.map((study) => (
          <CaseStudyCard key={study.slug} study={study} preview={previews[study.slug]} variant="side-quest" />
        ))}
      </div>
    </div>
  );
}
