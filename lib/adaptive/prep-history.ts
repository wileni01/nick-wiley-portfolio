export interface PrepSessionSnapshot {
  id: string;
  timestamp: string;
  averageScore: number;
  averageConfidence?: number | null;
  answerCount: number;
  topThemes: string[];
}

export const PREP_HISTORY_MAX_ENTRIES = 20;
const PREP_HISTORY_ID_MAX_CHARS = 80;
const PREP_HISTORY_TOP_THEMES_MAX = 6;
const PREP_HISTORY_THEME_MAX_CHARS = 120;

export function getPrepHistoryStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.prep-history.${companyId}.${personaId}`;
}

export function parsePrepHistory(raw: string | null): PrepSessionSnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, PREP_HISTORY_MAX_ENTRIES)
      .map((entry) => normalizePrepHistoryEntry(entry))
      .filter((entry): entry is PrepSessionSnapshot => entry !== null)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    return [];
  }
}

export function appendPrepHistoryEntry(
  existing: PrepSessionSnapshot[],
  entry: PrepSessionSnapshot,
  maxEntries: number = PREP_HISTORY_MAX_ENTRIES
): PrepSessionSnapshot[] {
  const normalizedIncoming = normalizePrepHistoryEntry(entry);
  if (!normalizedIncoming) {
    return existing.slice(0, maxEntries);
  }

  const boundedMaxEntries = Math.max(1, Math.floor(maxEntries));
  const normalizedExisting = existing
    .map((snapshot) => normalizePrepHistoryEntry(snapshot))
    .filter((snapshot): snapshot is PrepSessionSnapshot => snapshot !== null);

  return [normalizedIncoming, ...normalizedExisting]
    .slice(0, boundedMaxEntries)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function arePrepHistoryEqual(
  left: PrepSessionSnapshot[],
  right: PrepSessionSnapshot[]
): boolean {
  if (left.length !== right.length) return false;
  return left.every((entry, index) => {
    const candidate = right[index];
    if (!candidate) return false;
    if (
      entry.id !== candidate.id ||
      entry.timestamp !== candidate.timestamp ||
      entry.averageScore !== candidate.averageScore ||
      entry.averageConfidence !== candidate.averageConfidence ||
      entry.answerCount !== candidate.answerCount ||
      entry.topThemes.length !== candidate.topThemes.length
    ) {
      return false;
    }
    return entry.topThemes.every((theme, themeIndex) => {
      return theme === candidate.topThemes[themeIndex];
    });
  });
}

export function serializePrepHistory(
  history: PrepSessionSnapshot[],
  maxEntries: number = PREP_HISTORY_MAX_ENTRIES
): string {
  const boundedMaxEntries = Math.max(1, Math.floor(maxEntries));
  const normalized = history
    .map((entry) => normalizePrepHistoryEntry(entry))
    .filter((entry): entry is PrepSessionSnapshot => entry !== null)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, boundedMaxEntries);
  return JSON.stringify(normalized);
}

function normalizePrepHistoryEntry(input: unknown): PrepSessionSnapshot | null {
  if (!input || typeof input !== "object") return null;

  const candidate = input as Partial<PrepSessionSnapshot>;
  if (typeof candidate.id !== "string" || typeof candidate.timestamp !== "string") {
    return null;
  }
  if (
    typeof candidate.averageScore !== "number" ||
    typeof candidate.answerCount !== "number" ||
    !Array.isArray(candidate.topThemes)
  ) {
    return null;
  }

  const id = candidate.id.trim().slice(0, PREP_HISTORY_ID_MAX_CHARS);
  if (!id) return null;

  const parsedTimestamp = new Date(candidate.timestamp);
  if (Number.isNaN(parsedTimestamp.getTime())) return null;

  const averageScore = Math.max(
    0,
    Math.min(100, Math.round(Number(candidate.averageScore)))
  );
  const answerCount = Math.max(0, Math.min(12, Math.round(Number(candidate.answerCount))));
  const averageConfidence =
    typeof candidate.averageConfidence === "number"
      ? Math.max(1, Math.min(5, Number(candidate.averageConfidence)))
      : null;
  const topThemes = candidate.topThemes
    .map((theme) => String(theme).trim().slice(0, PREP_HISTORY_THEME_MAX_CHARS))
    .filter(Boolean)
    .slice(0, PREP_HISTORY_TOP_THEMES_MAX);

  return {
    id,
    timestamp: parsedTimestamp.toISOString(),
    averageScore,
    averageConfidence,
    answerCount,
    topThemes,
  };
}
