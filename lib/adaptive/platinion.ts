import type { CompanyId } from "./types";

type SearchParamValue = string | string[] | undefined;
type SearchParamsLike = Record<string, SearchParamValue>;

export interface AdaptiveMode {
  companyId: CompanyId;
  personaId: string;
}

export const ADAPTIVE_MODE_COOKIE = "nw-adaptive-mode";

const PLATINION_MODE: AdaptiveMode = {
  companyId: "bcg",
  personaId: "bcg-harsh",
};

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getAdaptiveModeFromShortParam(
  shortParam: string | null | undefined
): AdaptiveMode | null {
  if (!shortParam) return null;
  const normalized = shortParam.toLowerCase();
  if (normalized === "platinion" || normalized === "harsh") {
    return PLATINION_MODE;
  }
  return null;
}

export function getAdaptiveModeFromSearchParams(
  searchParams: SearchParamsLike
): AdaptiveMode | null {
  const shortMode = getAdaptiveModeFromShortParam(firstParam(searchParams.p));
  if (shortMode) return shortMode;

  const company = firstParam(searchParams.for)?.toLowerCase();
  const persona = firstParam(searchParams.persona)?.toLowerCase();
  if (company === "bcg" && persona === "bcg-harsh") {
    return PLATINION_MODE;
  }
  return null;
}

export function getAdaptiveModeFromUrlSearchParams(
  searchParams: URLSearchParams
): AdaptiveMode | null {
  return getAdaptiveModeFromSearchParams({
    p: searchParams.get("p") ?? undefined,
    for: searchParams.get("for") ?? undefined,
    persona: searchParams.get("persona") ?? undefined,
  });
}

export function isPlatinionView(searchParams: SearchParamsLike): boolean {
  return getAdaptiveModeFromSearchParams(searchParams) !== null;
}

export function serializeAdaptiveMode(mode: AdaptiveMode): string {
  return `${mode.companyId}:${mode.personaId}`;
}

export function parseAdaptiveModeCookie(
  value: string | null | undefined
): AdaptiveMode | null {
  if (!value) return null;
  const [companyId, personaId] = value.split(":");
  if (!companyId || !personaId) return null;
  if (companyId === "bcg" && personaId === "bcg-harsh") {
    return PLATINION_MODE;
  }
  return null;
}
