import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeActions } from "@/components/resume/resume-actions";
import { SkillsHighlight } from "@/components/adaptive/skills-highlight";

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

        {/* Adaptive skills highlight */}
        <div className="mb-6 no-print">
          <SkillsHighlight />
        </div>

        {/* Resume Content */}
        <div className="rounded-xl border border-border bg-card p-8 sm:p-10 print:border-none print:p-0 print:rounded-none print:bg-transparent">
          {/* Header */}
          <header className="border-b border-border pb-6 mb-6 print:pb-4 print:mb-4">
            <h2 className="text-2xl font-bold tracking-tight print:text-xl">
              Nicholas A. Wiley
            </h2>
            <p className="text-sm text-muted-foreground mt-1 print:text-xs">
              Alexandria, VA &bull;{" "}
              <a
                href="/contact"
                className="text-primary hover:underline"
              >
                Contact
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
              delivering analytics, ML, and decision-support solutions across
              federal civilian agencies (NSF, USDA, USPS, Census), startups,
              and digital transformation engagements. Hands-on builder
              (Python/SQL, NLP embeddings, clustering, dashboards, browser
              automation) who translates mission needs into scalable, auditable
              tools. Founder of an AR startup with two U.S. utility patents.
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
                <strong className="font-medium">AI/ML &amp; NLP:</strong>{" "}
                Sentence Transformers, BERTopic, SciBERT/BERT, UMAP, HDBSCAN,
                K-Means, Optuna, scikit-learn, human-in-the-loop workflows
              </div>
              <div>
                <strong className="font-medium">Data &amp; Analytics:</strong>{" "}
                SQL, Python, AWS, Tableau, SAS, data warehouses, ETL pipelines,
                Salesforce integration
              </div>
              <div>
                <strong className="font-medium">
                  Platforms &amp; Tools:
                </strong>{" "}
                Streamlit, Next.js, Stripe, HubSpot, BigQuery, DBeaver,
                ServiceNow; ESRI, Palantir, Unity
              </div>
              <div>
                <strong className="font-medium">
                  Governance &amp; Delivery:
                </strong>{" "}
                Agile/Scrum, stakeholder alignment, Section 508, documentation,
                adoption enablement, browser automation
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
                      clients (NSF, USDA, USPS, Census), aligning technical
                      approach to mission goals and stakeholder needs.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">NSF:</strong> Built
                      Panel Wizard decision-support tool consolidating 8
                      screens into 1, using sentence transformer embeddings and
                      K-Means clustering. Reduced panel formation from weeks to
                      hours. Built BERTopic-based proposal classification
                      system (7,000+ proposals, 70+ themes, Optuna-optimized).
                      Created researcher lineage dashboard integrating public
                      and internal data. Developed RoboRA document automation,
                      ADCC compliance checking (28 automated checks), and
                      telemetry dashboards.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">USDA:</strong> Built
                      global data warehouse on AWS integrating Salesforce,
                      integrity database, and CBP customs import records.
                      Created NLP taxonomy classifier (scikit-learn) for
                      organic import categorization. Developed dozens of
                      Tableau reports supporting 50,000+ certified operations.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">USPS:</strong> Managed
                      data analytics for international mail operations,
                      identifying leads and operational insights using SAS.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">Census Bureau:</strong>{" "}
                      Provided data analytics support including ServiceNow
                      administration and Python-based reporting.
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

              {/* LLI */}
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-semibold text-sm print:text-xs">
                    Lincoln Leadership Institute at Gettysburg
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    2020–Present
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Lead Software Engineer &amp; Digital Strategist (Contract)
                </p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Led the digital transformation of a premier in-person
                      leadership development program: conceptualized the
                      digital format, identified and vetted production
                      partners, adapted content for virtual delivery, trained
                      and led presenters, and managed advertising and
                      enrollment.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Rebuilt{" "}
                      <a
                        href="https://www.gettysburgleadership.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        gettysburgleadership.com
                      </a>{" "}
                      using Next.js with Stripe, HubSpot, and PostHog
                      analytics integrations. Modernized from legacy WordPress.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Conceptualized the &ldquo;America at 250&rdquo; program
                      using AI-powered market research; the program has
                      generated significant revenue since launch.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Designed and executed digital marketing campaigns
                      (HubSpot email automation) that drove direct program
                      registrations, contributing to hundreds of thousands in
                      revenue.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Automated creation of marketing materials; led migration
                      from Emma to HubSpot for email marketing.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Mentored an intern through conversion to full-time hire
                      to manage digital assets and marketing operations.
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
                      Founded AR-driven tours using Unity platform programming
                      and geospatial datasets to make historical context
                      accessible and engaging.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Raised $200K+ to produce a tour book and multiple mobile
                      applications. Managed iPad rental fleet including device
                      imaging and provisioning.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Painstakingly geocoded historical content for dynamic
                      location-based delivery; coordinated conversion of
                      archival map data into machine-readable formats.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Presented to Civil War historical societies, building
                      trust for technology adoption in a traditionally
                      technology-resistant market.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      U.S. utility patent holder (9,417,668; 9,900,042).
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
                  Data Analyst (GIS Lead)
                </p>
                <ul className="space-y-1.5 text-sm print:text-xs">
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Led GIS integration of government data for Recovery Act
                      oversight using ESRI and Palantir network/lead analysis.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Assisted in creation of data ontology for cross-system
                      investigative analysis.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Conceived investigation that identified 90 contract
                      misrepresentations through geospatial and network
                      analysis.
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
