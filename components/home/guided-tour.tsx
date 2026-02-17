"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

const tourSteps: TourStep[] = [
  {
    targetId: "hero-section",
    title: "The short version",
    description:
      "I build AI and analytics tools for federal agencies, designed so the people accountable for outcomes stay in control.",
  },
  {
    targetId: "what-i-do",
    title: "What I build",
    description:
      "Decision-support apps, data platforms, and the adoption and governance work that makes those tools stick.",
  },
  {
    targetId: "selected-work",
    title: "Selected work",
    description:
      "Case studies from NSF, USDA, and a startup I founded. You can toggle between Executive and Builder views.",
  },
  {
    targetId: "testimonial-section",
    title: "What others say",
    description: "A word from someone I've worked with.",
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 12;

export function GuidedTourButton() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateSpotlight = useCallback(() => {
    if (!active) return;
    const target = document.getElementById(tourSteps[step].targetId);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setSpotlight({
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    });
  }, [active, step]);

  const handleStart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  const handleEnd = useCallback(() => {
    setActive(false);
    setStep(0);
    setSpotlight(null);
    setIsTransitioning(false);
  }, []);

  const handleNext = useCallback(() => {
    if (step < tourSteps.length - 1) {
      setIsTransitioning(true);
      setStep((s) => s + 1);
    } else {
      handleEnd();
    }
  }, [step, handleEnd]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setIsTransitioning(true);
      setStep((s) => s - 1);
    }
  }, [step]);

  // Scroll to target and update spotlight
  useEffect(() => {
    if (!active) return;
    const target = document.getElementById(tourSteps[step].targetId);
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });

    // Update spotlight after scroll settles
    const updateAfterScroll = () => {
      updateSpotlight();
      setIsTransitioning(false);
    };

    // Clear any previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Initial quick update for responsiveness
    const quickUpdate = setTimeout(updateSpotlight, 50);
    // Final update after scroll completes
    scrollTimeoutRef.current = setTimeout(updateAfterScroll, prefersReducedMotion ? 50 : 550);

    return () => {
      clearTimeout(quickUpdate);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [active, step, prefersReducedMotion, updateSpotlight]);

  // Update spotlight on scroll and resize
  useEffect(() => {
    if (!active) return;

    const handleUpdate = () => updateSpotlight();
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [active, updateSpotlight]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleEnd();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handleEnd, handleNext, handlePrev]);

  // Focus trap
  useEffect(() => {
    if (active && overlayRef.current) {
      overlayRef.current.focus();
    }
  }, [active, step]);

  // Block user-initiated scrolling while allowing programmatic scrollIntoView
  useEffect(() => {
    if (!active) return;
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", prevent, { passive: false });
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      document.removeEventListener("wheel", prevent);
      document.removeEventListener("touchmove", prevent);
    };
  }, [active]);

  const currentStep = tourSteps[step];

  // Build the clip-path polygon that creates a "hole" over the target section
  const clipPath = spotlight
    ? buildClipPath(spotlight)
    : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStart}
        className="gap-2"
      >
        <Play className="h-3.5 w-3.5" />
        Take a 60-second tour
      </Button>

      {active && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[90]"
          role="dialog"
          aria-modal="true"
          aria-label="Guided tour"
          tabIndex={-1}
        >
          {/* Dimmed overlay with spotlight cutout */}
          <div
            className="absolute inset-0 tour-spotlight-overlay"
            style={{ clipPath }}
            onClick={handleEnd}
          />

          {/* Spotlight border glow around the target */}
          {spotlight && (
            <div
              className="fixed pointer-events-none rounded-lg tour-spotlight-ring"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
              }}
            />
          )}

          {/* Tour card — fixed at bottom center so it never covers the content */}
          <div
            className={`fixed bottom-6 left-1/2 z-[91] mx-4 w-full max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl ${
              isTransitioning ? "opacity-80" : "animate-scale-in"
            } transition-opacity duration-200`}
          >
            {/* Close */}
            <button
              onClick={handleEnd}
              className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="End tour"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Progress */}
            <div className="mb-4 flex gap-1">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="space-y-2 pr-6">
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handleEnd}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {step < tourSteps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    "Finish"
                  )}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              {step + 1} of {tourSteps.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Builds a CSS clip-path polygon that covers the full viewport
 * but leaves a rectangular hole for the spotlight area.
 */
function buildClipPath(rect: SpotlightRect): string {
  const { top, left, width, height } = rect;
  const right = left + width;
  const bottom = top + height;

  // Outer rect covers viewport, inner rect punches a hole via evenodd fill
  return `polygon(evenodd,
    0 0, 100% 0, 100% 100%, 0 100%,
    ${left}px ${top}px,
    ${right}px ${top}px,
    ${right}px ${bottom}px,
    ${left}px ${bottom}px
  )`;
}
