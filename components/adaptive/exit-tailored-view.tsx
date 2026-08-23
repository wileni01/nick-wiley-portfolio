"use client";

import { X } from "lucide-react";
import { useAdaptiveMaybe } from "./adaptive-provider";

/**
 * Small control for leaving a tailored (link-activated) view and returning
 * to the default site. Used by the server-rendered Platinion variant, which
 * has no other way to reset the session cookie.
 */
export function ExitTailoredView({ className }: { className?: string }) {
  const adaptive = useAdaptiveMaybe();
  if (!adaptive) return null;

  return (
    <button
      type="button"
      onClick={adaptive.deactivate}
      className={
        className ??
        "inline-flex items-center gap-1 rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
      }
      aria-label="Exit tailored view"
      title="Exit tailored view"
    >
      <X className="h-3 w-3" />
    </button>
  );
}
