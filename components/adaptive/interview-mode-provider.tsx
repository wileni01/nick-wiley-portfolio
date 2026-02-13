"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AIProvider } from "@/lib/ai";
import {
  companyProfiles,
  getCompanyProfileById,
  getDefaultPersonaForCompany,
  getPersonaById,
} from "@/lib/adaptive/profiles";
import { parseInterviewDate } from "@/lib/adaptive/interview-date";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";
import type { CompanyId, CompanyProfile, PersonaProfile } from "@/lib/adaptive/types";

interface InterviewModeContextValue {
  companyId: CompanyId | null;
  personaId: string | null;
  provider: AIProvider;
  focusNote: string;
  company: CompanyProfile | null;
  persona: PersonaProfile | null;
  companies: CompanyProfile[];
  setCompanyId: (companyId: CompanyId | null) => void;
  setPersonaId: (personaId: string | null) => void;
  setProvider: (provider: AIProvider) => void;
  setFocusNote: (focusNote: string) => void;
  resetMode: () => void;
}

const InterviewModeContext = createContext<InterviewModeContextValue | null>(
  null
);

function isCompanyId(value: string | null): value is CompanyId {
  if (!value) return false;
  return companyProfiles.some((company) => company.id === value);
}

const STORAGE_KEYS = {
  companyId: "adaptive.companyId",
  personaId: "adaptive.personaId",
  provider: "adaptive.provider",
  focusNote: "adaptive.focusNote",
} as const;

export function InterviewModeProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyIdState] = useState<CompanyId | null>(null);
  const [personaId, setPersonaIdState] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [focusNote, setFocusNote] = useState("");
  const [interviewDate, setInterviewDate] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const company = companyId ? getCompanyProfileById(companyId) ?? null : null;
  const persona =
    companyId && personaId ? getPersonaById(companyId, personaId) ?? null : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlCompany = params.get("company");
    const urlPersona = params.get("persona");
    const urlProvider = params.get("provider");
    const urlFocus = params.get("focus");
    const urlInterviewDate = parseInterviewDate(params.get("date"));

    const storedCompany = localStorage.getItem(STORAGE_KEYS.companyId);
    const storedPersona = localStorage.getItem(STORAGE_KEYS.personaId);
    const storedProvider = localStorage.getItem(STORAGE_KEYS.provider);
    const storedFocus = localStorage.getItem(STORAGE_KEYS.focusNote);

    const nextCompany = isCompanyId(urlCompany)
      ? urlCompany
      : isCompanyId(storedCompany)
        ? storedCompany
        : null;

    let nextPersona: string | null = null;
    if (nextCompany) {
      if (urlPersona && getPersonaById(nextCompany, urlPersona)) {
        nextPersona = urlPersona;
      } else if (storedPersona && getPersonaById(nextCompany, storedPersona)) {
        nextPersona = storedPersona;
      } else {
        nextPersona = getDefaultPersonaForCompany(nextCompany)?.id ?? null;
      }
    }

    const nextProvider =
      urlProvider === "anthropic" || urlProvider === "openai"
        ? urlProvider
        : storedProvider === "anthropic" || storedProvider === "openai"
          ? storedProvider
          : "openai";

    const nextFocus = (urlFocus ?? storedFocus ?? "").slice(0, 200);

    if (nextCompany && nextPersona && urlInterviewDate) {
      const interviewDateKey = getInterviewDateStorageKey(nextCompany, nextPersona);
      localStorage.setItem(interviewDateKey, urlInterviewDate);
      window.dispatchEvent(
        new CustomEvent("adaptive-interview-date-updated", {
          detail: { key: interviewDateKey },
        })
      );
    }

    setCompanyIdState(nextCompany);
    setPersonaIdState(nextPersona);
    setProvider(nextProvider);
    setFocusNote(nextFocus);
    setInterviewDate(urlInterviewDate);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !companyId || !personaId) {
      setInterviewDate(null);
      return;
    }
    const key = getInterviewDateStorageKey(companyId, personaId);
    function refreshDate() {
      setInterviewDate(parseInterviewDate(localStorage.getItem(key)));
    }

    refreshDate();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refreshDate();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refreshDate();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-interview-date-updated", onInterviewDateUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-interview-date-updated",
        onInterviewDateUpdate
      );
    };
  }, [companyId, hydrated, personaId]);

  useEffect(() => {
    if (!hydrated) return;

    if (companyId) {
      localStorage.setItem(STORAGE_KEYS.companyId, companyId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.companyId);
    }

    if (personaId) {
      localStorage.setItem(STORAGE_KEYS.personaId, personaId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.personaId);
    }
    localStorage.setItem(STORAGE_KEYS.provider, provider);
    if (focusNote.trim()) {
      localStorage.setItem(STORAGE_KEYS.focusNote, focusNote.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.focusNote);
    }

    const params = new URLSearchParams(window.location.search);
    if (companyId) {
      params.set("company", companyId);
    } else {
      params.delete("company");
    }
    if (personaId) {
      params.set("persona", personaId);
    } else {
      params.delete("persona");
    }
    if (companyId && personaId) {
      const modeInterviewDate = parseInterviewDate(
        localStorage.getItem(getInterviewDateStorageKey(companyId, personaId))
      );
      const nextInterviewDate = interviewDate ?? modeInterviewDate;
      if (nextInterviewDate) {
        params.set("date", nextInterviewDate);
      } else {
        params.delete("date");
      }
    } else {
      params.delete("date");
    }
    params.set("provider", provider);
    if (focusNote.trim()) {
      params.set("focus", focusNote.trim());
    } else {
      params.delete("focus");
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }

    if (companyId) {
      document.documentElement.setAttribute("data-company-theme", companyId);
    } else {
      document.documentElement.removeAttribute("data-company-theme");
    }
  }, [companyId, focusNote, hydrated, interviewDate, personaId, provider]);

  function setCompanyId(company: CompanyId | null) {
    if (!company) {
      setCompanyIdState(null);
      setPersonaIdState(null);
      return;
    }

    const defaultPersona = getDefaultPersonaForCompany(company);
    setCompanyIdState(company);
    setPersonaIdState(defaultPersona?.id ?? null);
  }

  function setPersonaId(persona: string | null) {
    if (!companyId || !persona) {
      setPersonaIdState(null);
      return;
    }

    if (!getPersonaById(companyId, persona)) {
      setPersonaIdState(getDefaultPersonaForCompany(companyId)?.id ?? null);
      return;
    }

    setPersonaIdState(persona);
  }

  function resetMode() {
    setCompanyIdState(null);
    setPersonaIdState(null);
    setProvider("openai");
    setFocusNote("");
  }

  const value: InterviewModeContextValue = {
    companyId,
    personaId,
    provider,
    focusNote,
    company,
    persona,
    companies: companyProfiles,
    setCompanyId,
    setPersonaId,
    setProvider,
    setFocusNote,
    resetMode,
  };

  return (
    <InterviewModeContext.Provider value={value}>
      {children}
    </InterviewModeContext.Provider>
  );
}

export function useInterviewMode() {
  const context = useContext(InterviewModeContext);
  if (!context) {
    throw new Error(
      "useInterviewMode must be used inside InterviewModeProvider."
    );
  }
  return context;
}
