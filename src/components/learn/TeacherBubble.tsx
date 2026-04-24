"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TeacherBubbleProps {
  message: string;
  show: boolean;
  onTap?: () => void;
  isSpeaking?: boolean;
}

export function TeacherBubble({ message, show, onTap, isSpeaking }: TeacherBubbleProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 20 }}
          onClick={onTap}
          className="flex items-end gap-2 cursor-pointer"
        >
          <motion.span
            animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
            transition={isSpeaking ? { duration: 0.6, repeat: Infinity } : {}}
            className="text-5xl"
          >
            \uD83E\uDDD1\u200D\uD83C\uDFEB
          </motion.span>
          <div className="bg-white rounded-2xl rounded-br-none shadow-lg px-5 py-3 max-w-[280px]">
            <p className="text-lg font-bold">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
