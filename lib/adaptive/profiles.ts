import type { CompanyId, CompanyProfile, PersonaProfile } from "./types";

export const companyProfiles: CompanyProfile[] = [
  {
    id: "kungfu-ai",
    name: "KUNGFU.AI",
    website: "https://www.kungfu.ai",
    summary:
      "AI strategy, engineering, and operations consultancy focused on delivering responsible AI in complex organizations.",
    priorityTags: [
      "strategy",
      "ai-engineering",
      "operations",
      "responsible-ai",
      "governance",
      "enterprise-delivery",
      "change-management",
    ],
    theme: {
      light: {
        primary: "#E41159",
        accent: "#4421D2",
        ring: "#C91266",
        background: "#FFF8FB",
        foreground: "#110A29",
        muted: "#FDE7F0",
        border: "#F6B3CB",
      },
      dark: {
        primary: "#F0598D",
        accent: "#8D7BFF",
        ring: "#F0598D",
        background: "#130A22",
        foreground: "#F8ECF5",
        muted: "#28143D",
        border: "#4B285F",
      },
    },
    personas: [
      {
        id: "kungfu-cto",
        name: "Ron Green",
        role: "Co-founder & CTO",
        recommendationGoal:
          "Show production-grade AI architecture, safety controls, and delivery quality under real constraints.",
        focusPresets: [
          "Emphasize architecture tradeoffs and reliability decisions.",
          "Highlight human-in-the-loop controls and auditability.",
          "Focus on scaling path from pilot to production.",
        ],
        focusTags: [
          "ai-engineering",
          "ml-experimentation",
          "human-in-the-loop",
          "auditability",
          "enterprise-delivery",
          "security",
        ],
        assetTypeWeights: { work: 1.4, writing: 1.0, project: 1.2, resume: 1.1 },
      },
      {
        id: "kungfu-managing-director",
        name: "Stephen Straus",
        role: "Co-founder & Managing Director",
        recommendationGoal:
          "Emphasize client outcomes, strategic narrative, and evidence of scalable delivery leadership.",
        focusPresets: [
          "Frame outcomes in business value and stakeholder trust.",
          "Show repeatable delivery patterns across organizations.",
          "Lead with strategic decision impact, then implementation depth.",
        ],
        focusTags: [
          "strategy",
          "leadership",
          "outcomes",
          "enterprise",
          "governance",
          "program-delivery",
        ],
        assetTypeWeights: { work: 1.5, writing: 1.1, resume: 1.3, project: 0.9 },
      },
      {
        id: "kungfu-cso",
        name: "Benjamin Herndon",
        role: "Chief Strategy Officer",
        recommendationGoal:
          "Highlight strategic framing, adoption pathways, and governance-first AI decision support.",
        focusPresets: [
          "Focus on responsible AI operating model and governance.",
          "Emphasize adoption strategy and cross-functional alignment.",
          "Position work as decision-support, not automation theater.",
        ],
        focusTags: [
          "strategy",
          "decision-support",
          "responsible-ai",
          "governance",
          "stakeholder-alignment",
          "adoption",
        ],
        assetTypeWeights: { work: 1.3, writing: 1.3, resume: 1.1, project: 0.9 },
      },
      {
        id: "kungfu-vp-ai-strategy",
        name: "Daniel Bruce",
        role: "VP of AI Strategy",
        recommendationGoal:
          "Show tactical AI execution tied to measurable business decisions and operating models.",
        focusPresets: [
          "Emphasize roadmap execution over model novelty.",
          "Focus on measurable adoption and operational behavior change.",
          "Highlight delivery governance that avoids slowing teams down.",
        ],
        focusTags: [
          "ai-engineering",
          "strategy",
          "operations",
          "decision-support",
          "adoption",
          "delivery",
        ],
        assetTypeWeights: { work: 1.4, writing: 1.1, resume: 1.2, project: 1.0 },
      },
      {
        id: "kungfu-engineering-director",
        name: "Engineering Leadership",
        role: "Director of Engineering",
        recommendationGoal:
          "Focus on technical depth, model operations, and human-in-the-loop quality controls.",
        focusPresets: [
          "Detail observability and override telemetry loops.",
          "Emphasize reusable architecture patterns and standards.",
          "Focus on reducing technical risk while shipping quickly.",
        ],
        focusTags: [
          "ml-experimentation",
          "ai-engineering",
          "clustering",
          "embeddings",
          "governance",
          "delivery",
        ],
        assetTypeWeights: { work: 1.5, project: 1.2, writing: 0.9, resume: 1.0 },
      },
      {
        id: "kungfu-head-of-people",
        name: "Meg Marsh",
        role: "Head of People",
        recommendationGoal:
          "Highlight adoption leadership, cross-functional enablement, and evidence of strengthening team culture through operational and change-management practices.",
        focusPresets: [
          "Emphasize how Nick drives adoption and enablement across diverse teams.",
          "Focus on stakeholder alignment, communication, and organizational change management.",
          "Show consulting-environment collaboration and leadership that reduces operational friction.",
        ],
        focusTags: [
          "change-management",
          "adoption",
          "enablement",
          "stakeholder-alignment",
          "leadership",
          "operations",
          "governance",
          "delivery",
        ],
        assetTypeWeights: { resume: 1.5, work: 1.3, writing: 1.2, project: 0.8 },
      },
    ],
    sources: [
      "https://www.kungfu.ai/our-team",
      "https://www.kungfu.ai/services",
      "https://www.kungfu.ai/our-approach",
      "https://www.kungfu.ai/ethics-charter",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    website: "https://www.anthropic.com",
    summary:
      "AI research and product company focused on safe, steerable, and trustworthy frontier model deployment.",
    priorityTags: [
      "ai-safety",
      "alignment",
      "responsible-ai",
      "governance",
      "evaluation",
      "trust",
      "enterprise",
    ],
    theme: {
      light: {
        primary: "#DA7756",
        accent: "#6A9BCC",
        ring: "#DA7756",
        background: "#FAF9F5",
        foreground: "#141413",
        muted: "#EEECE2",
        border: "#E1DDD1",
      },
      dark: {
        primary: "#E28B6E",
        accent: "#9AB9DA",
        ring: "#E28B6E",
        background: "#1B1916",
        foreground: "#F8F3EA",
        muted: "#2A2620",
        border: "#403A31",
      },
    },
    personas: [
      {
        id: "anthropic-ceo",
        name: "Dario Amodei",
        role: "CEO (scenario)",
        recommendationGoal:
          "Demonstrate safety-minded delivery, robust human oversight, and disciplined deployment in regulated environments.",
        focusPresets: [
          "Emphasize safety-by-design and responsible deployment boundaries.",
          "Focus on calibration between capability and governance controls.",
          "Highlight human oversight as a product requirement, not a fallback.",
        ],
        focusTags: [
          "ai-safety",
          "responsible-ai",
          "human-in-the-loop",
          "governance",
          "evaluation",
          "enterprise-delivery",
          "alignment",
        ],
        assetTypeWeights: { work: 1.4, writing: 1.3, resume: 1.2, project: 0.9 },
      },
    ],
    sources: [
      "https://www.anthropic.com/constitution",
      "https://www.anthropic.com/news/uk-ai-safety-summit",
      "https://privacy.anthropic.com/en/",
    ],
  },
  {
    id: "bcg",
    name: "Boston Consulting Group",
    website: "https://www.bcg.com",
    summary:
      "Global management consulting firm advising on strategy, technology transformation, GenAI adoption, and data-driven operating models.",
    priorityTags: [
      "strategy",
      "enterprise-delivery",
      "governance",
      "ai-engineering",
      "data-platform",
      "operations",
      "leadership",
      "consulting",
    ],
    theme: {
      light: {
        primary: "#147B58",
        accent: "#0D6E4F",
        ring: "#147B58",
        background: "#F8FAF9",
        foreground: "#0F1F18",
        muted: "#EEF3F0",
        border: "#D1DDD6",
      },
      dark: {
        primary: "#2EA87A",
        accent: "#5CC4A0",
        ring: "#2EA87A",
        background: "#0A1210",
        foreground: "#E8F2EC",
        muted: "#16261F",
        border: "#1E3A2E",
      },
    },
    personas: [
      {
        id: "bcg-harsh",
        name: "Harsh Vardhan Singh",
        role: "Partner — GenAI, Data & Agents",
        recommendationGoal:
          "Demonstrate production AI delivery, data platform architecture, and strategic transformation outcomes that translate to enterprise-scale GenAI impact.",
        focusPresets: [
          "Emphasize AI/ML delivery at scale with measurable business outcomes.",
          "Highlight data platform architecture and analytics that drive strategic decisions.",
          "Focus on governance, adoption, and change management in complex organizations.",
        ],
        focusTags: [
          "ai-engineering",
          "ai-ml",
          "strategy",
          "enterprise-delivery",
          "data-platform",
          "analytics",
          "adoption",
          "decision-support",
          "governance",
          "automation",
          "leadership",
          "operations",
        ],
        assetTypeWeights: { work: 1.5, writing: 1.2, resume: 1.3, project: 0.9 },
      },
    ],
    sources: [
      "https://www.bcg.com/capabilities/artificial-intelligence",
      "https://www.bcg.com/capabilities/digital-technology-data",
    ],
  },
];

export function getCompanyProfiles(): CompanyProfile[] {
  return companyProfiles;
}

export function getCompanyProfileById(
  companyId: CompanyId
): CompanyProfile | undefined {
  return companyProfiles.find((company) => company.id === companyId);
}

export function getDefaultPersonaForCompany(
  companyId: CompanyId
): PersonaProfile | undefined {
  return getCompanyProfileById(companyId)?.personas[0];
}

export function getPersonaById(
  companyId: CompanyId,
  personaId: string
): PersonaProfile | undefined {
  return getCompanyProfileById(companyId)?.personas.find(
    (persona) => persona.id === personaId
  );
}
