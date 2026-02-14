import assert from "node:assert/strict";
import test from "node:test";

import {
  logServerError,
  logServerInfo,
  logServerWarning,
  serializeServerError,
} from "../../lib/server-error";
import {
  applyDefaultAIProviderHeaders,
  applyResolvedAIProviderHeaders,
  resolveAIProvider,
} from "../../lib/ai";
import { deliverContactSubmission } from "../../lib/contact-delivery";

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

test("serializeServerError normalizes unknown and Error inputs", () => {
  assert.deepEqual(serializeServerError(new Error("boom")), {
    name: "Error",
    message: "boom",
  });
  assert.deepEqual(serializeServerError({ bad: true }), {
    name: "UnknownError",
    message: "[object Object]",
  });
});

test("serializeServerError strips control/bidi chars and enforces length bounds", () => {
  const oversizedMessage = `\u0000\u202E${"m".repeat(1400)}`;
  const error = new Error(oversizedMessage);
  error.name = `\u0007\u202D${"n".repeat(300)}`;

  const serialized = serializeServerError(error);
  assert.equal(serialized.name.length, 240);
  assert.equal(serialized.message.length, 1200);
  assert.equal(serialized.name.includes("\u202D"), false);
  assert.equal(serialized.message.includes("\u202E"), false);
  assert.equal(serialized.name.includes("\u0007"), false);
  assert.equal(serialized.message.includes("\u0000"), false);
});

test("server log helpers sanitize route/request/message and redact details", () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const captured: Array<{ level: string; args: unknown[] }> = [];

  console.error = (...args: unknown[]) => {
    captured.push({ level: "error", args });
  };
  console.warn = (...args: unknown[]) => {
    captured.push({ level: "warn", args });
  };
  console.info = (...args: unknown[]) => {
    captured.push({ level: "info", args });
  };

  const circularDetails: Record<string, unknown> = {};
  circularDetails.self = circularDetails;

  try {
    logServerError({
      route: " api/chat\u202E<script> ",
      requestId: " req\r\nid<script> ",
      error: new Error("failed"),
      details: {
        apiKey: "super-secret",
        nested: {
          authorization: "Bearer token",
          ok: "value",
        },
        circular: circularDetails,
      },
    });
    logServerWarning({
      route: "api/contact",
      requestId: "warn-id",
      message: "warn\u0000message",
      details: { token: "hidden" },
    });
    logServerInfo({
      route: "api/interview-mode",
      requestId: "info-id",
      message: "info\u0007message",
      details: { cookie: "hidden" },
    });
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
  }

  assert.equal(captured.length, 3);

  const errorEntry = captured.find((entry) => entry.level === "error");
  assert.ok(errorEntry);
  assert.equal(errorEntry.args[0], "api/chatscript error");
  const errorPayload = errorEntry.args[1] as {
    requestId: string;
    details: {
      apiKey: string;
      nested: { authorization: string; ok: string };
      circular: { self: string };
    };
  };
  assert.equal(errorPayload.requestId, "reqidscript");
  assert.equal(errorPayload.details.apiKey, "[redacted]");
  assert.equal(errorPayload.details.nested.authorization, "[redacted]");
  assert.equal(errorPayload.details.nested.ok, "value");
  assert.equal(errorPayload.details.circular.self, "[circular]");

  const warningEntry = captured.find((entry) => entry.level === "warn");
  assert.ok(warningEntry);
  assert.equal(warningEntry.args[0], "api/contact warning");
  const warningPayload = warningEntry.args[1] as {
    message: string;
    details: { token: string };
  };
  assert.equal(warningPayload.message, "warnmessage");
  assert.equal(warningPayload.details.token, "[redacted]");

  const infoEntry = captured.find((entry) => entry.level === "info");
  assert.ok(infoEntry);
  assert.equal(infoEntry.args[0], "api/interview-mode info");
  const infoPayload = infoEntry.args[1] as {
    message: string;
    details: { cookie: string };
  };
  assert.equal(infoPayload.message, "infomessage");
  assert.equal(infoPayload.details.cookie, "[redacted]");
});

