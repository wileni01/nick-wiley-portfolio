import assert from "node:assert/strict";
import test from "node:test";

import { POST as postChat } from "../../app/api/chat/route";
import { POST as postContact } from "../../app/api/contact/route";
import { POST as postInterviewMode } from "../../app/api/interview-mode/route";

function withEnv(
  entries: Record<string, string | undefined>,
  run: () => Promise<void> | void
) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(entries)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  const restore = () => {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
  try {
    const result = run();
    if (result instanceof Promise) {
      return result.finally(restore);
    }
    restore();
  } catch (error) {
    restore();
    throw error;
  }
}

function withGlobalValue<T extends keyof typeof globalThis>(
  key: T,
  value: (typeof globalThis)[T],
  run: () => Promise<void> | void
) {
  const hadOwnProperty = Object.prototype.hasOwnProperty.call(globalThis, key);
  const previous = globalThis[key];
  (globalThis as Record<string, unknown>)[key as string] = value as unknown;
  const restore = () => {
    if (hadOwnProperty) {
      (globalThis as Record<string, unknown>)[key as string] = previous as unknown;
    } else {
      delete (globalThis as Record<string, unknown>)[key as string];
    }
  };

  try {
    const result = run();
    if (result instanceof Promise) {
      return result.finally(restore);
    }
    restore();
  } catch (error) {
    restore();
    throw error;
  }
}

function buildJsonRequest(input: {
  url: string;
  body: string | Uint8Array;
  ip?: string;
  contentType?: string;
  contentLength?: string;
}): Request {
  const headers = new Headers();
  if (input.contentType !== "") {
    headers.set("content-type", input.contentType ?? "application/json");
  }
  if (input.ip) {
    headers.set("x-forwarded-for", input.ip);
  }
  if (input.contentLength !== undefined) {
    headers.set("content-length", input.contentLength);
  }
  return new Request(input.url, {
    method: "POST",
    headers,
    body: input.body,
  });
}

let ipCounter = 0;
const SAFE_REQUEST_ID_HEADER_PATTERN = /^[A-Za-z0-9._:-]{1,120}$/;
const EXPECTED_RATE_LIMIT_LIMITS = {
  chat: 50,
  interviewMode: 40,
  contact: 5,
} as const;

function uniqueIp() {
  ipCounter += 1;
  const thirdOctet = Math.floor(ipCounter / 200) % 200;
  const fourthOctet = (ipCounter % 200) + 20;
  return `198.51.${thirdOctet}.${fourthOctet}`;
}

function assertStandardRateLimitHeaders(
  response: Response,
  options: { allowRetryAfter?: boolean } = {}
) {
  const limitHeader = response.headers.get("X-RateLimit-Limit");
  const remainingHeader = response.headers.get("X-RateLimit-Remaining");
  const resetHeader = response.headers.get("X-RateLimit-Reset");
  const requestIdHeader = response.headers.get("X-Request-Id");

  assert.notEqual(limitHeader, null);
  assert.notEqual(remainingHeader, null);
  assert.notEqual(resetHeader, null);
  assert.notEqual(requestIdHeader, null);
  assert.match(requestIdHeader!, SAFE_REQUEST_ID_HEADER_PATTERN);

  const limit = Number(limitHeader);
  const remaining = Number(remainingHeader);
  const reset = Number(resetHeader);

  assert.ok(Number.isInteger(limit));
  assert.ok(limit > 0);
  assert.ok(Number.isInteger(remaining));
  assert.ok(remaining >= 0);
  assert.ok(remaining <= limit);
  assert.ok(Number.isInteger(reset));
  assert.ok(reset >= 0);
  if (!options.allowRetryAfter) {
    assert.equal(response.headers.get("Retry-After"), null);
  }
}

function assertRateLimitLimitHeaderEquals(response: Response, expected: number) {
  const limitHeader = response.headers.get("X-RateLimit-Limit");
  assert.notEqual(limitHeader, null);
  assert.equal(Number(limitHeader), expected);
}

function assertRouteRateLimitLimitHeader(
  response: Response,
  route: keyof typeof EXPECTED_RATE_LIMIT_LIMITS
) {
  assertRateLimitLimitHeaderEquals(response, EXPECTED_RATE_LIMIT_LIMITS[route]);
}

