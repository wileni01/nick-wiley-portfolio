/**
 * Products, programs, and engagements shown on /projects.
 *
 * Facts come from the shipped repos, their READMEs, and the case studies in
 * content/work. Images are either real screenshots (`screenshot`), captures
 * of real terminal output (`terminal`), or representative recreations built
 * from the product's own description (`recreation`). Keep the `imageKind`
 * honest; it is shown to visitors.
 */

export type ProductStatus = "live" | "shipped" | "in-development" | "beta" | "retired";
export type ImageKind = "screenshot" | "recreation" | "terminal" | "photo";

export interface Product {
  slug: string;
  title: string;
  org: string;
  /** Only set when it can be traced to a repo, deployment, or case study. */
  year?: string;
  status: ProductStatus;
  summary: string;
  /** What it does and what I owned, in two or three sentences. */
  detail: string;
  stack: string[];
  image: string;
  imageKind: ImageKind;
  liveUrl?: string;
  caseStudySlug?: string;
  sourceUrl?: string;
  featured?: boolean;
}

export interface Program {
  title: string;
  org: string;
  summary: string;
  owned: string;
  outcome: string;
}

export interface Engagement {
  title: string;
  agency: string;
  summary: string;
  caseStudySlug?: string;
}

export interface Prototype {
  title: string;
  description: string;
  stack: string[];
  availability: string;
  href?: string;
}

