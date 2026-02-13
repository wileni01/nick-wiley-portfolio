"use client";

import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInterviewMode } from "./interview-mode-provider";
import { buildMockInterviewerScript } from "@/lib/adaptive/mock-interviewer";

export function MockInterviewerScript() {
  const { companyId, personaId } = useInterviewMode();

  if (!companyId || !personaId) return null;

  const script = buildMockInterviewerScript(companyId, personaId);
  if (!script) return null;

  return (
    <details className="rounded-lg border border-border bg-muted/20 p-4">
      <summary className="cursor-pointer list-none">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          {script.heading}
        </span>
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
    </details>
  );
}
