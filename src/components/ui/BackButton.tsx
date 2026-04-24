"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => router.push("/")}
      className="w-12 h-12 rounded-full bg-white/80 shadow-md flex items-center justify-center text-2xl"
      aria-label="חזרה לדף הבית"
    >
      🏠
    </motion.button>
  );
}
