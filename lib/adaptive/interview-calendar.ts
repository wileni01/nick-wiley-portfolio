interface BuildInterviewPrepCalendarInput {
  companyName: string;
  personaName: string;
  interviewDate: string;
}

export interface InterviewCalendarLink {
  id: "prep-2d" | "prep-1d" | "interview";
  label: string;
  offsetDays: number;
  url: string;
}

interface CalendarCheckpoint {
  id: "prep-2d" | "prep-1d" | "interview";
  label: string;
  offsetDays: number;
  details: string;
  startDate: Date;
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

  const stamp = toIcsTimestamp(new Date());
  const { normalizedCompany, normalizedPersona } = normalizeTarget(input);
  const baseUid = `${normalizedCompany}-${normalizedPersona}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const checkpoints = buildCalendarCheckpoints({
    interviewDate,
    normalizedCompany,
    normalizedPersona,
  }).filter((checkpoint) => isOnOrAfterTodayUtc(checkpoint.startDate));
  if (!checkpoints.length) return "";

  const eventBlocks = checkpoints.map((checkpoint) =>
    buildEventBlock({
      uid: `${baseUid}-${checkpoint.id}@nickwiley.dev`,
      date: checkpoint.startDate,
      summary: checkpoint.label,
      description: checkpoint.details,
      stamp,
    })
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nick Wiley//Adaptive Interview Prep//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventBlocks,
    "END:VCALENDAR",
    "",
  ].join("\n");
}

export function buildInterviewGoogleCalendarUrl(
  input: BuildInterviewPrepCalendarInput
): string {
  return buildInterviewGoogleCalendarEvents(input).find((event) => event.id === "interview")
    ?.url ?? "";
}

export function buildInterviewGoogleCalendarEvents(
  input: BuildInterviewPrepCalendarInput
): InterviewCalendarLink[] {
  const interviewDate = new Date(input.interviewDate);
  if (Number.isNaN(interviewDate.getTime())) return [];

  const { normalizedCompany, normalizedPersona } = normalizeTarget(input);
  return buildCalendarCheckpoints({
    interviewDate,
    normalizedCompany,
    normalizedPersona,
  })
    .filter((checkpoint) => isOnOrAfterTodayUtc(checkpoint.startDate))
    .map((checkpoint) => {
      const endDate = addDays(checkpoint.startDate, 1);
      return {
        id: checkpoint.id,
        label: checkpoint.label,
        offsetDays: checkpoint.offsetDays,
        url: buildGoogleCalendarUrl({
          title: checkpoint.label,
          details: checkpoint.details,
          startDate: checkpoint.startDate,
          endDate,
        }),
      };
    });
}

function buildGoogleCalendarUrl(input: {
  title: string;
  details: string;
  startDate: Date;
  endDate: Date;
}): string {
  const dates = `${toIcsDate(input.startDate)}/${toIcsDate(input.endDate)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    input.title
  )}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(input.details)}`;
}

function buildCalendarCheckpoints(input: {
  interviewDate: Date;
  normalizedCompany: string;
  normalizedPersona: string;
}): CalendarCheckpoint[] {
  const interviewDate = new Date(input.interviewDate);
  interviewDate.setUTCHours(0, 0, 0, 0);
  const interviewLabel = `Interview — ${input.normalizedCompany} (${input.normalizedPersona})`;

  return [
    {
      id: "prep-2d",
      label: "Prep checkpoint (T-2): anchor artifacts",
      offsetDays: -2,
      details:
        "Re-open your top two recommended artifacts and extract one metric + one governance detail from each.",
      startDate: addDays(interviewDate, -2),
    },
    {
      id: "prep-1d",
      label: "Prep checkpoint (T-1): pressure simulation",
      offsetDays: -1,
      details:
        "Run one full pressure-mode mock and tighten your weakest answer plus opening statement.",
      startDate: addDays(interviewDate, -1),
    },
    {
      id: "interview",
      label: interviewLabel,
      offsetDays: 0,
      details:
        "Final interview slot. Bring concise stories with metrics, ownership, and governance framing.",
      startDate: interviewDate,
    },
  ];
}

function isOnOrAfterTodayUtc(date: Date): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setUTCHours(0, 0, 0, 0);
  return compare.getTime() >= today.getTime();
}
