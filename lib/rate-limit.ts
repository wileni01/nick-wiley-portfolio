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
const MAX_RATE_LIMIT_REQUESTS = Number.MAX_SAFE_INTEGER;
const MAX_RATE_LIMIT_WINDOW_MS = Number.MAX_SAFE_INTEGER;
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

function trimRateLimitEntriesToCapacity(now: number) {
  if (rateLimitMap.size <= RATE_LIMIT_MAX_ENTRIES) return;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
  if (rateLimitMap.size <= RATE_LIMIT_MAX_ENTRIES) return;

  const overflowCount = rateLimitMap.size - RATE_LIMIT_MAX_ENTRIES;
  const evictionCandidates = Array.from(rateLimitMap.entries())
    .map(([key, entry]) => ({ key, resetTime: entry.resetTime }))
    .sort((a, b) => a.resetTime - b.resetTime)
    .slice(0, overflowCount);
  for (const candidate of evictionCandidates) {
    rateLimitMap.delete(candidate.key);
  }
}

export function normalizeRateLimitConfig(
  config: RateLimitConfig
): { maxRequests: number; windowMs: number } {
  const maxRequests = Number.isFinite(config.maxRequests)
    ? Math.min(
        MAX_RATE_LIMIT_REQUESTS,
        Math.max(1, Math.floor(config.maxRequests))
      )
    : 50;
  const windowMs = Number.isFinite(config.windowMs)
    ? Math.min(
        MAX_RATE_LIMIT_WINDOW_MS,
        Math.max(MIN_RATE_LIMIT_WINDOW_MS, Math.floor(config.windowMs))
      )
    : 3600000;
  return { maxRequests, windowMs };
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

function normalizeRateLimitIdentifier(identifier: unknown): string {
  let rawIdentifier = "";
  if (typeof identifier === "string") {
    rawIdentifier = identifier;
  } else {
    try {
      rawIdentifier = String(identifier ?? "");
    } catch {
      rawIdentifier = "";
    }
  }
  const bounded = rawIdentifier.slice(0, RATE_LIMIT_IDENTIFIER_MAX_CHARS);
  const sanitized = bounded.replace(SAFE_IDENTIFIER_PATTERN, "");
  return sanitized ? sanitized.toLowerCase() : "anonymous";
}

function getResetInMs(now: number, resetTime: number): number {
  if (!Number.isFinite(resetTime)) return 0;
  return Math.max(0, Math.ceil(resetTime - now));
}

function getSafeWindowMs(windowMs: number, now: number): number {
  const maxWindowFromNow = Math.max(1, Math.floor(Number.MAX_SAFE_INTEGER - now));
  return Math.min(windowMs, maxWindowFromNow);
}

export function rateLimit(
  identifier: unknown,
  config: RateLimitConfig = { maxRequests: 50, windowMs: 3600000 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  cleanupExpiredRateLimitEntries(now);
  const normalizedIdentifier = normalizeRateLimitIdentifier(identifier);
  const normalizedConfig = normalizeRateLimitConfig(config);
  const entry = rateLimitMap.get(normalizedIdentifier);

  if (!entry || now >= entry.resetTime) {
    const safeWindowMs = getSafeWindowMs(normalizedConfig.windowMs, now);
    rateLimitMap.set(normalizedIdentifier, {
      count: 1,
      resetTime: now + safeWindowMs,
    });
    trimRateLimitEntriesToCapacity(now);
    return {
      success: true,
      remaining: normalizedConfig.maxRequests - 1,
      resetIn: safeWindowMs,
    };
  }

  if (entry.count >= normalizedConfig.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: getResetInMs(now, entry.resetTime),
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: normalizedConfig.maxRequests - entry.count,
    resetIn: getResetInMs(now, entry.resetTime),
  };
}
