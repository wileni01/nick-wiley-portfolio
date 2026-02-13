import { getInterviewRecommendationBundle } from "./recommendations";
import type { AssetKind, CompanyId } from "./types";

export interface MockInterviewerPrompt {
  question: string;
  whatTheyAreTesting: string;
  answerStrategy: string;
  recommendedArtifact?: {
    title: string;
    url: string;
    kind: AssetKind;
  };
}

export interface MockInterviewerScript {
  heading: string;
  prompts: MockInterviewerPrompt[];
}

export interface MockAnswerFeedback {
  score: number;
  strengths: string[];
  gaps: string[];
  coachingPrompt: string;
}

export interface MockSessionReport {
  averageScore: number;
  answerCount: number;
  feedbackByQuestion: MockAnswerFeedback[];
}

const personaQuestionBanks: Record<
  string,
  Array<{ question: string; test: string }>
> = {
  "kungfu-cto": [
    {
      question:
        "Walk me through one system where model suggestions stayed useful without removing human accountability.",
      test: "Architecture depth + control-plane thinking in high-stakes AI.",
    },
    {
      question:
        "How did you evaluate model quality when there was no single obvious accuracy metric?",
      test: "Practical evaluation strategy under ambiguous, real-world constraints.",
    },
    {
      question:
        "What tradeoff did you make between model complexity and operational reliability?",
      test: "Engineering judgment and production pragmatism.",
    },
    {
      question:
        "If we needed to harden this for enterprise scale, what would you improve first?",
      test: "Forward-looking system design and reliability roadmap thinking.",
    },
  ],
  "kungfu-managing-director": [
    {
      question:
        "How do you translate a technical AI initiative into stakeholder-level value and urgency?",
      test: "Executive communication and value framing.",
    },
    {
      question:
        "Tell me about a moment where adoption, not code, was the biggest delivery risk.",
      test: "Program leadership and change management maturity.",
    },
    {
      question:
        "How do you sequence quick wins versus long-term platform investments?",
      test: "Strategic prioritization in consulting engagements.",
    },
    {
      question:
        "What evidence do you use to prove this approach is repeatable across clients?",
      test: "Scalability and operating model thinking.",
    },
  ],
  "kungfu-cso": [
    {
      question:
        "How do you set strategy when data quality and governance constraints are not fully known upfront?",
      test: "Strategic planning in uncertain environments.",
    },
    {
      question:
        "What does a responsible AI operating model look like in practice, not just policy?",
      test: "Governance execution beyond frameworks.",
    },
    {
      question:
        "Where do you deliberately keep humans in the loop, and why?",
      test: "Decision-rights design and accountability discipline.",
    },
    {
      question:
        "How have you aligned technical teams and non-technical leaders around one decision framework?",
      test: "Cross-functional alignment and facilitation strength.",
    },
  ],
  "kungfu-vp-ai-strategy": [
    {
      question:
        "How do you turn AI strategy into a practical roadmap teams can actually execute?",
      test: "Strategy-to-execution conversion capability.",
    },
    {
      question:
        "How do you decide what should be productized versus handled as analyst workflow?",
      test: "Product judgment and operating model design.",
    },
    {
      question:
        "How do you keep governance from becoming a delivery bottleneck?",
      test: "Balanced risk management and execution speed.",
    },
    {
      question:
        "What does successful first-quarter adoption look like for a new AI workflow?",
      test: "Outcome definition and deployment pragmatism.",
    },
  ],
  "kungfu-engineering-director": [
    {
      question:
        "Show me how you made a model-assisted workflow understandable to engineers and domain experts alike.",
      test: "Technical communication and product usability for ML systems.",
    },
    {
      question:
        "What instrumentation did you add to understand overrides and model drift signals?",
      test: "Observability and ML operations discipline.",
    },
    {
      question:
        "What was your approach to reducing technical risk while still shipping quickly?",
      test: "Risk-managed engineering execution.",
    },
    {
      question:
        "How would you package this into reusable architecture patterns for future teams?",
      test: "Systematization and engineering leverage mindset.",
    },
  ],
  "anthropic-ceo": [
    {
      question:
        "How do you demonstrate that human oversight is a design principle, not an afterthought?",
      test: "Safety-by-design and governance authenticity.",
    },
    {
      question:
        "What does your evaluation and red-team mindset look like in constrained production settings?",
      test: "Safety and evaluation rigor under practical constraints.",
    },
    {
      question:
        "How do you balance capability gains with trust, auditability, and deployment caution?",
      test: "Responsible scaling instincts.",
    },
    {
      question:
        "What kinds of AI work would you explicitly refuse, and why?",
      test: "Ethical boundaries and leadership judgment.",
    },
  ],
};

