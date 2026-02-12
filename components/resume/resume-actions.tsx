"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeActionsProps {
  variant?: "button" | "inline";
}

export function ResumeActions({ variant = "button" }: ResumeActionsProps) {
  if (variant === "inline") {
    return (
      <p className="text-xs text-muted-foreground">
        PDF not available?{" "}
        <button
          onClick={() => window.print()}
          className="text-primary hover:underline"
        >
          Print this page
        </button>{" "}
        to save as PDF.
      </p>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
}
