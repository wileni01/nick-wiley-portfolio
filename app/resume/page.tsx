import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeActions } from "@/components/resume/resume-actions";
import { SkillsHighlight } from "@/components/adaptive/skills-highlight";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Nicholas A. Wiley — Managing Consultant at IBM. 12+ years building analytics, ML, and decision-support tools for federal civilian agencies.",
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
              Managing Consultant and applied data scientist. 12+ years
              building analytics, ML, and decision-support tools for federal
              civilian agencies (NSF, USDA, USPS, Census), a startup, and
              a leadership development organization. I write Python, build
              NLP pipelines, design dashboards, and handle the governance
              and adoption work that makes those tools stick. Two U.S.
              utility patents from an AR startup I founded. Comfortable
              in regulated, high-accountability settings.
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
                Agile/Scrum, stakeholder communication, Section 508,
                documentation, training and adoption, browser automation
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
                      Build and deliver analytics and ML tools for federal
                      clients (NSF, USDA, USPS, Census). Own technical
                      approach, stakeholder communication, and delivery.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">NSF:</strong> Built
                      Panel Wizard — a decision-support tool that consolidated
                      8 screens into 1, using sentence transformer embeddings
                      and K-Means clustering. Cut panel formation from weeks
                      to hours. Built BERTopic proposal classifier (7,000+
                      proposals, 70+ themes, Optuna-tuned). Created researcher
                      lineage dashboard connecting public and internal data.
                      Built RoboRA document automation, ADCC compliance
                      checking (28 automated checks), and telemetry dashboards.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">USDA:</strong> Built
                      global data warehouse on AWS integrating Salesforce,
                      integrity database, and CBP customs records. Created
                      NLP taxonomy classifier (scikit-learn) for organic
                      import categorization. Built dozens of Tableau reports
                      serving 50,000+ certified operations.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">USPS:</strong> Ran
                      data analytics for international mail operations —
                      identifying leads and operational patterns using SAS.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      <strong className="font-medium">Census Bureau:</strong>{" "}
                      Data analytics support — ServiceNow administration and
                      Python-based reporting.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Wrote proposal sections that contributed to a 5-year,
                      $5M contract win.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Ran study halls and working groups to get people
                      actually using the tools. Mentored analysts and
                      supported executive reporting.
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
                      Converted a flagship in-person leadership program to
                      digital: found and vetted producers, adapted content,
                      trained presenters, and managed advertising and
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
                      Created the &ldquo;America at 250&rdquo; program
                      concept using AI-powered market research. The program
                      has generated significant revenue since launch.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Built and ran email marketing campaigns (HubSpot)
                      that produced direct program registrations, contributing
                      to hundreds of thousands in revenue.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Automated marketing material creation. Migrated email
                      platform from Emma to HubSpot.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Mentored an intern through conversion to a full-time
                      hire managing digital assets and marketing.
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
                      Built AR-driven tours using Unity and geospatial
                      datasets to make historical context accessible at
                      battlefield sites.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Raised $200K+ to produce a tour book and mobile apps.
                      Managed iPad rental fleet including imaging and
                      provisioning.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Personally geocoded historical content for
                      location-based delivery. Converted archival map data
                      into machine-readable formats.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Presented to Civil War historical societies — earned
                      trust for technology in a market not naturally
                      interested in it.
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
                      Integrated analytics into client-facing visualization
                      products. Worked with executives to turn goals into
                      measurable reporting.
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
                      Ran GIS integration of government data for Recovery Act
                      oversight using ESRI and Palantir.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Helped create a data ontology for cross-system
                      investigative analysis.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">–</span>
                    <span>
                      Conceived an investigation that identified 90 contract
                      misrepresentations using geospatial and network
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
