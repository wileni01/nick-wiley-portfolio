import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeActions } from "@/components/resume/resume-actions";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Nicholas A. Wiley — Managing Consultant, AI Solutions Architect. 12+ years delivering analytics and ML solutions for federal agencies.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Action bar (no-print) */}
        <div className="flex items-center justify-between mb-8 no-print">
          <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
          <div className="flex items-center gap-2">
            <ResumeActions />
            <Button asChild variant="default" size="sm">
              <a href="/resume/nick-wiley-resume.pdf" download>
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>

        {/* Resume Content */}
        <div className="rounded-xl border border-border bg-card p-8 sm:p-10 print:border-none print:p-0 print:rounded-none print:bg-transparent">
          {/* Header */}
          <header className="border-b border-border pb-6 mb-6 print:pb-4 print:mb-4">
            <h2 className="text-2xl font-bold tracking-tight print:text-xl">
              Nicholas A. Wiley
            </h2>
            <p className="text-sm text-muted-foreground mt-1 print:text-xs">
              Alexandria, VA &bull; (717) 451-7015 &bull;{" "}
              <a
                href="mailto:wileni01@gmail.com"
                className="text-primary hover:underline"
              >
                wileni01@gmail.com
              </a>{" "}
              &bull;{" "}
              <a
                href="https://linkedin.com/in/nicholas-a-wiley-975b3136"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LinkedIn
              </a>
            </p>
          </header>

          {/* Summary */}
          <section id="summary" className="mb-8 scroll-mt-24 print:mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 print:text-xs print:mb-2">
              Summary
            </h3>
            <p className="text-sm leading-relaxed print:text-xs print:leading-snug">
              Managing Consultant and applied data scientist with 12+ years
              delivering analytics and ML solutions across federal civilian
              agencies, startups, and SaaS environments. Hands-on builder
              (Python/SQL, NLP embeddings, clustering, dashboards) who
              translates mission needs into scalable, auditable solutions.
              Comfortable in regulated settings with a focus on governance,
              documentation, accessibility, and human-in-the-loop workflows.
            </p>
          </section>

          {/* Core Skills */}
          <section id="skills" className="mb-8 scroll-mt-24 print:mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 print:text-xs print:mb-2">
              Core Skills
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 text-sm print:text-xs">
              <div>
                <strong className="font-medium">AI/ML &amp; GenAI:</strong>{" "}
                NLP embeddings (SciBERT/BERT), clustering (HDBSCAN, k-means),
                evaluation &amp; iteration, human-in-the-loop workflows
              </div>
              <div>
                <strong className="font-medium">Data &amp; Analytics:</strong>{" "}
                SQL, Python, data pipelines, warehouses, dashboards
              </div>
              <div>
                <strong className="font-medium">
                  Governance &amp; Delivery:
                </strong>{" "}
                Agile/Scrum, stakeholder alignment, documentation, adoption
                enablement
              </div>
              <div>
                <strong className="font-medium">Tools:</strong> Tableau,
                Google BigQuery, DBeaver, Dimensions; ESRI, Palantir
              </div>
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="mb-8 scroll-mt-24 print:mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 print:text-xs print:mb-2">
              Experience
            </h3>

            <div className="space-y-6 print:space-y-4">
              {/* IBM */}
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-semibold text-sm print:text-xs">
                    IBM — Global Business Services (AI &amp; Analytics)
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    2019–Present
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Managing Consultant
                </p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Lead delivery of analytics and ML solutions for federal
                      clients (NSF, USDA), aligning technical approach to
                      mission goals and stakeholder needs.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Built NLP embedding + clustering workflows
                      (SciBERT/BERT with HDBSCAN/k-means) to support proposal
                      triage and reviewer decision support.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Designed and delivered human-in-the-loop decision support
                      tooling (e.g., Panel Wizard) enabling staff to review,
                      override, and refine model recommendations.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Partnered on USDA organic analytics platform: warehouse +
                      Tableau reporting suite supporting 50,000+ operations;
                      contributed to ETL/warehouse work described at 5B+
                      records and millions processed daily.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Led proposal writing supporting a 5-year, $5M contract
                      win.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Facilitated adoption through study halls and working
                      groups; mentored analysts and supported executive
                      reporting.
                    </span>
                  </li>
                </ul>
              </div>

              {/* VisiTime */}
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-semibold text-sm print:text-xs">
                    VisiTime, LLC
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    2012–~2020
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Founder</p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Founded AR-driven tours using geospatial datasets to make
                      historical context accessible and engaging.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Raised $200K+ to produce a tour book and multiple mobile
                      applications.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Led distributed delivery to create an interactive iPad
                      tour experience; iterated business model and operations.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      U.S. patent holder (9,417,668; 9,900,042).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Transform */}
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-semibold text-sm print:text-xs">
                    Transform, Inc.
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    2014–2015
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Solution Engineer
                </p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Integrated analytics tooling into client-facing
                      visualization products; collaborated with executives to
                      translate goals into measurable reporting.
                    </span>
                  </li>
                </ul>
              </div>

              {/* RATB */}
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-semibold text-sm print:text-xs">
                    U.S. Government — Recovery Accountability and Transparency
                    Board
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    2011–2012
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Data Analyst
                </p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Applied geospatial analytics for Recovery Act oversight
                      using ESRI and Palantir; built datasets and presented
                      findings to diverse stakeholders.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Education */}
          <section id="education" className="mb-8 scroll-mt-24 print:mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 print:text-xs print:mb-2">
              Education
            </h3>
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <strong className="font-medium">
                    University of Maryland
                  </strong>{" "}
                  — MBA (Consulting &amp; Management), MS (Information Systems)
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  2019
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <strong className="font-medium">Gettysburg College</strong>{" "}
                  — BA Environmental Studies
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  2010
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <strong className="font-medium">Penn State</strong> —
                  Project Management Certificate; GIS Certificate
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  2017; 2012
                </span>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section id="certifications" className="mb-8 scroll-mt-24 print:mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 print:text-xs print:mb-2">
              Certifications / Programs
            </h3>
            <ul className="space-y-1.5 text-sm print:text-xs">
              <li>SAFe Scrum Master (2022)</li>
              <li>Tableau Certified Associate (2022)</li>
              <li>
                MIT Professional Education — Applied Data Science: Leveraging
                AI for Effective Decision-Making (2024)
              </li>
            </ul>
          </section>

          {/* Patents */}
          <section id="patents" className="scroll-mt-24">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 print:text-xs print:mb-2">
              Patents
            </h3>
            <ul className="space-y-1 text-sm print:text-xs">
              <li>U.S. Patent 9,417,668</li>
              <li>U.S. Patent 9,900,042</li>
            </ul>
          </section>
        </div>

        {/* PDF fallback note */}
        <div className="mt-6 text-center no-print">
          <ResumeActions variant="inline" />
        </div>
      </div>
    </div>
  );
}
