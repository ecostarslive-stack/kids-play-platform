"use client";

import Link from "next/link";
import { GameCard } from "@/components/ui/GameCard";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/providers/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  const learningGames = [
    { slug: "alef-bet", title: t.games.alefBet.title, subtitle: t.games.alefBet.subtitle, emoji: "🔤", color: "bg-game-purple" },
    { slug: "numbers", title: t.games.numbers.title, subtitle: t.games.numbers.subtitle, emoji: "🔢", color: "bg-game-pink" },
    { slug: "colors", title: t.games.colors.title, subtitle: t.games.colors.subtitle, emoji: "🎨", color: "bg-game-orange" },
    { slug: "shapes", title: t.games.shapes.title, subtitle: t.games.shapes.subtitle, emoji: "🔷", color: "bg-game-yellow" },
    { slug: "word-builder", title: t.games.wordBuilder.title, subtitle: t.games.wordBuilder.subtitle, emoji: "📝", color: "bg-game-green" },
    { slug: "treasure-hunt", title: t.games.treasureHunt.title, subtitle: t.games.treasureHunt.subtitle, emoji: "🗺️", color: "bg-game-blue" },
    { slug: "daily-word", title: t.games.dailyWord.title, subtitle: t.games.dailyWord.subtitle, emoji: "📅", color: "bg-gradient-to-br from-teal-400 to-emerald-500" },
    { slug: "conversation", title: t.games.conversation.title, subtitle: t.games.conversation.subtitle, emoji: "💬", color: "bg-gradient-to-br from-violet-400 to-purple-500" },
  ];

  const funGames = [
    { slug: "memory", title: t.games.memory.title, subtitle: t.games.memory.subtitle, emoji: "🧠", color: "bg-game-green" },
    { slug: "puzzle", title: t.games.puzzle.title, subtitle: t.games.puzzle.subtitle, emoji: "🧩", color: "bg-game-blue" },
    { slug: "balloon-pop", title: t.games.balloonPop.title, subtitle: t.games.balloonPop.subtitle, emoji: "🎈", color: "bg-game-pink" },
    { slug: "simon", title: t.games.simon.title, subtitle: t.games.simon.subtitle, emoji: "🔔", color: "bg-game-orange" },
  ];

  const storyGames = [
    { slug: "ari-adventure", title: t.games.ariAdventure.title, subtitle: t.games.ariAdventure.subtitle, emoji: "🦁", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
    { slug: "noa-garden", title: t.games.noaGarden.title, subtitle: t.games.noaGarden.subtitle, emoji: "🌸", color: "bg-gradient-to-br from-pink-400 to-rose-500" },
  ];

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 gap-8">
      <div className="w-full max-w-3xl flex justify-end">
        <LanguageToggle />
      </div>

      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
          {t.home.title}
        </h1>
        <p className="text-lg text-foreground/70">
          {t.home.subtitle}
        </p>
      </div>

      {/* Learn Hebrew - Featured CTA */}
      <section className="w-full max-w-3xl">
        <Link href="/learn">
          <GameCard
            title={t.home.learnHebrew}
            subtitle={t.home.learnHebrewSub}
            emoji="🗣️"
            color="bg-gradient-to-br from-indigo-500 to-blue-600"
          />
        </Link>
      </section>

      {/* Learn English - Featured CTA */}
      <section className="w-full max-w-3xl">
        <Link href="/learn-english">
          <GameCard
            title={t.home.learnEnglish}
            subtitle={t.home.learnEnglishSub}
            emoji="🇺🇸"
            color="bg-gradient-to-br from-red-500 to-pink-600"
          />
        </Link>
      </section>

      {/* Story Adventures */}
      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-black mb-3 text-center">{t.home.adventures}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyGames.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`}>
              <GameCard title={game.title} subtitle={game.subtitle} emoji={game.emoji} color={game.color} />
            </Link>
          ))}
        </div>
      </section>

      {/* Learning Games */}
      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-black mb-3 text-center">{t.home.learningGames}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {learningGames.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`}>
              <GameCard title={game.title} subtitle={game.subtitle} emoji={game.emoji} color={game.color} />
            </Link>
          ))}
        </div>
      </section>

      {/* Fun Games */}
      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-black mb-3 text-center">{t.home.funGames}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {funGames.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`}>
              <GameCard title={game.title} subtitle={game.subtitle} emoji={game.emoji} color={game.color} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
