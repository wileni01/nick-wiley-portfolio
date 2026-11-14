"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AudioLines, Bone, Compass, Diamond, Fan, MapPin, Music2, Navigation, Pause, Phone, Play, Radio, Settings } from "lucide-react";
import styles from "./startup-preview.module.css";

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const preference = window.matchMedia(motionPreference);
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function prefersReducedMotion() {
  return window.matchMedia(motionPreference).matches;
}

export function StartupPreview({
  children,
  compact = false,
}: {
  children: React.ReactNode;
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
        data-playback={playback === null ? undefined : playing ? "playing" : "paused"}
        data-offscreen={compact && !inView ? "true" : undefined}
      >
        {children}

        <div className={styles.screen} aria-hidden="true">
          <div className={`${styles.scene} ${styles.factory}`} data-stage="factory">
            <div className={styles.factoryStatus}><span>Factory screen</span><span>9:41</span></div>
            <div className={styles.factoryMap}>
              <span>Navigation</span>
              <Navigation fill="currentColor" />
            </div>
            <div className={styles.factoryTiles}>
              <div><Radio /><span>Audio Off</span></div>
              <div><Phone /><span>Connect Phone</span></div>
            </div>
            <div className={styles.factoryNav}>
              <span><Radio />Audio</span>
              <span><Phone />Phone</span>
              <span><Compass />Nav</span>
              <span><Settings />Settings</span>
            </div>
          </div>

          <div className={`${styles.scene} ${styles.boot}`} data-stage="loading">
            <div className={styles.bootIcon}><Diamond strokeWidth={1.4} /></div>
            <span className={styles.bootTitle}>Loading system</span>
            <span className={styles.bootDetail}>Warming up the dashboard…</span>
            <div className={styles.progress}><span /></div>
          </div>

          <div className={`${styles.scene} ${styles.chief}`} data-stage="chief">
            <span className={styles.chiefTitle}>Drive Safe Dad</span>
            <Bone className={styles.treat} fill="currentColor" strokeWidth={1.3} />
            <Image
              src="/images/projects/chief-boot.webp"
              alt=""
              width={359}
              height={440}
              sizes="(min-width: 880px) 156px, 20vw"
              className={styles.chiefCutout}
            />
          </div>

          <div className={`${styles.scene} ${styles.controls}`} data-stage="controls">
            <div className={styles.dashboardHeader}><span>9:41</span><span>67°</span></div>
            <div className={styles.map}>
              <span><Navigation fill="currentColor" /></span>
              <MapPin className={styles.mapPin} />
            </div>
            <div className={styles.nowPlaying}>
              <span className={styles.musicIcon}><Music2 /></span>
              <span><strong>Now playing</strong><small>On the road</small></span>
              <Play className={styles.trackPlay} fill="currentColor" />
            </div>
            <div className={styles.climate}><Fan /><span>70°</span><span>Auto</span></div>
            <div className={styles.dock}><Compass /><AudioLines /><Fan /></div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`text-link ${styles.playbackButton}`}
        aria-label={playing ? "Pause startup preview" : "Play startup preview"}
        onClick={() => setPlayback(!playing)}
      >
        {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        <span>{playing ? "Pause startup preview" : "Play startup preview"}</span>
      </button>
    </div>
  );
}
