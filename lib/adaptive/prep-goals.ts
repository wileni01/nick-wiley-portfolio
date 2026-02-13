export interface PrepGoalState {
  weeklyTarget: number;
}

export const defaultPrepGoal: PrepGoalState = {
  weeklyTarget: 3,
};

export function getPrepGoalStorageKey(companyId: string, personaId: string): string {
  return `adaptive.prep-goals.${companyId}.${personaId}`;
}

export function parsePrepGoalState(raw: string | null): PrepGoalState {
  if (!raw) return defaultPrepGoal;
  try {
    const parsed = JSON.parse(raw) as Partial<PrepGoalState>;
    return normalizePrepGoalState(parsed);
  } catch {
    return defaultPrepGoal;
  }
}

export function normalizePrepGoalState(
  input: Partial<PrepGoalState> | null | undefined
): PrepGoalState {
  const weeklyTarget = Number(input?.weeklyTarget);
  if (!Number.isFinite(weeklyTarget)) return defaultPrepGoal;
  return {
    weeklyTarget: Math.min(7, Math.max(1, Math.round(weeklyTarget))),
  };
}

export function serializePrepGoalState(state: PrepGoalState): string {
  const normalized = normalizePrepGoalState(state);
  return JSON.stringify(normalized);
}
