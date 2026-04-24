"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <span>⭐</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="inline-block min-w-[2ch] text-center"
        >
          {score}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
