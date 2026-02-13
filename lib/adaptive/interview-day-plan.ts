import { getInterviewRecommendationBundle } from "./recommendations";
import { getInterviewDateSummary } from "./interview-date";
import type { CompanyId } from "./types";

export interface InterviewDayPlanBlock {
  id: string;
  phase: string;
  objective: string;
  action: string;
}

export interface InterviewDayPlan {
  title: string;
  timelineLabel: string;
  blocks: InterviewDayPlanBlock[];
  fallbackPrompt: string;
}

interface BuildInterviewDayPlanInput {
  interviewDate?: string | null;
}

export function buildInterviewDayPlan(
  companyId: CompanyId,
  personaId: string,
  input: BuildInterviewDayPlanInput = {}
): InterviewDayPlan | null {
  const bundle = getInterviewRecommendationBundle(companyId, personaId);
  if (!bundle) return null;

  const topResource = bundle.topRecommendations[0]?.asset;
  const secondResource = bundle.topRecommendations[1]?.asset;
  const interviewTimeline = getInterviewDateSummary(input.interviewDate ?? null);
  const prepWindowBlocks = buildPrepWindowBlocks({
    daysUntilInterview: interviewTimeline.daysUntil,
    topResourceTitle: topResource?.title,
  });

  return {
    title: `Interview day plan for ${bundle.persona.name} (${bundle.persona.role})`,
    timelineLabel: interviewTimeline.label,
    blocks: [
      ...prepWindowBlocks,
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

function buildPrepWindowBlocks(input: {
  daysUntilInterview: number | null;
  topResourceTitle?: string;
}): InterviewDayPlanBlock[] {
  if (input.daysUntilInterview === null || input.daysUntilInterview < 0) {
    return [];
  }

  const anchorResourceAction = input.topResourceTitle
    ? `Re-open "${input.topResourceTitle}" and reframe one answer with metric + governance detail.`
    : "Re-open one top case study and reframe one answer with metric + governance detail.";

  if (input.daysUntilInterview === 0) {
    return [
      {
        id: "prep-now",
        phase: "Now",
        objective: "Final confidence calibration",
        action:
          "Run one 3-minute confidence loop: opener, strongest proof, closing question. Keep tempo calm and concise.",
      },
    ];
  }

  if (input.daysUntilInterview <= 2) {
    return [
      {
        id: "prep-urgent-mock",
        phase: `T-${input.daysUntilInterview} day${
          input.daysUntilInterview === 1 ? "" : "s"
        }`,
        objective: "Complete final pressure simulation",
        action:
          "Run one full pressure-mode mock and tighten your weakest answer before ending the session.",
      },
      {
        id: "prep-urgent-anchor",
        phase: "Final review",
        objective: "Lock anchor evidence",
        action: anchorResourceAction,
      },
    ];
  }

  if (input.daysUntilInterview <= 7) {
    return [
      {
        id: "prep-weekly-rhythm",
        phase: "This week",
        objective: "Maintain rehearsal rhythm",
        action:
          "Schedule two focused rehearsals: one for structure (context → action → outcome), one for pacing and confidence.",
      },
    ];
  }

  return [
    {
      id: "prep-early-baseline",
      phase: "Prep window",
      objective: "Establish baseline momentum",
      action:
        "Run one baseline mock session and complete the highest-impact readiness checklist items first.",
    },
  ];
}