test("server log helpers bound nested detail depth, key count, and array length", () => {
  const originalInfo = console.info;
  const captured: Array<{ args: unknown[] }> = [];
  console.info = (...args: unknown[]) => {
    captured.push({ args });
  };

  const details: Record<string, unknown> = {};
  details.big = 123n;
  details.timestamp = new Date("2024-01-01T00:00:00.000Z");
  details.invalidTimestamp = new Date("invalid");
  details.list = Array.from({ length: 25 }, (_, index) => ({
    item: index,
    nested: { tooDeep: true },
  }));
  details.nested = {
    child: {
      deepObject: { value: "ignored" },
      deepArray: [1, 2, 3],
    },
  };
  for (let index = 0; index < 25; index += 1) {
    details[`overflow${index}`] = index;
  }

  try {
    logServerInfo({
      route: "api/interview-mode",
      requestId: "info-depth-test",
      message: "bounded details",
      details,
    });
  } finally {
    console.info = originalInfo;
  }

  assert.equal(captured.length, 1);
  const payload = captured[0]?.args[1] as {
    details?: Record<string, unknown>;
  };
  assert.ok(payload.details);
  const serializedDetails = payload.details as Record<string, unknown>;

  assert.equal(Object.keys(serializedDetails).length, 20);
  assert.equal("overflow17" in serializedDetails, false);
  assert.equal(serializedDetails.big, "123");
  assert.equal(serializedDetails.timestamp, "2024-01-01T00:00:00.000Z");
  assert.equal(serializedDetails.invalidTimestamp, "[invalid-date]");

  const list = serializedDetails.list as unknown[];
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 20);
  assert.equal(list[0], "[object]");

  const nested = serializedDetails.nested as Record<string, unknown>;
  assert.equal(Object.getPrototypeOf(nested), null);
  assert.equal(nested.child, "[object]");
});

