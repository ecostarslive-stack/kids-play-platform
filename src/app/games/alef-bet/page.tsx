"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { useGameSound } from "@/hooks/useGameSound";
import { useVoice } from "@/hooks/useVoice";
import { BigButton } from "@/components/ui/BigButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CorrectAnimation } from "@/components/feedback/CorrectAnimation";
import { TryAgainAnimation } from "@/components/feedback/TryAgainAnimation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { shuffleArray, pickRandom } from "@/lib/utils";

const TOTAL_ROUNDS = 10;

export default function AlefBetPage() {
  const router = useRouter();
  const { state, start, correct, wrong, next, complete, reset } = useGameState(TOTAL_ROUNDS);
  const { play, playCorrect, playWrong, playCheer } = useGameSound();
  const { speakHebrew } = useVoice({ hebrewRate: 0.7 });

  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [gameLetters, setGameLetters] = useState(() => pickRandom(hebrewLetters, TOTAL_ROUNDS));
  const [options, setOptions] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const currentLetter = gameLetters[state.currentIndex];

  useEffect(() => {
    if (state.phase === "playing" && currentLetter) {
      const others = hebrewLetters
        .filter((l) => l.id !== currentLetter.id)
        .map((l) => l.hebrew);
      const distractors = pickRandom(others, 3);
      setOptions(shuffleArray([currentLetter.hebrew, ...distractors]));
      const timer = setTimeout(() => speakHebrew(currentLetter.name), 400);
      return () => clearTimeout(timer);
    }
  }, [state.currentIndex, state.phase, currentLetter, speakHebrew]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLocked) return;
      setIsLocked(true);

      if (answer === currentLetter.hebrew) {
        correct();
        playCorrect();
        setShowCorrect(true);
        setTimeout(() => {
          setShowCorrect(false);
          if (state.currentIndex + 1 >= TOTAL_ROUNDS) {
            complete();
            playCheer();
          } else {
            next();
          }
          setIsLocked(false);
        }, 1000);
      } else {
        wrong();
        playWrong();
        setShowWrong(true);
        setTimeout(() => {
          setShowWrong(false);
          setIsLocked(false);
        }, 800);
      }
    },
    [currentLetter, correct, wrong, next, complete, playCorrect, playWrong, playCheer, isLocked, state.currentIndex]
  );

  const handlePlayAgain = useCallback(() => {
    setGameLetters(pickRandom(hebrewLetters, TOTAL_ROUNDS));
    reset();
    start();
  }, [reset, start]);

  if (state.phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl"
        >
          🔤
        </motion.div>
        <h1 className="text-4xl font-black">אותיות הא-ב</h1>
        <p className="text-lg text-foreground/70">מצאו את האות הנכונה!</p>
        <BigButton onClick={start} variant="success">
          !יאללה, מתחילים 🎮
        </BigButton>
      </div>
    );
  }

  if (state.phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={state.score}
        total={TOTAL_ROUNDS}
        onPlayAgain={handlePlayAgain}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={state.score} />
        <ProgressBar current={state.currentIndex} total={TOTAL_ROUNDS} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentIndex}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center gap-2"
        >
          <span className="text-9xl font-black text-game-purple">{currentLetter?.hebrew}</span>
          <span className="text-2xl text-foreground/60">{currentLetter?.name}</span>
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-bold">?איפה האות הזו</p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((option, i) => (
          <motion.button
            key={`${state.currentIndex}-${option}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswer(option)}
            className="bg-white rounded-2xl shadow-md p-6 text-6xl font-bold
              hover:shadow-lg active:bg-gray-50 transition-shadow"
          >
            {option}
          </motion.button>
        ))}
      </div>

      <CorrectAnimation show={showCorrect} />
      <TryAgainAnimation show={showWrong} />
    </div>
  );
}
