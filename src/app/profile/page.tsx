"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePlayer } from "@/providers/PlayerProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { AVATARS } from "@/lib/usePlayerStore";

const ALL_GAMES = [
  { slug: "alef-bet",      labelHe: "אותיות",       emoji: "🔤" },
  { slug: "numbers",       labelHe: "מספרים",       emoji: "🔢" },
  { slug: "colors",        labelHe: "צבעים",        emoji: "🎨" },
  { slug: "magic-garden",  labelHe: "גן הקסם",      emoji: "🌻" },
  { slug: "magic-kitchen", labelHe: "מטבח קסם",     emoji: "🍳" },
  { slug: "dress-up",      labelHe: "לבוש",         emoji: "👗" },
  { slug: "memory",        labelHe: "זיכרון",       emoji: "🧠" },
  { slug: "shapes",        labelHe: "צורות",        emoji: "🔷" },
  { slug: "word-builder",  labelHe: "בונה מילים",   emoji: "📝" },
  { slug: "treasure-hunt", labelHe: "ציד אוצרות",   emoji: "🗺️" },
  { slug: "balloon-pop",   labelHe: "בלונים",       emoji: "🎈" },
  { slug: "simon",         labelHe: "סיימון",       emoji: "🔔" },
  { slug: "puzzle",        labelHe: "פאזל",         emoji: "🧩" },
  { slug: "tap-animal",    labelHe: "חיות",         emoji: "🐱" },
  { slug: "word-match",    labelHe: "התאמת מילים",  emoji: "🃏" },
  { slug: "abc-rocket",    labelHe: "רקטה ABC",     emoji: "🚀" },
  { slug: "count-bubbles", labelHe: "בועות",        emoji: "🫧" },
  { slug: "color-splash",  labelHe: "צבע ספלאש",    emoji: "💦" },
  { slug: "pony-care",     labelHe: "פוני",         emoji: "🦄" },
  { slug: "ari-adventure", labelHe: "הרפתקת ארי",   emoji: "🦁" },
  { slug: "noa-garden",    labelHe: "גן של נועה",   emoji: "🌸" },
  { slug: "daily-word",    labelHe: "מילה יומית",   emoji: "📅" },
  { slug: "conversation",  labelHe: "שיחה",         emoji: "💬" },
];

function StarBar({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <motion.span
          key={s}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: s * 0.08, type: "spring" }}
          style={{ fontSize: 14, color: s <= stars ? "#fbbf24" : "#d1d5db" }}
        >★</motion.span>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { player } = usePlayer();
  const { isHebrew } = useLanguage();
  const avatar = AVATARS.find((a) => a.id === player.avatarId) ?? AVATARS[0];
  const gameStars = player.gameStars ?? {};

  const completedGames = ALL_GAMES.filter((g) => (gameStars[g.slug] ?? 0) > 0);
  const totalPossibleStars = ALL_GAMES.length * 3;
  const earnedStars = Object.values(gameStars).reduce((sum, s) => sum + s, 0);
  const completionPct = Math.round((completedGames.length / ALL_GAMES.length) * 100);

  // Streak milestones
  const streakMilestone = player.streakDays >= 30 ? "🏆" : player.streakDays >= 14 ? "🥇" : player.streakDays >= 7 ? "🥈" : player.streakDays >= 3 ? "🥉" : "🔥";

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 pt-4 pb-10 gap-4"
      style={{ background: "linear-gradient(180deg, #fdf4ff 0%, #f0f9ff 100%)", minHeight: "100dvh" }}>

      {/* Back */}
      <Link href="/" className="text-foreground/50 font-bold text-sm">← {isHebrew ? "חזרה" : "Back"}</Link>

      {/* Avatar card */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl p-5 shadow-xl text-white flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
        <motion.span className="text-6xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
          {avatar.emoji}
        </motion.span>
        <div className="flex-1">
          <p className="font-black text-2xl">{player.name || (isHebrew ? "שחקן" : "Player")}</p>
          <div className="flex gap-3 mt-1">
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-sm font-bold">⭐ {player.totalStars}</span>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-sm font-bold">{streakMilestone} {player.streakDays} {isHebrew ? "ימים" : "days"}</span>
          </div>
        </div>
      </motion.div>

      {/* Overall progress */}
      <div className="bg-white rounded-3xl p-4 shadow-md flex flex-col gap-3">
        <p className="font-black text-base text-foreground">{isHebrew ? "התקדמות כללית" : "Overall Progress"}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground/60">{completedGames.length}/{ALL_GAMES.length} {isHebrew ? "משחקים" : "games"}</span>
          <span className="text-sm font-black text-purple-600">{completionPct}%</span>
        </div>
        <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #a855f7, #6366f1)" }}
            initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
        </div>
        <div className="flex justify-between text-xs text-foreground/40">
          <span>⭐ {earnedStars} / {totalPossibleStars} {isHebrew ? "כוכבים" : "stars"}</span>
          <span>🔥 {isHebrew ? "שיא" : "best streak"}: {player.streakDays}</span>
        </div>
      </div>

      {/* Star summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: isHebrew ? "כוכבים" : "Stars",   value: player.totalStars, emoji: "⭐", color: "#f59e0b" },
          { label: isHebrew ? "משחקים" : "Games",   value: completedGames.length, emoji: "🎮", color: "#6366f1" },
          { label: isHebrew ? "streak" : "Streak",  value: player.streakDays, emoji: "🔥", color: "#ef4444" },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-1">
            <span className="text-2xl">{stat.emoji}</span>
            <p className="font-black text-xl" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-foreground/50 font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-game list */}
      <div className="bg-white rounded-3xl p-4 shadow-md">
        <p className="font-black text-base text-foreground mb-3">{isHebrew ? "כל המשחקים" : "All Games"}</p>
        <div className="flex flex-col gap-2">
          {ALL_GAMES.map((g, i) => {
            const stars = gameStars[g.slug] ?? 0;
            const played = stars > 0;
            return (
              <Link href={`/games/${g.slug}`} key={g.slug}>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${played ? "bg-purple-50" : "bg-foreground/5"}`}>
                  <span className="text-2xl">{g.emoji}</span>
                  <span className={`flex-1 font-bold text-sm ${played ? "text-foreground" : "text-foreground/50"}`}>
                    {g.labelHe}
                  </span>
                  {played ? (
                    <StarBar stars={stars} />
                  ) : (
                    <span className="text-xs text-foreground/30 font-bold">{isHebrew ? "לא שוחק" : "not played"}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