test("server log helpers fall back route/request labels and omit non-object details", () => {
  const originalWarn = console.warn;
  const captured: Array<{ args: unknown[] }> = [];
  console.warn = (...args: unknown[]) => {
    captured.push({ args });
  };

  const longWarning = `prefix\u0000\u202E${"x".repeat(320)}`;
  try {
    logServerWarning({
      route: "\u0000 ### *** ",
      requestId: "\u0000 *** ",
      message: longWarning,
      details: [] as unknown as Record<string, unknown>,
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(captured.length, 1);
  assert.equal(captured[0]?.args[0], "server warning");
  const payload = captured[0]?.args[1] as {
    requestId: string;
    message: string;
    details?: unknown;
  };
  assert.equal(payload.requestId, "unknown-request");
  assert.equal(payload.message.startsWith("prefix"), true);
  assert.equal(payload.message.length, 240);
  assert.equal("details" in payload, false);
});

test("server log helpers keep prototype-safe detail objects for special keys", () => {
  const originalInfo = console.info;
  const captured: Array<{ args: unknown[] }> = [];
  console.info = (...args: unknown[]) => {
    captured.push({ args });
  };

  const details: Record<string, unknown> = {};
  Object.defineProperty(details, "__proto__", {
    value: { polluted: "yes" },
    enumerable: true,
    configurable: true,
  });
  details.safe = "ok";

  try {
    logServerInfo({
      route: "api/chat",
      requestId: "proto-safe",
      message: "prototype safety",
      details,
    });
  } finally {
    console.info = originalInfo;
  }

  assert.equal(({} as { polluted?: string }).polluted, undefined);
  assert.equal(captured.length, 1);
  const payload = captured[0]?.args[1] as {
    details?: Record<string, unknown>;
  };
  assert.ok(payload.details);
  const serializedDetails = payload.details as Record<string, unknown>;
  assert.equal(Object.getPrototypeOf(serializedDetails), null);
  assert.equal(Object.prototype.hasOwnProperty.call(serializedDetails, "__proto__"), true);
  const protoPayload = serializedDetails["__proto__"] as Record<string, unknown>;
  assert.equal(Object.getPrototypeOf(protoPayload), null);
  assert.equal(protoPayload.polluted, "yes");
  assert.equal(serializedDetails.safe, "ok");
});

test("resolveAIProvider honors available keys and fallback behavior", () =>
  withEnv(
    {
      OPENAI_API_KEY: " openai-test-key-12345 ",
      ANTHROPIC_API_KEY: undefined,
    },
    () => {
      assert.deepEqual(resolveAIProvider("openai"), {
        requested: "openai",
        selected: "openai",
        didFallback: false,
      });
      assert.deepEqual(resolveAIProvider("anthropic"), {
        requested: "anthropic",
        selected: "openai",
        didFallback: true,
      });
    }
  ));

test("resolveAIProvider ignores short/blank keys and can return none", () =>
  withEnv(
    {
      OPENAI_API_KEY: " short ",
      ANTHROPIC_API_KEY: "   ",
    },
    () => {
      assert.deepEqual(resolveAIProvider("openai"), {
        requested: "openai",
        selected: null,
        didFallback: false,
      });
    }
  ));

test("applyResolvedAIProviderHeaders always emits fallback header", () => {
  const noProviderHeaders = applyResolvedAIProviderHeaders(new Headers(), {
    requested: "openai",
    selected: null,
    didFallback: false,
  });
  assert.equal(noProviderHeaders.get("X-AI-Provider-Requested"), "openai");
  assert.equal(noProviderHeaders.get("X-AI-Provider"), "none");
  assert.equal(noProviderHeaders.get("X-AI-Provider-Fallback"), "none");

  const fallbackHeaders = applyResolvedAIProviderHeaders(new Headers(), {
    requested: "anthropic",
    selected: "openai",
    didFallback: true,
  });
  assert.equal(fallbackHeaders.get("X-AI-Provider-Requested"), "anthropic");
  assert.equal(fallbackHeaders.get("X-AI-Provider"), "openai");
  assert.equal(fallbackHeaders.get("X-AI-Provider-Fallback"), "1");
});

test("applyResolvedAIProviderHeaders marks non-fallback selected provider explicitly", () => {
  const headers = applyResolvedAIProviderHeaders(new Headers(), {
    requested: "openai",
    selected: "openai",
    didFallback: false,
  });

  assert.equal(headers.get("X-AI-Provider-Requested"), "openai");
  assert.equal(headers.get("X-AI-Provider"), "openai");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "none");
});

test("applyDefaultAIProviderHeaders seeds unspecified provider observability state", () => {
  const headers = applyDefaultAIProviderHeaders(new Headers());
  assert.equal(headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(headers.get("X-AI-Provider"), "none");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "none");
});

test("applyDefaultAIProviderHeaders resets prior provider header values", () => {
  const headers = new Headers({
    "X-AI-Provider-Requested": "anthropic",
    "X-AI-Provider": "openai",
    "X-AI-Provider-Fallback": "1",
  });

  const result = applyDefaultAIProviderHeaders(headers);

  assert.equal(result, headers);
  assert.equal(headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(headers.get("X-AI-Provider"), "none");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "none");
});

test("applyDefaultAIProviderHeaders preserves unrelated headers", () => {
  const headers = new Headers({
    "X-Custom-Header": "keep-me",
  });

  applyDefaultAIProviderHeaders(headers);

  assert.equal(headers.get("X-Custom-Header"), "keep-me");
  assert.equal(headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(headers.get("X-AI-Provider"), "none");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "none");
});

test("applyResolvedAIProviderHeaders overrides default provider header state", () => {
  const headers = new Headers({ "X-Custom-Header": "keep" });
  applyDefaultAIProviderHeaders(headers);
  applyResolvedAIProviderHeaders(headers, {
    requested: "anthropic",
    selected: "openai",
    didFallback: true,
  });

  assert.equal(headers.get("X-Custom-Header"), "keep");
  assert.equal(headers.get("X-AI-Provider-Requested"), "anthropic");
  assert.equal(headers.get("X-AI-Provider"), "openai");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "1");
});

test("applyResolvedAIProviderHeaders clears stale provider values when none selected", () => {
  const headers = new Headers({
    "X-AI-Provider-Requested": "openai",
    "X-AI-Provider": "openai",
    "X-AI-Provider-Fallback": "1",
    "X-Custom-Header": "keep",
  });

  applyResolvedAIProviderHeaders(headers, {
    requested: "anthropic",
    selected: null,
    didFallback: false,
  });

  assert.equal(headers.get("X-Custom-Header"), "keep");
  assert.equal(headers.get("X-AI-Provider-Requested"), "anthropic");
  assert.equal(headers.get("X-AI-Provider"), "none");
  assert.equal(headers.get("X-AI-Provider-Fallback"), "none");
});

test("deliverContactSubmission skips delivery when provider config is invalid", async () =>
  withEnv(
    {
      RESEND_API_KEY: undefined,
      CONTACT_EMAIL: "invalid-email",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      let fetchCalled = false;
      globalThis.fetch = (async () => {
        fetchCalled = true;
        return new Response("", { status: 200 });
      }) as typeof fetch;
      try {
        const result = await deliverContactSubmission({
          name: "A",
          email: "a@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(fetchCalled, false);
        assert.deepEqual(result, { attempted: false, delivered: false });
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission sanitizes outgoing payload and redacts provider errors", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: "Display\r\nName <from@example.com>",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      const fetchCalls: Array<{ url: string; init: RequestInit }> = [];
      globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
        fetchCalls.push({ url: String(url), init: init ?? {} });
        if (fetchCalls.length === 1) {
          return new Response("", { status: 200 });
        }
        return new Response("failed for user@example.com", { status: 500 });
      }) as typeof fetch;

      try {
        const success = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "Hello\r\nWorld",
          message: "Testing",
        });
        assert.equal(success.attempted, true);
        assert.equal(success.delivered, true);
        assert.equal(success.error, undefined);

        const firstCall = fetchCalls[0];
        assert.ok(firstCall);
        assert.equal(firstCall.url, "https://api.resend.com/emails");
        const headers = firstCall.init.headers as Record<string, string>;
        assert.equal(headers.Authorization, "Bearer resend-api-key-12345");
        assert.equal(headers["Content-Type"], "application/json");
        const payload = JSON.parse(String(firstCall.init.body)) as {
          from: string;
          to: string[];
          subject: string;
          reply_to?: string;
        };
        assert.equal(payload.from, "Display  Name <from@example.com>");
        assert.deepEqual(payload.to, ["team@example.com"]);
        assert.equal(payload.subject, "Portfolio Contact: Hello World");
        assert.equal(payload.reply_to, "nick@example.com");

        const failure = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "retry",
          message: "again",
        });
        assert.equal(failure.attempted, true);
        assert.equal(failure.delivered, false);
        assert.ok(failure.error?.includes("Resend delivery failed (500):"));
        assert.ok(failure.error?.includes("us***@example.com"));
        assert.equal(failure.error?.includes("user@example.com"), false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission truncates oversized provider errors and redacts emails", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      const oversizedProviderBody = `${"x".repeat(420)} person@example.com ${"y".repeat(420)}`;
      globalThis.fetch = (async () =>
        new Response(oversizedProviderBody, { status: 502 })) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, false);
        assert.ok(result.error?.startsWith("Resend delivery failed (502): "));
        assert.equal(result.error?.includes("person@example.com"), false);
        assert.ok(result.error?.includes("pe***@example.com"));
        assert.ok((result.error?.length ?? 0) < 560);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission redacts emails embedded within contiguous provider error text", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () =>
        new Response("prefixperson@example.comsuffix", {
          status: 500,
          headers: { "content-type": "text/plain" },
        })) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, false);
        assert.ok(result.error?.startsWith("Resend delivery failed (500): "));
        assert.equal(result.error?.includes("person@example.com"), false);
        assert.ok(result.error?.includes("***@example.com"));
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission normalizes fallback sender and omits invalid reply-to", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: "invalid from header",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      let capturedBody: Record<string, unknown> | null = null;
      globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
        capturedBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        return new Response("", { status: 200 });
      }) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "not-an-email",
          subject: "   ",
          message: "Test",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, true);
        assert.ok(capturedBody);
        assert.equal(
          capturedBody?.from,
          "Portfolio Contact <onboarding@resend.dev>"
        );
        assert.equal(capturedBody?.subject, "Portfolio Contact: New message");
        assert.equal("reply_to" in (capturedBody ?? {}), false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission classifies abort-like and timeout errors as timeout", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      for (const errorName of ["AbortError", "TimeoutError"] as const) {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async () => {
          const timeoutError = new Error(`request failed: ${errorName}`);
          timeoutError.name = errorName;
          throw timeoutError;
        }) as typeof fetch;

        try {
          const result = await deliverContactSubmission({
            name: "Nick",
            email: "nick@example.com",
            subject: "hello",
            message: "world",
          });
          assert.equal(result.attempted, true);
          assert.equal(result.delivered, false);
          assert.ok(
            result.error?.includes("Resend request timed out after 8000ms")
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    }
  ));

