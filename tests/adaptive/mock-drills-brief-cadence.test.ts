import assert from "node:assert/strict";
import test from "node:test";

import { buildTargetedDrills } from "../../lib/adaptive/drills";
import {
  buildMockInterviewerScript,
  deriveCoachingThemes,
  evaluateMockAnswer,
  evaluateMockSession,
} from "../../lib/adaptive/mock-interviewer";
import { buildMockScriptMarkdown } from "../../lib/adaptive/mock-script-export";
import {
  buildPrepBriefMarkdown,
  buildPrepPacketMarkdown,
} from "../../lib/adaptive/prep-brief";
import { evaluatePrepCadence } from "../../lib/adaptive/prep-cadence";

function daysAgoIso(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

test("mock interviewer script builds persona-tailored prompts with artifacts", () => {
  const script = buildMockInterviewerScript("kungfu-ai", "kungfu-cto");
  assert.ok(script);
  if (!script) return;

  assert.ok(script.heading.includes("Ron Green"));
  assert.equal(script.prompts.length, 4);
  script.prompts.forEach((prompt) => {
    assert.ok(prompt.question.length > 0);
    assert.ok(prompt.whatTheyAreTesting.length > 0);
    assert.ok(prompt.answerStrategy.length > 0);
    assert.ok(prompt.recommendedArtifact);
    assert.ok(prompt.recommendedArtifact?.url.startsWith("/"));
  });
});

test("mock interviewer script returns null for invalid mode combination", () => {
  assert.equal(buildMockInterviewerScript("anthropic", "unknown-persona"), null);
});

test("evaluateMockAnswer scores detailed governance-rich answers higher", () => {
  const weak = evaluateMockAnswer("Short answer.");
  assert.ok(weak.score < 60);
  assert.ok(weak.gaps.length > 0);
  assert.ok(weak.coachingPrompt.includes("CAR/STAR"));

  const strong = evaluateMockAnswer(
    [
      "I built and led a human-in-the-loop review workflow for 50000+ operations.",
      "We reduced analyst review time by 35% while maintaining auditability and override checkpoints.",
      "The result improved decision quality for federal stakeholders and reduced governance risk.",
      "I designed instrumentation for safety events and accountability trails.",
    ].join(" ")
  );
  assert.ok(strong.score >= 80);
  assert.ok(strong.strengths.length >= 4);
  assert.equal(strong.gaps.length, 0);
});

test("mock session reporting and coaching themes aggregate feedback consistently", () => {
  const report = evaluateMockSession([
    "I built the pipeline but no metrics here.",
    "I designed and delivered dashboards that improved operations by 20% with audit logs.",
    "",
  ]);
  assert.equal(report.answerCount, 3);
  assert.ok(report.averageScore >= 0);
  assert.ok(report.averageScore <= 100);
  assert.equal(report.feedbackByQuestion.length, 3);

  const themes = deriveCoachingThemes(report.feedbackByQuestion, 3);
  assert.ok(themes.length > 0);
  assert.ok(themes.length <= 3);
  assert.ok(themes[0]?.[1] >= themes[themes.length - 1]?.[1]);
});

test("targeted drills map known themes and provide bounded fallback set", () => {
  const mapped = buildTargetedDrills({
    themes: [
      "Add concrete metrics",
      "Use stronger ownership language",
      "Unknown custom theme",
      "Include governance and safety framing",
    ],
  });
  assert.equal(mapped.length, 3);
  assert.ok(mapped[0]?.id.includes("add-concrete-metrics"));
  assert.equal(mapped[2]?.theme, "Unknown custom theme");
  assert.ok(mapped[2]?.title.length > 0);

  const fallback = buildTargetedDrills({ themes: [] });
  assert.equal(fallback.length, 3);
  assert.equal(fallback[0]?.theme, "General prep");
  assert.ok(fallback[0]?.id.startsWith("fallback-"));
});

test("prep brief and packet markdown exports include major sections", () => {
  const brief = buildPrepBriefMarkdown({
    generatedAt: "2026-02-13T10:00:00.000Z",
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    personaRole: "Co-founder & CTO",
    personaGoal: "Show production-grade architecture with safeguards.",
    interviewDate: "2026-03-01",
    focusNote: "Focus on architecture and governance.",
    prepNotes: "Bring examples from Panel Wizard.",
    readiness: { completed: 5, total: 6, percentage: 83 },
    latestScore: 84,
    latestConfidence: 4,
    preflight: { score: 82, label: "Ready to rehearse", detail: "Strong signal." },
    cadence: {
      label: "On track",
      detail: "Plan one rehearsal",
      sessionsNeeded: 1,
      recencyDays: 1,
    },
    topResources: [
      {
        title: "Panel Wizard",
        url: "/work/panel-wizard",
        reason: "Strong overlap on governance + decision-support.",
      },
    ],
    talkingPoints: ["Lead with measurable impact."],
    reminders: [
      {
        title: "Run one pressure mock",
        detail: "Focus on weakest answer.",
        dueBy: "2026-02-14",
        priority: "high",
      },
    ],
    calendarLinks: [{ label: "Interview event", url: "https://calendar.google.com" }],
  });
  assert.ok(brief.includes("# Interview Prep Brief"));
  assert.ok(brief.includes("## Recommended Resources (open first)"));
  assert.ok(brief.includes("## Practice Reminders"));
  assert.ok(brief.includes("## Calendar Shortcuts"));

  const packet = buildPrepPacketMarkdown({
    generatedAt: "2026-02-13T10:00:00.000Z",
    companyName: "KUNGFU.AI",
    personaName: "Ron Green",
    personaRole: "Co-founder & CTO",
    personaGoal: "Show production-grade architecture with safeguards.",
    readiness: { completed: 5, total: 6, percentage: 83 },
    latestScore: 84,
    latestConfidence: 4,
    topResources: [],
    talkingPoints: [],
    nextActions: [
      { priority: "high", title: "Run mock", detail: "Focus on weakest answer." },
    ],
    drills: [
      {
        theme: "Add concrete metrics",
        title: "Metric layering drill",
        instruction: "Use one metric.",
        starterPrompt: "The measurable improvement was ___.",
      },
    ],
    dayPlan: {
      title: "Interview day plan",
      blocks: [{ phase: "T-30", objective: "Re-open artifact", action: "Review proof." }],
      fallbackPrompt: "Reset with CAR.",
    },
  });
  assert.ok(packet.includes("## Next Best Actions"));
  assert.ok(packet.includes("## Targeted Drills"));
  assert.ok(packet.includes("## Interview Day Plan"));
});

test("mock script markdown export includes recommended artifact links", () => {
  const script = buildMockInterviewerScript("anthropic", "anthropic-ceo");
  assert.ok(script);
  if (!script) return;
  const markdown = buildMockScriptMarkdown({
    generatedAt: "2026-02-13T10:00:00.000Z",
    companyName: "Anthropic",
    personaName: "Dario Amodei",
    personaRole: "CEO (scenario)",
    script,
  });
  assert.ok(markdown.includes("# Mock Interviewer Script"));
  assert.ok(markdown.includes("## Script"));
  assert.ok(markdown.includes("Recommended artifact: ["));
});

test("prep cadence handles timeline states and urgency windows", () => {
  const missingDate = evaluatePrepCadence({
    daysUntilInterview: null,
    readinessPct: 40,
    latestScore: null,
    latestSessionTimestamp: null,
  });
  assert.equal(missingDate.status, "none");
  assert.ok(missingDate.detail.includes("Set an interview date"));
  assert.ok(missingDate.sessionsNeeded > 0);

  const datePassed = evaluatePrepCadence({
    daysUntilInterview: -2,
    readinessPct: 80,
    latestScore: 90,
    latestSessionTimestamp: daysAgoIso(1),
  });
  assert.equal(datePassed.status, "none");
  assert.equal(datePassed.sessionsNeeded, 0);

  const urgent = evaluatePrepCadence({
    daysUntilInterview: 1,
    readinessPct: 55,
    latestScore: 65,
    latestSessionTimestamp: daysAgoIso(5),
  });
  assert.equal(urgent.status, "urgent");
  assert.ok(urgent.sessionsNeeded >= 1);

  const onTrack = evaluatePrepCadence({
    daysUntilInterview: 7,
    readinessPct: 85,
    latestScore: 90,
    latestSessionTimestamp: daysAgoIso(1),
  });
  assert.equal(onTrack.status, "on-track");
  assert.equal(onTrack.sessionsNeeded, 0);
});
