"use client";

import { useCallback, useRef, useState } from "react";

export interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

let particleId = 0;

export function useGameJuice() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const burst = useCallback(
    (
      x: number,
      y: number,
      emojis: string[],
      count = 8,
    ) => {
      const newParticles: Particle[] = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 60;
        return {
          id: ++particleId,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id))
        );
      }, 1000);
    },
    []
  );

  const flash = useCallback((color = "#FFD700") => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash(null), 300);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  const celebrate = useCallback(
    (x: number, y: number) => {
      burst(x, y, ["⭐", "✨", "🌟", "💫", "🎉"], 12);
      flash("#FFD700");
    },
    [burst, flash]
  );

  const wrongFeedback = useCallback(() => {
    triggerShake();
    flash("#FF6B6B");
  }, [triggerShake, flash]);

  return { particles, screenFlash, shake, burst, flash, triggerShake, celebrate, wrongFeedback };
}
