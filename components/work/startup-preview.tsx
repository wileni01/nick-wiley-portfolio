import Image from "next/image";
import { AudioLines, Bone, Compass, Diamond, Fan, MapPin, Music2, Navigation, Phone, Play, Radio, Settings } from "lucide-react";
import { LoopingPreview } from "./looping-preview";
import styles from "./startup-preview.module.css";

export function StartupPreview({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <LoopingPreview compact={compact} label="startup preview">
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
    </LoopingPreview>
  );
}
