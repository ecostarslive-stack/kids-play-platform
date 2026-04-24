"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BigButton } from "@/components/ui/BigButton";

interface CompletionCelebrationProps {
  show: boolean;
  score: number;
  total: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const confettiEmojis = ["🎉", "⭐", "🌟", "🎊", "💫", "🏆", "🎈", "🦄"];

export function CompletionCelebration({
  show,
  score,
  total,
  onPlayAgain,
  onGoHome,
}: CompletionCelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/40 backdrop-blur-sm"
        >
          {/* Confetti */}
          {confettiEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{
                x: Math.random() * 300 - 150,
                y: 100,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                y: -400,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 1],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute text-4xl"
            >
              {emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 mx-4 max-w-sm w-full"
          >
            <span className="text-7xl">🏆</span>
            <h2 className="text-3xl font-black text-foreground">!סיימתם</h2>
            <p className="text-xl text-foreground/70">
              {score} מתוך {total} ⭐
            </p>

            <div className="flex gap-3 mt-4 w-full">
              <BigButton onClick={onPlayAgain} variant="success" className="flex-1">
                🔄 שחקו שוב
              </BigButton>
              <BigButton onClick={onGoHome} variant="secondary" className="flex-1">
                🏠 דף הבית
              </BigButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
