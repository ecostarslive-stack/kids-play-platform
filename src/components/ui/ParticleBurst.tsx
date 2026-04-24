"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Particle } from "@/hooks/useGameJuice";

interface Props {
  particles: Particle[];
  screenFlash?: string | null;
  shake?: boolean;
}

export function ParticleBurst({ particles, screenFlash, shake }: Props) {
  return (
    <>
      {/* Screen flash overlay */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ backgroundColor: screenFlash }}
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.5 }}
            animate={{
              x: p.x + p.vx,
              y: p.y + p.vy + 80,
              opacity: 0,
              scale: 1.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="fixed pointer-events-none z-40 text-2xl"
            style={{ left: 0, top: 0 }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
