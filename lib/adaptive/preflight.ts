export interface PreflightInput {
  readinessPct: number;
  latestScore: number | null;
  launchpadPct: number;
  hasNotes: boolean;
  hasFocusNote: boolean;
}

export interface PreflightResult {
  score: number;
  label: "Ready to rehearse" | "Almost ready" | "Needs preparation";
  detail: string;
}

export function calculatePreflightScore(input: PreflightInput): PreflightResult {
  const readinessPoints = Math.round((Math.max(0, Math.min(100, input.readinessPct)) / 100) * 40);
  const scorePoints =
    input.latestScore !== null
      ? Math.round((Math.max(0, Math.min(100, input.latestScore)) / 100) * 40)
      : 0;
  const launchpadPoints = Math.round(
    (Math.max(0, Math.min(100, input.launchpadPct)) / 100) * 10
  );
  const notesPoints = input.hasNotes ? 5 : 0;
  const focusPoints = input.hasFocusNote ? 5 : 0;

  const total = readinessPoints + scorePoints + launchpadPoints + notesPoints + focusPoints;

  if (total >= 80) {
    return {
      score: total,
      label: "Ready to rehearse",
      detail:
        "Strong signal across readiness, mock performance, and launchpad execution.",
    };
  }

  if (total >= 60) {
    return {
      score: total,
      label: "Almost ready",
      detail:
        "Good baseline. Complete remaining prep actions before final interview simulation.",
    };
  }

  return {
    score: total,
    label: "Needs preparation",
    detail:
      "Focus on checklist completion, one full mock run, and opening key resources.",
  };
}
