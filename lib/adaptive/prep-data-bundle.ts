import { parsePrepHistory, type PrepSessionSnapshot } from "./prep-history";
import { parsePrepGoalState, type PrepGoalState } from "./prep-goals";
import { parseReadinessState, type ReadinessState } from "./readiness-checklist";

export interface StoredMockSessionState {
  answers: string[];
  confidences: number[];
  currentIndex: number;
  completed: boolean;
  started: boolean;
  updatedAt: string;
}

export interface PrepDataBundle {
  version: 1;
  exportedAt: string;
  mode: {
    companyId: string;
    personaId: string;
  };
  readinessState: ReadinessState;
  prepHistory: PrepSessionSnapshot[];
  prepGoal: PrepGoalState;
  prepNotes: string;
  mockSession: StoredMockSessionState | null;
  drillState: Record<string, boolean>;
}

export function buildPrepDataBundle(input: {
  companyId: string;
  personaId: string;
  readinessRaw: string | null;
  prepHistoryRaw: string | null;
  prepGoalRaw: string | null;
  prepNotesRaw: string | null;
  mockSessionRaw: string | null;
  drillStateRaw: string | null;
}): PrepDataBundle {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    mode: {
      companyId: input.companyId,
      personaId: input.personaId,
    },
    readinessState: parseReadinessState(input.readinessRaw),
    prepHistory: parsePrepHistory(input.prepHistoryRaw),
    prepGoal: parsePrepGoalState(input.prepGoalRaw),
    prepNotes: parsePrepNotes(input.prepNotesRaw),
    mockSession: parseMockSessionState(input.mockSessionRaw),
    drillState: parseDrillState(input.drillStateRaw),
  };
}

export function parsePrepDataBundle(raw: string): PrepDataBundle | null {
  try {
    const parsed = JSON.parse(raw) as PrepDataBundle;
    if (
      parsed?.version !== 1 ||
      typeof parsed?.mode?.companyId !== "string" ||
      typeof parsed?.mode?.personaId !== "string"
    ) {
      return null;
    }

    return {
      version: 1,
      exportedAt:
        typeof parsed.exportedAt === "string"
          ? parsed.exportedAt
          : new Date().toISOString(),
      mode: {
        companyId: parsed.mode.companyId,
        personaId: parsed.mode.personaId,
      },
      readinessState: parseReadinessState(
        JSON.stringify(parsed.readinessState ?? {})
      ),
      prepHistory: parsePrepHistory(JSON.stringify(parsed.prepHistory ?? [])),
      prepGoal: parsePrepGoalState(JSON.stringify(parsed.prepGoal ?? {})),
      prepNotes: parsePrepNotes(
        typeof parsed.prepNotes === "string" ? parsed.prepNotes : null
      ),
      mockSession: parseMockSessionState(
        parsed.mockSession ? JSON.stringify(parsed.mockSession) : null
      ),
      drillState: parseDrillState(JSON.stringify(parsed.drillState ?? {})),
    };
  } catch {
    return null;
  }
}

function parsePrepNotes(raw: string | null): string {
  if (!raw) return "";
  return String(raw).slice(0, 1200);
}

function parseMockSessionState(raw: string | null): StoredMockSessionState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredMockSessionState>;
    const answers = Array.isArray(parsed.answers)
      ? parsed.answers.map((value) => String(value))
      : [];
    const confidences = Array.isArray(parsed.confidences)
      ? parsed.confidences.map((value) =>
          Math.min(5, Math.max(1, Number(value) || 3))
        )
      : [];
    return {
      answers,
      confidences,
      currentIndex: Math.max(0, Math.floor(Number(parsed.currentIndex) || 0)),
      completed: Boolean(parsed.completed),
      started: Boolean(parsed.started),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function parseDrillState(raw: string | null): Record<string, boolean> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      normalized[key] = Boolean(value);
    }
    return normalized;
  } catch {
    return {};
  }
}
