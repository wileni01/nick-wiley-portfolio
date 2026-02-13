import type { CompanyId } from "./types";

export interface ReadinessChecklistItem {
  id: string;
  label: string;
  helper: string;
}

const commonChecklist: ReadinessChecklistItem[] = [
  {
    id: "opening-story",
    label: "Refine your 60-second opening story",
    helper:
      "Connect your background to this role and include one concrete example.",
  },
  {
    id: "proof-artifacts",
    label: "Bookmark 2-3 proof artifacts",
    helper:
      "Pick case studies/writing links you can open quickly during the interview.",
  },
  {
    id: "metrics-ready",
    label: "Prepare measurable impact cues",
    helper:
      "Have at least one metric/scale statement ready for each core example.",
  },
  {
    id: "governance-angle",
    label: "Practice governance framing",
    helper:
      "Be ready to explain auditability, override design, and safety constraints.",
  },
];

const personaSpecificChecklist: Record<string, ReadinessChecklistItem[]> = {
  "kungfu-cto": [
    {
      id: "cto-architecture-tradeoff",
      label: "Prepare one architecture tradeoff story",
      helper:
        "Explain why you chose reliability/governance over higher model complexity.",
    },
    {
      id: "cto-observability",
      label: "Outline ML observability approach",
      helper:
        "Show how override patterns and quality signals informed iteration.",
    },
  ],
  "kungfu-managing-director": [
    {
      id: "md-value-narrative",
      label: "Tighten executive value narrative",
      helper:
        "Frame outcomes in terms of stakeholder trust, adoption, and delivery risk reduction.",
    },
    {
      id: "md-scalability",
      label: "Prepare repeatability pitch",
      helper: "Show how your approach generalizes across accounts and teams.",
    },
  ],
  "kungfu-cso": [
    {
      id: "cso-operating-model",
      label: "Draft responsible AI operating model answer",
      helper:
        "Clarify decision rights across strategy, delivery, and governance teams.",
    },
    {
      id: "cso-prioritization",
      label: "Prepare uncertainty prioritization example",
      helper:
        "Show how you set roadmap priorities with incomplete data quality context.",
    },
  ],
  "kungfu-vp-ai-strategy": [
    {
      id: "vp-roadmap",
      label: "Bring a 90-day execution roadmap",
      helper:
        "Outline discovery, pilot, and adoption milestones with measurable checkpoints.",
    },
    {
      id: "vp-adoption-signals",
      label: "Define adoption success signals",
      helper:
        "State what behavior changes indicate rollout is actually working.",
    },
  ],
  "kungfu-engineering-director": [
    {
      id: "eng-reusability",
      label: "Prepare reusable architecture patterns",
      helper:
        "Describe which parts became templates for future model-assisted workflows.",
    },
    {
      id: "eng-risk-controls",
      label: "List practical risk controls",
      helper:
        "Cover access boundaries, validation layers, and production guardrails.",
    },
  ],
  "anthropic-ceo": [
    {
      id: "ceo-safety-posture",
      label: "Strengthen safety-first positioning",
      helper:
        "Show how you think about capability, misuse risk, and deployment caution together.",
    },
    {
      id: "ceo-ethical-boundaries",
      label: "Prepare ethical refusal examples",
      helper:
        "Be explicit about classes of AI work you would decline and why.",
    },
  ],
};

export function getReadinessChecklist(
  _companyId: CompanyId,
  personaId: string
): ReadinessChecklistItem[] {
  return [...commonChecklist, ...(personaSpecificChecklist[personaId] ?? [])];
}
