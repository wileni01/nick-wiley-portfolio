import type { PortfolioAsset } from "./types";

const portfolioAssets: PortfolioAsset[] = [
  {
    id: "work-panel-wizard",
    title: "Panel Wizard: Human-in-the-loop ML for proposal panel formation",
    url: "/work/panel-wizard",
    kind: "work",
    summary:
      "SciBERT embeddings and clustering suggestions with human override for high-stakes panel decisions.",
    tags: [
      "human-in-the-loop",
      "governance",
      "nlp",
      "clustering",
      "decision-support",
      "federal",
      "responsible-ai",
      "auditability",
    ],
  },
  {
    id: "work-usda-organic-analytics",
    title: "USDA Organic Analytics Platform",
    url: "/work/usda-organic-analytics",
    kind: "work",
    summary:
      "Warehouse and Tableau reporting suite supporting 50,000+ operations with accessibility and governance baked in.",
    tags: [
      "data-platform",
      "tableau",
      "etl",
      "governance",
      "accessibility",
      "federal",
      "operations",
      "enterprise-delivery",
    ],
  },
  {
    id: "work-researcher-lineage",
    title: "Researcher Lineage Dashboard",
    url: "/work/researcher-lineage-dashboard",
    kind: "work",
    summary:
      "Funding lineage dashboard for portfolio review and collaboration insight.",
    tags: [
      "dashboards",
      "analytics",
      "portfolio-review",
      "stakeholder-alignment",
      "bigquery",
      "federal",
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
      "Founder-led AR and geospatial product delivery from fundraising to operations.",
    tags: [
      "startup",
      "product",
      "ar",
      "gis",
      "operations",
      "founder",
      "execution",
    ],
  },
  {
    id: "work-ratb-gis",
    title: "Recovery oversight with GIS",
    url: "/work/ratb-gis-oversight",
    kind: "work",
    summary:
      "GIS and Palantir-assisted oversight workflows for risk targeting and investigation support.",
    tags: [
      "gis",
      "public-sector",
      "risk-analysis",
      "accountability",
      "federal",
      "oversight",
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
