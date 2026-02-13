export interface PracticeReminder {
  id: string;
  title: string;
  detail: string;
  dueBy: string;
  priority: "high" | "medium" | "low";
}

interface BuildPracticeRemindersInput {
  now: Date;
  latestScore: number | null;
  readinessPct: number;
  launchpadPct: number;
}

export function buildPracticeReminders(
  input: BuildPracticeRemindersInput
): PracticeReminder[] {
  const reminders: PracticeReminder[] = [];
  const todayIso = input.now.toISOString().slice(0, 10);
  const tomorrow = new Date(input.now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

  if (input.latestScore === null) {
    reminders.push({
      id: "first-session",
      title: "Run baseline mock session",
      detail:
        "Complete one full 5-question session to establish score, themes, and confidence baseline.",
      dueBy: todayIso,
      priority: "high",
    });
  } else if (input.latestScore < 70) {
    reminders.push({
      id: "raise-score",
      title: "Run improvement cycle",
      detail:
        "Run one mock round, then replay your lowest-scoring answer with stronger metrics + impact close.",
      dueBy: tomorrowIso,
      priority: "high",
    });
  } else {
    reminders.push({
      id: "maintain",
      title: "Keep rhythm with one rehearsal",
      detail:
        "Run one focused rehearsal and review your top 2 recommendation artifacts.",
      dueBy: tomorrowIso,
      priority: "medium",
    });
  }

  if (input.readinessPct < 70) {
    reminders.push({
      id: "readiness-gap",
      title: "Close checklist gaps",
      detail:
        "Complete at least two outstanding readiness checklist items before interview day.",
      dueBy: tomorrowIso,
      priority: "medium",
    });
  }

  if (input.launchpadPct < 80) {
    reminders.push({
      id: "launchpad-open",
      title: "Open all launchpad resources",
      detail:
        "Review each recommended artifact and mark it opened for faster recall during interviews.",
      dueBy: todayIso,
      priority: "low",
    });
  }

  return reminders.slice(0, 3);
}
