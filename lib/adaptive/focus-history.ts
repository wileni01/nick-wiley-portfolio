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
      .map((value) => String(value).trim())
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export function addFocusHistoryEntry(history: string[], entry: string): string[] {
  const normalized = entry.trim();
  if (!normalized) return history;
  const deduped = [normalized, ...history.filter((item) => item !== normalized)];
  return deduped.slice(0, 6);
}
