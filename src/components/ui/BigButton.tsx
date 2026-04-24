"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BigButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning";
  disabled?: boolean;
  className?: string;
}

const variantClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
};

export function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className,
}: BigButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "min-h-[56px] min-w-[56px] px-6 py-3 rounded-2xl font-bold text-xl",
        "shadow-md transition-opacity",
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
