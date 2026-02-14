"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardPaste, Download, FileUp, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewMode } from "./interview-mode-provider";
import { getReadinessStorageKey } from "@/lib/adaptive/readiness-checklist";
import { getPrepHistoryStorageKey } from "@/lib/adaptive/prep-history";
import { getPrepGoalStorageKey } from "@/lib/adaptive/prep-goals";
import {
  buildPrepDataBundle,
  parsePrepDataBundle,
  PREP_DATA_BUNDLE_MAX_CHARS,
  type PrepDataBundle,
} from "@/lib/adaptive/prep-data-bundle";
import {
  getDrillStateStorageKey,
  getInterviewDateStorageKey,
  getLaunchpadStorageKey,
  getMockSessionStorageKey,
  getPrepNotesStorageKey,
} from "@/lib/adaptive/storage-keys";
import { getFocusHistoryStorageKey } from "@/lib/adaptive/focus-history";
import { copyTextToClipboard } from "@/lib/clipboard";
import { sanitizeFileToken, triggerDownload } from "@/lib/download";

type StatusTone = "neutral" | "error" | "success";
const CROSS_MODE_IMPORT_CONFIRM_MS = 10000;

type PrepDataKeyName =
  | "readiness"
  | "history"
  | "goals"
  | "mock"
  | "drills"
  | "notes"
  | "focusHistory"
  | "launchpad"
  | "interviewDate";

