import assert from "node:assert/strict";
import test from "node:test";

import {
  buildApiResponseHeaders,
  buildRateLimitExceededHeaders,
  buildRateLimitHeaders,
} from "../../lib/api-rate-limit";
import { buildApiRequestContext } from "../../lib/api-request-context";
import { normalizeRateLimitConfig, rateLimit } from "../../lib/rate-limit";
import { createRequestId, normalizeRequestId } from "../../lib/request-id";

test("normalizeRequestId bounds and sanitizes unsafe values", () => {
  assert.equal(normalizeRequestId("  abc\r\n<script>  "), "abcscript");
  assert.equal(normalizeRequestId("x".repeat(300)).length, 120);
  assert.equal(normalizeRequestId("x".repeat(300), 12), "x".repeat(12));
  assert.equal(normalizeRequestId("###"), null);
  assert.equal(normalizeRequestId(123), null);
});

test("createRequestId returns safe non-empty identifiers", () => {
  const first = createRequestId();
  const second = createRequestId();

  assert.ok(first.length > 10);
  assert.ok(second.length > 10);
  assert.match(first, /^[a-zA-Z0-9._:-]+$/);
  assert.match(second, /^[a-zA-Z0-9._:-]+$/);
  assert.notEqual(first, second);
});

test("normalizeRateLimitConfig applies finite/default/minimum guards", () => {
  assert.deepEqual(
    normalizeRateLimitConfig({ maxRequests: 3.8, windowMs: 500.2 }),
    { maxRequests: 3, windowMs: 1000 }
  );
  assert.deepEqual(
    normalizeRateLimitConfig({ maxRequests: Number.NaN, windowMs: Number.POSITIVE_INFINITY }),
    { maxRequests: 50, windowMs: 3600000 }
  );
});

test("rateLimit normalizes identifiers so equivalent keys share limits", () => {
  const config = { maxRequests: 1, windowMs: 1000 };
  const uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const noisyIdentifier = `NAMESPACE:${uniqueToken}:198.51.100.77?!`;
  const normalizedIdentifier = `namespace:${uniqueToken}:198.51.100.77`;

  const first = rateLimit(noisyIdentifier, config);
  const second = rateLimit(normalizedIdentifier, config);

  assert.equal(first.success, true);
  assert.equal(first.remaining, 0);
  assert.equal(second.success, false);
  assert.equal(second.remaining, 0);
  assert.ok(second.resetIn >= 0);
});

test("rate-limit header builders clamp malformed snapshot values", () => {
  const headers = new Headers(
    buildRateLimitHeaders(
      { maxRequests: 5, windowMs: 1000 },
      { remaining: Number.POSITIVE_INFINITY, resetIn: Number.NaN }
    )
  );

  assert.equal(headers.get("X-RateLimit-Limit"), "5");
  assert.equal(headers.get("X-RateLimit-Remaining"), "0");
  assert.equal(headers.get("X-RateLimit-Reset"), "0");

  const exceededHeaders = new Headers(
    buildRateLimitExceededHeaders(
      { maxRequests: 5, windowMs: 1000 },
      { remaining: -50, resetIn: -100 }
    )
  );
  assert.equal(exceededHeaders.get("X-RateLimit-Remaining"), "0");
  assert.equal(exceededHeaders.get("Retry-After"), "1");
});

test("buildApiResponseHeaders sanitizes request id and include retry metadata", () => {
  const headers = buildApiResponseHeaders({
    config: { maxRequests: 2, windowMs: 1000 },
    snapshot: { remaining: 1, resetIn: 1900 },
    requestId: " req\r\nid<script> ",
    includeRetryAfter: true,
  });

  assert.equal(headers.get("X-Request-Id"), "reqidscript");
  assert.equal(headers.get("X-RateLimit-Limit"), "2");
  assert.equal(headers.get("X-RateLimit-Remaining"), "1");
  assert.equal(headers.get("X-RateLimit-Reset"), "2");
  assert.equal(headers.get("Retry-After"), "2");
});

test("buildApiRequestContext sanitizes namespace and reuses same rate-limit bucket", () => {
  const requestIp = "198.51.100.140";
  const req = new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": requestIp },
  });
  const namespace = `InTerview Mode ### ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const config = { maxRequests: 2, windowMs: 60_000 };

  const first = buildApiRequestContext({
    req,
    rateLimitNamespace: namespace,
    rateLimitConfig: config,
  });
  const second = buildApiRequestContext({
    req,
    rateLimitNamespace: namespace,
    rateLimitConfig: config,
  });

  assert.equal(first.ip, requestIp);
  assert.equal(first.rateLimitResult.success, true);
  assert.equal(first.rateLimitResult.remaining, 1);
  assert.equal(second.rateLimitResult.success, true);
  assert.equal(second.rateLimitResult.remaining, 0);
  assert.ok(first.responseHeaders.get("X-Request-Id"));
  assert.ok(second.exceededHeaders.get("Retry-After"));
});
