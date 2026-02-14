"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import type { CompanyId } from "@/lib/adaptive/types";
import {
  getCompanyProfileById,
  getDefaultPersonaForCompany,
  getPersonaById,
} from "@/lib/adaptive/profiles";
import type { CompanyProfile, PersonaProfile } from "@/lib/adaptive/types";

const STORAGE_KEY = "nw-adaptive-mode";

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

function resolveState(
  companyId: CompanyId | null,
  personaId: string | null
): AdaptiveState {
  if (!companyId) {
    return {
      companyId: null,
      personaId: null,
      company: null,
      persona: null,
      isActive: false,
    };
  }
  const company = getCompanyProfileById(companyId) ?? null;
  if (!company) {
    return {
      companyId: null,
      personaId: null,
      company: null,
      persona: null,
      isActive: false,
    };
  }
  const persona = personaId
    ? (getPersonaById(companyId, personaId) ?? null)
    : (getDefaultPersonaForCompany(companyId) ?? null);

  return {
    companyId,
    personaId: persona?.id ?? null,
    company,
    persona,
    isActive: true,
  };
}

export function AdaptiveProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<AdaptiveState>({
    companyId: null,
    personaId: null,
    company: null,
    persona: null,
    isActive: false,
  });

  // Initialize from URL params or sessionStorage
  useEffect(() => {
    const urlCompany = searchParams.get("for") as CompanyId | null;
    const urlPersona = searchParams.get("persona");

    if (urlCompany) {
      const resolved = resolveState(urlCompany, urlPersona);
      if (resolved.isActive) {
        setState(resolved);
        try {
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              companyId: resolved.companyId,
              personaId: resolved.personaId,
            })
          );
        } catch {
          // sessionStorage unavailable
        }
        return;
      }
    }

    // Fall back to sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { companyId, personaId } = JSON.parse(stored);
        const resolved = resolveState(companyId, personaId);
        if (resolved.isActive) {
          setState(resolved);
          return;
        }
      }
    } catch {
      // sessionStorage unavailable or parse error
    }
  }, [searchParams]);

  const activate = useCallback(
    (companyId: CompanyId, personaId?: string) => {
      const resolved = resolveState(companyId, personaId ?? null);
      setState(resolved);
      if (resolved.isActive) {
        try {
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              companyId: resolved.companyId,
              personaId: resolved.personaId,
            })
          );
        } catch {
          // sessionStorage unavailable
        }
      }
    },
    []
  );

  const deactivate = useCallback(() => {
    setState({
      companyId: null,
      personaId: null,
      company: null,
      persona: null,
      isActive: false,
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  return (
    <AdaptiveContext.Provider value={{ ...state, activate, deactivate }}>
      {children}
    </AdaptiveContext.Provider>
  );
}
