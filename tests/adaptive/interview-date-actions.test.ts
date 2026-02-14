import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInterviewDateOffsetValue,
  clearInterviewDateForMode,
  setInterviewDateForMode,
  setInterviewDateOffsetForMode,
} from "../../lib/adaptive/interview-date-actions";
import { getInterviewDateStorageKey } from "../../lib/adaptive/storage-keys";

interface MockStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface MockWindowLike {
  localStorage: MockStorage;
  dispatchEvent: (event: Event) => boolean;
}

function withMockWindow(
  run: (ctx: {
    storage: Map<string, string>;
    dispatchedEvents: Event[];
    keyFor: (companyId: string, personaId: string) => string;
  }) => void
) {
  const previousWindow = (globalThis as { window?: unknown }).window;
  const storage = new Map<string, string>();
  const dispatchedEvents: Event[] = [];
  const mockWindow: MockWindowLike = {
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key)! : null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
      return true;
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: mockWindow,
  });

  try {
    run({
      storage,
      dispatchedEvents,
      keyFor: getInterviewDateStorageKey,
    });
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: previousWindow,
    });
  }
}

test("buildInterviewDateOffsetValue uses day offsets from normalized base date", () => {
  const baseDate = new Date("2026-02-13T18:20:00.000Z");
  assert.equal(buildInterviewDateOffsetValue(0, baseDate), "2026-02-13");
  assert.equal(buildInterviewDateOffsetValue(5, baseDate), "2026-02-18");
  assert.equal(buildInterviewDateOffsetValue(-2, baseDate), "2026-02-11");
});

test("setInterviewDateForMode persists normalized date and dispatches update event", () => {
  withMockWindow(({ storage, dispatchedEvents, keyFor }) => {
    const key = setInterviewDateForMode("kungfu-ai", "kungfu-cto", " 2026-03-01 ");
    assert.equal(key, keyFor("kungfu-ai", "kungfu-cto"));
    assert.equal(storage.get(key!), "2026-03-01");
    assert.equal(dispatchedEvents.length, 1);
    assert.equal(dispatchedEvents[0]?.type, "adaptive-interview-date-updated");
  });
});

test("setInterviewDateForMode is a no-op when date is unchanged", () => {
  withMockWindow(({ storage, dispatchedEvents, keyFor }) => {
    const key = keyFor("kungfu-ai", "kungfu-cto");
    storage.set(key, "2026-03-01");
    const result = setInterviewDateForMode("kungfu-ai", "kungfu-cto", "2026-03-01");
    assert.equal(result, key);
    assert.equal(dispatchedEvents.length, 0);
  });
});

test("setInterviewDateForMode rejects invalid dates and does not write", () => {
  withMockWindow(({ storage, dispatchedEvents }) => {
    const result = setInterviewDateForMode("kungfu-ai", "kungfu-cto", "2026-02-30");
    assert.equal(result, null);
    assert.equal(storage.size, 0);
    assert.equal(dispatchedEvents.length, 0);
  });
});

test("setInterviewDateOffsetForMode writes offset date and clearInterviewDateForMode removes key", () => {
  withMockWindow(({ storage, dispatchedEvents, keyFor }) => {
    const key = keyFor("anthropic", "anthropic-ceo");
    const setKey = setInterviewDateOffsetForMode(
      "anthropic",
      "anthropic-ceo",
      3
    );
    assert.equal(setKey, key);
    assert.ok(storage.get(key));
    assert.equal(dispatchedEvents.length, 1);

    const clearKey = clearInterviewDateForMode("anthropic", "anthropic-ceo");
    assert.equal(clearKey, key);
    assert.equal(storage.has(key), false);
    assert.equal(dispatchedEvents.length, 2);
    assert.equal(dispatchedEvents[1]?.type, "adaptive-interview-date-updated");
  });
});

test("clearInterviewDateForMode returns key without dispatch when key is absent", () => {
  withMockWindow(({ dispatchedEvents, keyFor }) => {
    const key = clearInterviewDateForMode("anthropic", "anthropic-ceo");
    assert.equal(key, keyFor("anthropic", "anthropic-ceo"));
    assert.equal(dispatchedEvents.length, 0);
  });
});
