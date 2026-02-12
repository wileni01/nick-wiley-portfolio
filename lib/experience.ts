export interface ExperienceEntry {
  id: string;
  type: "work" | "education" | "certification";
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string | "Present";
  description: string;
  highlights: string[];
  technologies?: string[];
}

export const experience: ExperienceEntry[] = [
  // ── Work Experience (demo data -- replace with real) ──
  {
    id: "lli-lead",
    type: "work",
    title: "Lead Software Engineer & AI Solutions Architect",
    organization: "Lincoln Leadership Institute at Gettysburg",
    location: "Gettysburg, PA",
    startDate: "2023-01",
    endDate: "Present",
    description:
      "Lead full-stack development and AI integration for the Lincoln Leadership Institute's digital transformation initiatives.",
    highlights: [
      "Rebuilt gettysburgleadership.com from legacy platform to Next.js 14 with Stripe, HubSpot, and PostHog integrations",
      "Developed AI-powered email data mining pipeline recovering 5,000+ contacts from legacy Outlook archives",
      "Built HubSpot contact deduplication system with GPT-4 lead scoring, eliminating 2,000+ duplicate records",
      "Implemented end-to-end payment processing with Stripe checkout and automated CRM sync",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "OpenAI",
      "Azure AI",
      "Stripe",
      "HubSpot",
    ],
  },
  {
    id: "ai-engineer",
    type: "work",
    title: "AI/ML Engineer",
    organization: "[FILL IN - Previous Employer]",
    location: "[FILL IN]",
    startDate: "2021-06",
    endDate: "2022-12",
    description:
      "[FILL IN] Description of role and responsibilities.",
    highlights: [
      "[FILL IN] Key achievement 1",
      "[FILL IN] Key achievement 2",
      "[FILL IN] Key achievement 3",
    ],
    technologies: ["Python", "TensorFlow", "AWS", "Docker"],
  },
  {
    id: "gov-contractor",
    type: "work",
    title: "Software Engineer - Federal Contracts",
    organization: "IBM (Federal Division)",
    location: "Washington, D.C.",
    startDate: "2020-01",
    endDate: "2021-05",
    description:
      "[FILL IN] Description of federal contract work across USPS, Census, USDA, and NSF projects.",
    highlights: [
      "[FILL IN] USPS project contribution",
      "[FILL IN] Census Bureau project contribution",
      "[FILL IN] USDA project contributions",
      "[FILL IN] NSF research computing contributions",
    ],
    technologies: [
      "Java",
      "Python",
      "AWS GovCloud",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
    ],
  },

  // ── Education ────────────────────────────────────────
  {
    id: "education-ms",
    type: "education",
    title: "Master of Science in Computer Science",
    organization: "[FILL IN - University]",
    location: "[FILL IN]",
    startDate: "2019-08",
    endDate: "2021-05",
    description:
      "[FILL IN] Focus areas, thesis topic, GPA if desired.",
    highlights: [
      "[FILL IN] Research focus or thesis",
      "[FILL IN] Notable coursework or achievements",
    ],
  },
  {
    id: "education-bs",
    type: "education",
    title: "Bachelor of Science in Computer Science",
    organization: "[FILL IN - University]",
    location: "[FILL IN]",
    startDate: "2015-08",
    endDate: "2019-05",
    description:
      "[FILL IN] Focus areas, minor, GPA if desired.",
    highlights: [
      "[FILL IN] Notable coursework or achievements",
      "[FILL IN] Extracurricular activities",
    ],
  },

  // ── Certifications ───────────────────────────────────
  {
    id: "cert-aws",
    type: "certification",
    title: "AWS Solutions Architect",
    organization: "Amazon Web Services",
    location: "",
    startDate: "2022-01",
    endDate: "2025-01",
    description: "[FILL IN or remove if not applicable]",
    highlights: [],
  },
  {
    id: "cert-security",
    type: "certification",
    title: "CompTIA Security+",
    organization: "CompTIA",
    location: "",
    startDate: "2021-06",
    endDate: "2024-06",
    description: "[FILL IN or remove if not applicable]",
    highlights: [],
  },
];

export function getWorkExperience(): ExperienceEntry[] {
  return experience.filter((e) => e.type === "work");
}

export function getEducation(): ExperienceEntry[] {
  return experience.filter((e) => e.type === "education");
}

export function getCertifications(): ExperienceEntry[] {
  return experience.filter((e) => e.type === "certification");
}
