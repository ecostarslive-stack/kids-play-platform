"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BigButton } from "@/components/ui/BigButton";

interface LessonCompleteProps {
  show: boolean;
  lessonTitle: string;
  wordsLearned: number;
  score: number;
  total: number;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
  hasNext: boolean;
}

const celebrationEmojis = ["\u2B50", "\uD83C\uDF1F", "\u2728", "\uD83C\uDF89", "\uD83D\uDCDA", "\uD83C\uDFC6", "\uD83C\uDF8A", "\uD83D\uDCAB"];

export function LessonComplete({
  show,
  lessonTitle,
  wordsLearned,
  score,
  total,
  onNext,
  onReplay,
  onHome,
  hasNext,
}: LessonCompleteProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
        >
          {celebrationEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ x: Math.random() * 300 - 150, y: 100, opacity: 1, scale: 0 }}
              animate={{
                y: -400,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 1],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, repeatDelay: 1 }}
              className="absolute text-3xl"
            >
              {emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full"
          >
            <span className="text-6xl">\uD83C\uDF93</span>
            <h2 className="text-2xl font-black text-center">!Lesson Complete</h2>
            <p className="text-lg text-foreground/60 text-center">{lessonTitle}</p>

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-3xl font-black text-game-purple">{wordsLearned}</p>
                <p className="text-sm text-foreground/60">Words Learned</p>
              </div>
              <div>
                <p className="text-3xl font-black text-success">{score}/{total}</p>
                <p className="text-sm text-foreground/60">Quiz Score</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.min(score, 5) }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="text-3xl"
                >
                  \u2B50
                </motion.span>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              {hasNext && (
                <BigButton onClick={onNext} variant="success" className="w-full">
                  Next Lesson \u27A1\uFE0F
                </BigButton>
              )}
              <BigButton onClick={onReplay} variant="warning" className="w-full">
                \uD83D\uDD04 Practice Again
              </BigButton>
              <BigButton onClick={onHome} variant="secondary" className="w-full">
                \uD83C\uDFE0 Home
              </BigButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
