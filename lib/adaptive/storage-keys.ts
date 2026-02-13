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
