import assert from "node:assert/strict";
import test from "node:test";

import { buildInterviewDayPlan } from "../../lib/adaptive/interview-day-plan";
import { buildNextActions } from "../../lib/adaptive/next-actions";
import { evaluateModeHealth } from "../../lib/adaptive/mode-health";
import { calculatePreflightScore } from "../../lib/adaptive/preflight";
import { buildPracticeReminders } from "../../lib/adaptive/practice-reminders";

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function daysAgoIso(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

test("preflight score handles missing timeline with strong prep baseline", () => {
  const result = calculatePreflightScore({
    readinessPct: 100,
    latestScore: 100,
    latestSessionTimestamp: new Date().toISOString(),
    launchpadPct: 100,
    hasNotes: true,
    hasFocusNote: true,
    interviewDate: null,
  });

  assert.equal(result.score, 100);
  assert.equal(result.label, "Ready to rehearse");
  assert.equal(result.timelineStatus, "missing");
  assert.equal(result.daysUntilInterview, null);
  assert.ok(result.detail.includes("Set an interview date"));
});

test("preflight score applies staleness + urgency penalties near interview", () => {
  const tomorrow = toLocalIsoDate(addDays(new Date(), 1));
  const result = calculatePreflightScore({
    readinessPct: 60,
    latestScore: 80,
    latestSessionTimestamp: daysAgoIso(5),
    launchpadPct: 100,
    hasNotes: false,
    hasFocusNote: false,
    interviewDate: tomorrow,
  });

  assert.equal(result.timelineStatus, "upcoming");
  assert.ok(result.score < 60);
  assert.equal(result.label, "Needs preparation");
  assert.ok(result.detail.includes("Interview is near"));
});

test("mode health surfaces timeline setup and urgent countdown states", () => {
  const missingTimeline = evaluateModeHealth({
    readinessPct: 40,
    latestScore: null,
    latestConfidence: null,
    latestSessionTimestamp: null,
    interviewDate: null,
  });
  assert.equal(missingTimeline.status, "timeline");
  assert.equal(missingTimeline.shortLabel, "Set date");

  const today = toLocalIsoDate(new Date());
  const urgent = evaluateModeHealth({
    readinessPct: 55,
    latestScore: null,
    latestConfidence: null,
    latestSessionTimestamp: null,
    interviewDate: today,
  });
  assert.equal(urgent.status, "urgent");
  assert.equal(urgent.shortLabel, "Urgent");
});

test("mode health reports strong status when readiness and score are high", () => {
  const farFuture = "2099-06-20";
  const strong = evaluateModeHealth({
    readinessPct: 85,
    latestScore: 90,
    latestConfidence: 4,
    latestSessionTimestamp: daysAgoIso(1),
    interviewDate: farFuture,
  });

  assert.equal(strong.status, "strong");
  assert.equal(strong.shortLabel, "On track");
  assert.ok(strong.detail.includes("Confidence 4/5"));
});

test("next actions include timeline and score-driven priorities with bounded output", () => {
  const actions = buildNextActions({
    readinessPct: 40,
    readinessCompleted: 1,
    readinessTotal: 6,
    latestScore: null,
    latestConfidence: null,
    latestThemes: [],
    topResourceTitle: "Panel Wizard",
    latestSessionTimestamp: null,
    interviewDate: null,
  });

  assert.ok(actions.length > 0);
  assert.ok(actions.length <= 4);
  const ids = actions.map((action) => action.id);
  assert.ok(ids.includes("set-interview-date"));
  assert.ok(ids.includes("finish-readiness"));
  assert.ok(ids.includes("run-first-session"));
});

test("next actions include reset date action when tracked date has passed", () => {
  const actions = buildNextActions({
    readinessPct: 80,
    readinessCompleted: 5,
    readinessTotal: 6,
    latestScore: 90,
    latestConfidence: 5,
    latestThemes: ["governance"],
    topResourceTitle: "Panel Wizard",
    latestSessionTimestamp: daysAgoIso(1),
    interviewDate: "2000-01-01",
  });
  assert.ok(actions.some((action) => action.id === "reset-interview-date"));
});

test("practice reminders adapt to missing timeline and near-interview urgency", () => {
  const now = new Date("2026-02-13T10:00:00.000Z");
  const missingTimeline = buildPracticeReminders({
    now,
    latestScore: null,
    readinessPct: 40,
    launchpadPct: 20,
    interviewDate: null,
  });
  assert.ok(missingTimeline.some((reminder) => reminder.id === "set-interview-date"));
  assert.equal(missingTimeline.length, 3);

  const nearInterview = buildPracticeReminders({
    now,
    latestScore: 68,
    readinessPct: 65,
    launchpadPct: 70,
    interviewDate: "2026-02-14",
  });
  assert.ok(nearInterview.some((reminder) => reminder.id === "interview-soon"));
  assert.equal(nearInterview[0]?.priority, "high");
});

test("interview day plan returns timeline-aware blocks for valid personas", () => {
  const plan = buildInterviewDayPlan("kungfu-ai", "kungfu-cto", {
    interviewDate: "2099-06-20",
  });
  assert.ok(plan);
  if (!plan) return;

  assert.ok(plan.title.includes("Ron Green"));
  assert.ok(plan.timelineLabel.includes("until interview"));
  const blockIds = plan.blocks.map((block) => block.id);
  assert.ok(blockIds.includes("prep-early-baseline"));
  assert.ok(blockIds.includes("pre-45"));
  assert.ok(blockIds.includes("close"));
  assert.ok(plan.fallbackPrompt.length > 0);
});

test("interview day plan returns null for invalid mode combinations", () => {
  assert.equal(buildInterviewDayPlan("anthropic", "unknown-persona"), null);
});
