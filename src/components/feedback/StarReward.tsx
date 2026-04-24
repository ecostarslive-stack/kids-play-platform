"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  stars: number; // 1-3
  visible: boolean;
  onDone: () => void;
  labelHe?: string;
  labelEn?: string;
}

const MESSAGES_HE = ["כל הכבוד! 🎉", "מדהים! 🌟", "וואו, גאון! 🏆", "עשית את זה! 💪", "מושלם! ✨"];
const MESSAGES_EN = ["Awesome! 🎉", "Amazing! 🌟", "You rock! 🏆", "You did it! 💪", "Perfect! ✨"];

export function StarReward({ stars, visible, onDone, labelHe, labelEn }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  const msgHe = labelHe ?? MESSAGES_HE[Math.floor(Math.random() * MESSAGES_HE.length)];
  const msgEn = labelEn ?? MESSAGES_EN[Math.floor(Math.random() * MESSAGES_EN.length)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="star-reward"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />

          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {/* Stars row */}
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="text-5xl"
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={i < stars ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0.25, scale: 0.8 }}
                  transition={{ delay: 0.15 * i, type: "spring", stiffness: 400 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <motion.div
              className="bg-white rounded-3xl px-8 py-4 shadow-2xl text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-2xl font-black text-purple-600">{msgHe}</p>
              <p className="text-sm text-gray-500 font-bold">{msgEn}</p>
              <p className="text-yellow-500 font-black mt-1">+{stars} ⭐</p>
            </motion.div>

            {/* Confetti burst */}
            {["🎊","🎈","✨","🌈","💛","🟡","⭐"].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: (i % 2 === 0 ? 1 : -1) * (40 + i * 20),
                  y: -(60 + i * 15),
                  scale: 0.5,
                  rotate: i * 60,
                }}
                transition={{ delay: 0.2, duration: 0.9 }}
              >
                {e}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
