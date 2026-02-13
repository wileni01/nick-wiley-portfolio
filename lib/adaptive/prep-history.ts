export interface PrepSessionSnapshot {
  id: string;
  timestamp: string;
  averageScore: number;
  answerCount: number;
  topThemes: string[];
}

export function getPrepHistoryStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.prep-history.${companyId}.${personaId}`;
}

export function parsePrepHistory(raw: string | null): PrepSessionSnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PrepSessionSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        typeof entry?.id === "string" &&
        typeof entry?.timestamp === "string" &&
        typeof entry?.averageScore === "number" &&
        typeof entry?.answerCount === "number" &&
        Array.isArray(entry?.topThemes)
    );
  } catch {
    return [];
  }
}

export function appendPrepHistoryEntry(
  existing: PrepSessionSnapshot[],
  entry: PrepSessionSnapshot,
  maxEntries: number = 20
): PrepSessionSnapshot[] {
  return [entry, ...existing].slice(0, maxEntries);
}
