"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard } from "@/components/ui/GameCard";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AvatarOnboarding } from "@/components/ui/AvatarOnboarding";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePlayer } from "@/providers/PlayerProvider";

interface GameEntry {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}

export default function HomePage() {
  const { t, isHebrew } = useLanguage();
  const { player, loaded, completeOnboarding } = usePlayer();

  const learningGames: GameEntry[] = [
    { slug: "alef-bet",      title: t.games.alefBet.title,      subtitle: t.games.alefBet.subtitle,      emoji: "🔤", color: "bg-game-purple" },
    { slug: "numbers",       title: t.games.numbers.title,       subtitle: t.games.numbers.subtitle,       emoji: "🔢", color: "bg-game-pink" },
    { slug: "colors",        title: t.games.colors.title,        subtitle: t.games.colors.subtitle,        emoji: "🎨", color: "bg-game-orange" },
    { slug: "shapes",        title: t.games.shapes.title,        subtitle: t.games.shapes.subtitle,        emoji: "🔷", color: "bg-game-yellow" },
    { slug: "word-builder",  title: t.games.wordBuilder.title,   subtitle: t.games.wordBuilder.subtitle,   emoji: "📝", color: "bg-game-green" },
    { slug: "treasure-hunt", title: t.games.treasureHunt.title,  subtitle: t.games.treasureHunt.subtitle,  emoji: "🗺️", color: "bg-game-blue" },
    { slug: "daily-word",    title: t.games.dailyWord.title,     subtitle: t.games.dailyWord.subtitle,     emoji: "📅", color: "bg-gradient-to-br from-teal-400 to-emerald-500" },
    { slug: "conversation",  title: t.games.conversation.title,  subtitle: t.games.conversation.subtitle,  emoji: "💬", color: "bg-gradient-to-br from-violet-400 to-purple-500" },
  ];

  const funGames: GameEntry[] = [
    { slug: "memory",      title: t.games.memory.title,     subtitle: t.games.memory.subtitle,     emoji: "🧠", color: "bg-game-green" },
    { slug: "puzzle",      title: t.games.puzzle.title,     subtitle: t.games.puzzle.subtitle,     emoji: "🧩", color: "bg-game-blue" },
    { slug: "balloon-pop", title: t.games.balloonPop.title, subtitle: t.games.balloonPop.subtitle, emoji: "🎈", color: "bg-game-pink" },
    { slug: "simon",       title: t.games.simon.title,      subtitle: t.games.simon.subtitle,      emoji: "🔔", color: "bg-game-orange" },
  ];

  const newGames: GameEntry[] = [
    { slug: "tap-animal",    title: t.games.tapAnimal.title,    subtitle: t.games.tapAnimal.subtitle,    emoji: "🐱", color: "bg-gradient-to-br from-green-400 to-emerald-500" },
    { slug: "word-match",    title: t.games.wordMatch.title,    subtitle: t.games.wordMatch.subtitle,    emoji: "🃏", color: "bg-gradient-to-br from-violet-500 to-purple-600" },
    { slug: "abc-rocket",    title: t.games.abcRocket.title,    subtitle: t.games.abcRocket.subtitle,    emoji: "🚀", color: "bg-gradient-to-br from-indigo-500 to-purple-600" },
    { slug: "count-bubbles", title: t.games.countBubbles.title, subtitle: t.games.countBubbles.subtitle, emoji: "🫧", color: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { slug: "color-splash",  title: t.games.colorSplash.title,  subtitle: t.games.colorSplash.subtitle,  emoji: "🎨", color: "bg-gradient-to-br from-orange-400 to-amber-500" },
    { slug: "pony-care",      title: t.games.ponyCare.title,      subtitle: t.games.ponyCare.subtitle,      emoji: "🦄", color: "bg-gradient-to-br from-pink-400 to-rose-500" },
    { slug: "magic-kitchen", title: t.games.magicKitchen.title, subtitle: t.games.magicKitchen.subtitle, emoji: "🍳", color: "bg-gradient-to-br from-orange-400 to-amber-500" },
    { slug: "magic-garden",  title: t.games.magicGarden.title,  subtitle: t.games.magicGarden.subtitle,  emoji: "🌻", color: "bg-gradient-to-br from-green-400 to-emerald-500" },
    { slug: "dress-up",      title: t.games.dressUp.title,      subtitle: t.games.dressUp.subtitle,      emoji: "👗", color: "bg-gradient-to-br from-pink-500 to-purple-500" },
  ];

  const storyGames: GameEntry[] = [
    { slug: "ari-adventure", title: t.games.ariAdventure.title, subtitle: t.games.ariAdventure.subtitle, emoji: "🦁", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
    { slug: "noa-garden",    title: t.games.noaGarden.title,    subtitle: t.games.noaGarden.subtitle,    emoji: "🌸", color: "bg-gradient-to-br from-pink-400 to-rose-500" },
  ];

  // Don't flash anything until loaded from localStorage
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

  // Show onboarding for first-time visitors
  if (!player.onboardingDone) {
    return <AvatarOnboarding onDone={completeOnboarding} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 pb-10 gap-6">
      {/* Language toggle */}
      <div className="w-full max-w-3xl flex justify-end pt-2">
        <LanguageToggle />
      </div>

      {/* Hero banner */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white text-center shadow-xl relative overflow-hidden"
      >
        {/* Floating bg emojis */}
        {["🌈","⭐","🎈","🌟","💫"].map((e, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-20 pointer-events-none"
            style={{ left: `${10 + i * 18}%`, top: `${15 + (i % 2) * 50}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5 }}
          >
            {e}
          </motion.span>
        ))}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="text-5xl mb-3"
        >
          🎮
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-black mb-1 drop-shadow">{t.home.title}</h1>
        <p className="text-base opacity-90">{t.home.subtitle}</p>
      </motion.section>

      {/* Learn Hebrew & English CTA row */}
      <section className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/learn">
          <GameCard
            title={t.home.learnHebrew}
            subtitle={t.home.learnHebrewSub}
            emoji="🗣️"
            color="bg-gradient-to-br from-indigo-500 to-blue-600"
          />
        </Link>
        <Link href="/learn-english">
          <GameCard
            title={t.home.learnEnglish}
            subtitle={t.home.learnEnglishSub}
            emoji="🇺🇸"
            color="bg-gradient-to-br from-red-500 to-pink-600"
          />
        </Link>
      </section>

      {/* Daily Challenge CTA */}
      <Link href="/daily-challenge" className="w-full max-w-3xl">
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-3xl p-4 flex items-center justify-between shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" }}
        >
          <div>
            <p className="text-white font-black text-xl">{t.home.dailyChallenge}</p>
            <p className="text-white/70 text-sm">{isHebrew ? "משחק חדש כל יום!" : "New game every day!"}</p>
          </div>
          <motion.span
            className="text-5xl"
            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >🎯</motion.span>
        </motion.div>
      </Link>

      {/* NEW games — featured prominently */}
      <Section title={t.home.newGames}>
        <div className="grid grid-cols-3 gap-3">
          {newGames.map((g) => (
            <GameLink key={g.slug} game={g} small />
          ))}
        </div>
      </Section>

      {/* Story Adventures */}
      <Section title={t.home.adventures}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storyGames.map((g) => (
            <GameLink key={g.slug} game={g} />
          ))}
        </div>
      </Section>

      {/* Learning Games */}
      <Section title={t.home.learningGames}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {learningGames.map((g) => (
            <GameLink key={g.slug} game={g} small />
          ))}
        </div>
      </Section>

      {/* Fun Games */}
      <Section title={t.home.funGames}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {funGames.map((g) => (
            <GameLink key={g.slug} game={g} small />
          ))}
        </div>
      </Section>

      {/* Achievements link */}
      <Link href="/achievements" className="w-full max-w-3xl">
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-lg py-4 rounded-2xl text-center shadow-md"
        >
          {t.home.myAchievements}
        </motion.div>
      </Link>

      {/* Daily streak nudge */}
      <DailyNudge isHebrew={isHebrew} />
    </main>
  );
}

/* ── helpers ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-3xl">
      <h2 className="text-xl font-black mb-3 text-center text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function GameLink({ game, small }: { game: GameEntry; small?: boolean }) {
  return (
    <Link href={`/games/${game.slug}`}>
      <motion.div
        whileTap={{ scale: 0.93 }}
        className={`${game.color} rounded-2xl shadow-md cursor-pointer text-white flex flex-col items-center justify-center gap-1 text-center
          ${small ? "p-3 min-h-[110px]" : "p-5 min-h-[150px]"}`}
      >
        <span className={small ? "text-3xl" : "text-5xl"}>{game.emoji}</span>
        <span className={`font-black leading-tight ${small ? "text-sm" : "text-lg"}`}>{game.title}</span>
        {!small && <span className="text-xs opacity-80">{game.subtitle}</span>}
      </motion.div>
    </Link>
  );
}

function DailyNudge({ isHebrew }: { isHebrew: boolean }) {
  const { player } = usePlayer();
  if (player.streakDays < 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-4 text-white text-center shadow-lg"
    >
      <p className="font-black text-lg">
        {isHebrew
          ? `🔥 ${player.streakDays} ימים ברצף! המשך כך!`
          : `🔥 ${player.streakDays} day streak! Keep it up!`}
      </p>
      <p className="text-sm opacity-90 mt-1">
        {isHebrew
          ? `⭐ ${player.totalStars} כוכבים שנאספו`
          : `⭐ ${player.totalStars} stars collected`}
      </p>
    </motion.div>
  );
}
