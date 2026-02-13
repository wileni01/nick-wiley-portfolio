export interface ModeHealthInput {
  readinessPct: number | null;
  latestScore: number | null;
  latestConfidence: number | null;
}

export interface ModeHealthOutput {
  status: "strong" | "building" | "attention";
  shortLabel: string;
  detail: string;
  className: string;
}

export function evaluateModeHealth(input: ModeHealthInput): ModeHealthOutput {
  const readiness = input.readinessPct ?? 0;
  const score = input.latestScore ?? 0;
  const confidence = input.latestConfidence;

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
