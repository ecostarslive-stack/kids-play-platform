"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CorrectAnimation } from "@/components/feedback/CorrectAnimation";
import { TryAgainAnimation } from "@/components/feedback/TryAgainAnimation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { DifficultySelector, Difficulty } from "@/components/ui/DifficultySelector";
import { hebrewWords } from "@/lib/data/words";
import { shuffleArray, pickRandom } from "@/lib/utils";
import { hebrewLetters } from "@/lib/data/hebrew-letters";

const diffConfig = {
  easy: { rounds: 6, extraLetters: 1 },
  medium: { rounds: 8, extraLetters: 2 },
  hard: { rounds: 8, extraLetters: 3 },
};

type Phase = "intro" | "difficulty" | "playing" | "complete";

interface LetterTile {
  id: string;
  letter: string;
  used: boolean;
}

export default function WordBuilderPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [words, setWords] = useState<typeof hebrewWords>([]);
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [built, setBuilt] = useState<string[]>([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const config = diffConfig[difficulty];
  const currentWord = words[round];

  const generateTiles = useCallback((word: typeof hebrewWords[0], extra: number) => {
    const wordLetters = word.letters.filter(l => l !== " ");
    const allHebrew = hebrewLetters.map(l => l.hebrew);
    const distractors = pickRandom(
      allHebrew.filter(l => !wordLetters.includes(l)),
      extra
    );
    const all = shuffleArray([
      ...wordLetters.map((l, i) => ({ id: `${l}-${i}`, letter: l, used: false })),
      ...distractors.map((l, i) => ({ id: `d-${l}-${i}`, letter: l, used: false })),
    ]);
    return all;
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const filtered = hebrewWords.filter(w => w.difficulty === diff);
    const rounds = diffConfig[diff].rounds;
    const selected = filtered.length >= rounds
      ? pickRandom(filtered, rounds)
      : shuffleArray([...filtered, ...pickRandom(filtered, rounds - filtered.length)]);
    setWords(selected);
    setScore(0);
    setRound(0);
    setBuilt([]);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase === "playing" && currentWord) {
      setTiles(generateTiles(currentWord, config.extraLetters));
      setBuilt([]);
    }
  }, [phase, round, currentWord, config.extraLetters, generateTiles]);

  const handleTileTap = useCallback((tile: LetterTile) => {
    if (isLocked || tile.used) return;

    const targetLetters = currentWord.letters.filter(l => l !== " ");
    const nextExpected = targetLetters[built.length];

    if (tile.letter === nextExpected) {
      const newBuilt = [...built, tile.letter];
      setBuilt(newBuilt);
      setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));

      if (newBuilt.length === targetLetters.length) {
        setIsLocked(true);
        playCorrect();
        setScore(s => s + 1);
        setShowCorrect(true);
        setTimeout(() => {
          setShowCorrect(false);
          if (round + 1 >= config.rounds) {
            playCheer();
            setPhase("complete");
          } else {
            setRound(r => r + 1);
          }
          setIsLocked(false);
        }, 1000);
      }
    } else {
      playWrong();
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 600);
    }
  }, [isLocked, currentWord, built, round, config.rounds, playCorrect, playWrong, playCheer]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="text-8xl">
          📝
        </motion.div>
        <h1 className="text-4xl font-black">בונים מילים</h1>
        <p className="text-lg text-foreground/70">!בנו מילים מאותיות</p>
        <BigButton onClick={() => setPhase("difficulty")} variant="success">!יאללה 🎮</BigButton>
      </div>
    );
  }

  if (phase === "difficulty") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black">📝 בונים מילים</h1>
        <DifficultySelector onSelect={startGame} />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={config.rounds}
        onPlayAgain={() => startGame(difficulty)}
        onGoHome={() => router.push("/")}
      />
    );
  }

  if (!currentWord) return null;

  const targetLetters = currentWord.letters.filter(l => l !== " ");

  return (
    <div className="flex-1 flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <ProgressBar current={round} total={config.rounds} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-6xl">{currentWord.emoji}</span>
          <span className="text-2xl font-bold text-foreground/50">{currentWord.word}</span>
        </motion.div>
      </AnimatePresence>

      {/* Built word slots */}
      <div className="flex gap-2 justify-center" dir="rtl">
        {targetLetters.map((_, i) => (
          <div
            key={i}
            className={`w-14 h-14 rounded-xl border-3 flex items-center justify-center text-2xl font-black
              ${built[i] ? "bg-success/20 border-success text-foreground" : "bg-white/50 border-foreground/20 border-dashed"}`}
          >
            {built[i] || ""}
          </div>
        ))}
      </div>

      {/* Letter tiles */}
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {tiles.map((tile, i) => (
          <motion.button
            key={tile.id}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: tile.used ? 0.6 : 1, rotate: 0, opacity: tile.used ? 0.3 : 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            whileTap={tile.used ? {} : { scale: 0.8 }}
            onClick={() => handleTileTap(tile)}
            disabled={tile.used}
            className={`w-14 h-14 rounded-2xl shadow-md text-2xl font-black flex items-center justify-center
              ${tile.used ? "bg-gray-200" : "bg-white hover:shadow-lg active:bg-gray-50"}`}
          >
            {tile.letter}
          </motion.button>
        ))}
      </div>

      <CorrectAnimation show={showCorrect} />
      <TryAgainAnimation show={showWrong} />
    </div>
  );
}
