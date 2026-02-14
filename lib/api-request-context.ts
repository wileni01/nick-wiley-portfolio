import { buildApiResponseHeaders } from "@/lib/api-rate-limit";
import { type RateLimitConfig, rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createRequestId } from "@/lib/request-id";

export interface ApiRequestContext {
  requestId: string;
  ip: string;
  rateLimitResult: ReturnType<typeof rateLimit>;
  responseHeaders: Headers;
  exceededHeaders: Headers;
}

export function buildApiRequestContext(input: {
  req: Request;
  rateLimitNamespace: string;
  rateLimitConfig: RateLimitConfig;
}): ApiRequestContext {
  const requestId = createRequestId();
  const ip = getRequestIp(input.req);
  const rateLimitResult = rateLimit(
    `${input.rateLimitNamespace}:${ip}`,
    input.rateLimitConfig
  );
  const responseHeaders = buildApiResponseHeaders({
    config: input.rateLimitConfig,
    snapshot: rateLimitResult,
    requestId,
  });
  const exceededHeaders = buildApiResponseHeaders({
    config: input.rateLimitConfig,
    snapshot: rateLimitResult,
    requestId,
    includeRetryAfter: true,
  });

  return {
    requestId,
    ip,
    rateLimitResult,
    responseHeaders,
    exceededHeaders,
  };
}
