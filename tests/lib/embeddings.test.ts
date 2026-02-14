import assert from "node:assert/strict";
import test from "node:test";

import { knowledgeBase } from "../../content/knowledge-base";
import { findRelevantContext } from "../../lib/embeddings";

function withOpenAiKey(
  value: string | undefined,
  run: () => Promise<void> | void
) {
  const previous = process.env.OPENAI_API_KEY;
  if (value === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = value;
  }
  try {
    const result = run();
    if (result instanceof Promise) {
      return result.finally(() => {
        if (previous === undefined) {
          delete process.env.OPENAI_API_KEY;
        } else {
          process.env.OPENAI_API_KEY = previous;
        }
      });
    }
    if (previous === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previous;
    }
  } catch (error) {
    if (previous === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previous;
    }
    throw error;
  }
}

function expectedContext(topK: number): string {
  return knowledgeBase
    .slice(0, topK)
    .map((entry) => entry.content)
    .join("\n\n");
}

test("findRelevantContext returns deterministic bounded fallback when key is absent", async () =>
  withOpenAiKey(undefined, async () => {
    const context = await findRelevantContext("federal ai delivery", 3);
    assert.equal(context, expectedContext(3));
  }));

test("findRelevantContext normalizes topK bounds on fallback path", async () =>
  withOpenAiKey(undefined, async () => {
    const defaultTopK = await findRelevantContext("query", Number.NaN);
    assert.equal(defaultTopK, expectedContext(5));

    const minTopK = await findRelevantContext("query", 0);
    assert.equal(minTopK, expectedContext(1));

    const maxTopK = await findRelevantContext("query", 999);
    assert.equal(maxTopK, expectedContext(10));
  }));

test("findRelevantContext empty query bypasses embeddings and still respects normalized topK", async () =>
  withOpenAiKey("openai-test-key-12345", async () => {
    const context = await findRelevantContext("   ", 4);
    assert.equal(context, expectedContext(4));
  }));