function assertChatRateLimitHeaders(
  response: Response,
  options: { allowRetryAfter?: boolean } = {}
) {
  assertStandardRateLimitHeaders(response, options);
  assertRouteRateLimitLimitHeader(response, "chat");
}

function assertInterviewModeRateLimitHeaders(
  response: Response,
  options: { allowRetryAfter?: boolean } = {}
) {
  assertStandardRateLimitHeaders(response, options);
  assertRouteRateLimitLimitHeader(response, "interviewMode");
}

function assertContactRateLimitHeaders(
  response: Response,
  options: { allowRetryAfter?: boolean } = {}
) {
  assertStandardRateLimitHeaders(response, options);
  assertRouteRateLimitLimitHeader(response, "contact");
}

function assertRetryAfterHeader(response: Response) {
  const retryAfterHeader = response.headers.get("Retry-After");
  assert.notEqual(retryAfterHeader, null);
  const retryAfter = Number(retryAfterHeader);
  assert.ok(Number.isInteger(retryAfter));
  assert.ok(retryAfter >= 1);
}

function assertRetryAfterMatchesResetHeader(response: Response) {
  const retryAfterHeader = response.headers.get("Retry-After");
  const resetHeader = response.headers.get("X-RateLimit-Reset");
  assert.notEqual(retryAfterHeader, null);
  assert.notEqual(resetHeader, null);
  assert.equal(Number(retryAfterHeader), Number(resetHeader));
}

function assertExhaustedRateLimitHeaders(response: Response) {
  assertStandardRateLimitHeaders(response, {
    allowRetryAfter: true,
  });
  assertRetryAfterHeader(response);
  assertRetryAfterMatchesResetHeader(response);
  assert.equal(response.headers.get("X-RateLimit-Remaining"), "0");
}

function assertRateLimitPayloadResetParity(
  payload: Record<string, unknown>,
  response: Response
) {
  const resetIn = Number(payload.resetIn);
  assert.ok(Number.isInteger(resetIn));
  assert.ok(resetIn >= 1);
  const resetHeader = Number(response.headers.get("X-RateLimit-Reset"));
  const retryAfterHeader = Number(response.headers.get("Retry-After"));
  assert.equal(resetIn, resetHeader);
  assert.equal(resetIn, retryAfterHeader);
}

function assertStandardJsonSecurityHeaders(response: Response) {
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
}

function assertRequestIdAndReturn(response: Response): string {
  const requestId = response.headers.get("X-Request-Id");
  assert.notEqual(requestId, null);
  assert.match(requestId!, SAFE_REQUEST_ID_HEADER_PATTERN);
  return requestId!;
}

async function assertErrorPayloadRequestIdMatchesHeader(
  response: Response
): Promise<Record<string, unknown>> {
  const headerRequestId = assertRequestIdAndReturn(response);
  const payload = (await response.json()) as Record<string, unknown>;
  assert.equal(payload.requestId, headerRequestId);
  return payload;
}

function assertRateLimitRemainingDecremented(
  firstResponse: Response,
  secondResponse: Response
) {
  const firstLimit = Number(firstResponse.headers.get("X-RateLimit-Limit"));
  const secondLimit = Number(secondResponse.headers.get("X-RateLimit-Limit"));
  const firstRemaining = Number(firstResponse.headers.get("X-RateLimit-Remaining"));
  const secondRemaining = Number(secondResponse.headers.get("X-RateLimit-Remaining"));
  assert.ok(Number.isInteger(firstLimit));
  assert.ok(Number.isInteger(secondLimit));
  assert.equal(firstLimit, secondLimit);
  assert.ok(Number.isInteger(firstRemaining));
  assert.ok(Number.isInteger(secondRemaining));
  assert.equal(secondRemaining, firstRemaining - 1);
}

test("chat invalid payload path emits explicit invalid_payload telemetry headers", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertChatRateLimitHeaders(response);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat invalid payload error body includes requestId matching response header", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  assert.equal(response.status, 400);
  const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
  assert.equal(
    payload.error,
    "Messages are required and must be valid chat entries."
  );
});

