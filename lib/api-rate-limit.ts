import { normalizeRateLimitConfig, type RateLimitConfig } from "@/lib/rate-limit";

interface RateLimitSnapshot {
  remaining: number;
  resetIn: number;
}

interface BuildApiResponseHeadersInput {
  config: RateLimitConfig;
  snapshot: RateLimitSnapshot;
  requestId?: string;
  includeRetryAfter?: boolean;
}

export function buildRateLimitHeaders(
  config: RateLimitConfig,
  snapshot: RateLimitSnapshot
): HeadersInit {
  const normalizedConfig = normalizeRateLimitConfig(config);
  const resetInSeconds = Math.max(0, Math.ceil(snapshot.resetIn / 1000));
  const boundedRemaining = Math.min(
    normalizedConfig.maxRequests,
    Math.max(0, snapshot.remaining)
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
  return {
    ...buildRateLimitHeaders(config, snapshot),
    "Retry-After": String(Math.max(1, Math.ceil(snapshot.resetIn / 1000))),
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
    headers.set("X-Request-Id", input.requestId);
  }
  return headers;
}
