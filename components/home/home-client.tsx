"use client";

import { GuidedTourButton } from "@/components/home/guided-tour";

export function HomeClient() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <GuidedTourButton />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Alexandria, VA</span>
        <span className="text-border">·</span>
        <span>IBM Federal Experience</span>
      </div>
    </div>
  );
}
