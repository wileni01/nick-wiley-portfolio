export function getMockSessionStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.mock-session.${companyId}.${personaId}`;
}

export function getDrillStateStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.drills.${companyId}.${personaId}`;
}

export function getPrepNotesStorageKey(
  companyId: string,
  personaId: string
): string {
  return `adaptive.prep-notes.${companyId}.${personaId}`;
}
