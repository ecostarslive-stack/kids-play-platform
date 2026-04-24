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
import { shapes } from "@/lib/data/shapes";
import { shuffleArray, pickRandom } from "@/lib/utils";

const TOTAL_ROUNDS = 6;
const shapeColors = ["#FF6B6B", "#4ECDC4", "#845EC2", "#FF922B", "#339AF0", "#51CF66"];

export default function ShapesPage() {
  const router = useRouter();
  const { state, start, correct, wrong, next, complete, reset } = useGameState(TOTAL_ROUNDS);
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();

  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [roundOrder, setRoundOrder] = useState(() => shuffleArray([...shapes]));
  const [options, setOptions] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const currentShape = roundOrder[state.currentIndex];

  useEffect(() => {
    if (state.phase === "playing" && currentShape) {
      const otherNames = shapes
        .filter((s) => s.id !== currentShape.id)
        .map((s) => s.hebrew);
      const distractors = pickRandom(otherNames, 3);
      setOptions(shuffleArray([currentShape.hebrew, ...distractors]));
      const timer = setTimeout(() => speakBilingual(currentShape.hebrew, currentShape.english), 900);
      return () => { clearTimeout(timer); cancelSpeak(); };
    }
  }, [state.currentIndex, state.phase, currentShape, speakBilingual, cancelSpeak]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLocked) return;
      setIsLocked(true);

      if (answer === currentShape.hebrew) {
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
    [currentShape, correct, wrong, next, complete, playCorrect, playWrong, playCheer, isLocked, state.currentIndex]
  );

  const handlePlayAgain = useCallback(() => {
    setRoundOrder(shuffleArray([...shapes]));
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
          🔷
        </motion.div>
        <h1 className="text-4xl font-black">צורות</h1>
        <p className="text-lg text-foreground/70">!לומדים צורות בעברית</p>
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

  const color = shapeColors[state.currentIndex % shapeColors.length];

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
          className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center gap-4"
        >
          <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-52 md:h-52">
            <motion.path
              d={currentShape?.svgPath}
              fill={color}
              stroke={color}
              strokeWidth="2"
              initial={{ pathLength: 0, fillOpacity: 0 }}
              animate={{ pathLength: 1, fillOpacity: 1 }}
              transition={{ duration: 1.5, fillOpacity: { delay: 0.8, duration: 0.5 } }}
            />
          </svg>
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-bold">?מה השם של הצורה</p>

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
