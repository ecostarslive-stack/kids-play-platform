"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ACHIEVEMENTS, getUnlockedAchievements } from "@/lib/achievements";
import { usePlayer } from "@/providers/PlayerProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { BackButton } from "@/components/ui/BackButton";

export default function AchievementsPage() {
  const { player, avatar } = usePlayer();
  const { isHebrew } = useLanguage();
  const unlocked = getUnlockedAchievements(player);
  const unlockedCount = unlocked.size;

  return (
    <div className="flex-1 flex flex-col items-center gap-6 px-4 pb-10 pt-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <h1 className="text-2xl font-black">
          {isHebrew ? "הישגים" : "Achievements"}
        </h1>
        <div className="w-12" />
      </div>

      {/* Player card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white text-center shadow-xl"
      >
        <div className="text-5xl mb-2">{avatar.emoji}</div>
        <h2 className="text-2xl font-black">{player.name || (isHebrew ? "חבר" : "Friend")}</h2>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="text-center">
            <p className="text-2xl font-black">⭐ {player.totalStars}</p>
            <p className="text-xs opacity-80">{isHebrew ? "כוכבים" : "stars"}</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-black">🔥 {player.streakDays}</p>
            <p className="text-xs opacity-80">{isHebrew ? "ימים" : "days"}</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-black">🏅 {unlockedCount}</p>
            <p className="text-xs opacity-80">{isHebrew ? "הישגים" : "badges"}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm font-bold text-foreground/60 mb-2">
          <span>{isHebrew ? "התקדמות" : "Progress"}</span>
          <span>{unlockedCount} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = unlocked.has(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 text-center shadow-sm border-2 transition-all
                ${isUnlocked
                  ? "bg-white border-yellow-300 shadow-md"
                  : "bg-gray-100 border-transparent opacity-50 grayscale"
                }`}
            >
              <motion.span
                className="text-4xl"
                animate={isUnlocked ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={isUnlocked ? { delay: i * 0.1, type: "spring" } : {}}
              >
                {isUnlocked ? ach.emoji : "🔒"}
              </motion.span>
              <p className="font-black text-sm leading-tight">
                {isHebrew ? ach.titleHe : ach.titleEn}
              </p>
              <p className="text-xs text-foreground/60 leading-tight">
                {isHebrew ? ach.descHe : ach.descEn}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* CTA to play more */}
      {unlockedCount < ACHIEVEMENTS.length && (
        <Link href="/" className="w-full">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black text-lg py-4 rounded-2xl text-center shadow-lg"
          >
            {isHebrew ? "!שחקו עוד כדי לפתוח הישגים 🎮" : "Play more to unlock badges! 🎮"}
          </motion.div>
        </Link>
      )}
    </div>
  );
}
