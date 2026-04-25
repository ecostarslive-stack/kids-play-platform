"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AvatarOnboarding } from "@/components/ui/AvatarOnboarding";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePlayer } from "@/providers/PlayerProvider";
import { DailyQuestPanel } from "@/components/ui/DailyQuestPanel";

// ── All games data ─────────────────────────────────────────────────────────────
interface GameDef {
  slug: string;
  labelHe: string;
  labelEn: string;
  emoji: string;
  color: string;
}

const ALL_GAMES: GameDef[] = [
  { slug: "alef-bet",      labelHe: "אותיות",     labelEn: "Letters",       emoji: "🔤", color: "#a855f7" },
  { slug: "numbers",       labelHe: "מספרים",     labelEn: "Numbers",       emoji: "🔢", color: "#ec4899" },
  { slug: "colors",        labelHe: "צבעים",      labelEn: "Colors",        emoji: "🎨", color: "#f97316" },
  { slug: "magic-garden",  labelHe: "גן הקסם",    labelEn: "Magic Garden",  emoji: "🌻", color: "#22c55e" },
  { slug: "magic-kitchen", labelHe: "מטבח קסם",   labelEn: "Magic Kitchen", emoji: "🍳", color: "#f59e0b" },
  { slug: "dress-up",      labelHe: "לבוש",       labelEn: "Dress Up",      emoji: "👗", color: "#d946ef" },
  { slug: "memory",        labelHe: "זיכרון",     labelEn: "Memory",        emoji: "🧠", color: "#3b82f6" },
  { slug: "shapes",        labelHe: "צורות",      labelEn: "Shapes",        emoji: "🔷", color: "#eab308" },
  { slug: "word-builder",  labelHe: "בונה מילים", labelEn: "Word Builder",  emoji: "📝", color: "#10b981" },
  { slug: "treasure-hunt", labelHe: "אוצר",       labelEn: "Treasure",      emoji: "🗺️", color: "#0ea5e9" },
  { slug: "balloon-pop",   labelHe: "בלונים",     labelEn: "Balloons",      emoji: "🎈", color: "#f43f5e" },
  { slug: "simon",         labelHe: "סיימון",     labelEn: "Simon",         emoji: "🔔", color: "#8b5cf6" },
  { slug: "puzzle",        labelHe: "פאזל",       labelEn: "Puzzle",        emoji: "🧩", color: "#0284c7" },
  { slug: "tap-animal",    labelHe: "חיות",       labelEn: "Animals",       emoji: "🐱", color: "#16a34a" },
  { slug: "word-match",    labelHe: "התאמת מילים", labelEn: "Word Match",   emoji: "🃏", color: "#7c3aed" },
  { slug: "abc-rocket",    labelHe: "רקטה ABC",   labelEn: "ABC Rocket",    emoji: "🚀", color: "#4f46e5" },
  { slug: "count-bubbles", labelHe: "בועות",      labelEn: "Bubbles",       emoji: "🫧", color: "#0891b2" },
  { slug: "color-splash",  labelHe: "צבע ספלאש",  labelEn: "Color Splash",  emoji: "💦", color: "#ea580c" },
  { slug: "pony-care",     labelHe: "פוני",       labelEn: "Pony Care",     emoji: "🦄", color: "#db2777" },
  { slug: "ari-adventure", labelHe: "הרפתקת ארי", labelEn: "Ari's Adventure",emoji: "🦁", color: "#d97706" },
  { slug: "noa-garden",    labelHe: "גן של נועה",  labelEn: "Noa's Garden",  emoji: "🌸", color: "#be185d" },
  { slug: "daily-word",    labelHe: "מילה יומית",  labelEn: "Daily Word",    emoji: "📅", color: "#0f766e" },
  { slug: "conversation",  labelHe: "שיחה",       labelEn: "Conversation",  emoji: "💬", color: "#6d28d9" },
];

// Islands on the map (top featured games — visually prominent)
interface Island {
  slug: string;
  x: number;
  y: number;
  size: number;
}

