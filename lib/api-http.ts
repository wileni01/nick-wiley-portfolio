import { z } from "zod";
const UTF8_TEXT_ENCODER = new TextEncoder();
const JSON_SERIALIZATION_FALLBACK_ERROR = "Internal response serialization error.";
const INVALID_CONTENT_LENGTH_ERROR = "Invalid Content-Length header.";
const JSON_MEDIA_TYPE_PATTERN = /^application\/json(?:\s*;|$)/i;
const CONTENT_LENGTH_DIGITS_PATTERN = /^\d+$/;

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

function parseDeclaredContentLength(headerValue: string | null): number | null {
  if (headerValue === null) return null;
  const normalized = headerValue.trim();
  if (!CONTENT_LENGTH_DIGITS_PATTERN.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed)) return Number.NaN;
  return parsed;
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit
): Response {
  const responseHeaders = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (headers) {
    const customHeaders = new Headers(headers);
    customHeaders.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
  }
  const requestId = responseHeaders.get("X-Request-Id");
  const payload =
    status >= 400 && requestId && body.requestId === undefined
      ? { ...body, requestId }
      : body;
  let serializedPayload: string;
  let responseStatus = status;
  try {
    serializedPayload = JSON.stringify(payload, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  } catch {
    responseStatus = status >= 400 ? status : 500;
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
  const invalidJsonMessage = options?.invalidJsonMessage ?? "Invalid JSON payload.";
  const invalidPayloadMessage =
    options?.invalidPayloadMessage ?? "Invalid request payload.";
  const invalidContentTypeMessage =
    options?.invalidContentTypeMessage ?? "Content-Type must be application/json.";
  const invalidContentLengthMessage =
    options?.invalidContentLengthMessage ?? INVALID_CONTENT_LENGTH_ERROR;
  const emptyBodyMessage = options?.emptyBodyMessage ?? "Request body is required.";
  const tooLargeMessage =
    options?.tooLargeMessage ?? "Request payload is too large.";
  const responseHeaders = options?.responseHeaders;
  const allowMissingContentType = options?.allowMissingContentType ?? true;
  const maxPayloadBytes = Number.isFinite(options?.maxBytes)
    ? Math.max(1, Math.floor(options?.maxBytes ?? 0))
    : Number.isFinite(options?.maxChars)
      ? Math.max(1, Math.floor(options?.maxChars ?? 0))
      : null;
  const maxChars = Number.isFinite(options?.maxChars)
    ? Math.max(1, Math.floor(options?.maxChars ?? 0))
    : null;
  let declaredContentLength: number | null = null;
  const contentType = req.headers.get("content-type");
  if (contentType) {
    const normalizedContentType = contentType.trim();
    if (!JSON_MEDIA_TYPE_PATTERN.test(normalizedContentType)) {
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
    declaredContentLength = parseDeclaredContentLength(req.headers.get("content-length"));
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

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400, responseHeaders),
    };
  }
  const rawTextBytesLength = UTF8_TEXT_ENCODER.encode(rawText).length;
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
  if (!rawText.trim()) {
    return {
      success: false,
      response: jsonResponse({ error: emptyBodyMessage }, 400, responseHeaders),
    };
  }
  if (maxChars !== null && rawText.length > maxChars) {
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
    rawBody = JSON.parse(rawText) as unknown;
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
