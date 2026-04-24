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
import { numbers } from "@/lib/data/numbers";
import { shuffleArray, pickRandom } from "@/lib/utils";

const TOTAL_ROUNDS = 10;
const countEmojis = ["🍎", "⭐", "🌸", "🐟", "🎈", "🦋", "🍌", "🔵"];

function getRandomEmoji() {
  return countEmojis[Math.floor(Math.random() * countEmojis.length)];
}

export default function NumbersPage() {
  const router = useRouter();
  const { state, start, correct, wrong, next, complete, reset } = useGameState(TOTAL_ROUNDS);
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();

  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [roundOrder, setRoundOrder] = useState(() => shuffleArray([...numbers]));
  const [options, setOptions] = useState<number[]>([]);
  const [emoji, setEmoji] = useState("🍎");
  const [isLocked, setIsLocked] = useState(false);

  const currentNumber = roundOrder[state.currentIndex];

  useEffect(() => {
    if (state.phase === "playing" && currentNumber) {
      setEmoji(getRandomEmoji());
      const otherValues = numbers
        .filter((n) => n.value !== currentNumber.value)
        .map((n) => n.value);
      const distractors = pickRandom(otherValues, 3);
      setOptions(shuffleArray([currentNumber.value, ...distractors]));
      const timer = setTimeout(() => speakBilingual(currentNumber.hebrew, currentNumber.english), 600);
      return () => { clearTimeout(timer); cancelSpeak(); };
    }
  }, [state.currentIndex, state.phase, currentNumber, speakBilingual, cancelSpeak]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (isLocked) return;
      setIsLocked(true);

      if (answer === currentNumber.value) {
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
    [currentNumber, correct, wrong, next, complete, playCorrect, playWrong, playCheer, isLocked, state.currentIndex]
  );

  const handlePlayAgain = useCallback(() => {
    setRoundOrder(shuffleArray([...numbers]));
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
          🔢
        </motion.div>
        <h1 className="text-4xl font-black">מספרים</h1>
        <p className="text-lg text-foreground/70">!סופרים עד 10</p>
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
          className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-4"
        >
          <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
            {Array.from({ length: currentNumber?.value || 0 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="text-4xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
          <span className="text-2xl font-bold text-foreground/60">{currentNumber?.hebrew}</span>
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-bold">?כמה יש כאן</p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((option, i) => (
          <motion.button
            key={`${state.currentIndex}-${option}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswer(option)}
            className="bg-white rounded-2xl shadow-md p-6 text-4xl font-bold
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
