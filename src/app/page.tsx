"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AvatarOnboarding } from "@/components/ui/AvatarOnboarding";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePlayer } from "@/providers/PlayerProvider";
import { DailyQuestPanel } from "@/components/ui/DailyQuestPanel";

// ── Island / World Map Data ────────────────────────────────────────────────────
interface Island {
  slug: string;
  label: string;
  emoji: string;
  color: string; // island bg
  x: number; // % from left
  y: number; // % from top
  size: number; // relative size factor
  stars?: number; // locked threshold
}

const ISLANDS: Island[] = [
  { slug: "alef-bet",      label: "אותיות",   emoji: "🔤", color: "#a855f7", x: 50, y: 12, size: 1.3 },
  { slug: "numbers",       label: "מספרים",   emoji: "🔢", color: "#ec4899", x: 22, y: 28, size: 1.1 },
  { slug: "colors",        label: "צבעים",    emoji: "🎨", color: "#f97316", x: 75, y: 30, size: 1.0 },
  { slug: "magic-kitchen", label: "מטבח",     emoji: "🍳", color: "#f59e0b", x: 15, y: 52, size: 1.0 },
  { slug: "magic-garden",  label: "גן",       emoji: "🌻", color: "#22c55e", x: 55, y: 50, size: 1.1 },
  { slug: "dress-up",      label: "לבוש",     emoji: "👗", color: "#d946ef", x: 85, y: 55, size: 0.95 },
  { slug: "memory",        label: "זיכרון",   emoji: "🧠", color: "#3b82f6", x: 30, y: 70, size: 0.95 },
  { slug: "treasure-hunt", label: "אוצר",     emoji: "🗺️", color: "#0ea5e9", x: 72, y: 72, size: 0.95 },
  { slug: "word-builder",  label: "מילים",    emoji: "📝", color: "#10b981", x: 45, y: 84, size: 0.9 },
  { slug: "shapes",        label: "צורות",    emoji: "🔷", color: "#eab308", x: 12, y: 82, size: 0.85 },
  { slug: "balloon-pop",   label: "בלונים",   emoji: "🎈", color: "#f43f5e", x: 83, y: 84, size: 0.85 },
  { slug: "simon",         label: "סיימון",   emoji: "🔔", color: "#8b5cf6", x: 60, y: 92, size: 0.8  },
];

// Background decoration clouds/fish
const BG_DECO = [
  { emoji: "☁️",  x: 5,  y: 8,  scale: 1.4 },
  { emoji: "☁️",  x: 72, y: 5,  scale: 1.0 },
  { emoji: "☁️",  x: 88, y: 18, scale: 0.8 },
  { emoji: "🐟",  x: 2,  y: 42, scale: 0.9 },
  { emoji: "🐠",  x: 92, y: 68, scale: 0.9 },
  { emoji: "⛵",  x: 40, y: 95, scale: 1.0 },
  { emoji: "🌊",  x: 0,  y: 97, scale: 1.5 },
  { emoji: "🌊",  x: 50, y: 97, scale: 1.5 },
  { emoji: "⭐",  x: 10, y: 18, scale: 0.7 },
  { emoji: "⭐",  x: 95, y: 38, scale: 0.6 },
];

// Path connections between islands (drawn as SVG lines)
const PATHS = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  [3, 6], [4, 6], [4, 7], [5, 7], [6, 9], [6, 8], [7, 10], [8, 11],
];

export default function HomePage() {
  const { isHebrew } = useLanguage();
  const { player, loaded, completeOnboarding } = usePlayer();
  const [activeIsland, setActiveIsland] = useState<string | null>(null);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-6xl"
        >
          🌟
        </motion.div>
      </div>
    );
  }

  if (!player.onboardingDone) {
    return <AvatarOnboarding onDone={completeOnboarding} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center pb-6 gap-0 overflow-x-hidden">
      {/* Top bar */}
      <div className="w-full max-w-3xl flex justify-between items-center px-4 pt-3 pb-1 z-10">
        <PlayerBadge player={player} isHebrew={isHebrew} />
        <LanguageToggle />
      </div>

      {/* Daily Quest strip */}
      <div className="w-full max-w-3xl px-3 mb-1">
        <DailyQuestPanel compact />
      </div>

      {/* World Map */}
      <div className="w-full max-w-3xl px-2">
        <WorldMap
          islands={ISLANDS}
          activeIsland={activeIsland}
          setActiveIsland={setActiveIsland}
          playerStars={player.totalStars}
        />
      </div>

      {/* Quick links row */}
      <div className="w-full max-w-3xl px-3 mt-2 grid grid-cols-3 gap-2">
        <QuickLink href="/learn"          emoji="🗣️" label={isHebrew ? "עברית" : "Hebrew"} color="#6366f1" />
        <QuickLink href="/learn-english"  emoji="🇺🇸" label={isHebrew ? "אנגלית" : "English"} color="#ef4444" />
        <QuickLink href="/daily-challenge" emoji="🎯" label={isHebrew ? "אתגר יומי" : "Daily"} color="#a855f7" />
      </div>

      {/* Achievements */}
      <Link href="/achievements" className="w-full max-w-3xl px-3 mt-2">
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-base py-3 rounded-2xl text-center shadow-md"
        >
          {isHebrew ? "🏆 ההישגים שלי" : "🏆 My Achievements"}
        </motion.div>
      </Link>
    </main>
  );
}

