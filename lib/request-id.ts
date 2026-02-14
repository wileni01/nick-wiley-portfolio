const FALLBACK_RANDOM_TOKEN_CHARS = 24;
const FALLBACK_COUNTER_MODULO = 36 ** 4;
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

  return Math.random().toString(36).slice(2, 2 + FALLBACK_RANDOM_TOKEN_CHARS);
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
