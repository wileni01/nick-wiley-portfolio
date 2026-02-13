export interface PrepCadenceInput {
  daysUntilInterview: number | null;
  readinessPct: number;
  latestScore: number | null;
  latestSessionTimestamp: string | null;
}

export interface PrepCadenceOutput {
  status: "none" | "on-track" | "watch" | "urgent";
  label: string;
  detail: string;
  sessionsNeeded: number;
  recencyDays: number | null;
}

export function evaluatePrepCadence(input: PrepCadenceInput): PrepCadenceOutput {
  const recencyDays = getSessionRecencyDays(input.latestSessionTimestamp);

  if (input.daysUntilInterview === null) {
    return {
      status: "none",
      label: "Date not set",
      detail:
        "Set an interview date to generate a pacing plan for remaining prep reps.",
      sessionsNeeded: estimateSessionsNeeded(input.readinessPct, input.latestScore),
      recencyDays,
    };
  }

  if (input.daysUntilInterview < 0) {
    return {
      status: "none",
      label: "Date passed",
      detail:
        "Interview date is in the past. Update the date to refresh cadence guidance.",
      sessionsNeeded: 0,
      recencyDays,
    };
  }

  const sessionsNeeded = estimateSessionsNeeded(input.readinessPct, input.latestScore);
  const remainingDays = input.daysUntilInterview;

  if (sessionsNeeded === 0) {
    return {
      status: "on-track",
      label: "On track",
      detail:
        "Strong prep baseline. Run one light rehearsal to stay warm and preserve answer sharpness.",
      sessionsNeeded,
      recencyDays,
    };
  }

  const hasStalePractice = recencyDays === null || recencyDays > 3;
  if (remainingDays <= 1 && (sessionsNeeded > 0 || hasStalePractice)) {
    return {
      status: "urgent",
      label: "Urgent pacing",
      detail:
        "Interview is imminent. Run a full pressure simulation now and close your highest-impact readiness gaps.",
      sessionsNeeded,
      recencyDays,
    };
  }

  const availableSessionSlots = Math.max(1, remainingDays + 1);
  if (sessionsNeeded > availableSessionSlots || (remainingDays <= 3 && sessionsNeeded > 1)) {
    return {
      status: "watch",
      label: "Compressed window",
      detail: `You likely need ${sessionsNeeded} focused rehearsal session${
        sessionsNeeded === 1 ? "" : "s"
      } in the remaining ${remainingDays + 1} day${remainingDays === 0 ? "" : "s"}.`,
      sessionsNeeded,
      recencyDays,
    };
  }

  return {
    status: "on-track",
    label: "On track",
    detail: `Plan ${sessionsNeeded} focused rehearsal session${
      sessionsNeeded === 1 ? "" : "s"
    } before interview day to maintain consistency.`,
    sessionsNeeded,
    recencyDays,
  };
}

function estimateSessionsNeeded(readinessPct: number, latestScore: number | null): number {
  let needed = 0;

  if (latestScore === null) {
    needed += 2;
  } else if (latestScore < 70) {
    needed += 2;
  } else if (latestScore < 85) {
    needed += 1;
  }

  if (readinessPct < 70) {
    needed += 1;
  }

  return Math.min(4, Math.max(0, needed));
}

function getSessionRecencyDays(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
