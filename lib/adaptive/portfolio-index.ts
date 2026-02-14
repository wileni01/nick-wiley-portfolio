import type { PortfolioAsset } from "./types";

const portfolioAssets: PortfolioAsset[] = [
  {
    id: "work-panel-wizard",
    title: "Panel Wizard: Human-in-the-loop ML for proposal panel formation",
    url: "/work/panel-wizard",
    kind: "work",
    summary:
      "Decision-support tool consolidating 8 screens into 1, using sentence transformer embeddings and K-Means clustering. Reduced panel formation from weeks to hours.",
    tags: [
      "human-in-the-loop",
      "governance",
      "nlp",
      "clustering",
      "decision-support",
      "federal",
      "responsible-ai",
      "auditability",
      "streamlit",
      "sentence-transformers",
    ],
  },
  {
    id: "work-usda-organic-analytics",
    title: "USDA Organic Analytics Platform",
    url: "/work/usda-organic-analytics",
    kind: "work",
    summary:
      "Global data warehouse on AWS integrating Salesforce, CBP customs records, and investigative data. NLP taxonomy classifier and dozens of Tableau reports.",
    tags: [
      "data-platform",
      "tableau",
      "etl",
      "governance",
      "accessibility",
      "federal",
      "operations",
      "enterprise-delivery",
      "aws",
      "salesforce",
      "nlp",
      "scikit-learn",
    ],
  },
  {
    id: "work-researcher-lineage",
    title: "Researcher Lineage Dashboard",
    url: "/work/researcher-lineage-dashboard",
    kind: "work",
    summary:
      "Integrated public and internal data to map researcher funding trajectories, co-funders, and international funding sources.",
    tags: [
      "dashboards",
      "analytics",
      "portfolio-review",
      "stakeholder-alignment",
      "bigquery",
      "federal",
      "public-data",
      "data-integration",
    ],
  },
  {
    id: "work-study-halls",
    title: "Building adoption: Study halls that made analytics usable",
    url: "/work/enablement-study-halls",
    kind: "work",
    summary:
      "Enablement and data working groups that increased self-service and reduced analytics bottlenecks.",
    tags: [
      "adoption",
      "change-management",
      "governance",
      "enablement",
      "operations",
      "federal",
    ],
  },
  {
    id: "work-visitime",
    title: "VisiTime AR Tour System",
    url: "/work/visitime-ar",
    kind: "work",
    summary:
      "Built AR tour platform on Unity from scratch — fundraising, geocoded content delivery, iPad fleet management, and 2 U.S. utility patents.",
    tags: [
      "startup",
      "product",
      "ar",
      "gis",
      "operations",
      "founder",
      "execution",
      "unity",
      "patents",
      "location-intelligence",
    ],
  },
  {
    id: "work-ratb-gis",
    title: "Recovery oversight with GIS",
    url: "/work/ratb-gis-oversight",
    kind: "work",
    summary:
      "Led GIS integration and Palantir network analysis that identified 90 contract misrepresentations in Recovery Act oversight.",
    tags: [
      "gis",
      "public-sector",
      "risk-analysis",
      "accountability",
      "federal",
      "oversight",
      "palantir",
      "investigations",
    ],
  },
  {
    id: "work-nsf-proposal-classification",
    title: "AI-Powered Research Proposal Classification",
    url: "/work/nsf-proposal-classification",
    kind: "work",
    summary:
      "BERTopic pipeline classifying 7,000+ proposals into 70+ themes with Optuna-optimized hyperparameters.",
    tags: [
      "nlp",
      "topic-modeling",
      "bertopic",
      "unsupervised-learning",
      "optimization",
      "federal",
      "ai-ml",
    ],
  },
  {
    id: "work-nsf-robora",
    title: "RoboRA: Automated document generation",
    url: "/work/nsf-robora",
    kind: "work",
    summary:
      "Modernized Excel-based document generation with data-driven templates and Chrome automation for legacy systems.",
    tags: [
      "automation",
      "document-generation",
      "legacy-modernization",
      "browser-automation",
      "federal",
    ],
  },
  {
    id: "work-nsf-adcc",
    title: "ADCC: Automated compliance checking",
    url: "/work/nsf-adcc",
    kind: "work",
    summary:
      "28 automated compliance checks against live operational data, replacing manual auditing with systematic validation.",
    tags: [
      "compliance",
      "data-quality",
      "automation",
      "governance",
      "federal",
    ],
  },
  {
    id: "work-nsf-telemetry",
    title: "Telemetry dashboards for tool adoption",
    url: "/work/nsf-telemetry",
    kind: "work",
    summary:
      "Anonymous usage telemetry across the full analytics suite, turning adoption data into actionable insights.",
    tags: [
      "adoption",
      "telemetry",
      "analytics",
      "governance",
      "federal",
    ],
  },
  {
    id: "writing-hitl",
    title: "Human-in-the-loop isn't a compromise. It's the point.",
    url: "/writing/human-in-the-loop",
    kind: "writing",
    summary:
      "Why human control, override paths, and auditability are core design goals in high-stakes AI.",
    tags: [
      "human-in-the-loop",
      "governance",
      "responsible-ai",
      "auditability",
      "ai-safety",
    ],
  },
  {
    id: "writing-dashboards-decisions",
    title: "From dashboards to decisions",
    url: "/writing/from-dashboards-to-decisions",
    kind: "writing",
    summary:
      "Analytics should improve decision quality, not just generate charts.",
    tags: [
      "analytics",
      "decision-support",
      "product-thinking",
      "stakeholder-alignment",
    ],
  },
  {
    id: "writing-consulting-ai",
    title: "What consulting taught me about building AI responsibly",
    url: "/writing/consulting-and-responsible-ai",
    kind: "writing",
    summary:
      "How governance, constraints, and adoption shape production AI delivery.",
    tags: [
      "responsible-ai",
      "governance",
      "consulting",
      "delivery",
      "regulated-environments",
    ],
  },
  {
    id: "project-rag-prototype",
    title: "RAG Pipeline Prototype",
    url: "/projects",
    kind: "project",
    summary:
      "Embedding-based retrieval prototype for curated Q&A over local corpora.",
    tags: [
      "rag",
      "embeddings",
      "retrieval",
      "ai-engineering",
      "prototyping",
    ],
  },
  {
    id: "project-clustering-template",
    title: "Embedding + Clustering Notebook Template",
    url: "/projects",
    kind: "project",
    summary:
      "Reusable NLP workflow for vectorization and clustering exploration.",
    tags: [
      "embeddings",
      "clustering",
      "ml-experimentation",
      "python",
      "notebooks",
    ],
  },
  {
    id: "project-governance-checklist",
    title: "Tableau Governance Checklist",
    url: "/projects",
    kind: "project",
    summary:
      "Starter governance kit for BI adoption in regulated settings.",
    tags: [
      "governance",
      "tableau",
      "adoption",
      "accessibility",
      "documentation",
    ],
  },
  {
    id: "resume-summary",
    title: "Resume: Summary and Core Skills",
    url: "/resume#summary",
    kind: "resume",
    summary:
      "12+ years of federal and startup delivery across applied AI, analytics, and governance.",
    tags: [
      "experience",
      "applied-ai",
      "federal",
      "governance",
      "leadership",
    ],
  },
  {
    id: "resume-experience",
    title: "Resume: Experience Highlights",
    url: "/resume#experience",
    kind: "resume",
    summary:
      "IBM federal consulting, NSF/USDA delivery, proposal wins, and startup execution.",
    tags: [
      "delivery",
      "federal",
      "leadership",
      "program-delivery",
      "enterprise",
      "outcomes",
    ],
  },
  {
    id: "about-approach",
    title: "About: How I think about work",
    url: "/about",
    kind: "page",
    summary:
      "Decision-first systems thinking with accountability, usability, and repeatability.",
    tags: [
      "systems-thinking",
      "decision-support",
      "governance",
      "stakeholder-alignment",
    ],
  },
];

export function getPortfolioAssets(): PortfolioAsset[] {
  return portfolioAssets;
}
