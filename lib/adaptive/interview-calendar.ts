interface BuildInterviewPrepCalendarInput {
  companyName: string;
  personaName: string;
  interviewDate: string;
}

function normalizeTarget(input: {
  companyName: string;
  personaName: string;
}) {
  const normalizedCompany = input.companyName.trim() || "Target Company";
  const normalizedPersona = input.personaName.trim() || "Interviewer";
  return { normalizedCompany, normalizedPersona };
}

function toIcsDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function toIcsTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildEventBlock(input: {
  uid: string;
  date: Date;
  summary: string;
  description: string;
  stamp: string;
}): string {
  const startDate = toIcsDate(input.date);
  const endDate = toIcsDate(addDays(input.date, 1));
  return [
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${input.stamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(input.summary)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
    "END:VEVENT",
  ].join("\n");
}

export function buildInterviewPrepCalendarIcs(
  input: BuildInterviewPrepCalendarInput
): string {
  const interviewDate = new Date(input.interviewDate);
  if (Number.isNaN(interviewDate.getTime())) return "";

  interviewDate.setUTCHours(0, 0, 0, 0);
  const stamp = toIcsTimestamp(new Date());
  const { normalizedCompany, normalizedPersona } = normalizeTarget(input);
  const baseUid = `${normalizedCompany}-${normalizedPersona}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const interviewEvent = buildEventBlock({
    uid: `${baseUid}-interview@nickwiley.dev`,
    date: interviewDate,
    summary: `Interview — ${normalizedCompany} (${normalizedPersona})`,
    description:
      "Final interview slot. Bring concise stories with metrics, ownership, and governance framing.",
    stamp,
  });

  const prepOneDay = buildEventBlock({
    uid: `${baseUid}-prep-1d@nickwiley.dev`,
    date: addDays(interviewDate, -1),
    summary: "Prep checkpoint — Final pressure simulation",
    description:
      "Run one full pressure-mode mock, then tighten your weakest answer and opening statement.",
    stamp,
  });

  const prepTwoDay = buildEventBlock({
    uid: `${baseUid}-prep-2d@nickwiley.dev`,
    date: addDays(interviewDate, -2),
    summary: "Prep checkpoint — Anchor artifacts review",
    description:
      "Re-open your top two recommended artifacts and extract one metric + one governance detail from each.",
    stamp,
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nick Wiley//Adaptive Interview Prep//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    prepTwoDay,
    prepOneDay,
    interviewEvent,
    "END:VCALENDAR",
    "",
  ].join("\n");
}

export function buildInterviewGoogleCalendarUrl(
  input: BuildInterviewPrepCalendarInput
): string {
  const interviewDate = new Date(input.interviewDate);
  if (Number.isNaN(interviewDate.getTime())) return "";

  interviewDate.setUTCHours(0, 0, 0, 0);
  const endDate = addDays(interviewDate, 1);
  const { normalizedCompany, normalizedPersona } = normalizeTarget(input);
  const title = `Interview — ${normalizedCompany} (${normalizedPersona})`;
  const details =
    "Final interview slot. Bring concise stories with metrics, ownership, and governance framing.";
  const dates = `${toIcsDate(interviewDate)}/${toIcsDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(details)}`;
}