test("chat repeated requests decrement rate-limit remaining consistently", async () => {
  const ip = uniqueIp();
  const firstResponse = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip,
    })
  );
  const secondResponse = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip,
    })
  );

  assert.equal(firstResponse.status, 400);
  assert.equal(secondResponse.status, 400);
  assertChatRateLimitHeaders(firstResponse);
  assertChatRateLimitHeaders(secondResponse);
  assertRateLimitRemainingDecremented(firstResponse, secondResponse);
});

test("chat generates unique request ids across repeated requests", async () => {
  const firstResponse = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  const secondResponse = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  const firstRequestId = assertRequestIdAndReturn(firstResponse);
  const secondRequestId = assertRequestIdAndReturn(secondResponse);
  assert.notEqual(firstRequestId, secondRequestId);
});

test("chat empty-body payload keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "",
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertChatRateLimitHeaders(response);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat malformed JSON keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: '{"messages":[{"role":"user","content":"hello"}',
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertChatRateLimitHeaders(response);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat post-sanitization empty messages keep invalid_payload fallback reason", async () =>
  withEnv(
    {
      OPENAI_API_KEY: "openai-test-key-12345",
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postChat(
        buildJsonRequest({
          url: "http://localhost/api/chat",
          body: JSON.stringify({
            provider: "openai",
            messages: [{ role: "user", content: "<>" }],
          }),
          ip: uniqueIp(),
        })
      );

      assert.equal(response.status, 400);
      assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
      assert.equal(
        response.headers.get("X-Chat-Context-Fallback"),
        "invalid_payload"
      );
      const payload = (await response.json()) as { error: string };
      assert.equal(payload.error, "Messages are empty after sanitization.");
    }
  ));

test("chat provider headers reflect configured fallback provider selection", async () =>
  withEnv(
    {
      OPENAI_API_KEY: "openai-test-key-12345",
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postChat(
        buildJsonRequest({
          url: "http://localhost/api/chat",
          body: JSON.stringify({
            provider: "anthropic",
            messages: [{ role: "user", content: "<>" }],
          }),
          ip: uniqueIp(),
        })
      );

      assert.equal(response.status, 400);
      assert.equal(response.headers.get("X-AI-Provider-Requested"), "anthropic");
      assert.equal(response.headers.get("X-AI-Provider"), "openai");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "1");
      assert.equal(
        response.headers.get("X-Chat-Context-Fallback"),
        "invalid_payload"
      );
      const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
      assert.equal(payload.error, "Messages are empty after sanitization.");
    }
  ));

test("chat rate-limited responses report fallback context source and reason", async () => {
  const ip = uniqueIp();
  for (let index = 0; index < 50; index++) {
    const response = await postChat(
      buildJsonRequest({
        url: "http://localhost/api/chat",
        body: "{}",
        ip,
      })
    );
    assert.equal(response.status, 400);
  }
  const rateLimitedResponse = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip,
    })
  );
  assert.equal(rateLimitedResponse.status, 429);
  assertStandardJsonSecurityHeaders(rateLimitedResponse);
  assertExhaustedRateLimitHeaders(rateLimitedResponse);
  assertRouteRateLimitLimitHeader(rateLimitedResponse, "chat");
  assert.equal(rateLimitedResponse.headers.get("X-Chat-Context-Source"), "fallback");
  assert.equal(
    rateLimitedResponse.headers.get("X-Chat-Context-Fallback"),
    "rate_limited"
  );
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider"), "none");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Fallback"), "none");
  const payload = await assertErrorPayloadRequestIdMatchesHeader(rateLimitedResponse);
  assert.equal(payload.error, "Rate limit exceeded. Please try again later.");
  assertRateLimitPayloadResetParity(payload, rateLimitedResponse);
});

test("chat content-type validation keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentType: "text/plain",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
  const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
  assert.equal(payload.error, "Chat requests must use application/json.");
});

