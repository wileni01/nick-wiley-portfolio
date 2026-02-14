import assert from "node:assert/strict";
import test from "node:test";

import {
  getDaysUntilInterview,
  getInterviewDateSummary,
  parseInterviewDate,
  toInterviewLocalDate,
} from "../../lib/adaptive/interview-date";
import {
  buildInterviewGoogleCalendarEvents,
  buildInterviewGoogleCalendarUrl,
  buildInterviewPrepCalendarIcs,
} from "../../lib/adaptive/interview-calendar";

test("interview-date parsing validates ISO calendar dates strictly", () => {
  assert.equal(parseInterviewDate(" 2026-02-13 "), "2026-02-13");
  assert.equal(parseInterviewDate("2026-02-30"), null);
  assert.equal(parseInterviewDate("2026-13-01"), null);
  assert.equal(parseInterviewDate("not-a-date"), null);
  assert.equal(parseInterviewDate(null), null);
});

test("toInterviewLocalDate and getDaysUntilInterview compute normalized day offsets", () => {
  const localDate = toInterviewLocalDate("2026-02-15");
  assert.ok(localDate);
  assert.equal(localDate?.getHours(), 0);
  assert.equal(localDate?.getMinutes(), 0);

  const baseDate = new Date("2026-02-13T15:30:00.000Z");
  assert.equal(getDaysUntilInterview("2026-02-15", baseDate), 2);
  assert.equal(getDaysUntilInterview("2026-02-13", baseDate), 0);
  assert.equal(getDaysUntilInterview("2026-02-11", baseDate), -2);
  assert.equal(getDaysUntilInterview("invalid", baseDate), null);
});

test("interview-date summary handles unset and invalid inputs deterministically", () => {
  assert.deepEqual(getInterviewDateSummary(null), {
    daysUntil: null,
    label: "No interview date set.",
  });
  assert.deepEqual(getInterviewDateSummary("bad-date"), {
    daysUntil: null,
    label: "Invalid interview date.",
  });
});

test("calendar ics export includes future checkpoints with escaped text", () => {
  const ics = buildInterviewPrepCalendarIcs({
    companyName: "ACME, Inc; AI",
    personaName: "Jane\nDoe",
    interviewDate: "2099-06-20",
  });

  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("PRODID:-//Nick Wiley//Adaptive Interview Prep//EN"));
  const eventMatches = ics.match(/BEGIN:VEVENT/g) ?? [];
  assert.equal(eventMatches.length, 3);
  assert.match(ics, /UID:acme-inc-ai-jane-doe-prep-2d@nickwiley\.dev/);
  assert.ok(
    ics.includes(
      "SUMMARY:Interview — ACME\\, Inc\\; AI (Jane\\nDoe)"
    )
  );
  assert.ok(ics.endsWith("END:VCALENDAR\n"));
});

test("calendar builders return empty output for invalid or past interview dates", () => {
  assert.equal(
    buildInterviewPrepCalendarIcs({
      companyName: "Example",
      personaName: "Interviewer",
      interviewDate: "not-a-date",
    }),
    ""
  );
  assert.deepEqual(
    buildInterviewGoogleCalendarEvents({
      companyName: "Example",
      personaName: "Interviewer",
      interviewDate: "2000-01-01",
    }),
    []
  );
  assert.equal(
    buildInterviewGoogleCalendarUrl({
      companyName: "Example",
      personaName: "Interviewer",
      interviewDate: "invalid",
    }),
    ""
  );
});

test("google calendar event links include prep checkpoints and interview slot", () => {
  const events = buildInterviewGoogleCalendarEvents({
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    interviewDate: "2099-06-20",
  });

  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => event.id),
    ["prep-2d", "prep-1d", "interview"]
  );
  const interviewEvent = events.find((event) => event.id === "interview");
  assert.ok(interviewEvent);
  assert.ok(interviewEvent?.url.startsWith("https://calendar.google.com/calendar/render"));
  assert.ok(interviewEvent?.url.includes("action=TEMPLATE"));
  assert.ok(interviewEvent?.url.includes("dates=20990620%2F20990621"));

  const directUrl = buildInterviewGoogleCalendarUrl({
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    interviewDate: "2099-06-20",
  });
  assert.equal(directUrl, interviewEvent?.url);
});

test("calendar checkpoints are filtered to on-or-after today", () => {
  const today = new Date();
  const isoToday = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;

  const events = buildInterviewGoogleCalendarEvents({
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    interviewDate: isoToday,
  });

  assert.deepEqual(
    events.map((event) => event.id),
    ["interview"]
  );
  assert.ok(events[0]?.url.includes("dates="));

  const ics = buildInterviewPrepCalendarIcs({
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    interviewDate: isoToday,
  });
  const eventMatches = ics.match(/BEGIN:VEVENT/g) ?? [];
  assert.equal(eventMatches.length, 1);
  assert.ok(ics.includes("Interview — KUNGFU.AI (Ron Green)"));
});
