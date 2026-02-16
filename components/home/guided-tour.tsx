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
      "I build AI and analytics tools for federal agencies — designed so the people accountable for outcomes stay in control.",
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
    description:
      "A word from someone I've worked with.",
  },
];

export function GuidedTourButton() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleStart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  const handleEnd = useCallback(() => {
    setActive(false);
    setStep(0);
  }, []);

  const handleNext = useCallback(() => {
    if (step < tourSteps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleEnd();
    }
  }, [step, handleEnd]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  // Scroll to target
  useEffect(() => {
    if (!active) return;
    const target = document.getElementById(tourSteps[step].targetId);
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [active, step, prefersReducedMotion]);

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

  const currentStep = tourSteps[step];

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
          className="fixed inset-0 z-[90] flex items-end justify-center pb-8 sm:items-center sm:pb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Guided tour"
          tabIndex={-1}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={handleEnd}
          />

          {/* Tour card */}
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-scale-in">
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
                  className={`h-1 flex-1 rounded-full transition-colors ${
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
