import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPrepGoal,
  getPrepGoalStorageKey,
  normalizePrepGoalState,
  parsePrepGoalState,
  serializePrepGoalState,
} from "../../lib/adaptive/prep-goals";
import {
  getIncompleteReadinessItems,
  getReadinessChecklist,
  getReadinessCompletion,
  getReadinessStorageKey,
  parseReadinessState,
} from "../../lib/adaptive/readiness-checklist";
import {
  getDrillStateStorageKey,
  getInterviewDateStorageKey,
  getLaunchpadStorageKey,
  getMockSessionStorageKey,
  getPrepNotesStorageKey,
} from "../../lib/adaptive/storage-keys";

test("prep-goal parser and normalizer enforce defaults and bounds", () => {
  assert.deepEqual(parsePrepGoalState(null), defaultPrepGoal);
  assert.deepEqual(parsePrepGoalState("invalid-json"), defaultPrepGoal);
  assert.deepEqual(parsePrepGoalState(JSON.stringify({ weeklyTarget: 0 })), {
    weeklyTarget: 1,
  });
  assert.deepEqual(parsePrepGoalState(JSON.stringify({ weeklyTarget: 7.8 })), {
    weeklyTarget: 7,
  });
  assert.deepEqual(parsePrepGoalState(JSON.stringify({ weeklyTarget: "3.4" })), {
    weeklyTarget: 3,
  });
  assert.deepEqual(normalizePrepGoalState({ weeklyTarget: Number.NaN }), defaultPrepGoal);
  assert.equal(serializePrepGoalState({ weeklyTarget: 10 }), JSON.stringify({ weeklyTarget: 7 }));
});

test("prep-goal and readiness storage key helpers are deterministic", () => {
  assert.equal(
    getPrepGoalStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.prep-goals.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getReadinessStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.readiness.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getMockSessionStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.mock-session.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getDrillStateStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.drills.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getPrepNotesStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.prep-notes.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getLaunchpadStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.launchpad.kungfu-ai.kungfu-cto"
  );
  assert.equal(
    getInterviewDateStorageKey("kungfu-ai", "kungfu-cto"),
    "adaptive.interview-date.kungfu-ai.kungfu-cto"
  );
});

test("readiness checklist includes persona-specific items when available", () => {
  const commonOnly = getReadinessChecklist("anthropic", "unknown-persona");
  const personaSpecific = getReadinessChecklist("kungfu-ai", "kungfu-cto");

  assert.equal(commonOnly.length, 4);
  assert.ok(personaSpecific.length > commonOnly.length);
  assert.ok(
    personaSpecific.some((item) => item.id === "cto-architecture-tradeoff")
  );
});

test("readiness state parser sanitizes unsafe keys and completion helpers work", () => {
  const parsedState = parseReadinessState(
    JSON.stringify({
      "__proto__": true,
      " opening-story ": 1,
      constructor: true,
      "proof-artifacts": false,
      "metrics-ready": "yes",
    })
  );
  assert.equal(parsedState.__proto__, undefined);
  assert.equal(parsedState.constructor, undefined);
  assert.equal(parsedState["opening-story"], true);
  assert.equal(parsedState["proof-artifacts"], false);
  assert.equal(parsedState["metrics-ready"], true);

  const checklist = getReadinessChecklist("kungfu-ai", "kungfu-cto");
  const completion = getReadinessCompletion(checklist, parsedState);
  assert.equal(completion.completedCount, 2);
  assert.ok(completion.completionPct > 0);
  assert.ok(completion.completionPct < 100);

  const incomplete = getIncompleteReadinessItems(checklist, parsedState);
  assert.ok(incomplete.length > 0);
  assert.ok(incomplete.every((item) => !parsedState[item.id]));
});
