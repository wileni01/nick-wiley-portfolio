"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { ModeHealthPill } from "./mode-health-pill";
import { InterviewCountdownPill } from "./interview-countdown-pill";
import {
  addFocusHistoryEntry,
  getFocusHistoryStorageKey,
  parseFocusHistory,
} from "@/lib/adaptive/focus-history";
import {
  getInterviewDateSummary,
  parseInterviewDate,
} from "@/lib/adaptive/interview-date";
import { getInterviewDateStorageKey } from "@/lib/adaptive/storage-keys";

function formatFocusChipLabel(text: string): string {
  return text.length > 48 ? `${text.slice(0, 47)}…` : text;
}

interface InterviewModeSelectorProps {
  mobile?: boolean;
}

export function InterviewModeSelector({ mobile = false }: InterviewModeSelectorProps) {
  const {
    companyId,
    personaId,
    provider,
    focusNote,
    company,
    persona,
    companies,
    setCompanyId,
    setPersonaId,
    setProvider,
    setFocusNote,
    resetMode,
  } = useInterviewMode();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const [interviewDate, setInterviewDate] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId || !personaId) {
      setFocusHistory([]);
      return;
    }
    const key = getFocusHistoryStorageKey(companyId, personaId);
    function refresh() {
      setFocusHistory(parseFocusHistory(localStorage.getItem(key)));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refresh();
    }

    function onFocusHistoryUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-focus-history-updated", onFocusHistoryUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-focus-history-updated",
        onFocusHistoryUpdate
      );
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) {
      setInterviewDate(null);
      return;
    }
    const key = getInterviewDateStorageKey(companyId, personaId);

    function refresh() {
      setInterviewDate(parseInterviewDate(localStorage.getItem(key)));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refresh();
    }

    function onInterviewDateUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refresh();
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
  }, [companyId, personaId]);

  const interviewTimeline = getInterviewDateSummary(interviewDate);
  const shouldPromptDateSetup =
    interviewTimeline.daysUntil === null || interviewTimeline.daysUntil < 0;

  function setInterviewDateOffset(daysFromNow: number) {
    if (!companyId || !personaId) return;
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + daysFromNow);
    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");
    const nextDate = `${year}-${month}-${day}`;
    const key = getInterviewDateStorageKey(companyId, personaId);
    localStorage.setItem(key, nextDate);
    window.dispatchEvent(
      new CustomEvent("adaptive-interview-date-updated", { detail: { key } })
    );
  }

  async function handleCopyPrepLink() {
    if (!companyId || !personaId) return;

    try {
      const params = new URLSearchParams(window.location.search);
      params.set("company", companyId);
      params.set("persona", personaId);
      params.set("provider", provider);
      if (focusNote.trim()) {
        params.set("focus", focusNote.trim());
      }
      const interviewDate = parseInterviewDate(
        localStorage.getItem(getInterviewDateStorageKey(companyId, personaId))
      );
      if (interviewDate) {
        params.set("date", interviewDate);
      } else {
        params.delete("date");
      }

      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  function saveCurrentFocusNote() {
    if (!companyId || !personaId || !focusNote.trim()) return;
    const key = getFocusHistoryStorageKey(companyId, personaId);
    const nextHistory = addFocusHistoryEntry(
      parseFocusHistory(localStorage.getItem(key)),
      focusNote
    );
    localStorage.setItem(key, JSON.stringify(nextHistory));
    setFocusHistory(nextHistory);
    window.dispatchEvent(
      new CustomEvent("adaptive-focus-history-updated", { detail: { key } })
    );
  }

  function clearFocusHistory() {
    if (!companyId || !personaId) return;
    const key = getFocusHistoryStorageKey(companyId, personaId);
    localStorage.removeItem(key);
    setFocusHistory([]);
    window.dispatchEvent(
      new CustomEvent("adaptive-focus-history-updated", { detail: { key } })
    );
  }

  return (
    <div
      className={`rounded-lg border border-border bg-muted/40 p-2 ${
        mobile ? "space-y-2" : "hidden xl:flex xl:flex-wrap xl:items-center xl:gap-2"
      }`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Interview Mode
        </span>
        <ModeHealthPill />
        <InterviewCountdownPill />
        {companyId && personaId && shouldPromptDateSetup ? (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={() => setInterviewDateOffset(7)}
          >
            {interviewTimeline.daysUntil === null ? "Set date +7d" : "Reset date +7d"}
          </Button>
        ) : null}
      </div>

      <select
        value={companyId ?? ""}
        onChange={(event) =>
          setCompanyId(
            event.target.value
              ? (event.target.value as "kungfu-ai" | "anthropic")
              : null
          )
        }
        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        aria-label="Select target company"
      >
        <option value="">General Portfolio</option>
        {companies.map((companyOption) => (
          <option key={companyOption.id} value={companyOption.id}>
            {companyOption.name}
          </option>
        ))}
      </select>

      <select
        value={personaId ?? ""}
        onChange={(event) => setPersonaId(event.target.value || null)}
        className="h-8 min-w-40 rounded-md border border-border bg-background px-2 text-xs"
        aria-label="Select interviewer persona"
        disabled={!company}
      >
        {!company ? (
          <option value="">Select company first</option>
        ) : (
          company.personas.map((personaOption) => (
            <option key={personaOption.id} value={personaOption.id}>
              {personaOption.name} — {personaOption.role}
            </option>
          ))
        )}
      </select>

      <select
        value={provider}
        onChange={(event) =>
          setProvider(event.target.value as "openai" | "anthropic")
        }
        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        aria-label="Select AI provider for briefing"
      >
        <option value="openai">OpenAI brief</option>
        <option value="anthropic">Anthropic brief</option>
      </select>

      <input
        value={focusNote}
        onChange={(event) => setFocusNote(event.target.value.slice(0, 200))}
        placeholder="Optional focus note (e.g., emphasize platform scaling)"
        className="h-8 min-w-56 rounded-md border border-border bg-background px-2 text-xs"
        aria-label="Optional focus note"
      />

      {persona?.focusPresets?.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {persona.focusPresets.map((preset) => {
            const isActive = focusNote.trim() === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setFocusNote(isActive ? "" : preset)}
                className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      ) : null}

      {focusHistory.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {focusHistory.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFocusNote(item)}
              className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                focusNote.trim() === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
              title={item}
            >
              {formatFocusChipLabel(item)}
            </button>
          ))}
        </div>
      ) : null}

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setCompanyId("anthropic")}
        className="text-xs"
      >
        Compare: Anthropic CEO
      </Button>

      {(company || persona) && (
        <Button size="sm" variant="outline" onClick={resetMode} className="text-xs">
          Reset
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopyPrepLink}
        disabled={!companyId || !personaId}
        className="text-xs"
      >
        {copyState === "copied" ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied link
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy prep link
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={saveCurrentFocusNote}
        disabled={!companyId || !personaId || !focusNote.trim()}
        className="text-xs"
      >
        <Save className="h-3.5 w-3.5" />
        Save focus
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={clearFocusHistory}
        disabled={!companyId || !personaId || !focusHistory.length}
        className="text-xs"
      >
        Clear saved focus
      </Button>
    </div>
  );
}