// ── World Map Component ────────────────────────────────────────────────────────
function WorldMap({
  islands,
  activeIsland,
  setActiveIsland,
  playerStars,
}: {
  islands: Island[];
  activeIsland: string | null;
  setActiveIsland: (s: string | null) => void;
  playerStars: number;
}) {
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #4FC3F7 30%, #1E88E5 60%, #1565C0 100%)",
        aspectRatio: "3/4",
        maxHeight: "70vh",
      }}
    >
      {/* Background decorations */}
      {BG_DECO.map((d, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: `${d.scale * 22}px` }}
          animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.7, ease: "easeInOut" }}
        >
          {d.emoji}
        </motion.span>
      ))}

      {/* SVG path lines between islands */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        {PATHS.map(([a, b], i) => {
          const ia = islands[a];
          const ib = islands[b];
          return (
            <motion.path
              key={i}
              d={`M ${ia.x}% ${ia.y}% Q ${(ia.x + ib.x) / 2 + 8}% ${(ia.y + ib.y) / 2 - 8}% ${ib.x}% ${ib.y}%`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
              strokeDasharray="6 5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Islands */}
      {islands.map((island, i) => (
        <IslandNode
          key={island.slug}
          island={island}
          index={i}
          isActive={activeIsland === island.slug}
          onTap={() => setActiveIsland(activeIsland === island.slug ? null : island.slug)}
        />
      ))}

      {/* Popup tooltip when island tapped */}
      <AnimatePresence>
        {activeIsland && (() => {
          const isl = islands.find((i) => i.slug === activeIsland);
          if (!isl) return null;
          return (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              className="absolute z-20"
              style={{
                left: `${Math.min(Math.max(isl.x - 12, 2), 60)}%`,
                top: `${Math.max(isl.y - 22, 4)}%`,
              }}
            >
              <Link href={`/games/${isl.slug}`}>
                <div
                  className="rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2 border-2 border-white/60"
                  style={{ background: isl.color }}
                >
                  <span className="text-2xl">{isl.emoji}</span>
                  <span className="text-white font-black text-lg">{isl.label}</span>
                  <span className="text-white text-xl">▶</span>
                </div>
              </Link>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Map title */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <motion.p
          className="text-white font-black text-lg drop-shadow-lg"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🗺️ עולם המשחקים
        </motion.p>
      </div>
    </div>
  );
}

function IslandNode({
  island,
  index,
  isActive,
  onTap,
}: {
  island: Island;
  index: number;
  isActive: boolean;
  onTap: () => void;
}) {
  const size = island.size * 52; // base px size

  return (
    <motion.button
      className="absolute flex flex-col items-center gap-0.5 cursor-pointer z-10"
      style={{
        left: `${island.x}%`,
        top: `${island.y}%`,
        transform: "translate(-50%, -50%)",
        width: size,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isActive ? 1.18 : 1,
        opacity: 1,
        y: [0, -4, 0],
      }}
      transition={{
        scale: { type: "spring", stiffness: 300 },
        opacity: { delay: index * 0.07, duration: 0.4 },
        y: { repeat: Infinity, duration: 2.5 + index * 0.2, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.88 }}
      onClick={onTap}
    >
      {/* Island ground */}
      <div
        className="rounded-full shadow-lg flex items-center justify-center border-4 border-white/70"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${island.color}dd, ${island.color}88)`,
          width: size,
          height: size * 0.7,
          boxShadow: isActive ? `0 0 20px 6px ${island.color}88` : `0 4px 12px ${island.color}55`,
        }}
      >
        <span style={{ fontSize: size * 0.45 }}>{island.emoji}</span>
      </div>
      {/* Label */}
      <motion.span
        className="text-white font-black text-center drop-shadow-md leading-tight"
        style={{ fontSize: Math.max(10, size * 0.22) }}
        animate={{ opacity: isActive ? 1 : 0.85 }}
      >
        {island.label}
      </motion.span>
    </motion.button>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────
function PlayerBadge({ player, isHebrew }: { player: { name: string; totalStars: number; streakDays: number }; isHebrew: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-3 py-1.5 shadow-sm">
      <span className="text-xl">⭐</span>
      <div>
        <p className="font-black text-sm leading-none">{player.name || (isHebrew ? "שחקן" : "Player")}</p>
        <p className="text-xs text-foreground/50">{player.totalStars} ⭐ · 🔥 {player.streakDays}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, emoji, label, color }: { href: string; emoji: string; label: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.93 }}
        className="rounded-2xl py-2 px-1 flex flex-col items-center gap-1 shadow-md text-white"
        style={{ background: `linear-gradient(135deg, ${color}ee, ${color}88)` }}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="font-black text-xs text-center leading-tight">{label}</span>
      </motion.div>
    </Link>
  );
}
