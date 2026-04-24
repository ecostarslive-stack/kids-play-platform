"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { usePlayer } from "@/providers/PlayerProvider";

interface CompletionCelebrationProps {
  show: boolean;
  score: number;
  total: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const confettiEmojis = ["🎉", "⭐", "🌟", "🎊", "💫", "🏆", "🎈", "🦄"];

/** Calculate 1-3 stars based on score / total ratio */
function calcStars(score: number, total: number): number {
  if (total === 0) return 1;
  const ratio = score / total;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

export function CompletionCelebration({
  show,
  score,
  total,
  onPlayAgain,
  onGoHome,
}: CompletionCelebrationProps) {
  const { addStars } = usePlayer();
  const awardedRef = useRef(false);
  const stars = calcStars(score, total);

  // Award stars exactly once when the celebration appears
  useEffect(() => {
    if (show && !awardedRef.current) {
      awardedRef.current = true;
      addStars(stars);
    }
    if (!show) {
      awardedRef.current = false;
    }
  }, [show, stars, addStars]);

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
              initial={{ x: Math.random() * 300 - 150, y: 100, opacity: 1, scale: 0 }}
              animate={{
                y: -400,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 1],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
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

            {/* Stars earned */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <motion.span
                  key={s}
                  className="text-4xl"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={s <= stars ? { scale: 1, rotate: 0 } : { scale: 0.6, opacity: 0.3 }}
                  transition={{ delay: 0.5 + s * 0.15, type: "spring", stiffness: 400 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <p className="text-xl text-foreground/70">
              {score} מתוך {total}
            </p>

            <motion.p
              className="text-yellow-500 font-black text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              +{stars} ⭐ נוספו לאוסף שלך!
            </motion.p>

            <div className="flex gap-3 mt-2 w-full">
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
