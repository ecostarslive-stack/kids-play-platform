"use client";

import { motion } from "framer-motion";
import { useGameSound } from "@/hooks/useGameSound";

export function SoundToggle() {
  const { isMuted, toggleMute, playClick } = useGameSound();

  const handleClick = () => {
    if (isMuted) {
      toggleMute();
      setTimeout(() => playClick(), 30);
    } else {
      playClick();
      toggleMute();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
      aria-label={isMuted ? "הפעל צליל" : "השתק"}
      className="fixed top-3 left-3 z-50 w-12 h-12 rounded-full bg-white shadow-lg
        flex items-center justify-center text-2xl border-2 border-game-purple/20
        hover:shadow-xl transition-shadow"
    >
      {isMuted ? "🔇" : "🔊"}
    </motion.button>
  );
}
