"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TryAgainAnimationProps {
  show: boolean;
}

export function TryAgainAnimation({ show }: TryAgainAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-7xl md:text-8xl"
          >
            🤔
          </motion.div>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute mt-36 text-2xl font-black text-warning"
          >
            !נסו שוב
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
