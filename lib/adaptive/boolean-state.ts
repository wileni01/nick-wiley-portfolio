export interface ParseBooleanStateOptions {
  maxKeys?: number;
  maxKeyLength?: number;
}

export interface BooleanStateSummary {
  total: number;
  truthy: number;
  percentage: number;
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

export function summarizeBooleanStateRecord(
  state: Record<string, boolean>
): BooleanStateSummary {
  const values = Object.values(state);
  const total = values.length;
  const truthy = values.filter(Boolean).length;
  const percentage = total ? Math.round((truthy / total) * 100) : 0;
  return { total, truthy, percentage };
}

export function areBooleanStateRecordsEqual(
  left: Record<string, boolean>,
  right: Record<string, boolean>
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => right[key] === left[key]);
}

