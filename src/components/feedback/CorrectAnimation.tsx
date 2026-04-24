"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface CorrectAnimationProps {
  show: boolean;
}

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6BCB77", "#A78BFA", "#F472B6"];

export function CorrectAnimation({ show }: CorrectAnimationProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 320,
        dy: (Math.random() - 0.5) * 280 - 40,
        rot: Math.random() * 540 - 270,
        delay: Math.random() * 0.1,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 8,
      })),
    [show]
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0 }}
                animate={{ x: p.dx, y: p.dy, rotate: p.rot, opacity: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5, times: [0, 0.6, 1] }}
              className="text-8xl md:text-9xl relative z-10"
            >
              🎉
            </motion.div>
          </div>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute mt-40 text-3xl font-black text-success"
          >
            !כל הכבוד
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
