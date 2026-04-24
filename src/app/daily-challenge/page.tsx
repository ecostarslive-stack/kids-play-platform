"use client";

/**
 * Daily Challenge — picks a fresh featured game each day.
 * Shows a dramatic reveal animation. Updates at midnight.
 * Encourages daily habit: "Come back tomorrow for a new challenge!"
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePlayer } from "@/providers/PlayerProvider";
import { BackButton } from "@/components/ui/BackButton";

const DAILY_GAMES = [
  { slug: "tap-animal",    emoji: "🐱", titleHe: "חיות",            titleEn: "Animals",        color: "#22c55e" },
  { slug: "count-bubbles", emoji: "🫧", titleHe: "ספרו בועות",      titleEn: "Count Bubbles",  color: "#0ea5e9" },
  { slug: "color-splash",  emoji: "🎨", titleHe: "צבעים",            titleEn: "Colors",         color: "#ec4899" },
  { slug: "word-match",    emoji: "🃏", titleHe: "התאמת מילים",      titleEn: "Word Match",     color: "#8b5cf6" },
  { slug: "abc-rocket",    emoji: "🚀", titleHe: "ABC רקטה",         titleEn: "ABC Rocket",     color: "#6366f1" },
  { slug: "memory",        emoji: "🧠", titleHe: "זיכרון",           titleEn: "Memory",         color: "#10b981" },
  { slug: "balloon-pop",   emoji: "🎈", titleHe: "בלונים",           titleEn: "Balloons",       color: "#f97316" },
  { slug: "alef-bet",      emoji: "🔤", titleHe: "אותיות",           titleEn: "Letters",        color: "#a855f7" },
  { slug: "numbers",       emoji: "🔢", titleHe: "מספרים",           titleEn: "Numbers",        color: "#f43f5e" },
  { slug: "shapes",        emoji: "🔷", titleHe: "צורות",            titleEn: "Shapes",         color: "#eab308" },
  { slug: "treasure-hunt", emoji: "🗺️", titleHe: "ציד אוצרות",       titleEn: "Treasure Hunt",  color: "#d97706" },
  { slug: "simon",         emoji: "🔔", titleHe: "סימון אומר",       titleEn: "Simon Says",     color: "#06b6d4" },
  { slug: "puzzle",        emoji: "🧩", titleHe: "פאזל",             titleEn: "Puzzle",         color: "#3b82f6" },
  { slug: "ari-adventure", emoji: "🦁", titleHe: "המסע של אריה",     titleEn: "Ari's Adventure",color: "#f59e0b" },
];

function getDailyGame() {
  // Deterministic daily pick based on date
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_GAMES[dayOfYear % DAILY_GAMES.length];
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DailyChallengePage() {
  const { isHebrew } = useLanguage();
  const { player } = usePlayer();
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(getNextMidnight());

  const game = getDailyGame();

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getNextMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-reveal after a brief dramatic pause
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Check if already played today (stars awarded today)
  const playedToday = player.starsToday > 0;

  return (
    <div className="flex-1 flex flex-col items-center gap-6 px-4 pt-4 pb-10 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <h1 className="text-2xl font-black">
          {isHebrew ? "🎯 אתגר יומי" : "🎯 Daily Challenge"}
        </h1>
        <div className="w-12" />
      </div>

      {/* Date badge */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl px-5 py-2 text-sm font-bold">
        {new Date().toLocaleDateString(isHebrew ? "he-IL" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>

      {/* Main reveal card */}
      <motion.div
        className="w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${game.color}33, ${game.color}11)`, border: `3px solid ${game.color}44` }}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-foreground/60 font-bold text-base">
            {isHebrew ? "משחק היום הוא..." : "Today's game is..."}
          </p>

          <motion.div
            animate={revealed ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.3, opacity: 0, rotate: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-[100px] filter drop-shadow-2xl"
          >
            {game.emoji}
          </motion.div>

          <motion.div
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-3xl font-black" style={{ color: game.color }}>
              {isHebrew ? game.titleHe : game.titleEn}
            </h2>
            <p className="text-foreground/50 mt-1 text-sm">
              {isHebrew ? game.titleEn : game.titleHe}
            </p>
          </motion.div>

          {playedToday && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-green-100 rounded-2xl px-4 py-2 text-green-700 font-bold text-sm"
            >
              ✅ {isHebrew ? `שיחקתם היום! ${player.starsToday} ⭐ נוספו` : `Played today! ${player.starsToday} ⭐ earned`}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Play button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full"
      >
        <Link href={`/games/${game.slug}`}>
          <motion.div
            whileTap={{ scale: 0.96 }}
            className="w-full text-white font-black text-xl py-5 rounded-3xl text-center shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${game.color}dd, ${game.color})`,
              boxShadow: `0 8px 30px ${game.color}55`,
            }}
          >
            {isHebrew ? "!לשחק עכשיו 🎮" : "Play Now! 🎮"}
          </motion.div>
        </Link>
      </motion.div>

      {/* Countdown */}
      <div className="text-center">
        <p className="text-foreground/50 text-sm font-bold mb-1">
          {isHebrew ? "⏰ משחק חדש בעוד" : "⏰ New game in"}
        </p>
        <div className="text-2xl font-black text-foreground/70 font-mono">
          {formatCountdown(countdown)}
        </div>
      </div>

      {/* Streak nudge */}
      <div className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-4 text-white text-center">
        <p className="font-black text-base">
          {isHebrew
            ? `🔥 ${player.streakDays} ימים ברצף — שמרו על הרצף!`
            : `🔥 ${player.streakDays} day streak — keep it going!`}
        </p>
        <p className="text-sm opacity-80 mt-1">
          {isHebrew ? "⭐ סה\"כ כוכבים: " : "⭐ Total stars: "}{player.totalStars}
        </p>
      </div>
    </div>
  );
}
