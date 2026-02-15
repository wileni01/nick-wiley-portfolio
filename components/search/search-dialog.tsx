"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Briefcase, PenLine, ArrowRight } from "lucide-react";

interface SearchItem {
  title: string;
  url: string;
  type: "work" | "writing" | "page";
  summary: string;
}

const staticSearchItems: SearchItem[] = [
  // Pages
  { title: "Home", url: "/", type: "page", summary: "Human-in-the-loop AI for high-stakes decisions" },
  { title: "Resume", url: "/resume", type: "page", summary: "Experience, education, certifications, and patents" },
  { title: "About", url: "/about", type: "page", summary: "Background and approach" },
  { title: "Contact", url: "/contact", type: "page", summary: "Get in touch" },
  { title: "Projects", url: "/projects", type: "page", summary: "Smaller projects and demos" },
  // Case Studies
  { title: "Panel Wizard: Human-in-the-loop ML for proposal panel formation", url: "/work/panel-wizard", type: "work", summary: "SciBERT embeddings + clustering for auditable grouping suggestions at NSF" },
  { title: "USDA Organic Analytics Platform", url: "/work/usda-organic-analytics", type: "work", summary: "Warehouse + Tableau suite supporting 50,000+ operations" },
  { title: "Researcher Lineage Dashboard", url: "/work/researcher-lineage-dashboard", type: "work", summary: "Making funding histories visible for portfolio review" },
  { title: "Building adoption: Study halls", url: "/work/enablement-study-halls", type: "work", summary: "Enablement programs that made analytics usable" },
  { title: "VisiTime AR Tour System", url: "/work/visitime-ar", type: "work", summary: "Geospatial storytelling and AR visitor experience" },
  { title: "Recovery oversight with GIS (RATB)", url: "/work/ratb-gis-oversight", type: "work", summary: "Geospatial analysis for Recovery Act oversight" },
  { title: "Scott Search: Gamified decision support for contact recovery", url: "/work/lli-scott-search", type: "work", summary: "Gamified CRM contact recovery with Apollo.io enrichment and GPT-4 lead scoring" },
  // Writing
  { title: "Human-in-the-loop isn't a compromise. It's the point.", url: "/writing/human-in-the-loop", type: "writing", summary: "Why keeping humans in control is the goal, not a concession" },
  { title: "From dashboards to decisions", url: "/writing/from-dashboards-to-decisions", type: "writing", summary: "What analytics is actually for" },
  { title: "What consulting taught me about building AI responsibly", url: "/writing/consulting-and-responsible-ai", type: "writing", summary: "Governance and adoption as engineering requirements" },
];

function getIcon(type: SearchItem["type"]) {
  switch (type) {
    case "work":
      return <Briefcase className="h-4 w-4 shrink-0 text-primary" />;
    case "writing":
      return <PenLine className="h-4 w-4 shrink-0 text-accent" />;
    default:
      return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}

function getTypeLabel(type: SearchItem["type"]) {
  switch (type) {
    case "work":
      return "Case Study";
    case "writing":
      return "Writing";
    default:
      return "Page";
  }
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? staticSearchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase())
      )
    : staticSearchItems;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (url: string) => {
      router.push(url);
      handleClose();
    },
    [router, handleClose]
  );

  // Keyboard shortcuts: Cmd+K or /
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "/" && !open) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape" && open) {
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search case studies, writing, pages..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
          />
          <button
            onClick={handleClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul role="listbox">
              {results.map((item) => (
                <li key={item.url} role="option" aria-selected={false}>
                  <button
                    onClick={() => handleSelect(item.url)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted group"
                  >
                    {getIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.title}
                        </span>
                        <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.summary}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>{" "}
            to select
          </span>
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
