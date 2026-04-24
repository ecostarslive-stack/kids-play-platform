"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePlayerStore } from "@/lib/usePlayerStore";
import type { PlayerData } from "@/lib/usePlayerStore";
import { AVATARS } from "@/lib/usePlayerStore";

type AvatarEntry = typeof AVATARS[number];

interface PlayerContextType {
  player: PlayerData;
  loaded: boolean;
  updatePlayer: (updates: Partial<PlayerData>) => void;
  completeOnboarding: (name: string, avatarId: string) => void;
  addStars: (count: number) => void;
  avatar: AvatarEntry;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const store = usePlayerStore();

  return (
    <PlayerContext.Provider value={store}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
