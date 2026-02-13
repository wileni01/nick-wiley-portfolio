export function parseInterviewDate(raw: string | null): string | null {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const normalized = value.slice(0, 10);
  const parts = parseIsoDateParts(normalized);
  if (!parts) return null;
  return normalized;
}

export function toInterviewLocalDate(interviewDate: string | null): Date | null {
  const normalized = parseInterviewDate(interviewDate);
  if (!normalized) return null;
  const parts = parseIsoDateParts(normalized);
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDaysUntilInterview(
  interviewDate: string | null,
  baseDate: Date = new Date()
): number | null {
  const targetDate = toInterviewLocalDate(interviewDate);
  if (!targetDate) return null;
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const diffMs = targetDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getInterviewDateSummary(interviewDate: string | null): {
  daysUntil: number | null;
  label: string;
} {
  if (!interviewDate) {
    return { daysUntil: null, label: "No interview date set." };
  }
  const normalized = parseInterviewDate(interviewDate);
  if (!normalized) return { daysUntil: null, label: "Invalid interview date." };
  const daysUntil = getDaysUntilInterview(normalized);
  if (daysUntil === null) return { daysUntil: null, label: "Invalid interview date." };

  if (daysUntil > 0) {
    return {
      daysUntil,
      label: `${daysUntil} day${daysUntil === 1 ? "" : "s"} until interview`,
    };
  }

  if (daysUntil === 0) {
    return { daysUntil, label: "Interview is today." };
  }

  const absDays = Math.abs(daysUntil);
  return {
    daysUntil,
    label: `Interview date passed ${absDays} day${absDays === 1 ? "" : "s"} ago`,
  };
}

function parseIsoDateParts(
  value: string
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}
