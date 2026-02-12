"use client";

import { cn } from "@/lib/utils";

interface ModelToggleProps {
  provider: "openai" | "anthropic";
  onProviderChange: (provider: "openai" | "anthropic") => void;
}

export function ModelToggle({ provider, onProviderChange }: ModelToggleProps) {
  return (
    <div className="flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-medium">
      <button
        onClick={() => onProviderChange("openai")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-all",
          provider === "openai"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        GPT-4o
      </button>
      <button
        onClick={() => onProviderChange("anthropic")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-all",
          provider === "anthropic"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Claude
      </button>
    </div>
  );
}
