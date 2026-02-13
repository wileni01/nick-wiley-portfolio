export function parseInterviewDate(raw: string | null): string | null {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return value.slice(0, 10);
}

export function getInterviewDateSummary(interviewDate: string | null): {
  daysUntil: number | null;
  label: string;
} {
  if (!interviewDate) {
    return { daysUntil: null, label: "No interview date set." };
  }

  const date = new Date(interviewDate);
  if (Number.isNaN(date.getTime())) {
    return { daysUntil: null, label: "Invalid interview date." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

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
