export interface ModeHealthInput {
  readinessPct: number | null;
  latestScore: number | null;
  latestConfidence: number | null;
  latestSessionTimestamp: string | null;
  interviewDate: string | null;
}

export interface ModeHealthOutput {
  status: "strong" | "building" | "attention" | "urgent" | "timeline";
  shortLabel: string;
  detail: string;
  className: string;
}

export function evaluateModeHealth(input: ModeHealthInput): ModeHealthOutput {
  const readiness = input.readinessPct ?? 0;
  const score = input.latestScore ?? 0;
  const confidence = input.latestConfidence;
  const daysUntilInterview = getDaysUntilInterview(input.interviewDate);
  const recencyDays = getSessionRecencyDays(input.latestSessionTimestamp);

  if (daysUntilInterview === null) {
    return {
      status: "timeline",
      shortLabel: "Set date",
      detail:
        input.latestScore === null
          ? "Set your interview date and run a baseline mock session to unlock countdown-aware prep guidance."
          : "Set your interview date to unlock countdown-aware pacing and urgency guidance.",
      className: "border-amber-400/50 text-amber-700 dark:text-amber-300",
    };
  }

  if (daysUntilInterview < 0) {
    return {
      status: "timeline",
      shortLabel: "Date passed",
      detail:
        "Your tracked interview date has passed. Set your next interview target date to keep prep guidance aligned.",
      className: "border-rose-400/60 text-rose-700 dark:text-rose-300",
    };
  }

  if (daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 2) {
    const needsUrgentAttention =
      input.latestScore === null || readiness < 70 || recencyDays === null || recencyDays > 2;
    if (needsUrgentAttention) {
      return {
        status: "urgent",
        shortLabel: "Urgent",
        detail:
          daysUntilInterview === 0
            ? "Interview is today. Run one fast confidence loop and refresh your top two artifacts before go-time."
            : `Interview in ${daysUntilInterview} day${
                daysUntilInterview === 1 ? "" : "s"
              }. Prioritize a full pressure-mode mock and close remaining readiness gaps now.`,
        className: "border-rose-400/60 text-rose-700 dark:text-rose-300",
      };
    }
  }

  if (input.latestScore === null) {
    return {
      status: "attention",
      shortLabel: "Baseline needed",
      detail:
        "No mock session recorded yet. Run one full session to establish score and coaching themes.",
      className: "border-amber-400/50 text-amber-600 dark:text-amber-300",
    };
  }

  if (readiness >= 75 && score >= 82) {
    const confidenceHint =
      confidence !== null
        ? ` Confidence ${confidence}/5.`
        : "";
    return {
      status: "strong",
      shortLabel: "On track",
      detail: `Readiness ${readiness}% and score ${score}/100 indicate strong interview prep momentum.${confidenceHint}`,
      className: "border-emerald-400/50 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (readiness >= 50 && score >= 70) {
    return {
      status: "building",
      shortLabel: "Building",
      detail: `Readiness ${readiness}% and score ${score}/100 show progress. One focused practice cycle should raise consistency.`,
      className: "border-sky-400/50 text-sky-700 dark:text-sky-300",
    };
  }

  return {
    status: "attention",
    shortLabel: "Needs reps",
    detail: `Current readiness ${readiness}% and score ${score}/100 suggest additional practice is needed before interview day.`,
    className: "border-amber-400/50 text-amber-600 dark:text-amber-300",
  };
}

function getDaysUntilInterview(interviewDate: string | null): number | null {
  if (!interviewDate) return null;
  const date = new Date(interviewDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getSessionRecencyDays(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
