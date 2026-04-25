"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DailyQuestState,
  loadDailyQuests,
  saveDailyQuests,
  recordGameEvent,
} from "@/lib/dailyQuests";

type GameEvent = Parameters<typeof recordGameEvent>[1];

export function useDailyQuests() {
  const [state, setState] = useState<DailyQuestState | null>(null);

  useEffect(() => {
    setState(loadDailyQuests());
  }, []);

  const fireEvent = useCallback((event: GameEvent) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = recordGameEvent(prev, event);
      saveDailyQuests(next);
      return next;
    });
  }, []);

  return { quests: state, fireEvent };
}
