"use client";

import { motion } from "framer-motion";

interface DraggablePieceProps {
  children: React.ReactNode;
  id: string;
  onDragEnd: (id: string, info: { point: { x: number; y: number } }) => void;
  isPlaced: boolean;
}

export function DraggablePiece({ children, id, onDragEnd, isPlaced }: DraggablePieceProps) {
  if (isPlaced) return null;

  return (
    <motion.div
      drag
      dragSnapToOrigin
      whileDrag={{ scale: 1.1, zIndex: 50 }}
      onDragEnd={(_, info) => onDragEnd(id, info)}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      {children}
    </motion.div>
  );
}
