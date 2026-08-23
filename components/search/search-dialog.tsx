"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Briefcase, PenLine, ArrowRight } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";

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

function matches(item: SearchItem, terms: string[]) {
  const haystack =
    `${item.title} ${item.summary} ${item.keywords}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function SearchDialog({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? items.filter((item) => matches(item, terms)) : items;
  }, [items, query]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
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

  // Global shortcuts: Cmd/Ctrl+K or "/" to open, Escape to close.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
        return;
      }
      if (e.key === "/" && !open) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        handleOpen();
        return;
      }
      if (e.key === "Escape" && open) {
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpen, handleClose]);

  // Focus the input when the dialog opens.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  // Keep the highlighted result visible while arrowing through the list.
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) handleSelect(item.url);
    }
  }

  if (!open) return null;

  const safeActive = Math.min(activeIndex, Math.max(results.length - 1, 0));

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
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search case studies, writing, pages..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
            role="combobox"
            aria-expanded="true"
            aria-controls="site-search-results"
            aria-activedescendant={
              results[safeActive] ? `search-option-${safeActive}` : undefined
            }
            autoComplete="off"
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
            <ul id="site-search-results" role="listbox" ref={listRef}>
              {results.map((item, index) => {
                const active = index === safeActive;
                return (
                  <li
                    key={item.url}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(item.url)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors group ${
                        active ? "bg-muted" : "hover:bg-muted"
                      }`}
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
                      <ArrowRight
                        className={`h-3.5 w-3.5 text-muted-foreground transition-opacity shrink-0 ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>{" "}
            to navigate{" "}
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
