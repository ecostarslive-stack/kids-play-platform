"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePlayerStore, AVATARS } from "@/lib/usePlayerStore";
import { useLanguage } from "@/providers/LanguageProvider";

export function PlayerHeader() {
  const { player, loaded } = usePlayerStore();
  const { isHebrew } = useLanguage();
  const [showStarBurst, setShowStarBurst] = useState(false);
  const prevStars = useRef(player.totalStars);

  useEffect(() => {
    if (!loaded) return;
    if (player.totalStars > prevStars.current) {
      setShowStarBurst(true);
      const t = setTimeout(() => setShowStarBurst(false), 800);
      prevStars.current = player.totalStars;
      return () => clearTimeout(t);
    }
    prevStars.current = player.totalStars;
  }, [player.totalStars, loaded]);

  if (!loaded || !player.onboardingDone) return null;

  const av = AVATARS.find(a => a.id === player.avatarId) ?? AVATARS[0];
  const streakEmoji = player.streakDays >= 7 ? "🔥" : player.streakDays >= 3 ? "⚡" : "🌟";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-2">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md border border-white/60">

        {/* Avatar + Name */}
        <div className="flex items-center gap-2 min-w-0">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {av.emoji}
          </motion.span>
          <span className="font-black text-lg text-purple-700 truncate max-w-[80px]">
            {player.name || (isHebrew ? "חבר" : "Friend")}
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 bg-orange-100 rounded-xl px-3 py-1.5">
          <motion.span
            className="text-xl"
            animate={player.streakDays > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {streakEmoji}
          </motion.span>
          <span className="font-black text-orange-600 text-base">
            {player.streakDays}
          </span>
          <span className="text-orange-500 text-xs font-bold">
            {isHebrew ? "ימים" : "days"}
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 bg-yellow-100 rounded-xl px-3 py-1.5 relative">
          <AnimatePresence>
            {showStarBurst && (
              <motion.div
                key="starburst"
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-400 font-black text-sm pointer-events-none"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                +⭐
              </motion.div>
            )}
          </AnimatePresence>
          <motion.span
            className="text-xl"
            animate={showStarBurst ? { scale: [1, 1.4, 1], rotate: [0, 20, -20, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            ⭐
          </motion.span>
          <span className="font-black text-yellow-600 text-base">
            {player.totalStars}
          </span>
        </div>
      </div>
    </div>
  );
}
