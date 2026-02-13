import { getInterviewDateStorageKey } from "./storage-keys";

export function buildInterviewDateOffsetValue(
  daysFromNow: number,
  baseDate: Date = new Date()
): string {
  const next = new Date(baseDate);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + daysFromNow);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function setInterviewDateOffsetForMode(
  companyId: string,
  personaId: string,
  daysFromNow: number
): string | null {
  return setInterviewDateForMode(
    companyId,
    personaId,
    buildInterviewDateOffsetValue(daysFromNow)
  );
}

export function setInterviewDateForMode(
  companyId: string,
  personaId: string,
  interviewDate: string
): string | null {
  if (typeof window === "undefined") return null;
  const key = getInterviewDateStorageKey(companyId, personaId);
  window.localStorage.setItem(key, interviewDate);
  window.dispatchEvent(
    new CustomEvent("adaptive-interview-date-updated", { detail: { key } })
  );
  return key;
}
