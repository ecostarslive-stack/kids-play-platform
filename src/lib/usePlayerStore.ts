"use client";

import { useState, useEffect, useCallback } from "react";

export const AVATARS = [
  { id: "lion",    emoji: "🦁", label: "ארי",      labelEn: "Lion"    },
  { id: "bunny",   emoji: "🐰", label: "ארנב",     labelEn: "Bunny"   },
  { id: "dino",    emoji: "🦕", label: "דינוזאור", labelEn: "Dino"    },
  { id: "cat",     emoji: "🐱", label: "חתול",     labelEn: "Cat"     },
  { id: "bear",    emoji: "🐻", label: "דב",       labelEn: "Bear"    },
  { id: "panda",   emoji: "🐼", label: "פנדה",     labelEn: "Panda"   },
  { id: "owl",     emoji: "🦉", label: "ינשוף",    labelEn: "Owl"     },
  { id: "frog",    emoji: "🐸", label: "צפרדע",   labelEn: "Frog"    },
];

export interface PlayerData {
  name: string;
  avatarId: string;
  totalStars: number;
  streakDays: number;
  lastPlayDate: string | null; // ISO date string YYYY-MM-DD
  starsToday: number;
  onboardingDone: boolean;
  gameStars: Record<string, number>; // slug -> best star count (1-3)
}

const DEFAULT_PLAYER: PlayerData = {
  name: "",
  avatarId: "lion",
  totalStars: 0,
  streakDays: 0,
  lastPlayDate: null,
  starsToday: 0,
  onboardingDone: false,
  gameStars: {},
};

const STORAGE_KEY = "kids-play-player";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadPlayer(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER };
    return { ...DEFAULT_PLAYER, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PLAYER };
  }
}

function savePlayer(p: PlayerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/**
 * Checks/updates streak based on today's date and last play date.
 * Returns updated player (may mutate streak/starsToday).
 */
function refreshStreak(p: PlayerData): PlayerData {
  const today = todayStr();
  if (p.lastPlayDate === today) return p;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newStreak =
    p.lastPlayDate === yesterdayStr
      ? p.streakDays // will be incremented on first star today
      : 0;

  return {
    ...p,
    streakDays: newStreak,
    starsToday: 0,
  };
}

export function usePlayerStore() {
  const [player, setPlayerState] = useState<PlayerData>({ ...DEFAULT_PLAYER });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = refreshStreak(loadPlayer());
    setPlayerState(p);
    setLoaded(true);
  }, []);

  const updatePlayer = useCallback((updates: Partial<PlayerData>) => {
    setPlayerState((prev) => {
      const next = { ...prev, ...updates };
      savePlayer(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback((name: string, avatarId: string) => {
    const today = todayStr();
    const next: PlayerData = {
      ...DEFAULT_PLAYER,
      name,
      avatarId,
      onboardingDone: true,
      lastPlayDate: today,
      streakDays: 1,
      starsToday: 0,
      totalStars: 0,
    };
    savePlayer(next);
    setPlayerState(next);
  }, []);

  /** Call after a game is won / challenge completed */
  const addStars = useCallback((count: number) => {
    setPlayerState((prev) => {
      const today = todayStr();
      const wasNewDay = prev.lastPlayDate !== today;
      const streakDays = wasNewDay
        ? (() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yd = yesterday.toISOString().slice(0, 10);
            return prev.lastPlayDate === yd ? prev.streakDays + 1 : 1;
          })()
        : prev.streakDays;

      const next: PlayerData = {
        ...prev,
        totalStars: prev.totalStars + count,
        starsToday: wasNewDay ? count : prev.starsToday + count,
        lastPlayDate: today,
        streakDays,
      };
      savePlayer(next);
      return next;
    });
  }, []);

  /** Record a game completion with 1-3 stars. Only keeps best score per game. */
  const recordGameComplete = useCallback((slug: string, stars: number) => {
    setPlayerState((prev) => {
      const best = Math.max(prev.gameStars?.[slug] ?? 0, Math.min(3, Math.max(1, stars)));
      const next: PlayerData = {
        ...prev,
        gameStars: { ...(prev.gameStars ?? {}), [slug]: best },
      };
      savePlayer(next);
      return next;
    });
  }, []);

  const avatar = AVATARS.find((a) => a.id === player.avatarId) ?? AVATARS[0];

  return { player, loaded, updatePlayer, completeOnboarding, addStars, recordGameComplete, avatar };
}
