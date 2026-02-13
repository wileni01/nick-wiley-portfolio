import { parsePrepHistory, type PrepSessionSnapshot } from "./prep-history";
import { parsePrepGoalState, type PrepGoalState } from "./prep-goals";
import { parseReadinessState, type ReadinessState } from "./readiness-checklist";
import { parseFocusHistory } from "./focus-history";
import { parseInterviewDate } from "./interview-date";
import { parseBooleanStateRecord } from "./boolean-state";

export const PREP_DATA_BUNDLE_MAX_CHARS = 250_000;
const PREP_DATA_MODE_ID_MAX_CHARS = 80;
const PREP_DATA_NOTES_MAX_CHARS = 1200;
const PREP_DATA_STATE_MAX_KEYS = 400;
const PREP_DATA_STATE_KEY_MAX_CHARS = 120;
const PREP_DATA_MOCK_MAX_ANSWERS = 12;
const PREP_DATA_MOCK_ANSWER_MAX_CHARS = 2000;
const PREP_DATA_MOCK_MAX_QUESTION_ORDER = 24;

export interface StoredMockSessionState {
  answers: string[];
  confidences: number[];
  sessionMode?: "standard" | "pressure";
  questionOrder?: number[];
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
  focusHistory: string[];
  interviewDate: string | null;
  launchpadState: Record<string, boolean>;
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
  focusHistoryRaw: string | null;
  interviewDateRaw: string | null;
  launchpadStateRaw: string | null;
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
    focusHistory: parseFocusHistory(input.focusHistoryRaw),
    interviewDate: parseInterviewDate(input.interviewDateRaw),
    launchpadState: parseDrillState(input.launchpadStateRaw),
    mockSession: parseStoredMockSessionState(input.mockSessionRaw),
    drillState: parseDrillState(input.drillStateRaw),
  };
}

export function parsePrepDataBundle(raw: string): PrepDataBundle | null {
  if (typeof raw !== "string") return null;
  if (!raw.trim()) return null;
  if (raw.length > PREP_DATA_BUNDLE_MAX_CHARS) return null;

  try {
    const parsed = JSON.parse(raw) as PrepDataBundle;
    const companyId = parseModeId(parsed?.mode?.companyId);
    const personaId = parseModeId(parsed?.mode?.personaId);
    if (
      parsed?.version !== 1 ||
      !companyId ||
      !personaId
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
        companyId,
        personaId,
      },
      readinessState: parseReadinessState(
        JSON.stringify(parsed.readinessState ?? {})
      ),
      prepHistory: parsePrepHistory(JSON.stringify(parsed.prepHistory ?? [])),
      prepGoal: parsePrepGoalState(JSON.stringify(parsed.prepGoal ?? {})),
      prepNotes: parsePrepNotes(
        typeof parsed.prepNotes === "string" ? parsed.prepNotes : null
      ),
      focusHistory: parseFocusHistory(
        JSON.stringify(parsed.focusHistory ?? [])
      ),
      interviewDate: parseInterviewDate(
        typeof parsed.interviewDate === "string" ? parsed.interviewDate : null
      ),
      launchpadState: parseDrillState(
        JSON.stringify(parsed.launchpadState ?? {})
      ),
      mockSession: parseStoredMockSessionState(
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
  return String(raw).slice(0, PREP_DATA_NOTES_MAX_CHARS);
}

export function parseStoredMockSessionState(
  raw: string | null
): StoredMockSessionState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredMockSessionState>;
    const answers = Array.isArray(parsed.answers)
      ? parsed.answers
          .slice(0, PREP_DATA_MOCK_MAX_ANSWERS)
          .map((value) => String(value).slice(0, PREP_DATA_MOCK_ANSWER_MAX_CHARS))
      : [];
    const confidenceLimit =
      answers.length > 0 ? answers.length : PREP_DATA_MOCK_MAX_ANSWERS;
    const confidences = Array.isArray(parsed.confidences)
      ? parsed.confidences.slice(0, confidenceLimit).map((value) =>
          Math.min(5, Math.max(1, Number(value) || 3))
        )
      : [];
    const questionOrder = Array.isArray(parsed.questionOrder)
      ? Array.from(
          new Set(
            parsed.questionOrder
              .slice(0, PREP_DATA_MOCK_MAX_QUESTION_ORDER)
              .map((value) => Number(value))
              .filter(
                (value) =>
                  Number.isFinite(value) &&
                  Number.isInteger(value) &&
                  value >= 0 &&
                  value <= 99
              )
          )
        )
      : undefined;
    const nextIndex = Math.max(0, Math.floor(Number(parsed.currentIndex) || 0));
    const currentIndex = answers.length
      ? Math.min(nextIndex, answers.length - 1)
      : 0;
    return {
      answers,
      confidences,
      sessionMode: parsed.sessionMode === "pressure" ? "pressure" : "standard",
      questionOrder,
      currentIndex,
      completed: Boolean(parsed.completed),
      started: Boolean(parsed.started),
      updatedAt: parseIsoTimestamp(parsed.updatedAt),
    };
  } catch {
    return null;
  }
}

function parseDrillState(raw: string | null): Record<string, boolean> {
  return parseBooleanStateRecord(raw, {
    maxKeys: PREP_DATA_STATE_MAX_KEYS,
    maxKeyLength: PREP_DATA_STATE_KEY_MAX_CHARS,
  });
}

function parseModeId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().slice(0, PREP_DATA_MODE_ID_MAX_CHARS);
  return normalized ? normalized : null;
}

function parseIsoTimestamp(raw: unknown): string {
  if (typeof raw !== "string") return new Date().toISOString();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}
