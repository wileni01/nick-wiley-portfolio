"use client";

import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewMode } from "./interview-mode-provider";
import { getPrepNotesStorageKey } from "@/lib/adaptive/storage-keys";

const MAX_NOTES_LENGTH = 1200;

export function PrepNotes() {
  const { companyId, personaId } = useInterviewMode();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getPrepNotesStorageKey(companyId, personaId);

    function refresh() {
      const raw = localStorage.getItem(key);
      setNotes((raw ?? "").slice(0, MAX_NOTES_LENGTH));
    }

    refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === key) refresh();
    }

    function onNotesUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-prep-notes-updated", onNotesUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adaptive-prep-notes-updated", onNotesUpdate);
    };
  }, [companyId, personaId]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getPrepNotesStorageKey(companyId, personaId);
    localStorage.setItem(key, notes.slice(0, MAX_NOTES_LENGTH));
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-notes-updated", { detail: { key } })
    );
  }, [companyId, notes, personaId]);

  if (!companyId || !personaId) return null;

  function clearNotes() {
    const key = getPrepNotesStorageKey(companyId, personaId);
    localStorage.removeItem(key);
    setNotes("");
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-notes-updated", { detail: { key } })
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-primary" />
          Prep notes
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {notes.length}/{MAX_NOTES_LENGTH}
        </span>
      </div>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value.slice(0, MAX_NOTES_LENGTH))}
        rows={4}
        placeholder="Capture custom reminders, stories, and red flags for this interview mode..."
        maxLength={MAX_NOTES_LENGTH}
      />
      <Button size="sm" variant="ghost" onClick={clearNotes}>
        Clear notes
      </Button>
    </div>
  );
}
