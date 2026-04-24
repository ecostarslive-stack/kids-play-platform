"use client";

import { motion } from "framer-motion";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties = [
  { id: "easy" as Difficulty, label: "קל", emoji: "🌟", color: "bg-success", description: "מתחילים בקלות" },
  { id: "medium" as Difficulty, label: "בינוני", emoji: "⭐", color: "bg-warning", description: "אתגר קטן" },
  { id: "hard" as Difficulty, label: "קשה", emoji: "💪", color: "bg-primary", description: "!גיבורים על" },
];

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <p className="text-lg font-bold text-center text-foreground/70">בחרו רמת קושי</p>
      {difficulties.map((diff, i) => (
        <motion.button
          key={diff.id}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(diff.id)}
          className={`${diff.color} text-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow`}
        >
          <span className="text-3xl">{diff.emoji}</span>
          <div className="text-start">
            <span className="text-xl font-black block">{diff.label}</span>
            <span className="text-sm opacity-80">{diff.description}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
