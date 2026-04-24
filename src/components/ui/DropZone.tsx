"use client";

import { cn } from "@/lib/utils";

interface DropZoneProps {
  children?: React.ReactNode;
  isFilled: boolean;
  className?: string;
  id: string;
}

export function DropZone({ children, isFilled, className, id }: DropZoneProps) {
  return (
    <div
      data-dropzone={id}
      className={cn(
        "rounded-2xl border-4 border-dashed transition-colors flex items-center justify-center",
        isFilled ? "border-success bg-success/10" : "border-foreground/20 bg-white/30",
        className
      )}
    >
      {children}
    </div>
  );
}