test("chat multi-valued content-type keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json, text/plain",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat application plus-json media type remains valid and keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/vnd.api+json",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat json content-type with charset remains valid and keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json; charset=utf-8",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat missing content-type keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentType: "",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat non-numeric content-length keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "abc",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat unsafe-integer content-length keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "9007199254740992",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat invalid content-length keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "1",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat oversized declared payload keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "999999",
    })
  );

  assert.equal(response.status, 413);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat invalid UTF-8 payload keeps invalid_payload fallback semantics", async () => {
  const response = await postChat(
    buildJsonRequest({
      url: "http://localhost/api/chat",
      body: new Uint8Array([0xff, 0xfe, 0xfd]),
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Chat-Context-Source"), "none");
  assert.equal(response.headers.get("X-Chat-Context-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("chat no-provider path emits fallback telemetry and explicit provider defaults", async () =>
  withEnv(
    {
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postChat(
        buildJsonRequest({
          url: "http://localhost/api/chat",
          body: JSON.stringify({
            provider: "openai",
            messages: [{ role: "user", content: "Hello Nick" }],
          }),
          ip: uniqueIp(),
        })
      );

      assert.equal(response.status, 503);
      assertStandardJsonSecurityHeaders(response);
      assertChatRateLimitHeaders(response);
      assert.equal(response.headers.get("X-Chat-Context-Source"), "fallback");
      assert.equal(response.headers.get("X-Chat-Context-Fallback"), "no_provider");
      assert.equal(response.headers.get("X-AI-Provider-Requested"), "openai");
      assert.equal(response.headers.get("X-AI-Provider"), "none");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");

      const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
      assert.equal(
        payload.error,
        "No AI provider key is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY."
      );
    }
  ));

test("interview-mode invalid mode path reports invalid_mode fallback", async () =>
  withEnv(
    {
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postInterviewMode(
        buildJsonRequest({
          url: "http://localhost/api/interview-mode",
          body: JSON.stringify({
            companyId: "kungfu-ai",
            personaId: "unknown-persona",
            provider: "openai",
          }),
          ip: uniqueIp(),
        })
      );
      assert.equal(response.status, 400);
      assertStandardJsonSecurityHeaders(response);
      assertInterviewModeRateLimitHeaders(response);
      assert.equal(response.headers.get("X-AI-Narrative-Source"), "fallback");
      assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_mode");
      assert.equal(response.headers.get("X-AI-Provider"), "none");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
      const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
      assert.equal(payload.error, "Unknown company or interviewer persona.");
    }
  ));

test("interview-mode invalid payload keeps invalid_payload narrative defaults", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertInterviewModeRateLimitHeaders(response);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode invalid payload error body includes requestId matching response header", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  assert.equal(response.status, 400);
  const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
  assert.equal(payload.error, "Invalid interview mode payload.");
});

test("interview-mode repeated requests decrement rate-limit remaining consistently", async () => {
  const ip = uniqueIp();
  const firstResponse = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip,
    })
  );
  const secondResponse = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip,
    })
  );

  assert.equal(firstResponse.status, 400);
  assert.equal(secondResponse.status, 400);
  assertInterviewModeRateLimitHeaders(firstResponse);
  assertInterviewModeRateLimitHeaders(secondResponse);
  assertRateLimitRemainingDecremented(firstResponse, secondResponse);
});

test("interview-mode generates unique request ids across repeated requests", async () => {
  const firstResponse = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  const secondResponse = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  const firstRequestId = assertRequestIdAndReturn(firstResponse);
  const secondRequestId = assertRequestIdAndReturn(secondResponse);
  assert.notEqual(firstRequestId, secondRequestId);
});

test("interview-mode empty-body payload keeps invalid_payload narrative defaults", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "",
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertInterviewModeRateLimitHeaders(response);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode malformed JSON keeps invalid_payload narrative defaults", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: '{"companyId":"kungfu-ai","personaId":"kungfu-cto"',
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assertStandardJsonSecurityHeaders(response);
  assertInterviewModeRateLimitHeaders(response);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode provider fallback headers are explicit on deterministic error paths", async () =>
  withEnv(
    {
      OPENAI_API_KEY: "openai-test-key-12345",
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postInterviewMode(
        buildJsonRequest({
          url: "http://localhost/api/interview-mode",
          body: JSON.stringify({
            companyId: "kungfu-ai",
            personaId: "unknown-persona",
            provider: "anthropic",
          }),
          ip: uniqueIp(),
        })
      );
      assert.equal(response.status, 400);
      assert.equal(response.headers.get("X-AI-Provider-Requested"), "anthropic");
      assert.equal(response.headers.get("X-AI-Provider"), "openai");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "1");
      assertRouteRateLimitLimitHeader(response, "interviewMode");
      assert.equal(response.headers.get("X-AI-Narrative-Source"), "fallback");
      assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_mode");
    }
  ));

