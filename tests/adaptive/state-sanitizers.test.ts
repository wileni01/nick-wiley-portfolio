import assert from "node:assert/strict";
import test from "node:test";

import {
  areBooleanStateRecordsEqual,
  getBooleanStateCoveragePercentage,
  parseBooleanStateRecord,
  serializeBooleanStateRecord,
  summarizeBooleanStateRecord,
} from "../../lib/adaptive/boolean-state";
import {
  addFocusHistoryEntry,
  areFocusHistoryEqual,
  parseFocusHistory,
  serializeFocusHistory,
} from "../../lib/adaptive/focus-history";
import {
  appendPrepHistoryEntry,
  parsePrepHistory,
  serializePrepHistory,
  type PrepSessionSnapshot,
} from "../../lib/adaptive/prep-history";
import {
  parsePrepDataBundle,
  parseStoredMockSessionState,
} from "../../lib/adaptive/prep-data-bundle";

test("boolean-state parsing drops unsafe keys and bounds key length", () => {
  const raw = JSON.stringify({
    " keep ": 1,
    "__proto__": true,
    constructor: true,
    prototype: true,
    [("x".repeat(200) as string)]: "1",
  });
  const parsed = parseBooleanStateRecord(raw, { maxKeys: 10, maxKeyLength: 12 });

  assert.equal(parsed.keep, true);
  assert.equal(parsed.__proto__, undefined);
  assert.equal(parsed.constructor, undefined);
  assert.equal(parsed.prototype, undefined);
  const boundedLongKey = "x".repeat(12);
  assert.equal(parsed[boundedLongKey], true);
});

test("boolean-state serialization honors truthyOnly and deterministic key ordering", () => {
  const serialized = serializeBooleanStateRecord(
    {
      b: false,
      a: true,
      "__proto__": true,
      c: true,
    },
    { truthyOnly: true }
  );
  assert.equal(serialized, JSON.stringify({ a: true, c: true }));
});

test("boolean-state summary and coverage helpers compute expected percentages", () => {
  const summary = summarizeBooleanStateRecord({ a: true, b: false, c: true });
  assert.deepEqual(summary, { total: 3, truthy: 2, percentage: 67 });
  assert.equal(getBooleanStateCoveragePercentage(["a", "b", "d"], { a: true, b: false }), 33);
  assert.equal(areBooleanStateRecordsEqual({ a: true }, { a: true }), true);
  assert.equal(areBooleanStateRecordsEqual({ a: true }, { a: false }), false);
});

test("focus-history parsing and append enforce bounds and dedupe", () => {
  const parsed = parseFocusHistory(
    JSON.stringify([
      "  first  ",
      "",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
    ])
  );
  assert.deepEqual(parsed, ["first", "second", "third", "fourth", "fifth", "sixth"]);

  const next = addFocusHistoryEntry(parsed, " second ");
  assert.equal(next[0], "second");
  assert.equal(next.length, 6);
  assert.equal(areFocusHistoryEqual(next, next.slice()), true);
  assert.equal(areFocusHistoryEqual(next, parsed), false);
  assert.equal(serializeFocusHistory(["  one  ", "", "two"]), JSON.stringify(["one", "two"]));
});

test("prep-history parsing normalizes and sorts snapshots", () => {
  const raw = JSON.stringify([
    {
      id: " recent ",
      timestamp: "2026-02-01T10:00:00.000Z",
      averageScore: 99.9,
      averageConfidence: 5.9,
      answerCount: 14,
      topThemes: [" Alpha ", "", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"],
    },
    {
      id: " older ",
      timestamp: "2026-01-01T10:00:00.000Z",
      averageScore: -20,
      averageConfidence: -1,
      answerCount: -4,
      topThemes: ["One"],
    },
    {
      id: "",
      timestamp: "invalid-date",
      averageScore: 10,
      answerCount: 2,
      topThemes: [],
    },
  ]);

  const parsed = parsePrepHistory(raw);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0]?.id, "recent");
  assert.equal(parsed[0]?.averageScore, 100);
  assert.equal(parsed[0]?.averageConfidence, 5);
  assert.equal(parsed[0]?.answerCount, 12);
  assert.deepEqual(parsed[0]?.topThemes, ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"]);
  assert.equal(parsed[1]?.id, "older");
  assert.equal(parsed[1]?.averageScore, 0);
  assert.equal(parsed[1]?.averageConfidence, 1);
  assert.equal(parsed[1]?.answerCount, 0);
});

