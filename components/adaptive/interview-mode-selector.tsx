"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";

interface InterviewModeSelectorProps {
  mobile?: boolean;
}

export function InterviewModeSelector({ mobile = false }: InterviewModeSelectorProps) {
  const {
    companyId,
    personaId,
    provider,
    company,
    persona,
    companies,
    setCompanyId,
    setPersonaId,
    setProvider,
    resetMode,
  } = useInterviewMode();

  return (
    <div
      className={`rounded-lg border border-border bg-muted/40 p-2 ${
        mobile ? "space-y-2" : "hidden xl:flex xl:items-center xl:gap-2"
      }`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Interview Mode
        </span>
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
    </div>
  );
}
