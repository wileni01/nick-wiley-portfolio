"use client";

import { useRef, useState } from "react";
import { Download, FileUp, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { getReadinessStorageKey } from "@/lib/adaptive/readiness-checklist";
import { getPrepHistoryStorageKey } from "@/lib/adaptive/prep-history";
import { getPrepGoalStorageKey } from "@/lib/adaptive/prep-goals";
import {
  buildPrepDataBundle,
  parsePrepDataBundle,
} from "@/lib/adaptive/prep-data-bundle";
import {
  getDrillStateStorageKey,
  getMockSessionStorageKey,
  getPrepNotesStorageKey,
} from "@/lib/adaptive/storage-keys";
import { getFocusHistoryStorageKey } from "@/lib/adaptive/focus-history";

type StatusTone = "neutral" | "error" | "success";

export function PrepDataTools() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");
  const [tone, setTone] = useState<StatusTone>("neutral");

  if (!companyId || !personaId || !company || !persona) return null;

  const keys = {
    readiness: getReadinessStorageKey(companyId, personaId),
    history: getPrepHistoryStorageKey(companyId, personaId),
    goals: getPrepGoalStorageKey(companyId, personaId),
    mock: getMockSessionStorageKey(companyId, personaId),
    drills: getDrillStateStorageKey(companyId, personaId),
    notes: getPrepNotesStorageKey(companyId, personaId),
    focusHistory: getFocusHistoryStorageKey(companyId, personaId),
  };

  function emitRefreshEvents() {
    window.dispatchEvent(
      new CustomEvent("adaptive-readiness-updated", {
        detail: { key: keys.readiness },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-history-updated", {
        detail: { key: keys.history },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-goal-updated", {
        detail: { key: keys.goals },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-drill-state-updated", {
        detail: { key: keys.drills },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-mock-session-updated", {
        detail: { key: keys.mock },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-prep-notes-updated", {
        detail: { key: keys.notes },
      })
    );
    window.dispatchEvent(
      new CustomEvent("adaptive-focus-history-updated", {
        detail: { key: keys.focusHistory },
      })
    );
  }

  function getBundleJson() {
    const bundle = buildPrepDataBundle({
      companyId,
      personaId,
      readinessRaw: localStorage.getItem(keys.readiness),
      prepHistoryRaw: localStorage.getItem(keys.history),
      prepGoalRaw: localStorage.getItem(keys.goals),
      prepNotesRaw: localStorage.getItem(keys.notes),
      focusHistoryRaw: localStorage.getItem(keys.focusHistory),
      mockSessionRaw: localStorage.getItem(keys.mock),
      drillStateRaw: localStorage.getItem(keys.drills),
    });
    return JSON.stringify(bundle, null, 2);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(getBundleJson());
      setTone("success");
      setStatus("Prep data copied to clipboard.");
    } catch {
      setTone("error");
      setStatus("Could not copy to clipboard.");
    }
  }

  function downloadJson() {
    const json = getBundleJson();
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prep-data-${companyId}-${personaId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setTone("success");
    setStatus("Prep data exported as JSON.");
  }

  function resetData() {
    Object.values(keys).forEach((key) => localStorage.removeItem(key));
    emitRefreshEvents();
    setTone("success");
    setStatus("Cleared prep data for this company/persona mode.");
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function onImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = parsePrepDataBundle(raw);
      if (!parsed) {
        setTone("error");
        setStatus("Invalid prep data bundle.");
        return;
      }

      localStorage.setItem(keys.readiness, JSON.stringify(parsed.readinessState));
      localStorage.setItem(keys.history, JSON.stringify(parsed.prepHistory));
      localStorage.setItem(keys.goals, JSON.stringify(parsed.prepGoal));
      localStorage.setItem(keys.drills, JSON.stringify(parsed.drillState));
      localStorage.setItem(keys.notes, parsed.prepNotes);
      localStorage.setItem(keys.focusHistory, JSON.stringify(parsed.focusHistory));
      if (parsed.mockSession) {
        localStorage.setItem(keys.mock, JSON.stringify(parsed.mockSession));
      } else {
        localStorage.removeItem(keys.mock);
      }
      emitRefreshEvents();

      if (
        parsed.mode.companyId !== companyId ||
        parsed.mode.personaId !== personaId
      ) {
        setTone("neutral");
        setStatus(
          `Imported bundle from ${parsed.mode.companyId}/${parsed.mode.personaId} into current mode.`
        );
      } else {
        setTone("success");
        setStatus("Prep data imported successfully.");
      }
    } catch {
      setTone("error");
      setStatus("Could not read selected file.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Prep data tools</h3>
        <Badge variant="outline">
          {company.name} · {persona.role}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={copyJson}>
          Copy JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={downloadJson}>
          <Download className="h-3.5 w-3.5" />
          Download JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={triggerImport}>
          <FileUp className="h-3.5 w-3.5" />
          Import JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={resetData}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset mode data
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={onImportFile}
        className="hidden"
      />

      {status ? (
        <p
          className={`text-xs ${
            tone === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {status}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Backup or migrate prep state for this interview mode.
        </p>
      )}
    </div>
  );
}
