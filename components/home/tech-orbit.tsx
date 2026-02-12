"use client";

import { motion } from "framer-motion";

const innerRing = [
  { name: "React", color: "#61DAFB" },
  { name: "Python", color: "#3776AB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Next.js", color: "#808080" },
];

const outerRing = [
  { name: "OpenAI", color: "#10A37F" },
  { name: "D3.js", color: "#F9A03C" },
  { name: "FastAPI", color: "#009688" },
  { name: "Docker", color: "#2496ED" },
  { name: "Neo4j", color: "#008CC1" },
  { name: "Tailwind", color: "#06B6D4" },
  { name: "Stripe", color: "#635BFF" },
  { name: "HubSpot", color: "#FF7A59" },
];

export function TechOrbit() {
  return (
    <div className="relative mx-auto h-[400px] w-[400px]">
      {/* Center node */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
          <span className="text-xl font-bold text-primary">NW</span>
        </div>
      </div>

      {/* Inner ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {innerRing.map((tech, i) => {
          const angle = (i * 360) / innerRing.length;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 100;
          const y = Math.sin(rad) * 100;
          return (
            <motion.div
              key={tech.name}
              className="absolute left-1/2 top-1/2"
              style={{ x: x - 24, y: y - 24 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg"
                style={{ backgroundColor: tech.color }}
                title={tech.name}
              >
                {tech.name.slice(0, 2).toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {outerRing.map((tech, i) => {
          const angle = (i * 360) / outerRing.length;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 175;
          const y = Math.sin(rad) * 175;
          return (
            <motion.div
              key={tech.name}
              className="absolute left-1/2 top-1/2"
              style={{ x: x - 20, y: y - 20 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-md"
                style={{ backgroundColor: tech.color + "CC" }}
                title={tech.name}
              >
                {tech.name.slice(0, 2).toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Orbit rings (visual) */}
      <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/30" />
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/20" />
    </div>
  );
}
