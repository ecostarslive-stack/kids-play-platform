"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BigButton } from "@/components/ui/BigButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CorrectAnimation } from "@/components/feedback/CorrectAnimation";
import { TryAgainAnimation } from "@/components/feedback/TryAgainAnimation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { colors } from "@/lib/data/colors";
import { shuffleArray, pickRandom } from "@/lib/utils";

const TOTAL_ROUNDS = 10;

export default function ColorsPage() {
  const router = useRouter();
  const { state, start, correct, wrong, next, complete, reset } = useGameState(TOTAL_ROUNDS);
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();

  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [roundOrder, setRoundOrder] = useState(() => shuffleArray([...colors]));
  const [options, setOptions] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const currentColor = roundOrder[state.currentIndex % roundOrder.length];

  useEffect(() => {
    if (state.phase === "playing" && currentColor) {
      const otherNames = colors
        .filter((c) => c.id !== currentColor.id)
        .map((c) => c.hebrew);
      const distractors = pickRandom(otherNames, 3);
      setOptions(shuffleArray([currentColor.hebrew, ...distractors]));
      const timer = setTimeout(() => speakBilingual(currentColor.hebrew, currentColor.english), 500);
      return () => { clearTimeout(timer); cancelSpeak(); };
    }
  }, [state.currentIndex, state.phase, currentColor, speakBilingual, cancelSpeak]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLocked) return;
      setIsLocked(true);

      if (answer === currentColor.hebrew) {
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
    [currentColor, correct, wrong, next, complete, playCorrect, playWrong, playCheer, isLocked, state.currentIndex]
  );

  const handlePlayAgain = useCallback(() => {
    setRoundOrder(shuffleArray([...colors]));
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
          🎨
        </motion.div>
        <h1 className="text-4xl font-black">צבעים</h1>
        <p className="text-lg text-foreground/70">!מכירים צבעים בעברית</p>
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
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-40 h-40 md:w-52 md:h-52 rounded-full shadow-xl border-4 border-white"
            style={{ backgroundColor: currentColor?.hex }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-bold">?מה הצבע</p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((option, i) => (
          <motion.button
            key={`${state.currentIndex}-${option}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswer(option)}
            className="bg-white rounded-2xl shadow-md p-5 text-2xl font-bold
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
