"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";
import { parseInterviewDate } from "@/lib/adaptive/interview-date";
import {
  clearInterviewDateForMode,
  setInterviewDateForMode,
} from "@/lib/adaptive/interview-date-actions";

interface UseModeInterviewDateInput {
  companyId: string | null;
  personaId: string | null;
}

export function useModeInterviewDate(input: UseModeInterviewDateInput) {
  const { companyId, personaId } = input;
  const [interviewDate, setInterviewDateState] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    if (!companyId || !personaId) return null;
    return getInterviewDateStorageKey(companyId, personaId);
  }, [companyId, personaId]);

  useEffect(() => {
    if (!storageKey) {
      setInterviewDateState(null);
      return;
    }
    const activeStorageKey = storageKey;

    function refresh() {
      setInterviewDateState(
        parseInterviewDate(localStorage.getItem(activeStorageKey))
      );
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === activeStorageKey) refresh();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === activeStorageKey) refresh();
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
  }, [storageKey]);

  const setInterviewDate = useCallback(
    (value: string | null) => {
      if (!companyId || !personaId) return;
      const normalized = parseInterviewDate(value);
      if (normalized) {
        setInterviewDateForMode(companyId, personaId, normalized);
        return;
      }
      clearInterviewDateForMode(companyId, personaId);
    },
    [companyId, personaId]
  );

  return { interviewDate, setInterviewDate, storageKey };
}
