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

test("jsonResponse normalizes invalid status values to 500", () => {
  const response = jsonResponse({ ok: true }, 999);
  assert.equal(response.status, 500);
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