test("prep-history append/serialize enforce max entries and normalization", () => {
  const existing: PrepSessionSnapshot[] = [
    {
      id: "a",
      timestamp: "2026-01-01T00:00:00.000Z",
      averageScore: 10,
      averageConfidence: 3,
      answerCount: 2,
      topThemes: ["one"],
    },
  ];
  const appended = appendPrepHistoryEntry(existing, {
    id: "b",
    timestamp: "2026-01-02T00:00:00.000Z",
    averageScore: 20,
    averageConfidence: 4,
    answerCount: 3,
    topThemes: ["two"],
  });
  assert.equal(appended[0]?.id, "b");
  assert.equal(appended[1]?.id, "a");

  const serialized = serializePrepHistory([
    ...appended,
    {
      id: "c",
      timestamp: "invalid",
      averageScore: 50,
      averageConfidence: null,
      answerCount: 3,
      topThemes: [],
    } as unknown as PrepSessionSnapshot,
  ]);
  const roundTripped = parsePrepHistory(serialized);
  assert.equal(roundTripped.length, 2);
});

test("mock-session parser sanitizes answers/confidences/question order", () => {
  const parsed = parseStoredMockSessionState(
    JSON.stringify({
      answers: [" one ", "", "x".repeat(2500)],
      confidences: [6, -2, "3", null],
      sessionMode: "pressure",
      questionOrder: [0, 1, 1, 3, -1, 101, "5"],
      currentIndex: 99,
      completed: 1,
      started: "yes",
      updatedAt: "invalid-date",
    })
  );
  assert.ok(parsed);
  if (!parsed) return;
  assert.equal(parsed.answers.length, 3);
  assert.equal(parsed.answers[2]?.length, 2000);
  assert.deepEqual(parsed.confidences, [5, 1, 3]);
  assert.deepEqual(parsed.questionOrder, [0, 1, 3, 5]);
  assert.equal(parsed.currentIndex, 2);
  assert.equal(parsed.completed, true);
  assert.equal(parsed.started, true);
  assert.match(parsed.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("prep-data bundle parser rejects oversized and sanitizes nested state", () => {
  const oversized = "x".repeat(260_000);
  assert.equal(parsePrepDataBundle(oversized), null);

  const bundle = parsePrepDataBundle(
    JSON.stringify({
      version: 1,
      exportedAt: "invalid-date-value",
      mode: { companyId: " kungfu-ai ", personaId: " kungfu-cto " },
      readinessState: { "__proto__": true, checked: 1 },
      prepHistory: [
        {
          id: "entry",
          timestamp: "2026-02-01T00:00:00.000Z",
          averageScore: 85.4,
          averageConfidence: 4.2,
          answerCount: 5,
          topThemes: ["governance"],
        },
      ],
      prepGoal: { topic: "topic", targetDate: "2026-03-01", owner: "me" },
      prepNotes: "n".repeat(2000),
      focusHistory: [" one ", "", "two"],
      interviewDate: "2026-03-01",
      launchpadState: { "__proto__": true, launch: 1 },
      mockSession: {
        answers: ["answer"],
        confidences: [4],
        currentIndex: 0,
        completed: false,
        started: true,
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
      drillState: { "__proto__": true, drill: 1 },
    })
  );

  assert.ok(bundle);
  if (!bundle) return;
  assert.equal(bundle.mode.companyId, "kungfu-ai");
  assert.equal(bundle.mode.personaId, "kungfu-cto");
  assert.equal(bundle.prepNotes.length, 1200);
  assert.deepEqual(bundle.focusHistory, ["one", "two"]);
  assert.equal(bundle.readinessState.__proto__, undefined);
  assert.equal(bundle.readinessState.checked, true);
  assert.equal(bundle.launchpadState.launch, true);
  assert.equal(bundle.drillState.drill, true);
  assert.equal(bundle.mockSession?.answers[0], "answer");
});
