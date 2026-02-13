export interface PreflightInput {
  readinessPct: number;
  latestScore: number | null;
  latestSessionTimestamp: string | null;
  launchpadPct: number;
  hasNotes: boolean;
  hasFocusNote: boolean;
}

export interface PreflightResult {
  score: number;
  label: "Ready to rehearse" | "Almost ready" | "Needs preparation";
  detail: string;
  recencyDays: number | null;
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

  const total =
    readinessPoints + scorePoints + launchpadPoints + notesPoints + focusPoints;
  const recency = getSessionRecencyDays(input.latestSessionTimestamp);

  const stalenessPenalty =
    recency === null
      ? 0
      : recency > 14
        ? 15
        : recency > 7
          ? 10
          : recency > 3
            ? 5
            : 0;

  const adjustedTotal = Math.max(0, total - stalenessPenalty);

  if (adjustedTotal >= 80) {
    return {
      score: adjustedTotal,
      label: "Ready to rehearse",
      detail:
        stalenessPenalty > 0
          ? "Strong prep baseline, but session recency is slipping. Run a fresh simulation before interview day."
          : "Strong signal across readiness, mock performance, and launchpad execution.",
      recencyDays: recency,
    };
  }

  if (adjustedTotal >= 60) {
    return {
      score: adjustedTotal,
      label: "Almost ready",
      detail:
        stalenessPenalty > 0
          ? "Good baseline, but stale practice is lowering readiness. Run a fresh mock round."
          : "Good baseline. Complete remaining prep actions before final interview simulation.",
      recencyDays: recency,
    };
  }

  return {
    score: adjustedTotal,
    label: "Needs preparation",
    detail:
      "Focus on checklist completion, one full mock run, and opening key resources.",
    recencyDays: recency,
  };
}

function getSessionRecencyDays(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
