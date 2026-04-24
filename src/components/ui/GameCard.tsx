"use client";

import { motion } from "framer-motion";

interface GameCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}

export function GameCard({ title, subtitle, emoji, color }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${color} rounded-3xl p-6 text-white shadow-lg cursor-pointer
        flex flex-col items-center justify-center gap-2 min-h-[160px] md:min-h-[200px]
        transition-shadow hover:shadow-xl`}
    >
      <span className="text-5xl md:text-6xl">{emoji}</span>
      <h2 className="text-xl md:text-2xl font-black">{title}</h2>
      <p className="text-sm md:text-base opacity-80">{subtitle}</p>
    </motion.div>
  );
}
