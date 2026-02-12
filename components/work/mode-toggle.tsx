"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ViewMode = "executive" | "builder";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  mode: "executive",
  setMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("executive");

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

export function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5">
      <button
        onClick={() => setMode("executive")}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === "executive"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={mode === "executive"}
      >
        Executive
      </button>
      <button
        onClick={() => setMode("builder")}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === "builder"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={mode === "builder"}
      >
        Builder
      </button>
    </div>
  );
}
