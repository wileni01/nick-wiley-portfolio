export interface ParseBooleanStateOptions {
  maxKeys?: number;
  maxKeyLength?: number;
}

const DEFAULT_MAX_KEYS = 400;
const DEFAULT_MAX_KEY_LENGTH = 120;

export function parseBooleanStateRecord(
  raw: string | null,
  options?: ParseBooleanStateOptions
): Record<string, boolean> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: Record<string, boolean> = {};
    const maxKeys = Math.max(1, Math.floor(options?.maxKeys ?? DEFAULT_MAX_KEYS));
    const maxKeyLength = Math.max(
      1,
      Math.floor(options?.maxKeyLength ?? DEFAULT_MAX_KEY_LENGTH)
    );
    for (const [key, value] of Object.entries(parsed).slice(0, maxKeys)) {
      const normalizedKey = String(key).trim().slice(0, maxKeyLength);
      if (!normalizedKey) continue;
      normalized[normalizedKey] = Boolean(value);
    }
    return normalized;
  } catch {
    return {};
  }
}

