"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AvatarOnboarding } from "@/components/ui/AvatarOnboarding";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePlayer } from "@/providers/PlayerProvider";
import { DailyQuestPanel } from "@/components/ui/DailyQuestPanel";

// ── All games ─────────────────────────────────────────────────────────────────
interface GameDef {
  slug: string;
  labelHe: string;
  labelEn: string;
  emoji: string;
  color: string;
}

const ALL_GAMES: GameDef[] = [
  { slug: "alef-bet",      labelHe: "אותיות",      labelEn: "Letters",       emoji: "🔤", color: "#a855f7" },
  { slug: "numbers",       labelHe: "מספרים",      labelEn: "Numbers",       emoji: "🔢", color: "#3b82f6" },
  { slug: "colors",        labelHe: "צבעים",       labelEn: "Colors",        emoji: "🎨", color: "#f97316" },
  { slug: "magic-garden",  labelHe: "גן הקסם",     labelEn: "Magic Garden",  emoji: "🌻", color: "#22c55e" },
  { slug: "magic-kitchen", labelHe: "מטבח קסם",    labelEn: "Magic Kitchen", emoji: "🍳", color: "#f59e0b" },
  { slug: "dress-up",      labelHe: "לבוש",        labelEn: "Dress Up",      emoji: "👗", color: "#d946ef" },
  { slug: "memory",        labelHe: "זיכרון",      labelEn: "Memory",        emoji: "🧠", color: "#0ea5e9" },
  { slug: "shapes",        labelHe: "צורות",       labelEn: "Shapes",        emoji: "🔷", color: "#eab308" },
  { slug: "word-builder",  labelHe: "בונה מילים",  labelEn: "Word Builder",  emoji: "📝", color: "#10b981" },
  { slug: "treasure-hunt", labelHe: "ציד אוצרות",  labelEn: "Treasure",      emoji: "🗺️", color: "#06b6d4" },
  { slug: "balloon-pop",   labelHe: "פיצוץ בלונים",labelEn: "Balloons",      emoji: "🎈", color: "#f43f5e" },
  { slug: "simon",         labelHe: "סיימון",      labelEn: "Simon",         emoji: "🔔", color: "#8b5cf6" },
  { slug: "puzzle",        labelHe: "פאזל",        labelEn: "Puzzle",        emoji: "🧩", color: "#0284c7" },
  { slug: "tap-animal",    labelHe: "חיות",        labelEn: "Animals",       emoji: "🐱", color: "#16a34a" },
  { slug: "word-match",    labelHe: "התאמת מילים", labelEn: "Word Match",    emoji: "🃏", color: "#7c3aed" },
  { slug: "abc-rocket",    labelHe: "רקטה ABC",    labelEn: "ABC Rocket",    emoji: "🚀", color: "#4f46e5" },
  { slug: "count-bubbles", labelHe: "בועות",       labelEn: "Bubbles",       emoji: "🫧", color: "#0891b2" },
  { slug: "color-splash",  labelHe: "צבע ספלאש",   labelEn: "Color Splash",  emoji: "💦", color: "#ea580c" },
  { slug: "pony-care",     labelHe: "פוני",        labelEn: "Pony Care",     emoji: "🦄", color: "#db2777" },
  { slug: "ari-adventure", labelHe: "הרפתקת ארי",  labelEn: "Ari's Adventure",emoji: "🦁", color: "#d97706" },
  { slug: "noa-garden",    labelHe: "גן של נועה",  labelEn: "Noa's Garden",  emoji: "🌸", color: "#be185d" },
  { slug: "daily-word",    labelHe: "מילה יומית",  labelEn: "Daily Word",    emoji: "📅", color: "#0f766e" },
  { slug: "conversation",  labelHe: "שיחה",        labelEn: "Conversation",  emoji: "💬", color: "#6d28d9" },
];

// Map canvas size (px) — bigger than screen so you can scroll/pan
const MAP_W = 1400;
const MAP_H = 2000;
const MAP_SCALE = 0.55; // zoom-out factor applied via CSS transform

// Island positions on the large canvas (px)
interface Island {
  slug: string;
  x: number;  // center px
  y: number;  // center px
  size: number; // radius
}