test("interview-mode valid mode returns deterministic payload with no-provider fallback headers", async () =>
  withEnv(
    {
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
    },
    async () => {
      const response = await postInterviewMode(
        buildJsonRequest({
          url: "http://localhost/api/interview-mode",
          body: JSON.stringify({
            companyId: "kungfu-ai",
            personaId: "kungfu-cto",
            provider: "openai",
          }),
          ip: uniqueIp(),
        })
      );

      assert.equal(response.status, 200);
      assertStandardJsonSecurityHeaders(response);
      assertInterviewModeRateLimitHeaders(response);
      assert.equal(response.headers.get("X-AI-Provider-Requested"), "openai");
      assert.equal(response.headers.get("X-AI-Provider"), "none");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
      assert.equal(response.headers.get("X-AI-Narrative-Source"), "deterministic");
      assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "no_provider");

      const payload = (await response.json()) as {
        companyName: string;
        personaName: string;
        narrativeSource: string;
        deterministicNarrative: string;
        recommendations: Array<{ url: string; reason: string }>;
        requestId?: string;
      };
      assert.equal(payload.companyName, "KUNGFU.AI");
      assert.equal(payload.personaName, "Ron Green");
      assert.equal(payload.narrativeSource, "deterministic");
      assert.ok(payload.deterministicNarrative.length > 20);
      assert.ok(payload.recommendations.length > 0);
      assert.equal("requestId" in payload, false);
      for (const recommendation of payload.recommendations) {
        assert.match(recommendation.url, /^(\/(?!\/)|https:\/\/)/);
        assert.ok(recommendation.reason.length > 0);
      }
    }
  ));

test("interview-mode rate-limited responses emit rate_limited narrative fallback", async () => {
  const ip = uniqueIp();
  for (let index = 0; index < 40; index++) {
    const response = await postInterviewMode(
      buildJsonRequest({
        url: "http://localhost/api/interview-mode",
        body: "{}",
        ip,
      })
    );
    assert.equal(response.status, 400);
  }
  const rateLimitedResponse = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip,
    })
  );
  assert.equal(rateLimitedResponse.status, 429);
  assertStandardJsonSecurityHeaders(rateLimitedResponse);
  assertExhaustedRateLimitHeaders(rateLimitedResponse);
  assertRouteRateLimitLimitHeader(rateLimitedResponse, "interviewMode");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Narrative-Source"), "fallback");
  assert.equal(
    rateLimitedResponse.headers.get("X-AI-Narrative-Fallback"),
    "rate_limited"
  );
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider"), "none");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Fallback"), "none");
  const payload = await assertErrorPayloadRequestIdMatchesHeader(rateLimitedResponse);
  assert.equal(payload.error, "Rate limit exceeded. Please try again shortly.");
  assertRateLimitPayloadResetParity(payload, rateLimitedResponse);
});

test("interview-mode content-type validation keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentType: "text/plain",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
  const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
  assert.equal(payload.error, "Interview mode requests must use application/json.");
});

