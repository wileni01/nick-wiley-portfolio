import { z } from "zod";
import { normalizeRequestId } from "@/lib/request-id";
const UTF8_TEXT_DECODER = new TextDecoder("utf-8", { fatal: true });
const JSON_SERIALIZATION_FALLBACK_ERROR = "Internal response serialization error.";
const INVALID_CONTENT_LENGTH_ERROR = "Invalid Content-Length header.";
const JSON_MEDIA_TYPE_PATTERN =
  /^(?:application\/json|application\/[a-z0-9!#$&^_.+-]+\+json)(?:\s*;|$)/i;
const CONTENT_TYPE_MULTI_VALUE_SEPARATOR = ",";
const CONTENT_LENGTH_DIGITS_PATTERN = /^\d+$/;
const DEFAULT_JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const DEFAULT_CACHE_CONTROL = "no-store";
const DEFAULT_CONTENT_TYPE_OPTIONS = "nosniff";
const DEFAULT_ERROR_STATUS = 500;
const UTF8_BOM = "\uFEFF";

export interface ParseJsonRequestOptions {
  invalidJsonMessage?: string;
  invalidPayloadMessage?: string;
  invalidContentTypeMessage?: string;
  invalidContentLengthMessage?: string;
  emptyBodyMessage?: string;
  maxBytes?: number;
  maxChars?: number;
  tooLargeMessage?: string;
  responseHeaders?: HeadersInit;
  allowMissingContentType?: boolean;
}

type ParseJsonRequestResult<TSchema extends z.ZodTypeAny> =
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: Response };

interface ReadRequestBytesResult {
  success: boolean;
  bytes?: Uint8Array;
  tooLarge?: boolean;
}

function toHeaderValueString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return null;
  }
}

function setCustomHeaderSafely(
  target: Headers,
  key: unknown,
  value: unknown
): void {
  if (typeof key !== "string") return;
  const normalizedValue = toHeaderValueString(value);
  if (normalizedValue === null) return;
  try {
    target.set(key, normalizedValue);
  } catch {
    // Ignore malformed header names/values.
  }
}

function applyCustomHeadersSafely(
  target: Headers,
  headers: HeadersInit | undefined
): void {
  if (!headers) return;

  let iteratorFactory: (() => Iterator<unknown>) | undefined;
  try {
    iteratorFactory = (
      headers as { [Symbol.iterator]?: (() => Iterator<unknown>) | undefined }
    )[Symbol.iterator];
  } catch {
    iteratorFactory = undefined;
  }
  if (typeof iteratorFactory === "function") {
    try {
      for (const entry of headers as Iterable<unknown>) {
        let key: unknown;
        let value: unknown;
        try {
          [key, value] = entry as [unknown, unknown];
        } catch {
          continue;
        }
        setCustomHeaderSafely(target, key, value);
      }
      return;
    } catch {
      // Fall through to object-style parsing.
    }
  }

  let keys: string[];
  try {
    keys = Object.keys(headers as object);
  } catch {
    return;
  }
  for (const key of keys) {
    let value: unknown;
    try {
      value = (headers as Record<string, unknown>)[key];
    } catch {
      continue;
    }
    setCustomHeaderSafely(target, key, value);
  }
}

function readParseOption<T>(
  options: ParseJsonRequestOptions | undefined,
  key: keyof ParseJsonRequestOptions
): T | undefined {
  if (!options) return undefined;
  try {
    return options[key] as T | undefined;
  } catch {
    return undefined;
  }
}

async function readRequestBytes(
  req: Request,
  maxBytes: number | null
): Promise<ReadRequestBytesResult> {
  const stream = req.body;
  if (!stream) {
    return { success: true, bytes: new Uint8Array(0) };
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = stream.getReader();
  } catch {
    return { success: false };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      totalBytes += value.byteLength;
      if (maxBytes !== null && totalBytes > maxBytes) {
        await reader.cancel();
        return { success: false, tooLarge: true };
      }
      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancellation failures.
    }
    return { success: false };
  } finally {
    reader.releaseLock();
  }

  if (!chunks.length) {
    return { success: true, bytes: new Uint8Array(0) };
  }
  if (chunks.length === 1) {
    return { success: true, bytes: chunks[0] };
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { success: true, bytes: merged };
}

