import {
  buildApiResponseHeaders,
  normalizeExceededResetInSeconds,
} from "@/lib/api-rate-limit";
import {
  normalizeRateLimitConfig,
  type RateLimitConfig,
  rateLimit,
} from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createRequestId } from "@/lib/request-id";

const RATE_LIMIT_NAMESPACE_MAX_CHARS = 64;
const SAFE_RATE_LIMIT_NAMESPACE_PATTERN = /[^a-zA-Z0-9:_-]/g;

export interface ApiRequestContext {
  requestId: string;
  ip: string;
  rateLimitResult: ReturnType<typeof rateLimit>;
  rateLimitExceededResetInSeconds: number;
  responseHeaders: Headers;
  exceededHeaders: Headers;
}

function normalizeRateLimitNamespace(value: string): string {
  const bounded = value.slice(0, RATE_LIMIT_NAMESPACE_MAX_CHARS);
  const sanitized = bounded.replace(SAFE_RATE_LIMIT_NAMESPACE_PATTERN, "");
  return sanitized ? sanitized.toLowerCase() : "api";
}

export function buildApiRequestContext(input: {
  req: Request;
  rateLimitNamespace: string;
  rateLimitConfig: RateLimitConfig;
}): ApiRequestContext {
  const requestId = createRequestId();
  const ip = getRequestIp(input.req);
  const namespace = normalizeRateLimitNamespace(input.rateLimitNamespace);
  const normalizedRateLimitConfig = normalizeRateLimitConfig(input.rateLimitConfig);
  const rateLimitResult = rateLimit(`${namespace}:${ip}`, normalizedRateLimitConfig);
  const responseHeaders = buildApiResponseHeaders({
    config: normalizedRateLimitConfig,
    snapshot: rateLimitResult,
    requestId,
  });
  const exceededHeaders = buildApiResponseHeaders({
    config: normalizedRateLimitConfig,
    snapshot: rateLimitResult,
    requestId,
    includeRetryAfter: true,
  });
  const exceededResetHeader = Number(exceededHeaders.get("Retry-After"));
  const rateLimitExceededResetInSeconds =
    Number.isInteger(exceededResetHeader) && exceededResetHeader >= 1
      ? exceededResetHeader
      : normalizeExceededResetInSeconds(rateLimitResult.resetIn);

  return {
    requestId,
    ip,
    rateLimitResult,
    rateLimitExceededResetInSeconds,
    responseHeaders,
    exceededHeaders,
  };
}
