const FALLBACK_RANDOM_TOKEN_CHARS = 24;
const FALLBACK_COUNTER_MODULO = 36 ** 4;
const DEFAULT_REQUEST_ID_MAX_CHARS = 120;
const SAFE_REQUEST_ID_PATTERN = /[^a-zA-Z0-9._:-]/g;
let requestIdFallbackCounter = 0;

function getFallbackCounterToken(): string {
  requestIdFallbackCounter = (requestIdFallbackCounter + 1) % FALLBACK_COUNTER_MODULO;
  return requestIdFallbackCounter.toString(36).padStart(4, "0");
}

function createFallbackRandomToken(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Ignore and fallback to Math.random token path.
  }

  let token = "";
  while (token.length < FALLBACK_RANDOM_TOKEN_CHARS) {
    token += Math.random().toString(36).slice(2);
  }
  return token.slice(0, FALLBACK_RANDOM_TOKEN_CHARS);
}

export function normalizeRequestId(
  value: unknown,
  maxChars: number = DEFAULT_REQUEST_ID_MAX_CHARS
): string | null {
  if (typeof value !== "string") return null;
  const safeMaxChars = Number.isFinite(maxChars)
    ? Math.max(1, Math.floor(maxChars))
    : DEFAULT_REQUEST_ID_MAX_CHARS;
  const bounded = value.trim().slice(0, safeMaxChars);
  if (!bounded) return null;
  const sanitized = bounded.replace(SAFE_REQUEST_ID_PATTERN, "");
  return sanitized || null;
}

export function createRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall back to timestamp + random token.
  }

  return `${Date.now().toString(36)}-${getFallbackCounterToken()}-${createFallbackRandomToken()}`;
}
