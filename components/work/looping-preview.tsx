"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./looping-preview.module.css";

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const preference = window.matchMedia(motionPreference);
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function prefersReducedMotion() {
  return window.matchMedia(motionPreference).matches;
}

export function LoopingPreview({
  children,
  label,
  compact = false,
}: {
  children: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => false);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const playing = playback ?? !reducedMotion;

  useEffect(() => {
    const preview = previewRef.current;
    if (!compact || !preview) return;
    const threshold = 0.35;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= threshold),
      { threshold }
    );
    observer.observe(preview);
    return () => observer.disconnect();
  }, [compact]);

  return (
    <div className={styles.player} data-compact={compact || undefined}>
      <div
        ref={previewRef}
        className={styles.preview}
        data-default-motion={playback === null ? "" : undefined}
        data-playback={playback === null ? undefined : playing ? "playing" : "paused"}
        data-offscreen={compact && !inView ? "true" : undefined}
      >
        {children}
      </div>
      <button
        type="button"
        className={`text-link ${styles.playbackButton}`}
        aria-label={`${playing ? "Pause" : "Play"} ${label}`}
        onClick={() => setPlayback(!playing)}
      >
        {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        <span>{playing ? "Pause" : "Play"} {label}</span>
      </button>
    </div>
  );
}
