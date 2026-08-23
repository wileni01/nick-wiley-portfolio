"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  CompanyId,
  CompanyProfile,
  PersonaProfile,
} from "@/lib/adaptive/types";
import {
  getCompanyProfileById,
  getDefaultPersonaForCompany,
  getPersonaById,
} from "@/lib/adaptive/profiles";
import {
  getAdaptiveModeFromShortParam,
  type AdaptiveMode,
} from "@/lib/adaptive/platinion";
import {
  getServerSnapshot,
  getSnapshot,
  setMode,
  subscribe,
} from "@/lib/adaptive/mode-store";

interface AdaptiveState {
  companyId: CompanyId | null;
  personaId: string | null;
  company: CompanyProfile | null;
  persona: PersonaProfile | null;
  isActive: boolean;
}

interface AdaptiveContextValue extends AdaptiveState {
  activate: (companyId: CompanyId, personaId?: string) => void;
  deactivate: () => void;
}

const INACTIVE: AdaptiveState = {
  companyId: null,
  personaId: null,
  company: null,
  persona: null,
  isActive: false,
};

const AdaptiveContext = createContext<AdaptiveContextValue | null>(null);

export function useAdaptive(): AdaptiveContextValue {
  const ctx = useContext(AdaptiveContext);
  if (!ctx) {
    throw new Error("useAdaptive must be used within an AdaptiveProvider");
  }
  return ctx;
}

/** Safe version that returns null when used outside provider */
export function useAdaptiveMaybe(): AdaptiveContextValue | null {
  return useContext(AdaptiveContext);
}

function resolveState(mode: AdaptiveMode | null): AdaptiveState {
  if (!mode) return INACTIVE;
  const company = getCompanyProfileById(mode.companyId);
  if (!company) return INACTIVE;
  const persona =
    (mode.personaId
      ? getPersonaById(mode.companyId, mode.personaId)
      : getDefaultPersonaForCompany(mode.companyId)) ?? null;
  return {
    companyId: mode.companyId,
    personaId: persona?.id ?? null,
    company,
    persona,
    isActive: true,
  };
}

/**
 * Reads a tailored-view request from the URL. Supports the short form
 * (`?p=platinion`) and the explicit form (`?for=<company>&persona=<id>`).
 * Returns null when the URL does not name a valid company.
 */
function modeFromUrl(params: URLSearchParams): AdaptiveMode | null {
  const short = getAdaptiveModeFromShortParam(params.get("p"));
  if (short) return short;

  const companyId = params.get("for") as CompanyId | null;
  if (!companyId || !getCompanyProfileById(companyId)) return null;

  const personaId =
    params.get("persona") ?? getDefaultPersonaForCompany(companyId)?.id;
  if (!personaId) return null;
  return { companyId, personaId };
}

export function AdaptiveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const fromUrl = useMemo(() => modeFromUrl(searchParams), [searchParams]);

  // A tailored link persists its mode for the rest of the browsing session.
  useEffect(() => {
    if (fromUrl) setMode(fromUrl);
  }, [fromUrl]);

  const state = useMemo(
    () => resolveState(fromUrl ?? stored),
    [fromUrl, stored]
  );

  const activate = useCallback((companyId: CompanyId, personaId?: string) => {
    const resolved = resolveState({ companyId, personaId: personaId ?? "" });
    if (resolved.isActive && resolved.companyId && resolved.personaId) {
      setMode({ companyId: resolved.companyId, personaId: resolved.personaId });
    }
  }, []);

  const deactivate = useCallback(() => {
    setMode(null);
    // The home page also renders a server-side variant from the cookie, so
    // drop any tailored-view query params and re-render from the server.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const hadParams = ["p", "for", "persona"].some((key) =>
        url.searchParams.has(key)
      );
      if (hadParams) {
        url.searchParams.delete("p");
        url.searchParams.delete("for");
        url.searchParams.delete("persona");
        router.replace(url.pathname + (url.search || "") + url.hash);
        return;
      }
    }
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ ...state, activate, deactivate }),
    [state, activate, deactivate]
  );

  return (
    <AdaptiveContext.Provider value={value}>{children}</AdaptiveContext.Provider>
  );
}
