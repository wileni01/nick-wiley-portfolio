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
  interviewDate?: string | null;
}

function startOfDay(date: Date): Date {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function toIsoDate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const clone = startOfDay(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function parseInterviewDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfDay(parsed);
}

function getDaysUntilInterview(now: Date, interviewDate: Date | null): number | null {
  if (!interviewDate) return null;
  const today = startOfDay(now);
  const diffMs = interviewDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function capDueDate(baseDate: Date, interviewDate: Date | null, now: Date): Date {
  if (!interviewDate) return baseDate;
  const today = startOfDay(now);
  if (interviewDate.getTime() < today.getTime()) return today;
  return baseDate.getTime() > interviewDate.getTime() ? interviewDate : baseDate;
}

export function buildPracticeReminders(
  input: BuildPracticeRemindersInput
): PracticeReminder[] {
  const reminders: PracticeReminder[] = [];
  const interviewDate = parseInterviewDate(input.interviewDate);
  const daysUntilInterview = getDaysUntilInterview(input.now, interviewDate);
  const todayIso = toIsoDate(capDueDate(startOfDay(input.now), interviewDate, input.now));
  const tomorrowIso = toIsoDate(
    capDueDate(addDays(input.now, 1), interviewDate, input.now)
  );

  if (daysUntilInterview === null) {
    reminders.push({
      id: "set-interview-date",
      title: "Set your interview date",
      detail:
        "Add your interview date so reminders, pacing guidance, and countdown status can prioritize the right prep window.",
      dueBy: todayIso,
      priority: "medium",
    });
  }

  if (daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 2) {
    reminders.push({
      id: "interview-soon",
      title: "Run final rehearsal loop",
      detail:
        "Interview is imminent. Do one full pressure-mode mock, then tighten one closing answer with clear impact and governance framing.",
      dueBy: todayIso,
      priority: "high",
    });
  }

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

  const priorityOrder: Record<PracticeReminder["priority"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return reminders
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 3);
}