export const products: Product[] = [
  {
    slug: "gettysburg-tours",
    title: "Gettysburg Tours",
    org: "Product build (shipped as Gettysburg Pulse)",
    year: "2025 to present",
    status: "live",
    featured: true,
    summary:
      "The independent guide to touring Gettysburg: every tour type compared, priced, and verified, with provenance on every listing.",
    detail:
      "I built this end to end: a YAML-driven ingestion pipeline across 9+ sources, deterministic deduplication with logged conflict resolution, trust tiers and freshness timestamps on every listing, weather-aware ranking, and a retrieval-first assistant that has to cite its sources. The product question was trust: visitors could not tell what was open, current, or real. Prices show when they were last checked and link straight to the operator.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Vercel Cron", "RAG with citations"],
    image: "/images/projects/gettysburg-tours.jpg",
    imageKind: "screenshot",
    liveUrl: "https://www.gettysburgtours.com",
    caseStudySlug: "gettysburg-pulse",
  },
  {
    slug: "gettysburg-leadership",
    title: "GettysburgLeadership.com",
    org: "Lincoln Leadership Institute at Gettysburg",
    status: "live",
    featured: true,
    summary:
      "Full rebuild of the institute's web presence, from a legacy WordPress site to a Next.js application with payments, CRM, scheduling, and analytics built in.",
    detail:
      "I led the redesign and rebuild, working in Cursor and Claude Code. Stripe checkout replaced a manual email registration process, HubSpot forms capture leads with first-touch attribution, Calendly handles consultation scheduling, and PostHog and Sentry cover conversion tracking and error monitoring. The site serves Fortune 500 clients and government agencies booking programs on the battlefield.",
    stack: ["Next.js", "TypeScript", "Stripe", "HubSpot", "PostHog", "Sentry", "Claude Code"],
    image: "/images/projects/gettysburg-leadership.jpg",
    imageKind: "screenshot",
    liveUrl: "https://www.gettysburgleadership.com",
  },
  {
    slug: "moment-of-command",
    title: "The Moment of Command Assessment",
    org: "Lincoln Leadership Institute at Gettysburg",
    year: "2026",
    status: "live",
    featured: true,
    summary:
      "A passcode-gated leadership reflection tool. Participants answer ten questions and receive a branded PDF of their Leadership Instinct profile by email.",
    detail:
      "Built as a single-page React app with Vercel serverless functions: no database and no accounts. Resend delivers the PDF, private copies live in Vercel Blob for 30 days, and a daily cron deletes them. I designed the flow so a program facilitator can hand out one passcode and nothing else needs administering.",
    stack: ["React", "Vite", "Vercel Functions", "Resend", "Vercel Blob", "Cron"],
    image: "/images/projects/lli-assessment.jpg",
    imageKind: "screenshot",
  },
  {
    slug: "scott-search",
    title: "Scott Search",
    org: "Lincoln Leadership Institute at Gettysburg",
    year: "2026",
    status: "live",
    featured: true,
    summary:
      "A gamified, human-in-the-loop tool for recovering stale CRM contacts: staleness scoring, Apollo enrichment, GPT-4 lead scoring, and a card-based review flow.",
    detail:
      "Nobody had time to review hundreds of bounced and outdated contacts, so I made the review itself the product: keyboard-driven cards, XP, streaks, full undo, and HubSpot sync for approved records. Reviewers voluntarily extended sessions to reach the next level. Deployed on Vercel with a Turso backend.",
    stack: ["Python", "Flask", "OpenAI", "Apollo.io", "HubSpot API", "Turso", "Vercel"],
    image: "/images/projects/scott-search.png",
    imageKind: "screenshot",
    caseStudySlug: "lli-scott-search",
  },
  {
    slug: "lli-email-data-miner",
    title: "LLI Email Data Miner",
    org: "Lincoln Leadership Institute at Gettysburg",
    status: "shipped",
    summary:
      "Turns years of Outlook PST archives into an enriched, CRM-ready contact database, with invoice data pulled out by OCR.",
    detail:
      "PST to EML parsing, Azure AI Document Intelligence for invoices, Apollo.io enrichment, deduplication across thousands of threads, and HubSpot-compatible export, all behind a FastAPI service with a monitoring dashboard. It recovered 5,000+ contacts that had been locked in mailboxes.",
    stack: ["Python", "FastAPI", "Azure AI Document Intelligence", "Apollo.io", "SQLAlchemy", "HubSpot API"],
    image: "/images/projects/lli-email-miner.jpg",
    imageKind: "screenshot",
  },
  {
    slug: "lli-golden-record",
    title: "LLI Golden Record",
    org: "Lincoln Leadership Institute at Gettysburg",
    status: "shipped",
    summary:
      "One trustworthy record per contact: fuzzy deduplication, Apollo recovery, GPT-4 lead scoring, and a review screen where staff approve every merge.",
    detail:
      "Levenshtein matching proposes merges; people decide. The Flask review UI shows both records, the proposed golden record with the rule that chose each field, a lead score with its reasoning, and an audit trail that follows the record into HubSpot. It cleared 2,000+ duplicates and made pipeline reporting accurate for the first time.",
    stack: ["Python", "Flask", "OpenAI", "HubSpot API", "Apollo.io", "Levenshtein"],
    image: "/images/projects/golden-record.jpg",
    imageKind: "recreation",
  },
  {
    slug: "casekit",
    title: "CaseKit",
    org: "Independent product",
    year: "2026",
    status: "beta",
    featured: true,
    summary:
      "Six local-first consulting extensions built to be driven by coding agents: workplans, slides, analysis, architecture intelligence, and case memory, exchanging context only through validated CasePack files.",
    detail:
      "Copy the directory to any machine, open it in Claude Code, Codex, or Devin, and say \"please set up.\" Each extension is a standalone product with its own environment, tests, and agent contract. A family validator proves schema compatibility on every change, and an offline wheelhouse installs with no network at all, which matters for client machines that cannot reach the internet.",
    stack: ["Python", "uv", "JSON Schema", "Claude Code", "MCP", "python-pptx", "openpyxl"],
    image: "/images/projects/casekit.jpg",
    imageKind: "terminal",
  },
  {
    slug: "gettysburg-tour-app",
    title: "Gettysburg Battlefield Tour App",
    org: "Product build",
    year: "2026, in development",
    status: "in-development",
    summary:
      "A driving and walking tour of the battlefield with turn-by-turn navigation, narration that starts when you arrive at a stop, and driver-safe CarPlay and Android Auto surfaces.",
    detail:
      "Native iOS (SwiftUI, Mapbox, CarPlay) and Android (Compose, Mapbox, Android Auto) clients share one TypeScript data model and JSON schemas, served by a Fastify backend. I wrote the product requirements, UX spec, architecture, and data model before any client code, so the three apps stay consistent.",
    stack: ["Swift", "SwiftUI", "Kotlin", "Jetpack Compose", "Mapbox", "CarPlay", "Fastify"],
    image: "/images/projects/tour-app.jpg",
    imageKind: "recreation",
  },
  {
    slug: "nickantir",
    title: "NickAntir",
    org: "Independent build",
    status: "shipped",
    summary:
      "A fraud intelligence workbench in the spirit of Palantir: entity ontology, force-directed link analysis, geographic heatmaps, and risk scoring over CSV data, no enterprise license required.",
    detail:
      "I built it to revisit the investigative workflow I learned at RATB with modern web tooling. Analysts load entities, accounts, transactions, and locations, then trace connections visually. The ontology layer is what makes the graph and the map agree with each other.",
    stack: ["JavaScript", "D3.js", "Leaflet", "CSV ingestion"],
    image: "/images/projects/nickantir.jpg",
    imageKind: "screenshot",
  },
  {
    slug: "lli-purdue",
    title: "Purdue Partnership site",
    org: "Lincoln Leadership Institute at Gettysburg",
    year: "2025",
    status: "live",
    summary:
      "Microsite for the Purdue University Certificate in Transformational Leadership delivered at Gettysburg: sessions, faculty, registration, and enrollment dates.",
    detail:
      "A focused Next.js site for one partnership and one audience, built so the institute could launch a co-branded program without touching the main site.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    image: "/images/projects/lli-purdue.jpg",
    imageKind: "screenshot",
    liveUrl: "https://lli-purdue.vercel.app",
  },
  {
    slug: "lli-vistage",
    title: "Vistage member offer site",
    org: "Lincoln Leadership Institute at Gettysburg",
    year: "2025",
    status: "live",
    summary:
      "Landing site for a Vistage member offer: preferred rates, program details, and seat reservation for a specific partner audience.",
    detail:
      "Same pattern as the Purdue site: a small, fast Next.js microsite with its own messaging and conversion path, so a partner campaign can run on its own terms.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    image: "/images/projects/lli-vistage.jpg",
    imageKind: "screenshot",
    liveUrl: "https://llivistage-vistage-site.vercel.app",
  },
  {
    slug: "resume-generator",
    title: "Resume Generator",
    org: "Independent build",
    status: "shipped",
    summary:
      "Ingests every version of a resume, consolidates them into one gold-copy profile, then generates a targeted resume and cover letter for a specific listing.",
    detail:
      "DOCX and PDF parsing, profile consolidation, CAR-format generation with GPT-4o, and a history of what was generated for which role. A companion Chrome extension fills application forms from the generated content.",
    stack: ["Python", "FastAPI", "OpenAI", "Alpine.js", "SQLite", "Chrome Extension"],
    image: "/images/projects/resume-generator.jpg",
    imageKind: "screenshot",
  },
  {
    slug: "visitime",
    title: "VisiTime AR tours",
    org: "VisiTime, LLC (founder)",
    year: "2012 to 2020",
    status: "retired",
    summary:
      "An augmented-reality tour system for Gettysburg built on Unity: a six-hour interactive iPad tour, two U.S. utility patents, and $200K+ raised.",
    detail:
      "I founded the company, built the product, raised the money, shipped it, and ran the business. It is where I learned to own a roadmap, a P&L, and the relationships at the same time.",
    stack: ["Unity", "C#", "GIS", "iOS"],
    image: "/images/visitime_ar.jpg",
    imageKind: "photo",
    caseStudySlug: "visitime-ar",
  },
  {
    slug: "portfolio",
    title: "This site",
    org: "Independent build",
    year: "2026",
    status: "live",
    summary:
      "Next.js 16, TypeScript, Tailwind CSS 4. MDX case studies, a search index generated from content, tailored views for shared links, and a contact form that never pretends to send.",
    detail:
      "The images on this page are captured by a script from live sites and from hand-built recreations of internal tools, so they stay honest and reproducible. Source is public.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "MDX", "Vercel"],
    image: "/images/projects/portfolio-home.jpg",
    imageKind: "screenshot",
    sourceUrl: "https://github.com/wileni01/nick-wiley-portfolio",
  },
];

