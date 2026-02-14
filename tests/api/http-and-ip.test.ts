import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { jsonResponse, parseJsonRequest } from "../../lib/api-http";
import { getRequestIp } from "../../lib/request-ip";

test("parseJsonRequest accepts UTF-8 BOM-prefixed JSON payloads", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: '\uFEFF{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    allowMissingContentType: false,
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.value, "ok");
  }
});

test("parseJsonRequest rejects multi-valued content-type headers", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json, text/plain",
    },
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    allowMissingContentType: false,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 415);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Content-Type must be application/json.");
  }
});

test("parseJsonRequest accepts structured +json content-type media types", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/vnd.api+json; charset=utf-8",
    },
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    allowMissingContentType: false,
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.value, "ok");
  }
});

test("parseJsonRequest rejects invalid content-length mismatch", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": "1",
    },
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 400);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Invalid Content-Length header.");
  }
});

test("parseJsonRequest rejects missing content-type when required", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    allowMissingContentType: false,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 415);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Content-Type must be application/json.");
  }
});

test("parseJsonRequest allows missing content-type by default", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    body: new Uint8Array(Buffer.from('{"value":"ok"}')),
  });

  const result = await parseJsonRequest(req, schema);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.value, "ok");
  }
});

test("parseJsonRequest rejects empty body with configured message", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "   ",
  });

  const result = await parseJsonRequest(req, schema, {
    emptyBodyMessage: "Body required for request.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 400);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Body required for request.");
  }
});

test("parseJsonRequest returns configured message for invalid JSON payloads", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"value":',
  });

  const result = await parseJsonRequest(req, schema, {
    invalidJsonMessage: "JSON body could not be parsed.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 400);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "JSON body could not be parsed.");
  }
});

test("parseJsonRequest rejects declared oversized payload before parse", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": "5000",
    },
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    maxBytes: 100,
    tooLargeMessage: "Payload too large for parser.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 413);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Payload too large for parser.");
  }
});

test("parseJsonRequest enforces maxChars on parsed text length", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"value":"abcdefghijklmnopqrstuvwxyz"}',
  });

  const result = await parseJsonRequest(req, schema, {
    maxChars: 10,
    tooLargeMessage: "Character limit exceeded.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 413);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Character limit exceeded.");
  }
});

test("parseJsonRequest enforces maxBytes when body exceeds limit after read", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: new Uint8Array(Buffer.from('{"value":"abcdefghijklmnopqrstuvwxyz"}')),
  });

  const result = await parseJsonRequest(req, schema, {
    maxBytes: 18,
    tooLargeMessage: "Byte limit exceeded.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 413);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Byte limit exceeded.");
  }
});

test("parseJsonRequest rejects non-safe integer content-length header values", async () => {
  const schema = z.object({ value: z.string() });
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": "9007199254740993",
    },
    body: '{"value":"ok"}',
  });

  const result = await parseJsonRequest(req, schema, {
    invalidContentLengthMessage: "Content length must be a safe integer.",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.response.status, 400);
    const body = (await result.response.json()) as { error: string };
    assert.equal(body.error, "Content length must be a safe integer.");
  }
});

test("jsonResponse enforces immutable JSON security headers", () => {
  const response = jsonResponse(
    { ok: true },
    200,
    {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "none",
    }
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
});

test("jsonResponse normalizes request-id and backfills it on error responses", async () => {
  const response = jsonResponse(
    {
      error: "bad request",
      requestId: "  bad\r\nid<script>  ",
    },
    400
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Request-Id"), "badidscript");
  const body = (await response.json()) as { error: string; requestId?: string };
  assert.equal(body.error, "bad request");
  assert.equal(body.requestId, "badidscript");
});

test("jsonResponse uses normalized request-id header over body on error responses", async () => {
  const response = jsonResponse(
    {
      error: "bad request",
      requestId: " body-id ",
    },
    400,
    {
      "x-request-id": " header id ",
    }
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("X-Request-Id"), "headerid");
  const body = (await response.json()) as { requestId?: string };
  assert.equal(body.requestId, "headerid");
});

test("jsonResponse drops invalid request-id from successful payloads", async () => {
  const response = jsonResponse(
    { ok: true, requestId: "   " },
    200
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Request-Id"), null);
  const body = (await response.json()) as { ok: boolean; requestId?: string };
  assert.equal(body.ok, true);
  assert.equal(Object.prototype.hasOwnProperty.call(body, "requestId"), false);
});

test("jsonResponse normalizes invalid status values to 500", () => {
  const response = jsonResponse({ ok: true }, 999);
  assert.equal(response.status, 500);
});

test("jsonResponse serializes BigInt values as strings", async () => {
  const response = jsonResponse({ total: 42n, nested: { count: 7n } }, 200);

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    total: string;
    nested: { count: string };
  };
  assert.deepEqual(body, {
    total: "42",
    nested: { count: "7" },
  });
});

test("jsonResponse promotes success status to 500 on serialization failure", async () => {
  const circular = {} as Record<string, unknown>;
  circular.self = circular;

  const response = jsonResponse(
    { ok: true, circular, requestId: " req\r\nid " },
    200
  );

  assert.equal(response.status, 500);
  assert.equal(response.headers.get("X-Request-Id"), "reqid");
  const body = (await response.json()) as { error: string; requestId?: string };
  assert.equal(body.error, "Internal response serialization error.");
  assert.equal(body.requestId, "reqid");
});

test("getRequestIp prefers first valid x-forwarded-for token", () => {
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "unknown, [2001:db8::1]:443, 198.51.100.10",
      forwarded: 'for=198.51.100.11',
      "x-real-ip": "198.51.100.12",
    },
  });

  assert.equal(getRequestIp(req), "2001:db8::1");
});

test("getRequestIp falls back to standardized forwarded and direct headers", () => {
  const forwardedReq = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "unknown, bad-token",
      forwarded: 'proto=https;for="[2001:db8::3%eth0]:443"',
    },
  });
  assert.equal(getRequestIp(forwardedReq), "2001:db8::3");

  const directReq = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "unknown, bad-token",
      "x-real-ip": "198.51.100.22:8443",
    },
  });
  assert.equal(getRequestIp(directReq), "198.51.100.22");
});

test("getRequestIp returns anonymous when no valid headers exist", () => {
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "not-an-ip, unknown",
      forwarded: "for=invalid-hostname",
    },
  });
  assert.equal(getRequestIp(req), "anonymous");
});

test("getRequestIp falls back through direct proxy header candidates", () => {
  const req = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "unknown",
      forwarded: "for=invalid-hostname",
      "cf-connecting-ip": "invalid",
      "fly-client-ip": "\"198.51.100.30:443\"",
      "true-client-ip": "198.51.100.31",
      "x-client-ip": "198.51.100.32",
      "x-real-ip": "198.51.100.33",
    },
  });

  assert.equal(getRequestIp(req), "198.51.100.30");
});
