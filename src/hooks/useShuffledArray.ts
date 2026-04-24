"use client";

import { useMemo } from "react";
import { shuffleArray } from "@/lib/utils";

export function useShuffledArray<T>(array: T[], deps: unknown[] = []): T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => shuffleArray(array), [array.length, ...deps]);
}