export const programs: Program[] = [
  {
    title: "Digital program transformation",
    org: "Lincoln Leadership Institute at Gettysburg",
    summary:
      "Converted the institute's flagship in-person leadership program to a digital format, from concept to revenue.",
    owned:
      "Concept, production partner selection, hiring producers, adapting content for the screen, training and leading presenters, advertising, and enrollment.",
    outcome:
      "A digital program that reaches audiences beyond in-person attendees while keeping the experiential quality Fortune 500 and agency clients pay for.",
  },
  {
    title: "America at 250 program",
    org: "Lincoln Leadership Institute at Gettysburg",
    summary:
      "Conceived a new program connecting the 250th anniversary to leadership lessons from the battlefield.",
    owned:
      "Used AI-assisted market research for competitive analysis, audience research, and positioning, then worked with the team on programming, pricing, and go-to-market.",
    outcome: "A new product line that has generated significant revenue since launch.",
  },
  {
    title: "Email marketing and the move to HubSpot",
    org: "Lincoln Leadership Institute at Gettysburg",
    summary:
      "Led the migration from Emma to HubSpot and designed campaigns measured on registrations, not opens.",
    owned:
      "Metric definitions, segmentation, automation, attribution, and automated production of marketing collateral.",
    outcome: "Campaigns that produced direct program registrations, contributing to hundreds of thousands in revenue, with attribution the institute can trust.",
  },
  {
    title: "Intern-to-hire mentorship",
    org: "Lincoln Leadership Institute at Gettysburg",
    summary: "Mentored an intern into a full-time role managing the institute's digital assets and marketing operations.",
    owned: "A structured development plan across digital asset management, HubSpot administration, and marketing operations.",
    outcome: "Durable internal capacity instead of another dependency on a consultant.",
  },
];

