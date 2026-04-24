"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onClick: () => void;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function VoiceButton({
  onClick,
  isSpeaking = false,
  size = "md",
  label,
  className,
}: VoiceButtonProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
        transition={isSpeaking ? { duration: 0.5, repeat: Infinity } : {}}
        onClick={onClick}
        className={cn(
          "rounded-full bg-info text-white shadow-lg flex items-center justify-center",
          sizeClasses[size],
          isSpeaking && "bg-warning",
          className
        )}
        aria-label={label || "Listen"}
      >
        {isSpeaking ? "\uD83D\uDD0A" : "\uD83D\uDD08"}
      </motion.button>
      {label && <span className="text-xs font-bold text-foreground/60">{label}</span>}
    </div>
  );
}
