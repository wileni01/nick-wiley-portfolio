const ERROR_MESSAGE_MAX_CHARS = 1200;
const LOG_MESSAGE_MAX_CHARS = 240;
const LOG_DETAILS_MAX_KEYS = 20;
const LOG_DETAILS_MAX_DEPTH = 2;
const LOG_DETAILS_MAX_ARRAY_ITEMS = 20;
const SENSITIVE_LOG_KEY_PATTERN =
  /(password|passphrase|secret|token|api[-_]?key|authorization|cookie|set-cookie)/i;
const REDACTED_LOG_VALUE = "[redacted]";

export interface SerializedServerError {
  name: string;
  message: string;
}

export function serializeServerError(error: unknown): SerializedServerError {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message.slice(0, ERROR_MESSAGE_MAX_CHARS),
    };
  }

  return {
    name: "UnknownError",
    message: String(error).slice(0, ERROR_MESSAGE_MAX_CHARS),
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

function sanitizeLogValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.slice(0, ERROR_MESSAGE_MAX_CHARS);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Error) {
    return serializeServerError(value);
  }
  if (Array.isArray(value)) {
    if (depth >= LOG_DETAILS_MAX_DEPTH) {
      return `[array:${value.length}]`;
    }
    return value
      .slice(0, LOG_DETAILS_MAX_ARRAY_ITEMS)
      .map((item) => sanitizeLogValue(item, depth + 1));
  }
  if (typeof value === "object") {
    if (depth >= LOG_DETAILS_MAX_DEPTH) {
      return "[object]";
    }
    const entries = Object.entries(value as Record<string, unknown>).slice(
      0,
      LOG_DETAILS_MAX_KEYS
    );
    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, nestedValue] of entries) {
      sanitizedObject[key] = SENSITIVE_LOG_KEY_PATTERN.test(key)
        ? REDACTED_LOG_VALUE
        : sanitizeLogValue(nestedValue, depth + 1);
    }
    return sanitizedObject;
  }
  return String(value).slice(0, ERROR_MESSAGE_MAX_CHARS);
}

function sanitizeLogDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const sanitized = sanitizeLogValue(details, 0);
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return undefined;
  }
  return sanitized as Record<string, unknown>;
}

export function logServerError(input: ServerErrorLogInput) {
  const sanitizedDetails = sanitizeLogDetails(input.details);
  console.error(`${input.route} error`, {
    requestId: input.requestId,
    error: serializeServerError(input.error),
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  });
}

export function logServerWarning(input: ServerWarningLogInput) {
  const sanitizedDetails = sanitizeLogDetails(input.details);
  console.warn(`${input.route} warning`, {
    requestId: input.requestId,
    message: input.message.slice(0, LOG_MESSAGE_MAX_CHARS),
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  });
}