const fallbackQuestionBank: Array<{ question: string; test: string }> = [
  {
    question: "What problem were you solving, and why did that decision matter?",
    test: "Problem framing and decision-centric product thinking.",
  },
  {
    question:
      "How did you balance model capability, operational realities, and human accountability?",
    test: "Cross-functional AI delivery judgment.",
  },
  {
    question:
      "What outcomes improved after shipping, and how did you validate those improvements?",
    test: "Evidence orientation and delivery ownership.",
  },
  {
    question:
      "What would you redesign if you had one additional quarter to iterate?",
    test: "Learning mindset and architecture foresight.",
  },
];

export function buildMockInterviewerScript(
  companyId: CompanyId,
  personaId: string
): MockInterviewerScript | null {
  const bundle = getInterviewRecommendationBundle(companyId, personaId);
  if (!bundle) return null;

  const questionBank = personaQuestionBanks[personaId] ?? fallbackQuestionBank;
  const prompts = questionBank.slice(0, 4).map((entry, index) => {
    const recommendation = bundle.topRecommendations[index];

    return {
      question: entry.question,
      whatTheyAreTesting: entry.test,
      answerStrategy: recommendation
        ? `Anchor your answer in "${recommendation.asset.title}" and emphasize ${recommendation.matchedTags
            .slice(0, 2)
            .join(" + ") || "delivery quality + governance"}.`
        : "Anchor with a concrete case study and include one implementation detail plus one governance decision.",
      recommendedArtifact: recommendation
        ? {
            title: recommendation.asset.title,
            url: recommendation.asset.url,
            kind: recommendation.asset.kind,
          }
        : undefined,
    };
  });

  return {
    heading: `Mock interviewer script for ${bundle.persona.name} (${bundle.persona.role})`,
    prompts,
  };
}

const metricRegex = /\b(\d+[%+]?|one|two|three|four|five|million|billion)\b/i;
const governanceRegex = /\b(governance|audit|override|risk|safety|accountability|responsible)\b/i;
const actionRegex = /\b(built|designed|led|implemented|delivered|shipped|deployed)\b/i;
const outcomeRegex = /\b(result|impact|outcome|improved|reduced|increased|streamlined)\b/i;

export function evaluateMockAnswer(answer: string): MockAnswerFeedback {
  const normalized = answer.trim().toLowerCase();

  if (!normalized) {
    return {
      score: 0,
      strengths: [],
      gaps: ["No answer captured yet."],
      coachingPrompt:
        "Start with context, then explain your action, and close with a concrete outcome.",
    };
  }

  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (normalized.length >= 220) {
    score += 25;
    strengths.push("Provided enough detail for a structured response.");
  } else {
    gaps.push("Add more detail (target ~4–6 concise sentences).");
  }

  if (actionRegex.test(normalized)) {
    score += 25;
    strengths.push("Includes clear ownership/action language.");
  } else {
    gaps.push("Use stronger ownership verbs (built, led, designed, delivered).");
  }

  if (metricRegex.test(normalized)) {
    score += 20;
    strengths.push("Includes a measurable signal or concrete quantity.");
  } else {
    gaps.push("Add one concrete metric or scale cue.");
  }

  if (outcomeRegex.test(normalized)) {
    score += 15;
    strengths.push("Connects effort to an observable outcome.");
  } else {
    gaps.push("Close with impact: what improved and for whom.");
  }

  if (governanceRegex.test(normalized)) {
    score += 15;
    strengths.push("Shows governance/safety/accountability awareness.");
  } else {
    gaps.push("Include governance/safety guardrails in your framing.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const coachingPrompt =
    boundedScore >= 80
      ? "Strong answer. Tighten by leading with the decision context in one sentence."
      : boundedScore >= 60
        ? "Good baseline. Add one stronger metric and a clearer governance decision."
        : "Rebuild using CAR/STAR: context, your action, governance choice, measurable result.";

  return {
    score: boundedScore,
    strengths,
    gaps,
    coachingPrompt,
  };
}

export function evaluateMockSession(answers: string[]): MockSessionReport {
  const feedbackByQuestion = answers.map((answer) => evaluateMockAnswer(answer));
  const total = feedbackByQuestion.reduce((acc, item) => acc + item.score, 0);
  const averageScore =
    feedbackByQuestion.length > 0
      ? Math.round(total / feedbackByQuestion.length)
      : 0;

  return {
    averageScore,
    answerCount: feedbackByQuestion.length,
    feedbackByQuestion,
  };
}
