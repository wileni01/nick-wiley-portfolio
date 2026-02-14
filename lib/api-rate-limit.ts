import { normalizeRateLimitConfig, type RateLimitConfig } from "@/lib/rate-limit";
import { normalizeRequestId } from "@/lib/request-id";

export interface RateLimitSnapshot {
  remaining: number;
  resetIn: number;
}

interface BuildApiResponseHeadersInput {
  config: RateLimitConfig;
  snapshot: RateLimitSnapshot;
  requestId?: string;
  includeRetryAfter?: boolean;
}

export function normalizeResetInSeconds(resetInMs: number): number {
  if (!Number.isFinite(resetInMs)) return 0;
  return Math.max(0, Math.ceil(resetInMs / 1000));
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
  const resetInSeconds = normalizeResetInSeconds(snapshot.resetIn);
  const boundedRemaining = normalizeRemaining(
    snapshot.remaining,
    normalizedConfig.maxRequests
  );
  return {
    "X-RateLimit-Limit": String(normalizedConfig.maxRequests),
    "X-RateLimit-Remaining": String(boundedRemaining),
    "X-RateLimit-Reset": String(resetInSeconds),
  };
}

export function buildRateLimitExceededHeaders(
  config: RateLimitConfig,
  snapshot: RateLimitSnapshot
): HeadersInit {
  const retryAfterSeconds = normalizeExceededResetInSeconds(snapshot.resetIn);
  const exhaustedHeaders = buildRateLimitHeaders(config, {
    ...snapshot,
    remaining: 0,
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
  const headers = new Headers(
    input.includeRetryAfter
      ? buildRateLimitExceededHeaders(input.config, input.snapshot)
      : buildRateLimitHeaders(input.config, input.snapshot)
  );
  if (input.requestId) {
    const requestId = normalizeRequestId(input.requestId);
    if (requestId) {
      headers.set("X-Request-Id", requestId);
    }
  }
  return headers;
}