const MAP_ISLANDS: Island[] = [
  { slug: "alef-bet",      x: 50, y: 10, size: 1.3 },
  { slug: "numbers",       x: 20, y: 24, size: 1.1 },
  { slug: "colors",        x: 78, y: 22, size: 1.0 },
  { slug: "magic-kitchen", x: 12, y: 46, size: 1.0 },
  { slug: "magic-garden",  x: 55, y: 42, size: 1.15 },
  { slug: "dress-up",      x: 87, y: 45, size: 0.95 },
  { slug: "memory",        x: 30, y: 65, size: 0.95 },
  { slug: "treasure-hunt", x: 72, y: 65, size: 0.95 },
  { slug: "word-builder",  x: 48, y: 78, size: 0.9  },
  { slug: "shapes",        x: 12, y: 80, size: 0.85 },
  { slug: "balloon-pop",   x: 85, y: 80, size: 0.85 },
  { slug: "simon",         x: 58, y: 90, size: 0.8  },
];

// Dashed path connections
const PATHS = [
  [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[6,9],[6,8],[7,10],[8,11],
];

const BG_DECO = [
  { emoji: "☁️", x: 5,  y: 6,  s: 30 },
  { emoji: "☁️", x: 70, y: 4,  s: 24 },
  { emoji: "☁️", x: 88, y: 15, s: 20 },
  { emoji: "🐟", x: 2,  y: 40, s: 22 },
  { emoji: "🐠", x: 91, y: 68, s: 22 },
  { emoji: "⛵", x: 38, y: 95, s: 26 },
  { emoji: "⭐", x: 8,  y: 18, s: 16 },
  { emoji: "⭐", x: 93, y: 35, s: 14 },
];

export default function HomePage() {
  const { isHebrew } = useLanguage();
  const { player, loaded, completeOnboarding } = usePlayer();
  const [activeIsland, setActiveIsland] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-6xl"
        >🌟</motion.div>
      </div>
    );
  }

  if (!player.onboardingDone) {
    return <AvatarOnboarding onDone={completeOnboarding} />;
  }

  const mapGames = MAP_ISLANDS.map((isl) => ALL_GAMES.find((g) => g.slug === isl.slug)!);
  const mapSlugs = new Set(MAP_ISLANDS.map((i) => i.slug));
  const remainingGames = ALL_GAMES.filter((g) => !mapSlugs.has(g.slug));

  return (
    <main className="flex-1 flex flex-col items-center pb-8 gap-3 overflow-x-hidden">
      {/* Top bar */}
      <div className="w-full max-w-3xl flex justify-between items-center px-4 pt-3">
        <PlayerBadge player={player} isHebrew={isHebrew} />
        <LanguageToggle />
      </div>

      {/* Daily Quest strip */}
      <div className="w-full max-w-3xl px-3">
        <DailyQuestPanel compact />
      </div>

      {/* World Map */}
      <div className="w-full max-w-3xl px-2">
        <WorldMap
          islands={MAP_ISLANDS}
          games={mapGames}
          activeIsland={activeIsland}
          setActiveIsland={setActiveIsland}
        />
      </div>

      {/* Quick links */}
      <div className="w-full max-w-3xl px-3 grid grid-cols-3 gap-2">
        <QuickLink href="/learn"           emoji="🗣️" label={isHebrew ? "עברית" : "Hebrew"}    color="#6366f1" />
        <QuickLink href="/learn-english"   emoji="🇺🇸" label={isHebrew ? "אנגלית" : "English"} color="#ef4444" />
        <QuickLink href="/daily-challenge" emoji="🎯" label={isHebrew ? "אתגר יומי" : "Daily"} color="#a855f7" />
      </div>

      {/* ─── All Games toggle ────────────────────────────────────────── */}
      <div className="w-full max-w-3xl px-3">
        <motion.button
          className="w-full rounded-2xl py-3 text-white font-black text-base shadow-md"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? (isHebrew ? "▲ הסתר משחקים" : "▲ Hide games")
            : (isHebrew ? "▼ כל המשחקים" : "▼ All games")}
        </motion.button>

        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 grid grid-cols-3 gap-3">
                {ALL_GAMES.map((g, i) => (
                  <Link key={g.slug} href={`/games/${g.slug}`}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-2xl flex flex-col items-center justify-center gap-1 py-3 px-1 text-white shadow-md"
                      style={{ background: `linear-gradient(135deg, ${g.color}ee, ${g.color}88)` }}
                    >
                      <span className="text-3xl">{g.emoji}</span>
                      <span className="font-black text-xs text-center leading-tight">
                        {isHebrew ? g.labelHe : g.labelEn}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Extra games not on map ──────────────────────────────────── */}
      {!showAll && (
        <div className="w-full max-w-3xl px-3">
          <p className="text-foreground/40 font-bold text-xs text-center mb-2">
            {isHebrew ? "עוד משחקים" : "More games"}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {remainingGames.map((g) => (
              <Link key={g.slug} href={`/games/${g.slug}`} className="flex-shrink-0">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="rounded-2xl flex flex-col items-center justify-center gap-1 py-3 px-3 text-white shadow-md w-20"
                  style={{ background: `linear-gradient(135deg, ${g.color}ee, ${g.color}88)` }}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-black text-[10px] text-center leading-tight">
                    {isHebrew ? g.labelHe : g.labelEn}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <Link href="/achievements" className="w-full max-w-3xl px-3">
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

// ── World Map ──────────────────────────────────────────────────────────────────
function WorldMap({
  islands,
  games,
  activeIsland,
  setActiveIsland,
}: {
  islands: Island[];
  games: GameDef[];
  activeIsland: string | null;
  setActiveIsland: (s: string | null) => void;
}) {
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #4FC3F7 35%, #1E88E5 65%, #1565C0 100%)",
        aspectRatio: "3/4",
        maxHeight: "72vh",
      }}
      onClick={() => setActiveIsland(null)}
    >
      {/* BG deco */}
      {BG_DECO.map((d, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: d.s }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.7 }}
        >
          {d.emoji}
        </motion.span>
      ))}

      {/* Path SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        {PATHS.map(([a, b], i) => {
          const ia = islands[a]; const ib = islands[b];
          if (!ia || !ib) return null;
          return (
            <motion.path
              key={i}
              d={`M ${ia.x}% ${ia.y}% Q ${(ia.x+ib.x)/2+6}% ${(ia.y+ib.y)/2-6}% ${ib.x}% ${ib.y}%`}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: i * 0.08 }}
            />
          );
        })}
      </svg>

      {/* Islands */}
      {islands.map((isl, i) => {
        const game = games[i];
        if (!game) return null;
        const px = isl.size * 50;
        return (
          <motion.button
            key={isl.slug}
            className="absolute flex flex-col items-center z-10"
            style={{ left: `${isl.x}%`, top: `${isl.y}%`, transform: "translate(-50%,-50%)", width: px }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: activeIsland === isl.slug ? 1.2 : 1, opacity: 1, y: [0, -4, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 300 },
              opacity: { delay: i * 0.06 },
              y: { repeat: Infinity, duration: 2.5 + i * 0.2 },
            }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIsland(activeIsland === isl.slug ? null : isl.slug);
            }}
          >
            <div
              className="rounded-full border-4 border-white/70 flex items-center justify-center shadow-lg"
              style={{
                width: px, height: px * 0.68,
                background: `radial-gradient(circle at 35% 35%, ${game.color}dd, ${game.color}77)`,
                boxShadow: activeIsland === isl.slug ? `0 0 18px 5px ${game.color}88` : `0 4px 10px ${game.color}55`,
              }}
            >
              <span style={{ fontSize: px * 0.44 }}>{game.emoji}</span>
            </div>
            <span className="text-white font-black drop-shadow text-center leading-tight mt-0.5"
              style={{ fontSize: Math.max(9, px * 0.21) }}>
              {game.labelHe}
            </span>
          </motion.button>
        );
      })}

      {/* Popup */}
      <AnimatePresence>
        {activeIsland && (() => {
          const idx = islands.findIndex((i) => i.slug === activeIsland);
          if (idx === -1) return null;
          const isl = islands[idx]; const game = games[idx];
          return (
            <motion.div
              key="popup"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="absolute z-20"
              style={{
                left: `${Math.min(Math.max(isl.x - 14, 2), 58)}%`,
                top: `${Math.max(isl.y - 22, 3)}%`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/games/${isl.slug}`}>
                <div
                  className="rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2 border-2 border-white/60"
                  style={{ background: game.color }}
                >
                  <span className="text-2xl">{game.emoji}</span>
                  <span className="text-white font-black text-lg">{game.labelHe}</span>
                  <span className="text-white text-xl">▶</span>
                </div>
              </Link>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Title */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <p className="text-white font-black text-base drop-shadow">🗺️ עולם המשחקים</p>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function PlayerBadge({ player, isHebrew }: { player: { name: string; totalStars: number; streakDays: number }; isHebrew: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-3 py-1.5 shadow-sm">
      <span className="text-xl">⭐</span>
      <div>
        <p className="font-black text-sm leading-none">{player.name || (isHebrew ? "שחקן" : "Player")}</p>
        <p className="text-xs text-foreground/50">{player.totalStars}⭐ · 🔥{player.streakDays}</p>
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