test("interview-mode multi-valued content-type keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json, text/plain",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode application plus-json media type remains valid and keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/vnd.api+json",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode json content-type with charset remains valid and keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json; charset=utf-8",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode missing content-type keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentType: "",
    })
  );

  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode non-numeric content-length keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "abc",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode unsafe-integer content-length keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "9007199254740992",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode invalid content-length keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "1",
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode oversized declared payload keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "999999",
    })
  );

  assert.equal(response.status, 413);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("interview-mode invalid UTF-8 payload keeps invalid_payload narrative fallback semantics", async () => {
  const response = await postInterviewMode(
    buildJsonRequest({
      url: "http://localhost/api/interview-mode",
      body: new Uint8Array([0xff, 0xfe, 0xfd]),
      ip: uniqueIp(),
    })
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-AI-Narrative-Source"), "none");
  assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_payload");
  assert.equal(response.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(response.headers.get("X-AI-Provider"), "none");
  assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
});

test("contact invalid payload and honeypot paths emit explicit delivery reasons", async () => {
  const invalidPayloadResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
    })
  );
  assert.equal(invalidPayloadResponse.status, 400);
  assertStandardJsonSecurityHeaders(invalidPayloadResponse);
  assertContactRateLimitHeaders(invalidPayloadResponse);
  assert.equal(invalidPayloadResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    invalidPayloadResponse.headers.get("X-Contact-Delivery-Reason"),
    "invalid_payload"
  );
  const invalidPayloadBody = await assertErrorPayloadRequestIdMatchesHeader(
    invalidPayloadResponse
  );
  assert.equal(
    invalidPayloadBody.error,
    "Please provide valid name, email, and message."
  );

  const emptyBodyResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "",
      ip: uniqueIp(),
    })
  );
  assert.equal(emptyBodyResponse.status, 400);
  assertStandardJsonSecurityHeaders(emptyBodyResponse);
  assertContactRateLimitHeaders(emptyBodyResponse);
  assert.equal(emptyBodyResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    emptyBodyResponse.headers.get("X-Contact-Delivery-Reason"),
    "invalid_payload"
  );

  const malformedJsonResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: '{"name":"Nick","email":"nick@example.com"',
      ip: uniqueIp(),
    })
  );
  assert.equal(malformedJsonResponse.status, 400);
  assertStandardJsonSecurityHeaders(malformedJsonResponse);
  assertContactRateLimitHeaders(malformedJsonResponse);
  assert.equal(malformedJsonResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    malformedJsonResponse.headers.get("X-Contact-Delivery-Reason"),
    "invalid_payload"
  );

  const honeypotResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: JSON.stringify({
        name: "Nick",
        email: "nick@example.com",
        subject: "Hello",
        message: "Testing",
        honeypot: "bot-filled",
      }),
      ip: uniqueIp(),
    })
  );
  assert.equal(honeypotResponse.status, 200);
  assertStandardJsonSecurityHeaders(honeypotResponse);
  assertContactRateLimitHeaders(honeypotResponse);
  assert.equal(honeypotResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    honeypotResponse.headers.get("X-Contact-Delivery-Reason"),
    "honeypot"
  );
  const honeypotPayload = (await honeypotResponse.json()) as {
    success: boolean;
    requestId?: string;
  };
  assert.equal(honeypotPayload.success, true);
  assert.equal("requestId" in honeypotPayload, false);
});

test("contact repeated requests decrement rate-limit remaining consistently", async () => {
  const ip = uniqueIp();
  const firstResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip,
    })
  );
  const secondResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip,
    })
  );

  assert.equal(firstResponse.status, 400);
  assert.equal(secondResponse.status, 400);
  assertContactRateLimitHeaders(firstResponse);
  assertContactRateLimitHeaders(secondResponse);
  assertRateLimitRemainingDecremented(firstResponse, secondResponse);
});

test("contact generates unique request ids across repeated requests", async () => {
  const payload = JSON.stringify({
    name: "Nick Wiley",
    email: "nick@example.com",
    subject: "Interview follow-up",
    message: "Would love to connect further.",
    honeypot: "",
  });
  const firstResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: payload,
      ip: uniqueIp(),
    })
  );
  const secondResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: payload,
      ip: uniqueIp(),
    })
  );
  const firstRequestId = assertRequestIdAndReturn(firstResponse);
  const secondRequestId = assertRequestIdAndReturn(secondResponse);
  assert.notEqual(firstRequestId, secondRequestId);
});

test("contact content-type validation keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentType: "text/plain",
    })
  );
  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
  const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
  assert.equal(payload.error, "Contact form requests must use application/json.");
});

test("contact multi-valued content-type keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json, text/plain",
    })
  );
  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact application plus-json media type remains valid and keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/vnd.api+json",
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact json content-type with charset remains valid and keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentType: "application/json; charset=utf-8",
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact missing content-type keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentType: "",
    })
  );
  assert.equal(response.status, 415);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact non-numeric content-length keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "abc",
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact unsafe-integer content-length keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "9007199254740992",
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact invalid content-length keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "1",
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact oversized declared payload keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: "{}",
      ip: uniqueIp(),
      contentLength: "999999",
    })
  );
  assert.equal(response.status, 413);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact invalid UTF-8 payload keeps explicit invalid_payload delivery reason", async () => {
  const response = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: new Uint8Array([0xff, 0xfe, 0xfd]),
      ip: uniqueIp(),
    })
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(response.headers.get("X-Contact-Delivery-Reason"), "invalid_payload");
});

