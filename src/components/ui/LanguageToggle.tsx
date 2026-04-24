"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md
        text-sm font-bold transition-colors hover:bg-white"
      aria-label="Switch language"
    >
      <span className={`transition-opacity ${language === "he" ? "opacity-100" : "opacity-40"}`}>🇮🇱</span>
      <span className="text-foreground/30">/</span>
      <span className={`transition-opacity ${language === "en" ? "opacity-100" : "opacity-40"}`}>🇺🇸</span>
    </motion.button>
  );
}
