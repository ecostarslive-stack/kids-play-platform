"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BigButton } from "@/components/ui/BigButton";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { FlipCard } from "@/components/ui/FlipCard";
import { memoryCardPairs } from "@/lib/data/memory-cards";
import { shuffleArray, pickRandom } from "@/lib/utils";
import { GAME_CONFIG } from "@/lib/constants";

interface Card {
  id: string;
  pairId: string;
  emoji: string;
  hebrew: string;
  english: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function createCards(): Card[] {
  const selected = pickRandom(memoryCardPairs, GAME_CONFIG.MEMORY_PAIRS);
  const pairs: Card[] = [];
  selected.forEach((item) => {
    pairs.push(
      { id: `${item.id}-a`, pairId: item.id, emoji: item.emoji, hebrew: item.hebrew, english: item.english, isFlipped: false, isMatched: false },
      { id: `${item.id}-b`, pairId: item.id, emoji: item.emoji, hebrew: item.hebrew, english: item.english, isFlipped: false, isMatched: false }
    );
  });
  return shuffleArray(pairs);
}

type Phase = "intro" | "playing" | "complete";

export default function MemoryPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer, playFlip } = useGameSound();
  const { speakBilingual } = useBilingualSpeak();

  const [phase, setPhase] = useState<Phase>("intro");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const totalPairs = GAME_CONFIG.MEMORY_PAIRS;

  const startGame = useCallback(() => {
    setCards(createCards());
    setFlippedIds([]);
    setScore(0);
    setMatchedCount(0);
    setPhase("playing");
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (isLocked) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);
      playFlip();

      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );

      if (newFlipped.length === 2) {
        setIsLocked(true);
        const first = cards.find((c) => c.id === newFlipped[0])!;
        const second = cards.find((c) => c.id === cardId)!;

        if (first.pairId === second.pairId) {
          playCorrect();
          speakBilingual(first.hebrew, first.english);
          setScore((s) => s + 1);
          const newMatched = matchedCount + 1;
          setMatchedCount(newMatched);
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedIds([]);
          setIsLocked(false);

          if (newMatched >= totalPairs) {
            setTimeout(() => {
              playCheer();
              setPhase("complete");
            }, 500);
          }
        } else {
          playWrong();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) && !c.isMatched
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedIds([]);
            setIsLocked(false);
          }, GAME_CONFIG.FLIP_DELAY);
        }
      }
    },
    [cards, flippedIds, isLocked, matchedCount, totalPairs, playCorrect, playWrong, playCheer, playFlip, speakBilingual]
  );

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl"
        >
          🧠
        </motion.div>
        <h1 className="text-4xl font-black">משחק זיכרון</h1>
        <p className="text-lg text-foreground/70">!מצאו את הזוגות</p>
        <BigButton onClick={startGame} variant="success">
          !יאללה, מתחילים 🎮
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={totalPairs}
        onPlayAgain={startGame}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <span className="text-lg font-bold text-foreground/60">
          {matchedCount} / {totalPairs} זוגות
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
          >
            <FlipCard
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onClick={() => handleCardClick(card.id)}
              front={
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-3xl">{card.emoji}</span>
                  <span className="text-xs font-bold">{card.hebrew}</span>
                  <span className="text-[10px] text-foreground/50">{card.english}</span>
                </div>
              }
              back={<span className="text-3xl text-white">❓</span>}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