export function PrepDataTools() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const activeModeKey = companyId && personaId ? `${companyId}/${personaId}` : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");
  const [tone, setTone] = useState<StatusTone>("neutral");
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<PrepDataBundle | null>(null);
  const [pendingImportTargetKey, setPendingImportTargetKey] = useState<string | null>(
    null
  );
  const [manualJson, setManualJson] = useState("");

  useEffect(() => {
    if (!confirmReset) return;
    const timeout = window.setTimeout(() => {
      setConfirmReset(false);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [confirmReset]);

  useEffect(() => {
    if (!pendingImport) return;
    const timeout = window.setTimeout(() => {
      setPendingImport(null);
      setPendingImportTargetKey(null);
      setTone("neutral");
      setStatus("Cross-mode import request expired. Re-import to continue.");
    }, CROSS_MODE_IMPORT_CONFIRM_MS);
    return () => window.clearTimeout(timeout);
  }, [pendingImport]);

  useEffect(() => {
    if (!pendingImport || !pendingImportTargetKey || !activeModeKey) return;
    if (pendingImportTargetKey === activeModeKey) return;
    setPendingImport(null);
    setPendingImportTargetKey(null);
    setTone("neutral");
    setStatus("Active mode changed. Pending cross-mode import was cleared.");
  }, [activeModeKey, pendingImport, pendingImportTargetKey]);

  if (!companyId || !personaId || !company || !persona) return null;
  const activeCompanyId = companyId;
  const activePersonaId = personaId;

  const keys = {
    readiness: getReadinessStorageKey(activeCompanyId, activePersonaId),
    history: getPrepHistoryStorageKey(activeCompanyId, activePersonaId),
    goals: getPrepGoalStorageKey(activeCompanyId, activePersonaId),
    mock: getMockSessionStorageKey(activeCompanyId, activePersonaId),
    drills: getDrillStateStorageKey(activeCompanyId, activePersonaId),
    notes: getPrepNotesStorageKey(activeCompanyId, activePersonaId),
    focusHistory: getFocusHistoryStorageKey(activeCompanyId, activePersonaId),
    launchpad: getLaunchpadStorageKey(activeCompanyId, activePersonaId),
    interviewDate: getInterviewDateStorageKey(activeCompanyId, activePersonaId),
  };
  const maxBundleSizeKb = Math.round(PREP_DATA_BUNDLE_MAX_CHARS / 1024);

  function emitRefreshEvents(changed: Partial<Record<PrepDataKeyName, boolean>>) {
    if (!Object.keys(changed).length) return;
    if (changed.readiness) {
      window.dispatchEvent(
        new CustomEvent("adaptive-readiness-updated", {
          detail: { key: keys.readiness },
        })
      );
    }
    if (changed.history) {
      window.dispatchEvent(
        new CustomEvent("adaptive-prep-history-updated", {
          detail: { key: keys.history },
        })
      );
    }
    if (changed.goals) {
      window.dispatchEvent(
        new CustomEvent("adaptive-prep-goal-updated", {
          detail: { key: keys.goals },
        })
      );
    }
    if (changed.drills) {
      window.dispatchEvent(
        new CustomEvent("adaptive-drill-state-updated", {
          detail: { key: keys.drills },
        })
      );
    }
    if (changed.mock) {
      window.dispatchEvent(
        new CustomEvent("adaptive-mock-session-updated", {
          detail: { key: keys.mock },
        })
      );
    }
    if (changed.notes) {
      window.dispatchEvent(
        new CustomEvent("adaptive-prep-notes-updated", {
          detail: { key: keys.notes },
        })
      );
    }
    if (changed.focusHistory) {
      window.dispatchEvent(
        new CustomEvent("adaptive-focus-history-updated", {
          detail: { key: keys.focusHistory },
        })
      );
    }
    if (changed.launchpad) {
      window.dispatchEvent(
        new CustomEvent("adaptive-launchpad-updated", {
          detail: { key: keys.launchpad },
        })
      );
    }
    if (changed.interviewDate) {
      window.dispatchEvent(
        new CustomEvent("adaptive-interview-date-updated", {
          detail: { key: keys.interviewDate },
        })
      );
    }
  }

  function getBundleJson() {
    const bundle = buildPrepDataBundle({
      companyId: activeCompanyId,
      personaId: activePersonaId,
      readinessRaw: localStorage.getItem(keys.readiness),
      prepHistoryRaw: localStorage.getItem(keys.history),
      prepGoalRaw: localStorage.getItem(keys.goals),
      prepNotesRaw: localStorage.getItem(keys.notes),
      focusHistoryRaw: localStorage.getItem(keys.focusHistory),
      interviewDateRaw: localStorage.getItem(keys.interviewDate),
      launchpadStateRaw: localStorage.getItem(keys.launchpad),
      mockSessionRaw: localStorage.getItem(keys.mock),
      drillStateRaw: localStorage.getItem(keys.drills),
    });
    return JSON.stringify(bundle, null, 2);
  }

  async function copyJson() {
    setConfirmReset(false);
    setPendingImport(null);
    setPendingImportTargetKey(null);
    try {
      const copied = await copyTextToClipboard(getBundleJson());
      if (!copied) {
        setTone("error");
        setStatus("Could not copy to clipboard.");
        return;
      }
      setTone("success");
      setStatus("Prep data copied to clipboard.");
    } catch {
      setTone("error");
      setStatus("Could not copy to clipboard.");
    }
  }

  function downloadJson() {
    setConfirmReset(false);
    setPendingImport(null);
    setPendingImportTargetKey(null);
    const json = getBundleJson();
    const downloaded = triggerDownload({
      content: json,
      mimeType: "application/json;charset=utf-8",
      filename: `prep-data-${sanitizeFileToken(
        activeCompanyId,
        "company"
      )}-${sanitizeFileToken(activePersonaId, "persona")}.json`,
    });
    if (!downloaded) {
      setTone("error");
      setStatus("Could not start download.");
      return;
    }
    setTone("success");
    setStatus("Prep data exported as JSON.");
  }

  function resetData() {
    setPendingImport(null);
    setPendingImportTargetKey(null);
    if (!confirmReset) {
      setTone("neutral");
      setStatus("Click reset again within 5 seconds to confirm.");
      setConfirmReset(true);
      return;
    }

    const changed: Partial<Record<PrepDataKeyName, boolean>> = {};
    (Object.entries(keys) as Array<[PrepDataKeyName, string]>).forEach(
      ([name, key]) => {
        if (localStorage.getItem(key) === null) return;
        localStorage.removeItem(key);
        changed[name] = true;
      }
    );
    emitRefreshEvents(changed);
    if (!Object.keys(changed).length) {
      setTone("neutral");
      setStatus("No prep data found to clear for this mode.");
      setConfirmReset(false);
      return;
    }
    setTone("success");
    setStatus("Cleared prep data for this company/persona mode.");
    setConfirmReset(false);
  }

  function triggerImport() {
    setPendingImport(null);
    setPendingImportTargetKey(null);
    fileInputRef.current?.click();
  }

  function applyImportedBundle(parsed: PrepDataBundle) {
    setPendingImport(null);
    setPendingImportTargetKey(null);
    const changed: Partial<Record<PrepDataKeyName, boolean>> = {};

    function writeValue(name: PrepDataKeyName, nextValue: string | null) {
      const key = keys[name];
      const existing = localStorage.getItem(key);
      if (nextValue === null) {
        if (existing === null) return;
        localStorage.removeItem(key);
        changed[name] = true;
        return;
      }
      if (existing === nextValue) return;
      localStorage.setItem(key, nextValue);
      changed[name] = true;
    }

    writeValue("readiness", JSON.stringify(parsed.readinessState));
    writeValue("history", JSON.stringify(parsed.prepHistory));
    writeValue("goals", JSON.stringify(parsed.prepGoal));
    writeValue("drills", JSON.stringify(parsed.drillState));
    writeValue("notes", parsed.prepNotes);
    writeValue("focusHistory", JSON.stringify(parsed.focusHistory));
    writeValue("interviewDate", parsed.interviewDate);
    writeValue("launchpad", JSON.stringify(parsed.launchpadState));
    writeValue(
      "mock",
      parsed.mockSession ? JSON.stringify(parsed.mockSession) : null
    );

    emitRefreshEvents(changed);
    const changedCount = Object.keys(changed).length;

    if (
      parsed.mode.companyId !== activeCompanyId ||
      parsed.mode.personaId !== activePersonaId
    ) {
      setTone("neutral");
      setStatus(changedCount
        ? `Imported bundle from ${parsed.mode.companyId}/${parsed.mode.personaId} into current mode.`
        : `Bundle from ${parsed.mode.companyId}/${parsed.mode.personaId} matched current mode data (no changes applied).`);
    } else {
      setTone(changedCount ? "success" : "neutral");
      setStatus(
        changedCount
          ? "Prep data imported successfully."
          : "Prep data already matches this mode."
      );
    }
  }

  function isCrossModeBundle(parsed: PrepDataBundle): boolean {
    return (
      parsed.mode.companyId !== activeCompanyId ||
      parsed.mode.personaId !== activePersonaId
    );
  }

  function queueCrossModeImport(parsed: PrepDataBundle) {
    setConfirmReset(false);
    setPendingImport(parsed);
    setPendingImportTargetKey(activeModeKey);
    setTone("neutral");
    setStatus(
      `Bundle is from ${parsed.mode.companyId}/${parsed.mode.personaId}. Confirm within ${
        CROSS_MODE_IMPORT_CONFIRM_MS / 1000
      }s to import into current mode.`
    );
  }

  function cancelPendingImport() {
    if (!pendingImport) return;
    setPendingImport(null);
    setPendingImportTargetKey(null);
    setTone("neutral");
    setStatus("Cross-mode import canceled.");
  }

  function confirmPendingImport() {
    if (!pendingImport) return;
    if (!activeModeKey || (pendingImportTargetKey && pendingImportTargetKey !== activeModeKey)) {
      setPendingImport(null);
      setPendingImportTargetKey(null);
      setTone("neutral");
      setStatus("Active mode changed. Re-import bundle to continue.");
      return;
    }
    applyImportedBundle(pendingImport);
  }

  function importRawBundle(raw: string, source: "clipboard" | "file" | "manual"): boolean {
    if (!raw.trim()) {
      setTone("error");
      setStatus(
        source === "manual" ? "No JSON was provided." : `${source} content is empty.`
      );
      return false;
    }
    if (raw.length > PREP_DATA_BUNDLE_MAX_CHARS) {
      setTone("error");
      setStatus(
        source === "file"
          ? `Selected file is too large (max ${maxBundleSizeKb} KB).`
          : `JSON is too large (max ${maxBundleSizeKb} KB).`
      );
      return false;
    }

    const parsed = parsePrepDataBundle(raw);
    if (!parsed) {
      setTone("error");
      setStatus(
        source === "clipboard"
          ? "Clipboard does not contain a valid prep data bundle."
          : source === "manual"
            ? "Pasted content is not a valid prep data bundle."
            : "Invalid prep data bundle."
      );
      return false;
    }
    if (isCrossModeBundle(parsed)) {
      queueCrossModeImport(parsed);
      if (source === "manual") {
        setManualJson("");
      }
      return true;
    }
    applyImportedBundle(parsed);
    if (source === "manual") {
      setManualJson("");
    }
    return true;
  }

  async function pasteJsonFromClipboard() {
    setConfirmReset(false);
    setPendingImport(null);
    setPendingImportTargetKey(null);
    const canReadClipboard =
      typeof navigator !== "undefined" &&
      Boolean(navigator.clipboard?.readText);

    if (canReadClipboard) {
      try {
        const raw = await navigator.clipboard.readText();
        if (importRawBundle(raw, "clipboard")) return;
      } catch {
        // Fall through to manual paste prompt.
      }
    }
    setTone("neutral");
    setStatus("Clipboard read unavailable. Paste JSON manually below.");
  }

  function importManualJson() {
    setConfirmReset(false);
    setPendingImport(null);
    setPendingImportTargetKey(null);
    importRawBundle(manualJson, "manual");
  }

  async function onImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    setConfirmReset(false);
    setPendingImport(null);
    setPendingImportTargetKey(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      importRawBundle(raw, "file");
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
        <Button size="sm" variant="ghost" onClick={pasteJsonFromClipboard}>
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste JSON
        </Button>
        <Button
          size="sm"
          variant={confirmReset ? "destructive" : "ghost"}
          onClick={resetData}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {confirmReset ? "Confirm reset" : "Reset mode data"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={onImportFile}
        className="hidden"
      />

      {pendingImport ? (
        <div className="rounded-md border border-amber-400/50 bg-amber-50/40 dark:bg-amber-950/20 p-2 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Pending cross-mode import:{" "}
            <span className="font-medium text-foreground">
              {pendingImport.mode.companyId}/{pendingImport.mode.personaId}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={confirmPendingImport}
            >
              Confirm import
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px]"
              onClick={cancelPendingImport}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-background p-3 space-y-2">
        <p className="text-xs font-medium">Manual paste import</p>
        <Textarea
          value={manualJson}
          onChange={(event) => setManualJson(event.target.value)}
          rows={5}
          placeholder='Paste exported prep JSON here, then click "Import pasted JSON".'
          className="text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={importManualJson}
            disabled={!manualJson.trim()}
          >
            Import pasted JSON
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px]"
            onClick={() => setManualJson("")}
            disabled={!manualJson}
          >
            Clear pasted JSON
          </Button>
        </div>
      </div>

      {status ? (
        <p
          role="status"
          aria-live="polite"
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
