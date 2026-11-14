"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function StartupPreview({ children }: { children: React.ReactNode }) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);

  function play() {
    setPlays((count) => count + 1);
    setPlaying(true);
  }

  return (
    <>
      <div className="relative overflow-hidden">
        {children}
        {plays > 0 && (
          <div
            key={plays}
            className="startup-display"
            aria-hidden="true"
            onAnimationEnd={() => setPlaying(false)}
          />
        )}
      </div>
      <button type="button" className="text-link mt-3 cursor-pointer" onClick={play} disabled={playing}>
        <Play size={15} aria-hidden="true" />
        {playing ? "Playing startup preview" : "Play startup preview"}
      </button>
    </>
  );
}
