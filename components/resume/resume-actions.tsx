"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResumeActions() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" /> Print
    </Button>
  );
}
