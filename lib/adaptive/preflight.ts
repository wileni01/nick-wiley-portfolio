import { getDaysUntilInterview } from "./interview-date";

export interface PreflightInput {
  readinessPct: number;
  latestScore: number | null;
  latestSessionTimestamp: string | null;
  launchpadPct: number;
  hasNotes: boolean;
  hasFocusNote: boolean;
  interviewDate?: string | null;
}

export interface PreflightResult {
  score: number;
  label: "Ready to rehearse" | "Almost ready" | "Needs preparation";
  detail: string;
  recencyDays: number | null;
  daysUntilInterview: number | null;
  timelineStatus: "missing" | "upcoming" | "passed";
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
  const daysUntilInterview = getDaysUntilInterview(input.interviewDate ?? null);
  const timelineStatus =
    daysUntilInterview === null
      ? "missing"
      : daysUntilInterview < 0
        ? "passed"
        : "upcoming";

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

  const urgencyPenalty = getInterviewUrgencyPenalty({
    daysUntilInterview,
    recencyDays: recency,
    readinessPct: input.readinessPct,
  });

  const adjustedTotal = Math.max(0, total - stalenessPenalty - urgencyPenalty);

  if (adjustedTotal >= 80) {
    return {
      score: adjustedTotal,
      label: "Ready to rehearse",
      detail:
        timelineStatus === "passed"
          ? "Strong prep baseline, but the tracked interview date has passed. Set your next target date to keep timeline guidance aligned."
          : timelineStatus === "missing"
            ? "Strong prep baseline. Set an interview date to activate countdown-aware pacing and urgency guidance."
          : urgencyPenalty > 0
          ? "Strong baseline, but interview-day timing is tight. Run one fresh simulation today."
          : stalenessPenalty > 0
          ? "Strong prep baseline, but session recency is slipping. Run a fresh simulation before interview day."
          : "Strong signal across readiness, mock performance, and launchpad execution.",
      recencyDays: recency,
      daysUntilInterview,
      timelineStatus,
    };
  }

  if (adjustedTotal >= 60) {
    return {
      score: adjustedTotal,
      label: "Almost ready",
      detail:
        timelineStatus === "passed"
          ? "Good baseline, but your tracked interview date has passed. Update to your next date and run a fresh mock cycle."
          : timelineStatus === "missing"
            ? "Good baseline. Set an interview date to prioritize pacing and final-week actions."
          : urgencyPenalty > 0
          ? "Good baseline, but interview timeline is compressed. Prioritize one full mock and close critical checklist gaps now."
          : stalenessPenalty > 0
          ? "Good baseline, but stale practice is lowering readiness. Run a fresh mock round."
          : "Good baseline. Complete remaining prep actions before final interview simulation.",
      recencyDays: recency,
      daysUntilInterview,
      timelineStatus,
    };
  }

  return {
    score: adjustedTotal,
    label: "Needs preparation",
    detail:
      timelineStatus === "passed"
        ? "Interview date has passed. Set your next interview target, then complete checklist gaps and run a full mock session."
        : timelineStatus === "missing"
          ? "Set an interview date, then focus on checklist completion, one full mock run, and opening key resources."
        : daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 2
        ? "Interview is near. Prioritize one full mock run today, close top checklist gaps, and refresh key resources."
        : "Focus on checklist completion, one full mock run, and opening key resources.",
    recencyDays: recency,
    daysUntilInterview,
    timelineStatus,
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

function getInterviewUrgencyPenalty(input: {
  daysUntilInterview: number | null;
  recencyDays: number | null;
  readinessPct: number;
}): number {
  if (input.daysUntilInterview === null || input.daysUntilInterview < 0) return 0;

  let penalty = 0;

  if (input.daysUntilInterview <= 1) {
    penalty += input.recencyDays === null ? 10 : input.recencyDays > 1 ? 8 : 0;
  } else if (input.daysUntilInterview <= 3) {
    penalty += input.recencyDays === null ? 6 : input.recencyDays > 3 ? 5 : 0;
  }

  if (input.daysUntilInterview <= 2 && input.readinessPct < 70) {
    penalty += 4;
  }

  return penalty;
}
