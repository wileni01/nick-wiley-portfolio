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

function uniqueIp() {
  ipCounter += 1;
  const thirdOctet = Math.floor(ipCounter / 200) % 200;
  const fourthOctet = (ipCounter % 200) + 20;
  return `198.51.${thirdOctet}.${fourthOctet}`;
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
  assert.equal(rateLimitedResponse.headers.get("X-Chat-Context-Source"), "fallback");
  assert.equal(
    rateLimitedResponse.headers.get("X-Chat-Context-Fallback"),
    "rate_limited"
  );
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider"), "none");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Fallback"), "none");
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
      assert.equal(response.headers.get("X-Chat-Context-Source"), "fallback");
      assert.equal(response.headers.get("X-Chat-Context-Fallback"), "no_provider");
      assert.equal(response.headers.get("X-AI-Provider-Requested"), "openai");
      assert.equal(response.headers.get("X-AI-Provider"), "none");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");

      const payload = (await response.json()) as { error: string };
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
      assert.equal(response.headers.get("X-AI-Narrative-Source"), "fallback");
      assert.equal(response.headers.get("X-AI-Narrative-Fallback"), "invalid_mode");
      assert.equal(response.headers.get("X-AI-Provider"), "none");
      assert.equal(response.headers.get("X-AI-Provider-Fallback"), "none");
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
      };
      assert.equal(payload.companyName, "KUNGFU.AI");
      assert.equal(payload.personaName, "Ron Green");
      assert.equal(payload.narrativeSource, "deterministic");
      assert.ok(payload.deterministicNarrative.length > 20);
      assert.ok(payload.recommendations.length > 0);
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
  assert.equal(rateLimitedResponse.headers.get("X-AI-Narrative-Source"), "fallback");
  assert.equal(
    rateLimitedResponse.headers.get("X-AI-Narrative-Fallback"),
    "rate_limited"
  );
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Requested"), "unspecified");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider"), "none");
  assert.equal(rateLimitedResponse.headers.get("X-AI-Provider-Fallback"), "none");
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
  assert.equal(invalidPayloadResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    invalidPayloadResponse.headers.get("X-Contact-Delivery-Reason"),
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
  assert.equal(honeypotResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    honeypotResponse.headers.get("X-Contact-Delivery-Reason"),
    "honeypot"
  );
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
      assert.equal(response.headers.get("X-Contact-Delivery"), "skipped");
      assert.equal(
        response.headers.get("X-Contact-Delivery-Reason"),
        "provider_unconfigured"
      );

      const payload = (await response.json()) as { success: boolean; message: string };
      assert.equal(payload.success, true);
      assert.equal(payload.message, "Thank you! Your message has been received.");
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
          assert.equal(response.headers.get("X-Contact-Delivery"), "error");
          assert.equal(
            response.headers.get("X-Contact-Delivery-Reason"),
            "provider_error"
          );
          const payload = (await response.json()) as { error: string };
          assert.equal(
            payload.error,
            "Your message could not be delivered right now. Please try again shortly."
          );
        }
      )
  ));

test("contact rate-limited responses emit rate_limited delivery reason", async () => {
  const ip = uniqueIp();
  const payload = JSON.stringify({
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
        body: payload,
        ip,
      })
    );
    assert.equal(response.status, 200);
  }
  const rateLimitedResponse = await postContact(
    buildJsonRequest({
      url: "http://localhost/api/contact",
      body: payload,
      ip,
    })
  );
  assert.equal(rateLimitedResponse.status, 429);
  assert.equal(rateLimitedResponse.headers.get("X-Contact-Delivery"), "skipped");
  assert.equal(
    rateLimitedResponse.headers.get("X-Contact-Delivery-Reason"),
    "rate_limited"
  );
});
