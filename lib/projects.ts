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
      "Full rebuild of the Lincoln Leadership Institute's website with integrated payments, CRM, and analytics.",
    longDescription: `Led the complete redesign and rebuild of the Lincoln Leadership Institute at Gettysburg's web presence. 
The site serves Fortune 500 clients and government agencies seeking executive leadership development programs at historic battlefields.

Built a performant, SEO-optimized Next.js 14 application with Stripe payment processing for program registration, 
HubSpot CRM integration for lead capture and first-touch attribution, Calendly for consultation scheduling, 
PostHog analytics for conversion tracking, and Sentry for error monitoring. Deployed on Vercel's edge network.`,
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
    ],
    image: "/images/projects/gettysburg-leadership.png",
    live: "https://gettysburgleadership.com",
    github: undefined,
    featured: true,
    status: "completed",
    problem:
      "The Lincoln Leadership Institute's legacy website was outdated, had no payment processing, poor SEO, and no CRM integration — losing leads and requiring manual registration workflows.",
    solution:
      "Built a modern Next.js 14 site with Stripe checkout, HubSpot forms with UTM attribution, Calendly scheduling, PostHog analytics, and MDX-driven content for easy faculty and program management.",
    impact:
      "Streamlined registration flow from manual email to self-service checkout. Improved page load times by 4x. Enabled data-driven marketing with full attribution tracking across all touchpoints.",
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

  // ── Government Project Templates ─────────────────────
  {
    slug: "usps-mail-processing",
    title: "[USPS] Mail Processing Optimization",
    description: "[FILL IN] Brief description of the USPS project.",
    longDescription: `[FILL IN] Detailed description of the project, including scope, objectives, and your specific contributions.

**Agency:** United States Postal Service (USPS)
**Duration:** [FILL IN] e.g., June 2023 - December 2023
**Team Size:** [FILL IN] e.g., 5 engineers
**Funding Source:** [FILL IN] e.g., IBM Federal contract`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "USPS",
    featured: false,
    status: "template",
    problem: "[FILL IN] What problem was the agency facing?",
    solution: "[FILL IN] What solution did you build or contribute to?",
    impact: "[FILL IN] Quantifiable outcomes — time saved, accuracy improved, cost reduced.",
  },
  {
    slug: "census-data-platform",
    title: "[Census Bureau] Data Platform",
    description: "[FILL IN] Brief description of the Census Bureau project.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** U.S. Census Bureau
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Funding Source:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "Census Bureau",
    featured: false,
    status: "template",
    problem: "[FILL IN] What problem was the agency facing?",
    solution: "[FILL IN] What solution did you build or contribute to?",
    impact: "[FILL IN] Quantifiable outcomes.",
  },
  {
    slug: "usda-project-1",
    title: "[USDA] Agricultural Data System",
    description: "[FILL IN] Brief description of USDA project 1.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** U.S. Department of Agriculture (USDA)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Funding Source:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "USDA",
    featured: false,
    status: "template",
    problem: "[FILL IN] What problem was the agency facing?",
    solution: "[FILL IN] What solution did you build or contribute to?",
    impact: "[FILL IN] Quantifiable outcomes.",
  },
  {
    slug: "usda-project-2",
    title: "[USDA] Resource Management Platform",
    description: "[FILL IN] Brief description of USDA project 2.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** U.S. Department of Agriculture (USDA)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Funding Source:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "USDA",
    featured: false,
    status: "template",
    problem: "[FILL IN] What problem was the agency facing?",
    solution: "[FILL IN] What solution did you build or contribute to?",
    impact: "[FILL IN] Quantifiable outcomes.",
  },
  {
    slug: "nsf-project-1",
    title: "[NSF] Research Computing Platform",
    description: "[FILL IN] Brief description of NSF project 1.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** National Science Foundation (NSF)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Grant Number:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "template",
    problem: "[FILL IN] What research challenge was being addressed?",
    solution: "[FILL IN] What system/tool did you build?",
    impact: "[FILL IN] Research outcomes, publications, datasets produced.",
  },
  {
    slug: "nsf-project-2",
    title: "[NSF] Data Analytics Framework",
    description: "[FILL IN] Brief description of NSF project 2.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** National Science Foundation (NSF)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Grant Number:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "template",
    problem: "[FILL IN] What research challenge was being addressed?",
    solution: "[FILL IN] What system/tool did you build?",
    impact: "[FILL IN] Research outcomes, publications, datasets produced.",
  },
  {
    slug: "nsf-project-3",
    title: "[NSF] Machine Learning Pipeline",
    description: "[FILL IN] Brief description of NSF project 3.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** National Science Foundation (NSF)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Grant Number:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "template",
    problem: "[FILL IN] What research challenge was being addressed?",
    solution: "[FILL IN] What system/tool did you build?",
    impact: "[FILL IN] Research outcomes, publications, datasets produced.",
  },
  {
    slug: "nsf-project-4",
    title: "[NSF] Scientific Visualization Tool",
    description: "[FILL IN] Brief description of NSF project 4.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** National Science Foundation (NSF)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Grant Number:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "template",
    problem: "[FILL IN] What research challenge was being addressed?",
    solution: "[FILL IN] What system/tool did you build?",
    impact: "[FILL IN] Research outcomes, publications, datasets produced.",
  },
  {
    slug: "nsf-project-5",
    title: "[NSF] Cloud Infrastructure for Research",
    description: "[FILL IN] Brief description of NSF project 5.",
    longDescription: `[FILL IN] Detailed description of the project.

**Agency:** National Science Foundation (NSF)
**Duration:** [FILL IN]
**Team Size:** [FILL IN]
**Grant Number:** [FILL IN]`,
    category: ["Government"],
    technologies: ["[FILL IN]"],
    image: "/images/projects/placeholder-gov.svg",
    agency: "NSF",
    featured: false,
    status: "template",
    problem: "[FILL IN] What research challenge was being addressed?",
    solution: "[FILL IN] What system/tool did you build?",
    impact: "[FILL IN] Research outcomes, publications, datasets produced.",
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
