"use client";

import Link from "next/link";
import { Check, ClipboardCopy, Download, MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterviewMode } from "./interview-mode-provider";
import { useTransientState } from "./use-transient-state";
import { buildMockInterviewerScript } from "@/lib/adaptive/mock-interviewer";
import { buildMockScriptMarkdown } from "@/lib/adaptive/mock-script-export";
import { copyTextToClipboard } from "@/lib/clipboard";

export function MockInterviewerScript() {
  const { companyId, personaId, company, persona } = useInterviewMode();
  const [copyState, setCopyState] = useTransientState<
    "idle" | "copied" | "error"
  >("idle", 1800);
  const [downloadState, setDownloadState] = useTransientState<"idle" | "done">(
    "idle",
    1800
  );

  const script =
    companyId && personaId ? buildMockInterviewerScript(companyId, personaId) : null;
  const scriptMarkdown =
    company && persona && script
      ? buildMockScriptMarkdown({
          generatedAt: new Date().toISOString(),
          companyName: company.name,
          personaName: persona.name,
          personaRole: persona.role,
          script,
        })
      : "";

  if (!companyId || !personaId || !company || !persona) return null;
  if (!script) return null;

  async function copyScript() {
    try {
      const copied = await copyTextToClipboard(scriptMarkdown);
      setCopyState(copied ? "copied" : "error");
    } catch {
      setCopyState("error");
    }
  }

  function downloadScript() {
    const blob = new Blob([scriptMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock-script-${companyId}-${personaId}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadState("done");
  }

  return (
    <details className="rounded-lg border border-border bg-muted/20 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <MessageSquareQuote className="h-4 w-4 text-primary" />
            {script.heading}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void copyScript();
              }}
              className="text-xs"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied script
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy script
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                downloadScript();
              }}
              className="text-xs"
            >
              {downloadState === "done" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Downloaded
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download script
                </>
              )}
            </Button>
          </div>
        </div>
      </summary>

      <div className="mt-4 space-y-3">
        {script.prompts.map((prompt) => (
          <div key={prompt.question} className="rounded-md border border-border p-3">
            <p className="text-sm font-medium">{prompt.question}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Testing: {prompt.whatTheyAreTesting}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Answer strategy: {prompt.answerStrategy}
            </p>
            {prompt.recommendedArtifact && (
              <div className="mt-2 inline-flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase">
                  {prompt.recommendedArtifact.kind}
                </Badge>
                <Link
                  href={prompt.recommendedArtifact.url}
                  className="text-xs text-primary hover:underline"
                >
                  Review {prompt.recommendedArtifact.title}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      {copyState === "error" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Could not copy automatically. Use download instead.
        </p>
      )}
    </details>
  );
}
