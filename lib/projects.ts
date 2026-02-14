export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string[];
  technologies: string[];
  image: string;
  github?: string;
  live?: string;
  featured: boolean;
  status: "completed" | "in-progress" | "template";
  agency?: string;
  problem?: string;
  solution?: string;
  impact?: string;
}

export const projects: Project[] = [
  // ── LLI Client Work ──────────────────────────────────
  {
    slug: "gettysburg-leadership",
    title: "GettysburgLeadership.com",
    description:
      "Full rebuild of the Lincoln Leadership Institute's website — modernized from WordPress with integrated payments, CRM, and analytics.",
    longDescription: `Led the complete redesign and rebuild of the Lincoln Leadership Institute at Gettysburg's web presence, 
modernizing from a legacy WordPress site. The site serves Fortune 500 clients and government agencies seeking executive 
leadership development programs at historic battlefields.

Built a performant, SEO-optimized Next.js 14 application using Cursor and Claude Code with Stripe payment processing 
for program registration, HubSpot CRM integration for lead capture and first-touch attribution, Calendly for consultation 
scheduling, PostHog analytics for conversion tracking, and Sentry for error monitoring. Deployed on Vercel's edge network.`,
    category: ["LLI Client Work", "Full-Stack"],
    technologies: [
      "Next.js 14",
      "TypeScript",
      "React 18",
      "Tailwind CSS",
      "MDX",
      "Stripe",
      "HubSpot",
      "PostHog",
      "Sentry",
      "Vercel",
      "Calendly",
      "Cursor",
      "Claude Code",
    ],
    image: "/images/projects/gettysburg-leadership.png",
    live: "https://gettysburgleadership.com",
    github: undefined,
    featured: true,
    status: "completed",
    problem:
      "The Lincoln Leadership Institute's legacy WordPress website was outdated, had no payment processing, poor SEO, and no CRM integration — losing leads and requiring manual registration workflows.",
    solution:
      "Modernized from WordPress to a Next.js 14 site using Cursor and Claude Code, with Stripe checkout, HubSpot forms with UTM attribution, Calendly scheduling, PostHog analytics, and MDX-driven content.",
    impact:
      "Streamlined registration flow from manual email to self-service checkout. Improved page load times by 4x. Enabled data-driven marketing with full attribution tracking across all touchpoints.",
  },
  {
    slug: "lli-digital-transformation",
    title: "LLI Digital Program Transformation",
    description:
      "Led the conversion of a premier in-person leadership development program to a digital format — from concept to revenue.",
    longDescription: `Led the digital transformation of the Lincoln Leadership Institute's flagship in-person leadership 
development program. Conceptualized the digital format, identified and vetted production partners, hired producers, 
adapted content for virtual delivery, trained and led presenters, managed advertising and enrollment, and added 
digital interactions to maintain the engagement that made the in-person experience valuable.

This wasn't just putting a camera in a room — it required fundamentally rethinking how experiential leadership 
lessons translate to a screen while preserving the impact that Fortune 500 companies and government agencies pay for.`,
    category: ["LLI Client Work"],
    technologies: [
      "Digital Production",
      "Content Strategy",
      "Virtual Events",
      "Marketing",
    ],
    image: "/images/projects/placeholder-gov.svg",
    featured: false,
    status: "completed",
    problem:
      "A premier in-person leadership development program needed to reach audiences digitally without losing the experiential quality that made it valuable.",
    solution:
      "Conceptualized the digital format, vetted and hired production partners, adapted content, trained presenters, and managed the full enrollment pipeline.",
    impact:
      "Successfully launched a digital program that expanded the institute's reach beyond in-person attendees while maintaining program quality and revenue.",
  },
  {
    slug: "lli-america-250",
    title: "America at 250 Program",
    description:
      "Conceptualized a new leadership program using AI-powered market research — generating significant revenue since launch.",
    longDescription: `Conceptualized the "America at 250" program for the Lincoln Leadership Institute, leveraging AI-powered 
market research to identify the opportunity, validate demand, and shape the program's positioning. The program connects 
America's 250th anniversary to leadership lessons from historic battlefields.

Used AI tools for competitive analysis, audience research, and content positioning — then worked with the team to 
develop programming, pricing, and go-to-market strategy.`,
    category: ["LLI Client Work", "AI/ML"],
    technologies: [
      "AI Market Research",
      "Content Strategy",
      "Program Design",
    ],
    image: "/images/projects/placeholder-gov.svg",
    featured: false,
    status: "completed",
    problem:
      "The institute needed a new revenue stream tied to a major cultural moment — America's 250th anniversary — but lacked market research on demand and positioning.",
    solution:
      "Used AI-powered market research to conceptualize the program, validate demand, and develop the go-to-market strategy.",
    impact:
      "The program has generated significant revenue since launch, creating a new product line for the institute.",
  },
  {
    slug: "lli-email-marketing",
    title: "LLI Digital Marketing & Email Campaigns",
    description:
      "Designed email marketing campaigns and led Emma-to-HubSpot migration, driving program registrations and significant revenue.",
    longDescription: `Designed and executed digital marketing campaigns for the Lincoln Leadership Institute, identifying key 
metrics for email campaigns that converted into direct program registrations. Led the migration from Emma to HubSpot 
for email marketing, enabling better segmentation, automation, and attribution tracking.

Also automated the creation of marketing materials, reducing the time and effort required to produce 
consistent, professional collateral for program promotion.`,
    category: ["LLI Client Work"],
    technologies: [
      "HubSpot",
      "Emma (migrated from)",
      "Email Automation",
      "Marketing Analytics",
    ],
    image: "/images/projects/placeholder-gov.svg",
    featured: false,
    status: "completed",
    problem:
      "Email campaigns lacked attribution tracking and segmentation; marketing materials were created manually; the email platform (Emma) couldn't support needed automation.",
    solution:
      "Migrated from Emma to HubSpot, identified digital marketing metrics, designed targeted campaigns, and automated marketing material creation.",
    impact:
      "Email campaigns drove direct program signups contributing to hundreds of thousands in revenue. Automated marketing materials reduced production time.",
  },
  {
    slug: "lli-intern-mentorship",
    title: "LLI Intern-to-Hire Mentorship",
    description:
      "Mentored an intern through conversion to full-time hire to manage digital assets and marketing operations.",
    longDescription: `Mentored an intern through a structured development program, building their skills in digital asset 
management, HubSpot administration, and marketing operations. Successfully guided their transition from intern 
to full-time hire, where they now manage the institute's digital assets and ongoing marketing operations.`,
    category: ["LLI Client Work"],
    technologies: [
      "HubSpot",
      "Digital Asset Management",
      "Marketing Operations",
    ],
    image: "/images/projects/placeholder-gov.svg",
    featured: false,
    status: "completed",
    problem:
      "The institute needed dedicated digital operations support but lacked internal expertise to develop new talent for the role.",
    solution:
      "Mentored an intern through skill development in digital assets, HubSpot, and marketing operations, guiding them to a full-time role.",
    impact:
      "Created sustainable internal capacity for digital marketing operations through successful intern-to-hire pipeline.",
  },
  {
    slug: "lli-email-data-miner",
    title: "LLI Email Data Miner",
    description:
      "AI-powered email extraction tool that mines Outlook PST exports for contact enrichment and HubSpot import.",
    longDescription: `Built a full-stack data extraction pipeline that converts Outlook PST archives into enriched, 
CRM-ready contact databases. The system parses email metadata, extracts invoice data using Azure AI Document Intelligence (OCR), 
resolves contacts via Apollo.io enrichment, and exports HubSpot-compatible CSV files.

Features a FastAPI backend with SQLAlchemy/SQLite storage, a web UI for monitoring extraction progress, 
and intelligent deduplication logic to merge contacts from thousands of email threads.`,
    category: ["LLI Client Work", "AI/ML"],
    technologies: [
      "Python",
      "FastAPI",
      "Azure AI Document Intelligence",
      "OpenAI",
      "Apollo.io",
      "SQLAlchemy",
      "SQLite",
      "BeautifulSoup4",
      "HubSpot API",
    ],
    image: "/images/projects/lli-email-miner.png",
    featured: false,
    status: "completed",
    problem:
      "Years of client relationships were locked in Outlook PST archives with no structured way to extract, deduplicate, or import contacts into the CRM.",
    solution:
      "Developed an AI-powered pipeline: PST → EML parsing → OCR invoice extraction → Apollo.io enrichment → HubSpot-ready CSV export, with a web dashboard for monitoring.",
    impact:
      "Recovered 5,000+ contacts from legacy email archives, enriched with company data and job titles, enabling targeted re-engagement campaigns.",
  },
  {
    slug: "lli-golden-record",
    title: "LLI Golden Record",
    description:
      "HubSpot contact deduplication and recovery system with GPT-4 lead scoring.",
    longDescription: `Designed and built a contact management system that creates a single "golden record" for each contact 
across fragmented CRM data. Uses Levenshtein distance matching for fuzzy deduplication, Apollo.io API for contact recovery 
and enrichment, and optional GPT-4 integration for intelligent lead scoring.

Features a Flask-based review UI where staff can approve/reject merge suggestions, 
with full audit trail and HubSpot sync capabilities.`,
    category: ["LLI Client Work", "AI/ML"],
    technologies: [
      "Python",
      "Flask",
      "OpenAI GPT-4",
      "HubSpot API",
      "Apollo.io",
      "SQLite",
      "Levenshtein",
    ],
    image: "/images/projects/lli-golden-record.png",
    featured: false,
    status: "completed",
    problem:
      "The CRM contained thousands of duplicate contacts from years of imports, manual entry, and event registrations — degrading marketing analytics and causing embarrassing duplicate outreach.",
    solution:
      "Built a fuzzy-matching deduplication engine with human-in-the-loop review, Apollo.io enrichment for data recovery, and GPT-4 lead scoring for prioritization.",
    impact:
      "Eliminated 2,000+ duplicate records, improved email deliverability, and enabled accurate pipeline reporting for the first time.",
  },

  // ── Cybersecurity ────────────────────────────────────
  {
    slug: "nickantir",
    title: "NickAntir - Fraud Intelligence Platform",
    description:
      "Palantir-inspired fraud analysis platform with interactive graph visualization and geographic intelligence.",
    longDescription: `Built a comprehensive fraud intelligence platform inspired by Palantir's analytical approach. 
Features an interactive D3.js force-directed graph for entity relationship analysis, Leaflet.js geographic heatmaps 
for spatial pattern detection, a data ontology system for entity classification, and risk scoring algorithms.

The platform ingests CSV data and renders complex entity-relationship networks, allowing analysts to visually 
trace connections between suspects, accounts, transactions, and locations in real-time.`,
    category: ["Cybersecurity"],
    technologies: [
      "JavaScript",
      "D3.js v7",
      "Leaflet.js",
      "HTML5",
      "CSS3",
      "CSV Parsing",
    ],
    image: "/images/projects/nickantir.png",
    featured: true,
    status: "completed",
    problem:
      "Fraud investigators needed a tool to visualize complex entity relationships and geographic patterns across large datasets, without expensive enterprise licenses.",
    solution:
      "Built a web-based intelligence platform with D3.js force-directed graphs for link analysis, Leaflet.js for geographic visualization, and a custom data ontology for entity classification.",
    impact:
      "Enables analysts to visually trace fraud networks across entities, accounts, and locations — reducing investigation time and surfacing hidden connections.",
  },

  // ── Full-Stack ───────────────────────────────────────
  {
    slug: "nickwchat",
    title: "NickWChat - Polyglot Chat App",
    description:
      "Full-stack chat application with Neo4j graph database backend and React TypeScript frontend.",
    longDescription: `A polyglot chat application demonstrating modern full-stack architecture with a graph database backbone. 
The React/TypeScript frontend communicates via a FastAPI backend that stores conversations and relationships in Neo4j, 
enabling rich graph queries for conversation threading, user relationships, and message analytics.

Docker Compose orchestrates the full stack — web frontend, API server, and Neo4j database — 
with hot reload for development and production-ready configuration.`,
    category: ["Full-Stack"],
    technologies: [
      "React 18",
      "TypeScript",
      "Vite 5",
      "FastAPI",
      "Python 3.11",
      "Neo4j",
      "Docker Compose",
      "pnpm",
    ],
    image: "/images/projects/placeholder-nickwchat.svg",
    featured: false,
    status: "completed",
    problem:
      "Wanted to demonstrate graph database modeling for real-time relationships and build a production-grade polyglot system with type-safe frontend and Python backend.",
    solution:
      "Built a Docker-orchestrated stack: React/TS frontend → FastAPI backend → Neo4j graph DB, with full hot-reload development workflow.",
    impact:
      "Showcases graph-based data modeling for social features, with Docker Compose making the entire stack reproducible in one command.",
  },

  // ── AI/ML ────────────────────────────────────────────
  {
    slug: "nw-resume-generator",
    title: "AI Resume Generator",
    description:
      'GPT-4o powered resume and cover letter generator with "gold copy" profile system and Chrome extension.',
    longDescription: `An AI-powered system that ingests multiple resume versions and documents to build a comprehensive 
"gold copy" professional profile, then generates targeted resumes and cover letters for specific job listings using GPT-4o.

Features document ingestion (DOCX/PDF parsing), intelligent profile consolidation, CAR+I-format resume generation, 
targeted cover letter writing, and a Chrome extension that auto-fills application forms on LinkedIn and job boards 
using the generated content.`,
    category: ["AI/ML"],
    technologies: [
      "Python",
      "FastAPI",
      "OpenAI GPT-4o",
      "Tailwind CSS",
      "Alpine.js",
      "SQLite",
      "python-docx",
      "pdfplumber",
      "Chrome Extension API",
    ],
    image: "/images/projects/resume-generator.png",
    featured: true,
    status: "completed",
    problem:
      "Tailoring resumes for each job application is time-consuming, and manually filling application forms across multiple platforms is repetitive and error-prone.",
    solution:
      'Built an AI pipeline: ingest multiple resume versions → consolidate into "gold copy" profile → generate targeted resume/cover letter per job listing → auto-fill via Chrome extension.',
    impact:
      "Reduces resume tailoring from 45 minutes to 2 minutes per application. Chrome extension eliminates manual form-filling across LinkedIn, Greenhouse, and Lever.",
  },

  // ── Desktop/DevOps ───────────────────────────────────
  {
    slug: "g15-modes-console",
    title: "G15 Modes Console",
    description:
      "Electron desktop app for switching laptop modes with PowerShell automation for system management.",
    longDescription: `A desktop application built with Electron for managing laptop configuration profiles — 
switching between travel mode, desk mode, and KVM dock mode with automated system configuration changes.

Uses PowerShell scripts under the hood to manage display settings, network configurations, GPU switching 
(NVIDIA dGPU enable/disable), and peripheral detection. Features an integrated terminal (xterm.js) 
for direct script execution and a markdown-rendered documentation viewer.`,
    category: ["Desktop/DevOps"],
    technologies: [
      "Electron 34",
      "Node.js",
      "PowerShell",
      "xterm.js",
      "HTML/CSS/JS",
    ],
    image: "/images/projects/g15-modes.png",
    featured: false,
    status: "completed",
    problem:
      "Switching between laptop docking configurations required manually changing display, network, and GPU settings every time — a tedious and error-prone process.",
    solution:
      "Built an Electron app with PowerShell automation scripts that switch entire system profiles (display, network, GPU) with one click.",
    impact:
      "Reduces multi-step system reconfiguration to a single button press, with visual feedback and integrated terminal for debugging.",
  },

  // ── Open Source ──────────────────────────────────────
  {
    slug: "mtw2-qol-installer",
    title: "MTW2 QoL Installer",
    description:
      "PowerShell installer for Medieval II: Total War quality-of-life enhancements with integrity verification.",
    longDescription: `A community-focused PowerShell installer that automates quality-of-life enhancements for 
Medieval II: Total War. Features Large Address Aware patching (2GB → 4GB RAM), freecam installation, 
optional mod support (Unofficial Patch, TVB), automatic Steam installation detection, 
SHA-256 integrity verification, and automatic backup creation before any modifications.`,
    category: ["Open Source"],
    technologies: ["PowerShell", "SHA-256", "Steam API"],
    image: "/images/projects/placeholder-mtw2.svg",
    featured: false,
    status: "completed",
    problem:
      "Installing quality-of-life mods for Medieval II: Total War required manual hex editing, file replacement, and registry changes — risky for non-technical users.",
    solution:
      "Created an automated PowerShell installer with SHA-256 verification, automatic backups, Steam detection, and a guided installation flow.",
    impact:
      "Makes advanced game modifications accessible to all players with zero technical knowledge required, while ensuring safe rollback capability.",
  },
  {
    slug: "valley-of-vines",
    title: "Valley of Vines - Stardew Valley Mod",
    description:
      "Late-game vintner expansion mod for Stardew Valley with vineyard management and estate wine production.",
    longDescription: `A comprehensive content mod for Stardew Valley that adds a complete viticulture system — 
vineyard blocks, grape varieties, grape pressing, wine fermentation, blending stations, and an estate winery 
with brand score mechanics. Built with C#/.NET 6 on the SMAPI modding framework with Harmony patching.

Features custom crop definitions via JSON Assets, big craftable machines, multi-stage production chains, 
and a winery management UI for tracking brand reputation and wine inventory.`,
    category: ["Open Source", "Game Dev"],
    technologies: ["C#", ".NET 6", "SMAPI", "Harmony", "JSON Assets"],
    image: "/images/projects/placeholder-valley-of-vines.svg",
    featured: false,
    status: "completed",
    problem:
      "Stardew Valley's late-game farming lacks depth — players wanted a complex production chain similar to real-world viticulture.",
    solution:
      "Built a full viticulture system: vineyard blocks → grape harvesting → pressing → fermentation → blending → estate winery with brand reputation mechanics.",
    impact:
      "Adds 20+ hours of late-game content with a realistic wine production chain that rewards long-term planning and brand management.",
  },

  // ── Government Projects ─────────────────────────────
  {
    slug: "usps-international-ops",
    title: "USPS International Operations Analytics",
    description:
      "Data analytics for USPS international mail operations, identifying leads and optimizing operational workflows using SAS.",
    longDescription: `Managed data analytics for USPS international mail operations, developing analytical workflows 
that identified operational leads and surfaced insights for process optimization.

**Agency:** United States Postal Service (USPS)
**Role:** Data Analyst (via IBM)`,
    category: ["Government"],
    technologies: ["SAS", "Data Analytics", "SQL"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "USPS",
    featured: false,
    status: "completed",
    problem:
      "International mail operations lacked systematic analytics to identify leads and optimize processing workflows across global operations.",
    solution:
      "Developed SAS-based analytical workflows that surfaced operational leads and provided data-driven insights for international mail processing.",
    impact:
      "Improved operational visibility across international mail workflows, enabling data-driven decision-making for process optimization.",
  },
  {
    slug: "census-data-analytics",
    title: "Census Bureau Data Analytics Support",
    description:
      "Data analytics support for Census Bureau operations including ServiceNow administration and Python-based reporting.",
    longDescription: `Provided data analytics support for Census Bureau operations, including ServiceNow platform administration 
and Python-based reporting and automation.

**Agency:** U.S. Census Bureau
**Role:** Data Analytics Consultant (via IBM)`,
    category: ["Government"],
    technologies: ["Python", "ServiceNow", "SQL", "Data Analytics"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "Census Bureau",
    featured: false,
    status: "completed",
    problem:
      "Census Bureau operations needed improved data analytics capabilities and streamlined service management workflows.",
    solution:
      "Delivered data analytics support including ServiceNow administration and Python-based reporting tools for operational visibility.",
    impact:
      "Improved operational reporting capabilities and streamlined service management workflows through Python automation and ServiceNow optimization.",
  },
  {
    slug: "nsf-proposal-classification",
    title: "NSF AI-Powered Proposal Classification",
    description:
      "ML pipeline using BERTopic and Bayesian optimization to classify 7,000+ research proposals into 70+ themes.",
    longDescription: `Built a machine learning pipeline to automatically cluster and categorize 7,000+ NSF research proposals 
using advanced NLP and unsupervised learning techniques. Implemented BERTopic framework combining UMAP dimensionality reduction, 
HDBSCAN clustering, and transformer-based embeddings to discover 70+ distinct research themes. Optimized model performance 
using Optuna Bayesian optimization, improving clustering quality by 40% through automated hyperparameter tuning across 100+ trials.

**Agency:** National Science Foundation (NSF)
**Role:** Applied Data Scientist (via IBM)`,
    category: ["Government", "AI/ML"],
    technologies: [
      "Python",
      "BERTopic",
      "UMAP",
      "HDBSCAN",
      "Sentence Transformers",
      "Optuna",
      "Plotly",
      "Pandas",
      "scikit-learn",
    ],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "completed",
    problem:
      "Manually clustering thousands of research proposals into thematic panels was slow, inconsistent, and dependent on institutional knowledge.",
    solution:
      "Built a BERTopic pipeline with UMAP + HDBSCAN + transformer embeddings, optimized via Optuna across 100+ trials to discover 70+ research themes.",
    impact:
      "Automated manual proposal clustering, reducing panel formation time from weeks to hours while improving topic coherence by 40%.",
  },
  {
    slug: "nsf-panel-wizard",
    title: "NSF Panel Wizard Decision Support",
    description:
      "Human-in-the-loop decision support tool using sentence embeddings and K-Means clustering, consolidating 8 screens into 1.",
    longDescription: `Designed and delivered Panel Wizard — a decision-support copilot that consolidated data from 8 separate screens 
into a single unified view. Uses sentence transformer embeddings with K-Means clustering, cosine similarity fit scoring, 
silhouette analysis, and TF-IDF topic labeling. Built in Streamlit with Altair charting.

**Agency:** National Science Foundation (NSF)
**Role:** Solutions Architect / Applied Data Scientist (via IBM)`,
    category: ["Government", "AI/ML"],
    technologies: [
      "Python",
      "Streamlit",
      "Sentence Transformers",
      "scikit-learn",
      "K-Means",
      "Altair",
      "SQLAlchemy",
      "Pandas",
    ],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: true,
    status: "completed",
    problem:
      "Panelists navigated 8 different screens to track proposal ratings and rankings, making the review process fragmented and slow.",
    solution:
      "Built a Streamlit-based decision support tool with sentence embeddings and clustering that consolidates all panel review data into a single, intelligent interface.",
    impact:
      "Reduced panel formation time from weeks to hours. Consolidated 8 screens into 1 unified view with real-time fit scoring and override capabilities.",
  },
  {
    slug: "nsf-robora",
    title: "NSF RoboRA Document Automation",
    description:
      "Automated document generation tool with Chrome browser automation for legacy system integration.",
    longDescription: `Modernized an Excel-based document generation process into an automated pipeline that queries large datasets 
to populate template documents. Wrote Chrome browser automation that crawls legacy web interfaces and automatically posts 
generated documents to internal systems where no API existed.

**Agency:** National Science Foundation (NSF)
**Role:** Solutions Architect / Developer (via IBM)`,
    category: ["Government"],
    technologies: [
      "Python",
      "Chrome Automation",
      "Template Engine",
      "Data Pipelines",
    ],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "completed",
    problem:
      "Document generation relied on manual Excel workflows with copy-paste data entry into legacy web systems that had no API.",
    solution:
      "Built an automated document generation pipeline with Chrome browser automation to bridge modern data pipelines with legacy systems.",
    impact:
      "Eliminated hours of manual data entry per document cycle and reduced transcription errors in operational documents.",
  },
  {
    slug: "nsf-adcc",
    title: "NSF ADCC Compliance Checker",
    description:
      "Automated compliance checking tool that performs 28 data quality and compliance checks against live operational data.",
    longDescription: `Built ADCC (Automated Data Compliance Checker) — a tool with live data connections that allows users 
to perform 28 distinct compliance checks on the status of operational data. Each check is clearly defined, automated, 
repeatable, and produces audit-ready results.

**Agency:** National Science Foundation (NSF)
**Role:** Solutions Architect / Developer (via IBM)`,
    category: ["Government"],
    technologies: ["Python", "SQL", "Data Pipelines", "Compliance Rules Engine"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "completed",
    problem:
      "Compliance checking was manual, ad-hoc, and rarely comprehensive — leaving data quality gaps undetected until formal audits.",
    solution:
      "Built a modular compliance engine with 28 automated checks running against live data, with clear pass/fail indicators and drill-down capability.",
    impact:
      "Replaced manual auditing with systematic, repeatable compliance validation. Issues now surface proactively rather than in audits.",
  },
  {
    slug: "nsf-telemetry",
    title: "NSF Telemetry Dashboards",
    description:
      "Anonymous usage telemetry dashboards monitoring adoption and engagement across the full analytics tool suite.",
    longDescription: `Designed and deployed anonymous telemetry dashboards that monitor real-world usage of every tool 
in the analytics suite. Tracks adoption metrics, feature engagement, workflow patterns, and trend analysis — 
all with privacy-first design that collects behavioral patterns without identifying individual users.

**Agency:** National Science Foundation (NSF)
**Role:** Analytics Lead (via IBM)`,
    category: ["Government"],
    technologies: ["Python", "Dashboards", "Telemetry", "Analytics"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "completed",
    problem:
      "No systematic way to measure whether tools were being adopted, which features were used, or where workflows stalled.",
    solution:
      "Built anonymous telemetry collection across all tools with dashboards tracking adoption patterns, feature engagement, and workflow bottlenecks.",
    impact:
      "Enabled evidence-based iteration and gave leadership visibility into which tools were delivering value.",
  },
  {
    slug: "nsf-researcher-lineage",
    title: "NSF Researcher Lineage Dashboard",
    description:
      "Funding lineage dashboard integrating public and internal data to map researcher trajectories and co-funder networks.",
    longDescription: `Built a researcher lineage dashboard that incorporates public funding data with internal records to identify 
researchers' principal places of funding before, during, and after agency funding. Surfaces large co-funders and international 
funding sources for strategic portfolio intelligence.

**Agency:** National Science Foundation (NSF)
**Role:** Analytics Lead (via IBM)`,
    category: ["Government"],
    technologies: ["BigQuery", "Tableau", "SQL", "Python", "Public Data APIs"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "completed",
    problem:
      "Portfolio reviews relied on institutional memory with no visibility into researchers' broader funding ecosystem or international funding patterns.",
    solution:
      "Integrated public grant data with internal records to build a lineage dashboard showing funding trajectories, co-funders, and international sources.",
    impact:
      "Enabled strategic portfolio intelligence with visibility into co-funders and international funding patterns for the first time.",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectsByCategory(category: string): Project[] {
  return projects.filter((p) => p.category.includes(category));
}

export function getAllCategories(): string[] {
  const categories = new Set<string>();
  projects.forEach((p) => p.category.forEach((c) => categories.add(c)));
  return Array.from(categories).sort();
}
