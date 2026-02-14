export const FOCUS_HISTORY_MAX_ENTRIES = 6;
export const FOCUS_HISTORY_ENTRY_MAX_CHARS = 200;

export function getFocusHistoryStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.focus-history.${companyId}.${personaId}`;
}

export function parseFocusHistory(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, FOCUS_HISTORY_MAX_ENTRIES * 3)
      .map((value) => String(value).trim().slice(0, FOCUS_HISTORY_ENTRY_MAX_CHARS))
      .filter(Boolean)
      .slice(0, FOCUS_HISTORY_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function addFocusHistoryEntry(history: string[], entry: string): string[] {
  const normalized = entry.trim().slice(0, FOCUS_HISTORY_ENTRY_MAX_CHARS);
  if (!normalized) return history;
  const deduped = [
    normalized,
    ...history
      .map((item) => item.trim().slice(0, FOCUS_HISTORY_ENTRY_MAX_CHARS))
      .filter((item) => item && item !== normalized),
  ];
  return deduped.slice(0, FOCUS_HISTORY_MAX_ENTRIES);
}

export function areFocusHistoryEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export function serializeFocusHistory(history: string[]): string {
  return JSON.stringify(
    history
      .map((item) => item.trim().slice(0, FOCUS_HISTORY_ENTRY_MAX_CHARS))
      .filter(Boolean)
      .slice(0, FOCUS_HISTORY_MAX_ENTRIES)
  );
}
