import assert from "node:assert/strict";
import test from "node:test";

import { cn, formatDate, sanitizeInput, slugify } from "../../lib/utils";

test("sanitizeInput strips control, bidi, scriptable tokens, and enforces max length", () => {
  const input =
    "\u0000\u0007  \u202E<script>javascript:alert(1)</script> onClick=run() safe-value";

  const sanitized = sanitizeInput(input, 24);

  assert.equal(sanitized, "scriptalert(1)/script ru");
  assert.equal(sanitized.length, 24);
  assert.ok(!sanitized.includes("\u202E"));
  assert.ok(!sanitized.includes("javascript:"));
  assert.ok(!/[<>]/.test(sanitized));
});

test("sanitizeInput normalizes invalid maxChars values to safe bounds", () => {
  assert.equal(sanitizeInput("abcdef", Number.NaN), "abcdef");
  assert.equal(sanitizeInput("abcdef", -10), "a");
  assert.equal(sanitizeInput("abcdef", 3.9), "abc");
});

test("slugify lowers case and normalizes separators", () => {
  assert.equal(slugify("Responsible AI Delivery"), "responsible-ai-delivery");
  assert.equal(slugify("MLOps---Playbook!"), "mlops-playbook");
  assert.equal(slugify("AI / Governance / Ops"), "ai-governance-ops");
});

test("formatDate renders month and year", () => {
  assert.equal(formatDate("2024-01-15T00:00:00.000Z"), "January 2024");
  assert.equal(formatDate(new Date("2025-09-01T00:00:00.000Z")), "September 2025");
});

test("cn merges conditional and conflicting Tailwind classes", () => {
  const merged = cn("px-4 py-2", false && "hidden", "px-2", "text-sm", "text-base");
  assert.equal(merged, "py-2 px-2 text-base");
});
