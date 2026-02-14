import { normalizeRequestId } from "@/lib/request-id";

const ERROR_MESSAGE_MAX_CHARS = 1200;
const LOG_MESSAGE_MAX_CHARS = 240;
const LOG_ROUTE_MAX_CHARS = 80;
const LOG_REQUEST_ID_MAX_CHARS = 120;
const LOG_DETAILS_MAX_KEYS = 20;
const LOG_DETAILS_MAX_DEPTH = 2;
const LOG_DETAILS_MAX_ARRAY_ITEMS = 20;
const SAFE_LOG_ROUTE_PATTERN = /[^a-zA-Z0-9/_:-]/g;
const SAFE_LOG_REQUEST_ID_PATTERN = /[^a-zA-Z0-9._:-]/g;
const SENSITIVE_LOG_KEY_PATTERN =
  /(password|passphrase|secret|token|api[-_]?key|authorization|cookie|set-cookie)/i;
const REDACTED_LOG_VALUE = "[redacted]";
const CIRCULAR_LOG_VALUE = "[circular]";
const INVALID_DATE_LOG_VALUE = "[invalid-date]";
const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const BIDI_OVERRIDE_PATTERN = /[\u202A-\u202E\u2066-\u2069]/g;

export interface SerializedServerError {
  name: string;
  message: string;
}

function sanitizeLogString(input: string, maxChars: number): string {
  return input
    .replace(CONTROL_CHARS_PATTERN, "")
    .replace(BIDI_OVERRIDE_PATTERN, "")
    .trim()
    .slice(0, maxChars);
}

function sanitizeRouteLabel(route: string): string {
  const normalized = sanitizeLogString(route, LOG_ROUTE_MAX_CHARS).replace(
    SAFE_LOG_ROUTE_PATTERN,
    ""
  );
  return normalized || "server";
}

function sanitizeRequestIdLabel(requestId: string): string {
  const normalized = normalizeRequestId(
    sanitizeLogString(requestId, LOG_REQUEST_ID_MAX_CHARS).replace(
      SAFE_LOG_REQUEST_ID_PATTERN,
      ""
    ),
    LOG_REQUEST_ID_MAX_CHARS
  );
  return normalized || "unknown-request";
}

export function serializeServerError(error: unknown): SerializedServerError {
  if (error instanceof Error) {
    return {
      name: sanitizeLogString(error.name || "Error", LOG_MESSAGE_MAX_CHARS),
      message: sanitizeLogString(error.message, ERROR_MESSAGE_MAX_CHARS),
    };
  }

  return {
    name: "UnknownError",
    message: sanitizeLogString(String(error), ERROR_MESSAGE_MAX_CHARS),
  };
}

interface ServerLogBaseInput {
  route: string;
  requestId: string;
  details?: Record<string, unknown>;
}

interface ServerErrorLogInput extends ServerLogBaseInput {
  error: unknown;
}

interface ServerWarningLogInput extends ServerLogBaseInput {
  message: string;
}

interface ServerInfoLogInput extends ServerLogBaseInput {
  message: string;
}

function sanitizeLogValue(
  value: unknown,
  depth: number,
  seen: WeakSet<object>
): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return sanitizeLogString(value, ERROR_MESSAGE_MAX_CHARS);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return INVALID_DATE_LOG_VALUE;
    try {
      return value.toISOString();
    } catch {
      return INVALID_DATE_LOG_VALUE;
    }
  }
  if (value instanceof Error) {
    return serializeServerError(value);
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return CIRCULAR_LOG_VALUE;
    if (depth >= LOG_DETAILS_MAX_DEPTH) {
      return `[array:${value.length}]`;
    }
    seen.add(value);
    try {
      return value
        .slice(0, LOG_DETAILS_MAX_ARRAY_ITEMS)
        .map((item) => sanitizeLogValue(item, depth + 1, seen));
    } finally {
      seen.delete(value);
    }
  }
  if (typeof value === "object") {
    if (seen.has(value)) return CIRCULAR_LOG_VALUE;
    if (depth >= LOG_DETAILS_MAX_DEPTH) {
      return "[object]";
    }
    seen.add(value);
    try {
      const entries = Object.entries(value as Record<string, unknown>).slice(
        0,
        LOG_DETAILS_MAX_KEYS
      );
      const sanitizedObject: Record<string, unknown> = {};
      for (const [key, nestedValue] of entries) {
        sanitizedObject[key] = SENSITIVE_LOG_KEY_PATTERN.test(key)
          ? REDACTED_LOG_VALUE
          : sanitizeLogValue(nestedValue, depth + 1, seen);
      }
      return sanitizedObject;
    } finally {
      seen.delete(value);
    }
  }
  return sanitizeLogString(String(value), ERROR_MESSAGE_MAX_CHARS);
}

function sanitizeLogDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const sanitized = sanitizeLogValue(details, 0, new WeakSet());
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return undefined;
  }
  return sanitized as Record<string, unknown>;
}

export function logServerError(input: ServerErrorLogInput) {
  const sanitizedDetails = sanitizeLogDetails(input.details);
  const route = sanitizeRouteLabel(input.route);
  console.error(`${route} error`, {
    requestId: sanitizeRequestIdLabel(input.requestId),
    error: serializeServerError(input.error),
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  });
}

export function logServerWarning(input: ServerWarningLogInput) {
  const sanitizedDetails = sanitizeLogDetails(input.details);
  const route = sanitizeRouteLabel(input.route);
  console.warn(`${route} warning`, {
    requestId: sanitizeRequestIdLabel(input.requestId),
    message: sanitizeLogString(input.message, LOG_MESSAGE_MAX_CHARS),
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  });
}

export function logServerInfo(input: ServerInfoLogInput) {
  const sanitizedDetails = sanitizeLogDetails(input.details);
  const route = sanitizeRouteLabel(input.route);
  console.info(`${route} info`, {
    requestId: sanitizeRequestIdLabel(input.requestId),
    message: sanitizeLogString(input.message, LOG_MESSAGE_MAX_CHARS),
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  });
}
