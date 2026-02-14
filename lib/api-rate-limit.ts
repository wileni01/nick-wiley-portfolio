import { normalizeRateLimitConfig, type RateLimitConfig } from "@/lib/rate-limit";
import { normalizeRequestId } from "@/lib/request-id";

const MAX_RESET_IN_SECONDS = Number.MAX_SAFE_INTEGER;

export interface RateLimitSnapshot {
  remaining: number;
  resetIn: number;
}

interface BuildApiResponseHeadersInput {
  config: RateLimitConfig;
  snapshot: RateLimitSnapshot;
  requestId?: unknown;
  includeRetryAfter?: boolean;
}

function readNumericLike(
  source: unknown,
  key: string,
  fallback: number
): number {
  let value: unknown;
  try {
    value = (source as Record<string, unknown> | null | undefined)?.[key];
  } catch {
    return fallback;
  }
  return typeof value === "number" ? value : fallback;
}

function readInputValue<T>(
  input: BuildApiResponseHeadersInput,
  key: keyof BuildApiResponseHeadersInput
): T | undefined {
  try {
    return input[key] as T | undefined;
  } catch {
    return undefined;
  }
}

export function normalizeResetInSeconds(resetInMs: number): number {
  if (!Number.isFinite(resetInMs)) return 0;
  return Math.min(MAX_RESET_IN_SECONDS, Math.max(0, Math.ceil(resetInMs / 1000)));
}

function normalizeRemaining(
  remaining: number,
  maxRequests: number
): number {
  if (!Number.isFinite(remaining)) return 0;
  return Math.min(maxRequests, Math.max(0, Math.floor(remaining)));
}

export function normalizeExceededResetInSeconds(resetInMs: number): number {
  return Math.max(1, normalizeResetInSeconds(resetInMs));
}

export function buildRateLimitHeaders(
  config: RateLimitConfig,
  snapshot: RateLimitSnapshot
): HeadersInit {
  const normalizedConfig = normalizeRateLimitConfig(config);
  const snapshotResetIn = readNumericLike(snapshot, "resetIn", 0);
  const resetInSeconds = normalizeResetInSeconds(snapshotResetIn);
  const maxResetInSeconds = normalizeResetInSeconds(normalizedConfig.windowMs);
  const boundedResetInSeconds = Math.min(maxResetInSeconds, resetInSeconds);
  const snapshotRemaining = readNumericLike(snapshot, "remaining", 0);
  const boundedRemaining = normalizeRemaining(
    snapshotRemaining,
    normalizedConfig.maxRequests
  );
  return {
    "X-RateLimit-Limit": String(normalizedConfig.maxRequests),
    "X-RateLimit-Remaining": String(boundedRemaining),
    "X-RateLimit-Reset": String(boundedResetInSeconds),
  };
}

export function buildRateLimitExceededHeaders(
  config: RateLimitConfig,
  snapshot: RateLimitSnapshot
): HeadersInit {
  const normalizedConfig = normalizeRateLimitConfig(config);
  const snapshotResetIn = readNumericLike(snapshot, "resetIn", 0);
  const maxResetInSeconds = normalizeResetInSeconds(normalizedConfig.windowMs);
  const retryAfterSeconds = Math.min(
    maxResetInSeconds,
    normalizeExceededResetInSeconds(snapshotResetIn)
  );
  const exhaustedHeaders = buildRateLimitHeaders(normalizedConfig, {
    remaining: 0,
    resetIn: snapshotResetIn,
  });
  return {
    ...exhaustedHeaders,
    "X-RateLimit-Reset": String(retryAfterSeconds),
    "Retry-After": String(retryAfterSeconds),
  };
}

export function buildApiResponseHeaders(
  input: BuildApiResponseHeadersInput
): Headers {
  const config =
    readInputValue<RateLimitConfig>(input, "config") ??
    ({} as RateLimitConfig);
  const snapshot =
    readInputValue<RateLimitSnapshot>(input, "snapshot") ??
    ({ remaining: 0, resetIn: 0 } as RateLimitSnapshot);
  const includeRetryAfter = Boolean(
    readInputValue<unknown>(input, "includeRetryAfter")
  );
  const headers = new Headers(
    includeRetryAfter
      ? buildRateLimitExceededHeaders(config, snapshot)
      : buildRateLimitHeaders(config, snapshot)
  );
  const requestIdValue = readInputValue<unknown>(input, "requestId");
  if (requestIdValue) {
    const requestId = normalizeRequestId(requestIdValue);
    if (requestId) {
      headers.set("X-Request-Id", requestId);
    }
  }
  return headers;
}
