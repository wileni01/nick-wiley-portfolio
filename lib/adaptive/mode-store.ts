import {
  ADAPTIVE_MODE_COOKIE,
  serializeAdaptiveMode,
  type AdaptiveMode,
} from "./platinion";

/**
 * Tiny external store for the active adaptive mode.
 *
 * The mode lives outside React (sessionStorage + a session cookie) so the
 * provider can subscribe with `useSyncExternalStore` instead of mirroring
 * browser state into React state from an effect.
 */

const STORAGE_KEY = "nw-adaptive-mode";

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: AdaptiveMode | null | undefined;

function readFromStorage(): AdaptiveMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdaptiveMode>;
    if (
      typeof parsed?.companyId === "string" &&
      typeof parsed?.personaId === "string"
    ) {
      return { companyId: parsed.companyId, personaId: parsed.personaId };
    }
  } catch {
    // sessionStorage unavailable or corrupt
  }
  return null;
}

function writeCookie(mode: AdaptiveMode | null) {
  if (typeof document === "undefined") return;
  document.cookie = mode
    ? `${ADAPTIVE_MODE_COOKIE}=${serializeAdaptiveMode(mode)}; path=/; SameSite=Lax`
    : `${ADAPTIVE_MODE_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

function writeStorage(mode: AdaptiveMode | null) {
  if (typeof window === "undefined") return;
  try {
    if (mode) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mode));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): AdaptiveMode | null {
  if (cached === undefined) cached = readFromStorage();
  return cached;
}

export function getServerSnapshot(): AdaptiveMode | null {
  return null;
}

function sameMode(a: AdaptiveMode | null, b: AdaptiveMode | null) {
  if (!a || !b) return a === b;
  return a.companyId === b.companyId && a.personaId === b.personaId;
}

export function setMode(mode: AdaptiveMode | null) {
  const current = getSnapshot();
  // Always refresh persistence (the cookie is session-scoped and may have
  // been cleared), but only notify subscribers on an actual change.
  writeStorage(mode);
  writeCookie(mode);
  if (sameMode(current, mode)) return;
  cached = mode;
  emit();
}