test("deliverContactSubmission redacts emails in thrown request errors", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () => {
        throw new Error(
          "network failure for person@example.com and teammate@test.io"
        );
      }) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, false);
        assert.ok(result.error?.startsWith("Resend request error:"));
        assert.ok(result.error?.includes("pe***@example.com"));
        assert.ok(result.error?.includes("te***@test.io"));
        assert.equal(result.error?.includes("person@example.com"), false);
        assert.equal(result.error?.includes("teammate@test.io"), false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission uses unknown-delivery fallback for non-Error throws", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () => {
        throw "unexpected failure";
      }) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, false);
        assert.equal(
          result.error,
          "Resend request error: unknown delivery error"
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));

test("deliverContactSubmission uses unknown-error fallback when provider returns empty body", async () =>
  withEnv(
    {
      RESEND_API_KEY: "resend-api-key-12345",
      CONTACT_EMAIL: "team@example.com",
      CONTACT_FROM_EMAIL: undefined,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () =>
        new Response("", {
          status: 502,
          headers: { "content-type": "text/plain" },
        })) as typeof fetch;

      try {
        const result = await deliverContactSubmission({
          name: "Nick",
          email: "nick@example.com",
          subject: "hello",
          message: "world",
        });
        assert.equal(result.attempted, true);
        assert.equal(result.delivered, false);
        assert.equal(
          result.error,
          "Resend delivery failed (502): unknown error"
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  ));