function parseDeclaredContentLength(headerValue: string | null): number | null {
  if (headerValue === null) return null;
  const normalized = headerValue.trim();
  if (!CONTENT_LENGTH_DIGITS_PATTERN.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed)) return Number.NaN;
  return parsed;
}

function normalizeHttpStatus(value: number): number {
  const normalized = Number.isFinite(value) ? Math.floor(value) : NaN;
  if (!Number.isFinite(normalized)) return DEFAULT_ERROR_STATUS;
  if (normalized < 100 || normalized > 599) return DEFAULT_ERROR_STATUS;
  return normalized;
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit
): Response {
  const requestedStatus = normalizeHttpStatus(status);
  const responseHeaders = new Headers({
    "Content-Type": DEFAULT_JSON_CONTENT_TYPE,
    "Cache-Control": DEFAULT_CACHE_CONTROL,
    "X-Content-Type-Options": DEFAULT_CONTENT_TYPE_OPTIONS,
  });
  applyCustomHeadersSafely(responseHeaders, headers);
  responseHeaders.set("Content-Type", DEFAULT_JSON_CONTENT_TYPE);
  responseHeaders.set("Cache-Control", DEFAULT_CACHE_CONTROL);
  responseHeaders.set("X-Content-Type-Options", DEFAULT_CONTENT_TYPE_OPTIONS);
  let requestId = normalizeRequestId(responseHeaders.get("X-Request-Id"));
  if (requestId) {
    responseHeaders.set("X-Request-Id", requestId);
  } else {
    responseHeaders.delete("X-Request-Id");
    const bodyRequestId = normalizeRequestId(body.requestId);
    if (bodyRequestId) {
      responseHeaders.set("X-Request-Id", bodyRequestId);
      requestId = bodyRequestId;
    }
  }
  const payloadBase = { ...body };
  if (Object.prototype.hasOwnProperty.call(payloadBase, "requestId")) {
    const normalizedBodyRequestId = normalizeRequestId(payloadBase.requestId);
    if (normalizedBodyRequestId) {
      payloadBase.requestId = normalizedBodyRequestId;
    } else {
      delete payloadBase.requestId;
    }
  }
  const payload =
    requestedStatus >= 400 && requestId
      ? { ...payloadBase, requestId }
      : payloadBase;
  let serializedPayload: string;
  let responseStatus = requestedStatus;
  try {
    serializedPayload = JSON.stringify(payload, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  } catch {
    responseStatus =
      requestedStatus >= 400 ? requestedStatus : DEFAULT_ERROR_STATUS;
    serializedPayload = JSON.stringify({
      error: JSON_SERIALIZATION_FALLBACK_ERROR,
      ...(requestId ? { requestId } : {}),
    });
  }

  return new Response(serializedPayload, {
    status: responseStatus,
    headers: responseHeaders,
  });
}

export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  req: Request,
  schema: TSchema,
  options?: ParseJsonRequestOptions
): Promise<ParseJsonRequestResult<TSchema>> {
  const invalidJsonMessage =
    readParseOption<string>(options, "invalidJsonMessage") ??
    "Invalid JSON payload.";
  const invalidPayloadMessage =
    readParseOption<string>(options, "invalidPayloadMessage") ??
    "Invalid request payload.";
  const invalidContentTypeMessage =
    readParseOption<string>(options, "invalidContentTypeMessage") ??
    "Content-Type must be application/json.";
  const invalidContentLengthMessage =
    readParseOption<string>(options, "invalidContentLengthMessage") ??
    INVALID_CONTENT_LENGTH_ERROR;
  const emptyBodyMessage =
    readParseOption<string>(options, "emptyBodyMessage") ??
    "Request body is required.";
  const tooLargeMessage =
    readParseOption<string>(options, "tooLargeMessage") ??
    "Request payload is too large.";
  const responseHeaders = readParseOption<HeadersInit>(options, "responseHeaders");
  const allowMissingContentType =
    readParseOption<boolean>(options, "allowMissingContentType") ?? true;
  const rawMaxBytes = readParseOption<number>(options, "maxBytes");
  const rawMaxChars = readParseOption<number>(options, "maxChars");
  const maxPayloadBytes = Number.isFinite(rawMaxBytes)
    ? Math.max(1, Math.floor(rawMaxBytes ?? 0))
    : Number.isFinite(rawMaxChars)
      ? Math.max(1, Math.floor(rawMaxChars ?? 0))
      : null;
  const maxChars = Number.isFinite(rawMaxChars)
    ? Math.max(1, Math.floor(rawMaxChars ?? 0))
    : null;
  const declaredContentLength = parseDeclaredContentLength(
    req.headers.get("content-length")
  );
  if (
    declaredContentLength !== null &&
    (!Number.isFinite(declaredContentLength) || declaredContentLength < 0)
  ) {
    return {
      success: false,
      response: jsonResponse(
        { error: invalidContentLengthMessage },
        400,
        responseHeaders
      ),
    };
  }
  const contentType = req.headers.get("content-type");
  if (contentType) {
    const normalizedContentType = contentType.trim();
    if (
      normalizedContentType.includes(CONTENT_TYPE_MULTI_VALUE_SEPARATOR) ||
      !JSON_MEDIA_TYPE_PATTERN.test(normalizedContentType)
    ) {
      return {
        success: false,
        response: jsonResponse(
          { error: invalidContentTypeMessage },
          415,
          responseHeaders
        ),
      };
    }
  } else if (!allowMissingContentType) {
    return {
      success: false,
      response: jsonResponse(
        { error: invalidContentTypeMessage },
        415,
        responseHeaders
      ),
    };
  }
  if (maxPayloadBytes !== null) {
    if (
      declaredContentLength !== null &&
      declaredContentLength > maxPayloadBytes
    ) {
      return {
        success: false,
        response: jsonResponse({ error: tooLargeMessage }, 413, responseHeaders),
      };
    }
  }

  const readResult = await readRequestBytes(req, maxPayloadBytes);
  if (!readResult.success) {
    if (readResult.tooLarge) {
      return {
        success: false,
        response: jsonResponse({ error: tooLargeMessage }, 413, responseHeaders),
      };
    }
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400, responseHeaders),
    };
  }
  const rawBytes = readResult.bytes ?? new Uint8Array(0);
  const rawTextBytesLength = rawBytes.byteLength;
  let rawText: string;
  try {
    rawText = UTF8_TEXT_DECODER.decode(rawBytes);
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400, responseHeaders),
    };
  }
  const bodyText = rawText.startsWith(UTF8_BOM) ? rawText.slice(1) : rawText;
  if (
    declaredContentLength !== null &&
    Number.isFinite(declaredContentLength) &&
    declaredContentLength !== rawTextBytesLength
  ) {
    return {
      success: false,
      response: jsonResponse(
        { error: invalidContentLengthMessage },
        400,
        responseHeaders
      ),
    };
  }
  if (!bodyText.trim()) {
    return {
      success: false,
      response: jsonResponse({ error: emptyBodyMessage }, 400, responseHeaders),
    };
  }
  if (maxChars !== null && bodyText.length > maxChars) {
    return {
      success: false,
      response: jsonResponse({ error: tooLargeMessage }, 413, responseHeaders),
    };
  }
  if (maxPayloadBytes !== null && rawTextBytesLength > maxPayloadBytes) {
    return {
      success: false,
      response: jsonResponse({ error: tooLargeMessage }, 413, responseHeaders),
    };
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(bodyText) as unknown;
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400, responseHeaders),
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      success: false,
      response: jsonResponse({ error: invalidPayloadMessage }, 400, responseHeaders),
    };
  }

  return { success: true, data: parsed.data };
}
