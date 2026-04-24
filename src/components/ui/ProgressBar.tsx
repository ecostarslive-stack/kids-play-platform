"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm font-bold mb-1 text-foreground/70">
        <span>{current} / {total}</span>
        <span>⭐</span>
      </div>
      <div className="h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-l from-success to-game-green rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
    </div>
  );
}
