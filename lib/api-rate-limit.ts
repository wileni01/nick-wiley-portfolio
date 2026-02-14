import type { RateLimitConfig } from "@/lib/rate-limit";

interface RateLimitSnapshot {
  remaining: number;
  resetIn: number;
}

export function buildRateLimitHeaders(
  config: RateLimitConfig,
  snapshot: RateLimitSnapshot
): HeadersInit {
  const resetInSeconds = Math.max(0, Math.ceil(snapshot.resetIn / 1000));
  return {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(Math.max(0, snapshot.remaining)),
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
