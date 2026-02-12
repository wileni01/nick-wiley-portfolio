/**
 * Knowledge Base for the "Chat with Nick's Experience" RAG chatbot.
 *
 * This structured data is used to generate embeddings and provide context
 * for the AI to answer questions about Nick Wiley's professional experience.
 *
 * To update: edit the entries below. The chatbot will use this data
 * as its primary knowledge source.
 */

export interface KnowledgeEntry {
  id: string;
  category: string;
  content: string;
}

export const knowledgeBase: KnowledgeEntry[] = [
  // ── Identity & Overview ──────────────────────────────
  {
    id: "identity",
    category: "overview",
    content: `Nick Wiley is a Full-Stack Software Engineer and AI Solutions Architect based in the United States. 
He specializes in building production-grade web applications with AI integration, data engineering pipelines, 
and cybersecurity analysis tools. He has experience across federal government contracts (IBM), 
nonprofit client work (Lincoln Leadership Institute), and open-source development.

His core strengths include: React/Next.js frontend development, Python backend services (FastAPI, Flask), 
AI/ML integration (OpenAI GPT-4o, Azure AI, embeddings/RAG), CRM and data platform integration (HubSpot, Stripe, Apollo.io), 
DevOps (Docker, Vercel, PowerShell automation), and cybersecurity (fraud detection, graph analysis).`,
  },

  // ── Lincoln Leadership Institute Work ────────────────
  {
    id: "lli-overview",
    category: "work-experience",
    content: `Nick serves as Lead Software Engineer & AI Solutions Architect for the Lincoln Leadership Institute at Gettysburg (LLI). 
LLI is a premier executive leadership development organization that uses historic battlefields as teaching environments for Fortune 500 companies 
and government agencies. Nick led their complete digital transformation.`,
  },
  {
    id: "lli-website",
    category: "project",
    content: `Nick rebuilt gettysburgleadership.com from the ground up using Next.js 14 with TypeScript and Tailwind CSS. 
The site features Stripe payment processing for program registration, HubSpot CRM integration with first-touch UTM attribution, 
Calendly scheduling, PostHog analytics for conversion tracking, Sentry error monitoring, and MDX-driven content management. 
It's deployed on Vercel's edge network and improved page load times by 4x over the previous site.`,
  },
  {
    id: "lli-email-miner",
    category: "project",
    content: `Nick built an AI-powered email data mining pipeline for LLI that processes Outlook PST archives. 
The system uses Azure AI Document Intelligence for invoice OCR, Apollo.io for contact enrichment, 
and exports HubSpot-compatible CSV files. Built with Python/FastAPI, it recovered 5,000+ contacts from legacy email archives.`,
  },
  {
    id: "lli-golden-record",
    category: "project",
    content: `Nick built the LLI Golden Record system — a HubSpot contact deduplication and recovery platform. 
It uses Levenshtein distance for fuzzy matching, Apollo.io for data enrichment, and optional GPT-4 lead scoring. 
Features a Flask review UI for human-in-the-loop merge approval. Eliminated 2,000+ duplicate CRM records.`,
  },

  // ── Cybersecurity ────────────────────────────────────
  {
    id: "nickantir",
    category: "project",
    content: `Nick built NickAntir, a Palantir-inspired fraud intelligence platform. It features interactive D3.js v7 
force-directed graphs for entity-relationship analysis, Leaflet.js geographic heatmaps for spatial pattern detection, 
a data ontology system for entity classification, and risk scoring algorithms. The platform ingests CSV data and renders 
complex fraud networks for analyst investigation.`,
  },

  // ── AI/ML Experience ─────────────────────────────────
  {
    id: "resume-generator",
    category: "project",
    content: `Nick built an AI Resume Generator powered by GPT-4o. The system ingests multiple resume versions (DOCX/PDF), 
consolidates them into a "gold copy" professional profile, then generates targeted resumes and cover letters for specific 
job listings using CAR+I format. Includes a Chrome extension that auto-fills application forms on LinkedIn and job boards. 
Built with Python/FastAPI, Tailwind CSS, Alpine.js, and SQLite.`,
  },

  // ── Full-Stack Development ───────────────────────────
  {
    id: "nickwchat",
    category: "project",
    content: `Nick built NickWChat, a polyglot chat application demonstrating modern full-stack architecture. 
React 18/TypeScript frontend with Vite 5, FastAPI Python backend, and Neo4j graph database for storing conversation 
relationships. Docker Compose orchestrates the full stack with hot-reload development configuration.`,
  },

  // ── Government / Federal Work ────────────────────────
  {
    id: "gov-experience",
    category: "work-experience",
    content: `Nick has experience working on federal government technology projects through IBM's Federal Division. 
He contributed to projects for USPS, the U.S. Census Bureau, USDA, and multiple National Science Foundation (NSF) 
research computing initiatives. [Details to be filled in — these are placeholder entries for upcoming project descriptions.]`,
  },

  // ── Technical Skills ─────────────────────────────────
  {
    id: "frontend-skills",
    category: "skills",
    content: `Nick's frontend skills include: React, Next.js (App Router), TypeScript, Tailwind CSS, D3.js data visualization, 
Leaflet.js mapping, Framer Motion animations, HTML5/CSS3, and responsive/mobile-first design. 
He's built production sites with Stripe checkout, HubSpot forms, and PostHog analytics integration.`,
  },
  {
    id: "backend-skills",
    category: "skills",
    content: `Nick's backend skills include: Python (FastAPI, Flask, SQLAlchemy), Node.js, SQL databases (SQLite, PostgreSQL), 
Neo4j graph database, REST API design, WebSocket communication, and server-side rendering with Next.js. 
He emphasizes security with input sanitization, rate limiting, CORS configuration, and CSP headers.`,
  },
  {
    id: "ai-skills",
    category: "skills",
    content: `Nick's AI/ML skills include: OpenAI GPT-4o integration, text embeddings (text-embedding-3-small), 
Retrieval-Augmented Generation (RAG), Azure AI Document Intelligence (OCR), prompt engineering, 
Anthropic Claude integration, and the Vercel AI SDK for streaming responses. He's built production AI features 
including automated resume generation, lead scoring, and document intelligence extraction.`,
  },
  {
    id: "devops-skills",
    category: "skills",
    content: `Nick's DevOps skills include: Docker and Docker Compose, Vercel deployment (edge functions, serverless), 
CI/CD pipelines, PowerShell automation, Git/GitHub workflows, Linux/WSL, and cloud platforms. 
He's built Electron desktop applications and PowerShell installer tools with integrity verification.`,
  },
  {
    id: "security-skills",
    category: "skills",
    content: `Nick's cybersecurity skills include: fraud detection and analysis, graph-based threat analysis (D3.js network visualization), 
SHA-256 data integrity verification, secure API design, Content Security Policy implementation, 
input sanitization, rate limiting, and OWASP security best practices.`,
  },

  // ── Open Source & Game Development ───────────────────
  {
    id: "open-source",
    category: "interests",
    content: `Nick contributes to open source projects including a Medieval II: Total War quality-of-life mod installer 
(PowerShell with SHA-256 verification and Steam detection) and Valley of Vines, a Stardew Valley mod built with 
C#/.NET 6 on the SMAPI framework featuring complete viticulture mechanics with vineyard management, 
wine production chains, and brand reputation systems.`,
  },

  // ── What Makes Nick Unique ───────────────────────────
  {
    id: "differentiators",
    category: "overview",
    content: `What sets Nick apart: 1) He bridges the gap between AI research and production deployment — every AI feature 
he builds ships to real users. 2) He has rare cross-domain expertise spanning frontend, backend, AI/ML, DevOps, 
cybersecurity, and data engineering. 3) His government experience (IBM Federal) combined with startup-speed execution 
(LLI) means he can navigate both enterprise and agile environments. 4) He builds complete systems, not just features — 
from Chrome extensions to fraud analysis platforms to CRM integrations.`,
  },
];
