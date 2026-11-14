"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { AudioLines, Bone, Compass, Diamond, Fan, MapPin, Music2, Navigation, Pause, Play } from "lucide-react";
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

export function StartupPreview({ children }: { children: React.ReactNode }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => false);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const playing = playback ?? !reducedMotion;

  return (
    <>
      <div className={styles.preview} data-playback={playback === null ? undefined : playing ? "playing" : "paused"}>
        {children}

        <div className={styles.screen} aria-hidden="true">
          <div className={`${styles.scene} ${styles.boot}`}>
            <div className={styles.bootIcon}><Diamond strokeWidth={1.4} /></div>
            <span className={styles.bootTitle}>Loading system</span>
            <span className={styles.bootDetail}>Warming up the dashboard…</span>
            <div className={styles.progress}><span /></div>
          </div>

          <div className={`${styles.scene} ${styles.chief}`}>
            <span className={styles.chiefTitle}>Chief is on it</span>
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

          <div className={`${styles.scene} ${styles.controls}`}>
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
        className="text-link mt-3 cursor-pointer"
        onClick={() => setPlayback(!playing)}
      >
        {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        {playing ? "Pause startup preview" : "Play startup preview"}
      </button>
    </>
  );
}