const ISLANDS: Island[] = [
  // Row 1 — Top
  { slug: "alef-bet",      x: 700, y: 160,  size: 72 },
  // Row 2
  { slug: "numbers",       x: 250, y: 340,  size: 62 },
  { slug: "magic-garden",  x: 700, y: 360,  size: 68 },
  { slug: "colors",        x: 1150,y: 340,  size: 62 },
  // Row 3
  { slug: "magic-kitchen", x: 150, y: 560,  size: 58 },
  { slug: "word-builder",  x: 500, y: 560,  size: 58 },
  { slug: "dress-up",      x: 900, y: 560,  size: 58 },
  { slug: "treasure-hunt", x: 1250,y: 560,  size: 56 },
  // Row 4
  { slug: "memory",        x: 300, y: 760,  size: 58 },
  { slug: "shapes",        x: 700, y: 780,  size: 56 },
  { slug: "balloon-pop",   x: 1100,y: 760,  size: 56 },
  // Row 5
  { slug: "puzzle",        x: 180, y: 960,  size: 54 },
  { slug: "simon",         x: 550, y: 970,  size: 54 },
  { slug: "tap-animal",    x: 900, y: 960,  size: 54 },
  { slug: "word-match",    x: 1220,y: 970,  size: 52 },
  // Row 6
  { slug: "abc-rocket",    x: 350, y: 1160, size: 52 },
  { slug: "count-bubbles", x: 750, y: 1155, size: 52 },
  { slug: "color-splash",  x: 1100,y: 1160, size: 50 },
  // Row 7
  { slug: "pony-care",     x: 200, y: 1360, size: 50 },
  { slug: "ari-adventure", x: 600, y: 1350, size: 52 },
  { slug: "noa-garden",    x: 1000,y: 1360, size: 50 },
  // Row 8 — Bottom
  { slug: "daily-word",    x: 400, y: 1560, size: 48 },
  { slug: "conversation",  x: 900, y: 1560, size: 48 },
];