test("contact valid submission without provider keeps provider_unconfigured delivery reason", async () =>
  withEnv(
    {
      RESEND_API_KEY: undefined,
      CONTACT_TO_EMAIL: undefined,
      CONTACT_FROM_EMAIL: undefined,
      CONTACT_REPLY_TO_EMAIL: undefined,
    },
    async () => {
      const response = await postContact(
        buildJsonRequest({
          url: "http://localhost/api/contact",
          body: JSON.stringify({
            name: "Nick Wiley",
            email: "nick@example.com",
            subject: "Interview follow-up",
            message: "Would love to connect further.",
            honeypot: "",
          }),
          ip: uniqueIp(),
        })
      );

      assert.equal(response.status, 200);
      assertStandardJsonSecurityHeaders(response);
      assertContactRateLimitHeaders(response);
      assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
      assert.equal(
        response.headers.get("X-Contact-Delivery-Reason"),
        "provider_unconfigured"
      );

      const payload = (await response.json()) as { success: boolean; message: string };
      assert.equal(payload.success, true);
      assert.equal(payload.message, "Thank you! Your message has been received.");
      assert.equal("requestId" in payload, false);
    }
  ));

test("contact provider delivery failures emit provider_error telemetry", async () =>
  withEnv(
    {
      RESEND_API_KEY: "re_test_key_123456789",
      CONTACT_EMAIL: "owner@example.com",
      CONTACT_FROM_EMAIL: "Portfolio Contact <onboarding@resend.dev>",
      CONTACT_REPLY_TO_EMAIL: undefined,
    },
    () =>
      withGlobalValue(
        "fetch",
        (async () =>
          new Response('{"error":"provider unavailable"}', {
            status: 503,
            headers: { "content-type": "application/json" },
          })) as typeof fetch,
        async () => {
          const response = await postContact(
            buildJsonRequest({
              url: "http://localhost/api/contact",
              body: JSON.stringify({
                name: "Nick Wiley",
                email: "nick@example.com",
                subject: "Interview follow-up",
                message: "Would love to connect further.",
                honeypot: "",
              }),
              ip: uniqueIp(),
            })
          );

          assert.equal(response.status, 502);
          assertStandardJsonSecurityHeaders(response);
          assertContactRateLimitHeaders(response);
          assert.equal(response.headers.get("X-Contact-Delivery"), "error");
          assert.equal(
            response.headers.get("X-Contact-Delivery-Reason"),
            "provider_error"
          );
          const payload = await assertErrorPayloadRequestIdMatchesHeader(response);
          assert.equal(
            payload.error,
            "Your message could not be delivered right now. Please try again shortly."
          );
        }
      )
  ));

test("contact rate-limited responses emit rate_limited delivery reason", async () => {
  const ip = uniqueIp();
  const requestPayload = JSON.stringify({
    name: "Nick",
    email: "nick@example.com",
    subject: "Hello",
    message: "Testing",
    honeypot: "",
  });
  for (let index = 0; index < 5; index++) {
    const response = await postContact(
      buildJsonRequest({
        url: "http://localhost/api/contact",
        body: requestPayload,
        ip,
      })
    );
    assert.equal(response.status, 200);
  }
  const rateLimitedResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: requestPayload,
      ip,
    })
  );
  assert.equal(rateLimitedResponse.status, 429);
  assertStandardJsonSecurityHeaders(rateLimitedResponse);
  assertExhaustedRateLimitHeaders(rateLimitedResponse);
  assertRouteRateLimitLimitHeader(rateLimitedResponse, "contact");
  assert.equal(rateLimitedResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    rateLimitedResponse.headers.get("X-Contact-Delivery-Reason"),
    "rate_limited"
  );
  const errorPayload = await assertErrorPayloadRequestIdMatchesHeader(
    rateLimitedResponse
  );
  assert.equal(errorPayload.error, "Too many submissions. Please try again later.");
  assertRateLimitPayloadResetParity(errorPayload, rateLimitedResponse);
});
