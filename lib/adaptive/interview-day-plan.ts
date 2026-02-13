import { getInterviewRecommendationBundle } from "./recommendations";
import type { CompanyId } from "./types";

export interface InterviewDayPlanBlock {
  id: string;
  phase: string;
  objective: string;
  action: string;
}

export interface InterviewDayPlan {
  title: string;
  blocks: InterviewDayPlanBlock[];
  fallbackPrompt: string;
}

export function buildInterviewDayPlan(
  companyId: CompanyId,
  personaId: string
): InterviewDayPlan | null {
  const bundle = getInterviewRecommendationBundle(companyId, personaId);
  if (!bundle) return null;

  const topResource = bundle.topRecommendations[0]?.asset;
  const secondResource = bundle.topRecommendations[1]?.asset;

  return {
    title: `Interview day plan for ${bundle.persona.name} (${bundle.persona.role})`,
    blocks: [
      {
        id: "pre-45",
        phase: "T-45 min",
        objective: "Prime your opening narrative",
        action:
          "Rehearse your 60-second opener twice: role fit, one proof point, one value statement.",
      },
      {
        id: "pre-30",
        phase: "T-30 min",
        objective: "Re-open top proof artifacts",
        action: topResource
          ? `Review "${topResource.title}" and pull one metric + one governance detail you can cite quickly.`
          : "Review one case study and one writing post with outcome + governance details.",
      },
      {
        id: "pre-15",
        phase: "T-15 min",
        objective: "Align to interviewer lens",
        action: bundle.persona.recommendationGoal,
      },
      {
        id: "during",
        phase: "During interview",
        objective: "Balance executive and builder framing",
        action: secondResource
          ? `Anchor deep technical answers to "${secondResource.title}", then close each answer with stakeholder impact.`
          : "For each answer: context, action, outcome, and one risk/governance control.",
      },
      {
        id: "close",
        phase: "Final 5 minutes",
        objective: "Close with high-signal questions",
        action:
          "Ask about success metrics for the role, cross-functional operating model, and how responsible AI decisions are made.",
      },
    ],
    fallbackPrompt:
      "If you lose your thread, reset with: decision context → what you built → measurable impact → governance safeguard.",
  };
}
