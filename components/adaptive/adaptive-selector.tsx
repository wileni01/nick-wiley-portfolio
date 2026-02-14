"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Sparkles } from "lucide-react";
import { useAdaptive } from "./adaptive-provider";
import { getCompanyProfiles } from "@/lib/adaptive/profiles";
import { cn } from "@/lib/utils";

export function AdaptiveSelector() {
  const { isActive, company, persona, activate, deactivate } = useAdaptive();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profiles = getCompanyProfiles();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
          isActive
            ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Personalize portfolio view"
        aria-expanded={open}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">
          {isActive ? `Tailored for ${company?.name}` : "Personalize"}
        </span>
        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deactivate();
              setOpen(false);
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            aria-label="Reset to default view"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {!isActive && <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-lg z-50"
          >
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">
                Tailor this portfolio
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                See the most relevant work for your team
              </p>
            </div>

            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {profiles.map((profile) => (
                <div key={profile.id}>
                  <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {profile.name}
                  </p>
                  {profile.personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        activate(profile.id, p.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left rounded-lg px-2 py-2 text-xs transition-colors",
                        isActive &&
                          company?.id === profile.id &&
                          persona?.id === p.id
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground ml-1">
                        — {p.role}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {isActive && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => {
                    deactivate();
                    setOpen(false);
                  }}
                  className="w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-center"
                >
                  Reset to default view
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
