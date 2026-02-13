export interface NextAction {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

interface BuildNextActionsInput {
  readinessPct: number;
  readinessCompleted: number;
  readinessTotal: number;
  latestScore: number | null;
  latestConfidence: number | null;
  latestThemes: string[];
  topResourceTitle?: string;
  latestSessionTimestamp?: string | null;
  interviewDate?: string | null;
}

function getDaysUntilInterview(interviewDate: string | null | undefined): number | null {
  if (!interviewDate) return null;
  const date = new Date(interviewDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getSessionRecencyDays(timestamp: string | null | undefined): number | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function buildNextActions(input: BuildNextActionsInput): NextAction[] {
  const actions: NextAction[] = [];
  const daysUntilInterview = getDaysUntilInterview(input.interviewDate);
  const recencyDays = getSessionRecencyDays(input.latestSessionTimestamp);

  if (daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 2) {
    actions.push({
      id: "interview-countdown",
      priority: "high",
      title:
        daysUntilInterview === 0
          ? "Interview day: run final confidence loop"
          : `Interview in ${daysUntilInterview} day${
              daysUntilInterview === 1 ? "" : "s"
            }: run final simulation`,
      detail:
        recencyDays === null || recencyDays > 2
          ? "Complete one full pressure-mode session now, then tighten your opening and closing statements."
          : "Run one focused rehearsal on your weakest answer and refresh your top two artifacts.",
    });
  }

  if (input.readinessPct < 60) {
    actions.push({
      id: "finish-readiness",
      priority: "high",
      title: "Finish readiness fundamentals",
      detail: `Complete at least ${
        Math.max(1, Math.ceil(input.readinessTotal * 0.6) - input.readinessCompleted)
      } more checklist item(s) before the next mock run.`,
    });
  }

  if (input.latestScore === null) {
    actions.push({
      id: "run-first-session",
      priority: "high",
      title: "Run your first mock session",
      detail:
        "Complete one full 5-question run to establish a baseline score and coaching themes.",
    });
  } else if (input.latestScore < 70) {
    actions.push({
      id: "raise-score",
      priority: "high",
      title: "Raise your next mock score above 70",
      detail: input.latestThemes.length
        ? `Focus on: ${input.latestThemes.slice(0, 2).join(" + ")}.`
        : "Focus on adding measurable outcomes and explicit governance choices.",
    });
  } else if (input.latestScore < 85) {
    actions.push({
      id: "polish-score",
      priority: "medium",
      title: "Polish for consistency above 85",
      detail:
        "Tighten openings and close each answer with concrete impact + who it benefited.",
    });
  } else {
    actions.push({
      id: "maintain-performance",
      priority: "low",
      title: "Maintain high performance",
      detail:
        "Keep answers concise and rehearse transitions between technical detail and executive framing.",
    });
  }

  if (input.latestScore !== null && input.latestConfidence !== null) {
    const calibrationDelta = Number(
      (input.latestScore / 20 - input.latestConfidence).toFixed(1)
    );

    if (calibrationDelta <= -1) {
      actions.push({
        id: "confidence-under",
        priority: "medium",
        title: "Confidence is trailing performance",
        detail:
          "Your outputs are stronger than your self-rating. Practice delivery cadence and assertive openings.",
      });
    } else if (calibrationDelta >= 1) {
      actions.push({
        id: "confidence-over",
        priority: "medium",
        title: "Confidence may exceed output quality",
        detail:
          "Add more evidence and metrics to align confidence with answer quality.",
      });
    }
  }

  if (input.topResourceTitle) {
    actions.push({
      id: "open-top-resource",
      priority: "low",
      title: "Rehearse your anchor artifact",
      detail: `Do one focused rehearsal anchored on "${input.topResourceTitle}".`,
    });
  }

  const priorityWeight: Record<NextAction["priority"], number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return actions
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
    .slice(0, 4);
}
