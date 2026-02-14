// In-memory rate limiter (works without Vercel KV for local dev)
// In production, replace with Vercel KV for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60000;
const RATE_LIMIT_MAX_ENTRIES = 50000;
const MIN_RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_IDENTIFIER_MAX_CHARS = 160;
const SAFE_IDENTIFIER_PATTERN = /[^a-zA-Z0-9:._-]/g;
let lastCleanupAt = 0;

function cleanupExpiredRateLimitEntries(now: number) {
  if (now - lastCleanupAt < RATE_LIMIT_CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

function trimRateLimitEntriesToCapacity() {
  if (rateLimitMap.size <= RATE_LIMIT_MAX_ENTRIES) return;
  const overflowCount = rateLimitMap.size - RATE_LIMIT_MAX_ENTRIES;
  const keysToEvict = rateLimitMap.keys();
  for (let i = 0; i < overflowCount; i++) {
    const nextKey = keysToEvict.next();
    if (nextKey.done) break;
    rateLimitMap.delete(nextKey.value);
  }
}

export function normalizeRateLimitConfig(
  config: RateLimitConfig
): { maxRequests: number; windowMs: number } {
  const maxRequests = Number.isFinite(config.maxRequests)
    ? Math.max(1, Math.floor(config.maxRequests))
    : 50;
  const windowMs = Number.isFinite(config.windowMs)
    ? Math.max(MIN_RATE_LIMIT_WINDOW_MS, Math.floor(config.windowMs))
    : 3600000;
  return { maxRequests, windowMs };
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

function normalizeRateLimitIdentifier(identifier: string): string {
  const bounded = identifier.slice(0, RATE_LIMIT_IDENTIFIER_MAX_CHARS);
  const sanitized = bounded.replace(SAFE_IDENTIFIER_PATTERN, "");
  return sanitized ? sanitized.toLowerCase() : "anonymous";
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 50, windowMs: 3600000 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  cleanupExpiredRateLimitEntries(now);
  const normalizedIdentifier = normalizeRateLimitIdentifier(identifier);
  const normalizedConfig = normalizeRateLimitConfig(config);
  const entry = rateLimitMap.get(normalizedIdentifier);

  if (!entry || now >= entry.resetTime) {
    rateLimitMap.set(normalizedIdentifier, {
      count: 1,
      resetTime: now + normalizedConfig.windowMs,
    });
    trimRateLimitEntriesToCapacity();
    return {
      success: true,
      remaining: normalizedConfig.maxRequests - 1,
      resetIn: normalizedConfig.windowMs,
    };
  }

  if (entry.count >= normalizedConfig.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: normalizedConfig.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}