export const engagements: Engagement[] = [
  { title: "Panel Wizard", agency: "National Science Foundation", summary: "ML-assisted proposal panel formation; 8 screens consolidated into 1, weeks to hours.", caseStudySlug: "panel-wizard" },
  { title: "Proposal triage pipeline", agency: "National Science Foundation", summary: "SciBERT, UMAP, and HDBSCAN tuned with Optuna; 7,000+ proposals into 70+ themes with ambiguous cases routed to people.", caseStudySlug: "nsf-proposal-classification" },
  { title: "ADCC compliance checker", agency: "National Science Foundation", summary: "28 automated checks against live data, with drill-down and an audit trail.", caseStudySlug: "nsf-adcc" },
  { title: "RoboRA document automation", agency: "National Science Foundation", summary: "Replaced an Excel workflow with a pipeline that posts into a legacy system with no API.", caseStudySlug: "nsf-robora" },
  { title: "Telemetry dashboards", agency: "National Science Foundation", summary: "Anonymous usage telemetry across the tool suite to measure adoption honestly.", caseStudySlug: "nsf-telemetry" },
  { title: "Researcher lineage dashboard", agency: "National Science Foundation", summary: "Public and internal funding data joined in BigQuery to map researcher funding trajectories.", caseStudySlug: "researcher-lineage-dashboard" },
  { title: "Study halls and data working group", agency: "National Science Foundation", summary: "Recurring enablement that moved analysts from waiting for reports to building their own.", caseStudySlug: "enablement-study-halls" },
  { title: "Organic program analytics platform", agency: "USDA", summary: "AWS warehouse joining Salesforce, CBP customs records, and investigative data; Tableau suite for 50,000+ operations.", caseStudySlug: "usda-organic-analytics" },
  { title: "Recovery Act oversight with GIS", agency: "Recovery Accountability and Transparency Board", summary: "Geospatial and network analysis that surfaced 90 contract misrepresentations.", caseStudySlug: "ratb-gis-oversight" },
  { title: "International operations analytics", agency: "U.S. Postal Service", summary: "SAS-based analytical workflows that surfaced operational leads for international mail processing." },
  { title: "Data analytics support", agency: "U.S. Census Bureau", summary: "ServiceNow administration and Python-based reporting and automation for operations teams." },
];

export const prototypes: Prototype[] = [
  {
    title: "RAG pipeline prototype",
    description:
      "Embedding-based search over a local document corpus. I built this to test whether RAG could support curated Q&A without exposing sensitive data in a federal context. Short answer: it can, with caveats around chunk size and overlap that matter more than I expected.",
    stack: ["Python", "FAISS", "Embeddings"],
    availability: "Code available on request",
  },
  {
    title: "Embedding + clustering notebook",
    description:
      "A reusable Jupyter workflow for encoding text with sentence-transformer embeddings and testing clustering approaches (HDBSCAN, K-Means). I use this as a starting point when scoping NLP projects. Saves about a day of setup each time.",
    stack: ["Python", "Jupyter", "scikit-learn", "sentence-transformers"],
    availability: "Code available on request",
  },
  {
    title: "Tableau governance checklist",
    description:
      "A starter kit for teams adopting Tableau in regulated settings: naming conventions, data source management, accessibility standards, refresh monitoring, publishing workflows. I put this together after seeing the same governance gaps on multiple engagements.",
    stack: ["Tableau", "Documentation", "Governance"],
    availability: "Available on request",
  },
  {
    title: "Stack Overflow code language classifier",
    description:
      "Grad school project. I scraped Stack Overflow posts, extracted code snippets, and trained a Keras deep learning model to identify the programming language. The preprocessing ended up being harder than the model.",
    stack: ["Python", "Keras", "NLP"],
    availability: "Academic project (2017)",
  },
  {
    title: "DC intersection risk scoring",
    description:
      "ML model that scored Washington, DC intersections by accident risk using historical crash data and environmental features. The real lesson was how much feature engineering matters when your raw data is messy government records.",
    stack: ["Python", "scikit-learn", "Pandas"],
    availability: "Academic project (2017)",
  },
];

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
