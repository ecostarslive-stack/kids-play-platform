"use client";

import { motion } from "framer-motion";

interface FlipCardProps {
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
}

export function FlipCard({ isFlipped, isMatched, onClick, front, back }: FlipCardProps) {
  return (
    <div
      className="relative w-full aspect-square cursor-pointer"
      style={{ perspective: "600px" }}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Back of card (what you see when not flipped) */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-game-purple to-game-pink
            flex items-center justify-center text-4xl shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          {back}
        </div>
        {/* Front of card (revealed on flip) */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center text-4xl shadow-lg
            ${isMatched ? "bg-success/20 ring-4 ring-success" : "bg-white"}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {front}
        </div>
      </motion.div>
    </div>
  );
}