// Path connections between islands
const PATHS: [number, number][] = [
  [0,1],[0,2],[0,3],
  [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
  [4,8],[5,8],[5,9],[6,9],[6,10],[7,10],
  [8,11],[9,11],[9,12],[9,13],[10,13],[10,14],
  [11,15],[12,15],[12,16],[13,16],[13,17],[14,17],
  [15,18],[16,18],[16,19],[17,19],[17,20],
  [18,21],[19,21],[19,22],[20,22],
];

// Decorative background elements
const DECOS = [
  { e:"☁️", x:80,  y:80,  s:40 }, { e:"☁️", x:900, y:50,  s:32 }, { e:"☁️", x:1300,y:120, s:28 },
  { e:"🌊", x:0,   y:200, s:36 }, { e:"🌊", x:1350,y:300, s:36 },
  { e:"🐟", x:60,  y:450, s:28 }, { e:"🐠", x:1340,y:650, s:28 },
  { e:"⭐", x:420, y:240, s:24 }, { e:"⭐", x:1000,y:430, s:20 },
  { e:"⛵", x:1100,y:870, s:36 }, { e:"🐬", x:100, y:1050,s:32 },
  { e:"🏝️", x:1200,y:1250,s:40 },{ e:"🐳", x:200, y:1450,s:36 },
  { e:"⭐", x:700, y:1250,s:20 }, { e:"⛅",  x:400, y:1050,s:32 },
  { e:"🌺", x:500, y:1480,s:28 }, { e:"🌴", x:1050,y:1470,s:32 },
  { e:"🦀", x:650, y:1720,s:28 }, { e:"🐚", x:300, y:1720,s:24 },
  { e:"🌊", x:0,   y:1900,s:40 }, { e:"🌊", x:700, y:1950,s:40 },
];

function starsLabel(n: number) {
  if (n === 0) return "";
  return "★".repeat(n) + "☆".repeat(3 - n);
}

export default function HomePage() {
  const { isHebrew } = useLanguage();
  const { player, loaded, completeOnboarding } = usePlayer();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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

  if (!player.onboardingDone) return <AvatarOnboarding onDone={completeOnboarding} />;

  const gameStars = player.gameStars ?? {};

  return (
    <main className="flex-1 flex flex-col items-center pb-6 gap-2 overflow-x-hidden">
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
        <PanMap
          islands={ISLANDS}
          games={ALL_GAMES}
          gameStars={gameStars}
          activeSlug={activeSlug}
          setActiveSlug={setActiveSlug}
          isHebrew={isHebrew}
        />
      </div>

      {/* Quick links */}
      <div className="w-full max-w-3xl px-3 grid grid-cols-3 gap-2">
        <QuickLink href="/learn"           emoji="🗣️" label={isHebrew ? "עברית"    : "Hebrew"}  color="#6366f1" />
        <QuickLink href="/learn-english"   emoji="🇺🇸" label={isHebrew ? "אנגלית"   : "English"} color="#ef4444" />
        <QuickLink href="/daily-challenge" emoji="🎯" label={isHebrew ? "אתגר יומי" : "Daily"}   color="#a855f7" />
      </div>

      {/* Achievements */}
      <Link href="/achievements" className="w-full max-w-3xl px-3">
        <motion.div whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-base py-3 rounded-2xl text-center shadow-md">
          {isHebrew ? "🏆 ההישגים שלי" : "🏆 My Achievements"}
        </motion.div>
      </Link>
    </main>
  );
}

// ── Scrollable / Pannable Map ──────────────────────────────────────────────────
function PanMap({
  islands, games, gameStars, activeSlug, setActiveSlug, isHebrew,
}: {
  islands: Island[];
  games: GameDef[];
  gameStars: Record<string, number>;
  activeSlug: string | null;
  setActiveSlug: (s: string | null) => void;
  isHebrew: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dismiss popup when tapping outside an island
  const handleBgClick = useCallback(() => setActiveSlug(null), [setActiveSlug]);

  const gameMap = Object.fromEntries(games.map((g) => [g.slug, g]));

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30"
      style={{ height: "68vh", maxHeight: 560 }}
    >
      {/* Hint label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <motion.div
          className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <p className="text-white font-black text-xs">🗺️ {isHebrew ? "גלול לחקור את העולם" : "Scroll to explore"}</p>
        </motion.div>
      </div>

      {/* Scrollable canvas — outer sees scaled dims, inner canvas is full-size scaled down */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-auto"
        style={{ scrollbarWidth: "none" }}
        onClick={handleBgClick}
      >
        {/* Wrapper sized to scaled dims so scroll works correctly */}
        <div
          style={{
            width: MAP_W * MAP_SCALE,
            height: MAP_H * MAP_SCALE,
            overflow: "hidden",
            position: "relative",
          }}
        >
        {/* Map canvas — full size, scaled down via transform */}
        <div
          className="relative"
          style={{
            width: MAP_W,
            height: MAP_H,
            transform: `scale(${MAP_SCALE})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            background: "linear-gradient(180deg, #1a6b9e 0%, #1565c0 20%, #1976d2 40%, #0d47a1 70%, #01579b 100%)",
          }}
        >
          {/* Animated ocean texture */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-x-0 h-40 pointer-events-none"
              style={{
                top: `${i * 14}%`,
                background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.03), transparent)`,
              }}
              animate={{ x: [0, i % 2 === 0 ? 20 : -20, 0] }}
              transition={{ repeat: Infinity, duration: 6 + i, ease: "easeInOut" }}
            />
          ))}

          {/* Decorations */}
          {DECOS.map((d, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none"
              style={{ left: d.x, top: d.y, fontSize: d.s }}
              animate={{ y: [0, -6, 0], rotate: i % 3 === 0 ? [0, 5, -5, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut" }}
            >
              {d.e}
            </motion.span>
          ))}

          {/* SVG paths between islands */}
          <svg
            className="absolute inset-0"
            style={{ width: MAP_W, height: MAP_H, pointerEvents: "none" }}
          >
            {PATHS.map(([a, b], i) => {
              const ia = islands[a]; const ib = islands[b];
              if (!ia || !ib) return null;
              const mx = (ia.x + ib.x) / 2 + (i % 2 === 0 ? 30 : -30);
              const my = (ia.y + ib.y) / 2 - 20;
              return (
                <motion.path
                  key={i}
                  d={`M ${ia.x} ${ia.y} Q ${mx} ${my} ${ib.x} ${ib.y}`}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="2.5"
                  strokeDasharray="7 6"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.06 }}
                />
              );
            })}
          </svg>

          {/* Islands */}
          {islands.map((isl, idx) => {
            const game = gameMap[isl.slug];
            if (!game) return null;
            const stars = gameStars[isl.slug] ?? 0;
            const completed = stars > 0;
            const isActive = activeSlug === isl.slug;

            return (
              <motion.div
                key={isl.slug}
                className="absolute flex flex-col items-center cursor-pointer z-10"
                style={{
                  left: isl.x,
                  top: isl.y,
                  transform: "translate(-50%, -50%)",
                  width: isl.size * 2.2,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isActive ? 1.18 : 1,
                  opacity: 1,
                  y: [0, -5, 0],
                }}
                transition={{
                  scale: { type: "spring", stiffness: 300 },
                  opacity: { delay: idx * 0.04 },
                  y: { repeat: Infinity, duration: 2.8 + idx * 0.15, ease: "easeInOut" },
                }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlug(isActive ? null : isl.slug);
                }}
              >
                {/* Island body */}
                <div
                  className="rounded-full border-4 flex items-center justify-center shadow-xl"
                  style={{
                    width: isl.size * 2.2,
                    height: isl.size * 1.5,
                    borderColor: completed ? "#fbbf24" : "rgba(255,255,255,0.7)",
                    background: completed
                      ? `radial-gradient(circle at 35% 35%, ${game.color}ff, ${game.color}aa)`
                      : `radial-gradient(circle at 35% 35%, ${game.color}99, ${game.color}55)`,
                    boxShadow: isActive
                      ? `0 0 24px 8px ${game.color}99`
                      : completed
                      ? `0 0 12px 3px ${game.color}66, 0 4px 12px rgba(0,0,0,0.3)`
                      : `0 4px 10px rgba(0,0,0,0.25)`,
                  }}
                >
                  <span style={{ fontSize: isl.size * 0.9 }}>{game.emoji}</span>
                </div>

                {/* Name label */}
                <motion.span
                  className="text-white font-black text-center drop-shadow-lg leading-tight mt-1"
                  style={{ fontSize: Math.max(10, isl.size * 0.28) }}
                >
                  {isHebrew ? game.labelHe : game.labelEn}
                </motion.span>

                {/* Star badge */}
                {completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-0.5 bg-yellow-400 rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                    style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
                  >
                    {[1,2,3].map((s) => (
                      <span key={s} style={{ fontSize: 10, color: s <= stars ? "#1a1a1a" : "rgba(0,0,0,0.25)" }}>★</span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Popup tooltip */}
          <AnimatePresence>
            {activeSlug && (() => {
              const isl = islands.find((i) => i.slug === activeSlug);
              const game = gameMap[activeSlug];
              if (!isl || !game) return null;
              const stars = gameStars[activeSlug] ?? 0;

              // Position popup above island, clamped to canvas bounds
              const popW = 160;
              const popX = Math.min(Math.max(isl.x - popW / 2, 8), MAP_W - popW - 8);
              const popY = Math.max(isl.y - isl.size * 2.2, 8);

              return (
                <motion.div
                  key="popup"
                  initial={{ scale: 0.7, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className="absolute z-30"
                  style={{ left: popX, top: popY, width: popW }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/games/${activeSlug}`}>
                    <div
                      className="rounded-2xl px-3 py-2.5 shadow-2xl border-2 border-white/50 flex flex-col items-center gap-1"
                      style={{ background: game.color }}
                    >
                      <span className="text-3xl">{game.emoji}</span>
                      <span className="text-white font-black text-base leading-tight text-center">
                        {isHebrew ? game.labelHe : game.labelEn}
                      </span>
                      {stars > 0 && (
                        <div className="flex gap-0.5">
                          {[1,2,3].map((s) => (
                            <span key={s} style={{ color: s <= stars ? "#fbbf24" : "rgba(255,255,255,0.3)", fontSize: 14 }}>★</span>
                          ))}
                        </div>
                      )}
                      <div className="bg-white/20 rounded-full px-3 py-1 text-white font-black text-sm w-full text-center">
                        {isHebrew ? "▶ שחק עכשיו" : "▶ Play now"}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
        </div> {/* end scaled wrapper */}
      </div>

      {/* Scroll shadow overlays for visual cue */}
      <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.4), transparent)" }}>
        <p className="text-white/60 text-center text-xs font-bold pt-3">▼ {isHebrew ? "גלול למטה" : "scroll down"}</p>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function PlayerBadge({ player, isHebrew }: {
  player: { name: string; totalStars: number; streakDays: number; gameStars?: Record<string, number> };
  isHebrew: boolean;
}) {
  const completed = Object.keys(player.gameStars ?? {}).length;
  return (
    <div className="flex items-center gap-2 bg-white/85 backdrop-blur rounded-2xl px-3 py-1.5 shadow-sm">
      <span className="text-xl">⭐</span>
      <div>
        <p className="font-black text-sm leading-none">{player.name || (isHebrew ? "שחקן" : "Player")}</p>
        <p className="text-xs text-foreground/50">
          {player.totalStars}⭐ · 🔥{player.streakDays} · 🗺️{completed}
        </p>
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
