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
  assert.equal(normalizeRequestId("abc", Number.NaN), "abc");
  assert.equal(normalizeRequestId("abcdef", 0), "a");
  assert.equal(normalizeRequestId("abcdef", -10), "a");
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

test("createRequestId falls back to timestamp/counter token when randomUUID fails", () => {
  const originalNow = Date.now;
  const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const fixedNow = 1_700_000_000_123;
  Date.now = () => fixedNow;
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID() {
        throw new Error("randomUUID unavailable");
      },
      getRandomValues(values: Uint8Array) {
        for (let index = 0; index < values.length; index += 1) {
          values[index] = index;
        }
        return values;
      },
    },
    configurable: true,
  });

  try {
    const first = createRequestId();
    const second = createRequestId();

    const firstMatch = first.match(/^([a-z0-9]+)-([a-z0-9]{4})-([a-f0-9]{24})$/i);
    const secondMatch = second.match(/^([a-z0-9]+)-([a-z0-9]{4})-([a-f0-9]{24})$/i);
    assert.ok(firstMatch);
    assert.ok(secondMatch);
    assert.equal(firstMatch?.[1], fixedNow.toString(36));
    assert.equal(secondMatch?.[1], fixedNow.toString(36));
    assert.equal(firstMatch?.[3], "000102030405060708090a0b");
    assert.equal(secondMatch?.[3], "000102030405060708090a0b");

    const firstCounter = Number.parseInt(firstMatch?.[2] ?? "0", 36);
    const secondCounter = Number.parseInt(secondMatch?.[2] ?? "0", 36);
    assert.equal((firstCounter + 1) % 36 ** 4, secondCounter);
  } finally {
    Date.now = originalNow;
    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalCryptoDescriptor);
    } else {
      delete (globalThis as { crypto?: unknown }).crypto;
    }
  }
});

test("createRequestId falls back to Math.random token when getRandomValues fails", () => {
  const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const originalMathRandom = Math.random;
  let calls = 0;
  Math.random = () => {
    calls += 1;
    return 0.123456789;
  };
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID() {
        throw new Error("randomUUID unavailable");
      },
      getRandomValues() {
        throw new Error("getRandomValues unavailable");
      },
    },
    configurable: true,
  });

  try {
    const requestId = createRequestId();
    assert.match(requestId, /^[a-zA-Z0-9._:-]+$/);
    assert.match(requestId, /^[a-z0-9]+-[a-z0-9]{4}-[a-z0-9]+$/i);
    const token = requestId.split("-")[2] ?? "";
    assert.ok(token.length >= 24);
    assert.ok(calls > 0);
  } finally {
    Math.random = originalMathRandom;
    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalCryptoDescriptor);
    } else {
      delete (globalThis as { crypto?: unknown }).crypto;
    }
  }
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

test("rateLimit resets at inclusive window boundary and reports rolling reset times", () => {
  const originalNow = Date.now;
  let now = 1_700_000_000_000;
  Date.now = () => now;

  try {
    const identifier = `boundary:${Math.random().toString(36).slice(2)}`;
    const config = { maxRequests: 2, windowMs: 1000 };

    const first = rateLimit(identifier, config);
    assert.equal(first.success, true);
    assert.equal(first.remaining, 1);
    assert.equal(first.resetIn, 1000);

    const second = rateLimit(identifier, config);
    assert.equal(second.success, true);
    assert.equal(second.remaining, 0);
    assert.equal(second.resetIn, 1000);

    now += 250;
    const third = rateLimit(identifier, config);
    assert.equal(third.success, false);
    assert.equal(third.remaining, 0);
    assert.equal(third.resetIn, 750);

    now += 750;
    const resetAtBoundary = rateLimit(identifier, config);
    assert.equal(resetAtBoundary.success, true);
    assert.equal(resetAtBoundary.remaining, 1);
    assert.equal(resetAtBoundary.resetIn, 1000);
  } finally {
    Date.now = originalNow;
  }
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
  assert.equal(exceededHeaders.get("X-RateLimit-Reset"), "1");
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

test("buildApiResponseHeaders omits invalid request-id values", () => {
  const headers = buildApiResponseHeaders({
    config: { maxRequests: 5, windowMs: 1000 },
    snapshot: { remaining: 4, resetIn: 500 },
    requestId: "   ",
  });

  assert.equal(headers.get("X-Request-Id"), null);
  assert.equal(headers.get("X-RateLimit-Limit"), "5");
  assert.equal(headers.get("X-RateLimit-Remaining"), "4");
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

test("buildApiRequestContext falls back to anonymous IP when proxy headers are invalid", () => {
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "unknown, not-an-ip",
      forwarded: "for=invalid-host",
    },
  });
  const context = buildApiRequestContext({
    req,
    rateLimitNamespace: "chat",
    rateLimitConfig: { maxRequests: 2, windowMs: 60_000 },
  });

  assert.equal(context.ip, "anonymous");
  assert.equal(context.rateLimitResult.success, true);
  assert.ok(context.responseHeaders.get("X-Request-Id"));
});

test("buildApiRequestContext falls back empty namespace values to api bucket", () => {
  const ip = `198.51.100.${(Date.now() % 200) + 20}`;
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": ip,
    },
  });
  const config = { maxRequests: 1, windowMs: 60_000 };

  const first = buildApiRequestContext({
    req,
    rateLimitNamespace: "###",
    rateLimitConfig: config,
  });
  const second = buildApiRequestContext({
    req,
    rateLimitNamespace: "***",
    rateLimitConfig: config,
  });

  assert.equal(first.rateLimitResult.success, true);
  assert.equal(second.rateLimitResult.success, false);
  assert.equal(second.rateLimitResult.remaining, 0);
  assert.ok(second.exceededHeaders.get("Retry-After"));
});

test("buildApiRequestContext truncates overlong namespace values consistently", () => {
  const ip = `198.51.100.${(Date.now() % 200) + 40}`;
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": ip,
    },
  });
  const config = { maxRequests: 1, windowMs: 60_000 };
  const longPrefix = "A".repeat(70);
  const firstNamespace = `${longPrefix}-first`;
  const secondNamespace = `${longPrefix}-second`;

  const first = buildApiRequestContext({
    req,
    rateLimitNamespace: firstNamespace,
    rateLimitConfig: config,
  });
  const second = buildApiRequestContext({
    req,
    rateLimitNamespace: secondNamespace,
    rateLimitConfig: config,
  });

  assert.equal(first.rateLimitResult.success, true);
  assert.equal(second.rateLimitResult.success, false);
  assert.equal(second.rateLimitResult.remaining, 0);
  assert.ok(second.exceededHeaders.get("Retry-After"));
});
