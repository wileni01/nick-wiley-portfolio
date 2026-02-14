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

function buildJsonRequest(input: {
  url: string;
  body: string;
  ip?: string;
  contentType?: string;
}): Request {
  const headers = new Headers();
  if (input.contentType !== "") {
    headers.set("content-type", input.contentType ?? "application/json");
  }
  if (input.ip) {
    headers.set("x-forwarded-for", input.ip);
  }
  return new Request(input.url, {
    method: "POST",
    headers,
    body: input.body,
  });
}

function uniqueIp() {
  const octet = Math.floor(Math.random() * 200) + 20;
  return `198.51.100.${octet}`;
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
});

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
