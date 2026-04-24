"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BigButton } from "@/components/ui/BigButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CorrectAnimation } from "@/components/feedback/CorrectAnimation";
import { TryAgainAnimation } from "@/components/feedback/TryAgainAnimation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { DifficultySelector, Difficulty } from "@/components/ui/DifficultySelector";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { shuffleArray, pickRandom } from "@/lib/utils";

const balloonColors = ["#FF6B6B", "#4ECDC4", "#845EC2", "#FF922B", "#339AF0", "#51CF66", "#FF6F91", "#FFC75F"];

interface Balloon {
  id: string;
  letter: string;
  color: string;
  x: number;
  isTarget: boolean;
  popped: boolean;
}

const difficultyConfig = {
  easy: { balloons: 3, rounds: 8, speed: 8 },
  medium: { balloons: 4, rounds: 10, speed: 6 },
  hard: { balloons: 6, rounds: 12, speed: 4 },
};

type Phase = "intro" | "difficulty" | "playing" | "complete";

export default function BalloonPopPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer, playPop } = useGameSound();
  const { speakBilingual } = useBilingualSpeak();

  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [targetLetter, setTargetLetter] = useState("");
  const [targetLetterObj, setTargetLetterObj] = useState<{ hebrew: string; english: string } | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const config = difficultyConfig[difficulty];

  const generateRound = useCallback(() => {
    const target = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
    const others = hebrewLetters.filter(l => l.id !== target.id);
    const distractors = pickRandom(others, config.balloons - 1).map(l => l.hebrew);
    const allLetters = shuffleArray([target.hebrew, ...distractors]);

    const newBalloons: Balloon[] = allLetters.map((letter, i) => ({
      id: `${Date.now()}-${i}`,
      letter,
      color: balloonColors[i % balloonColors.length],
      x: 10 + (i * (80 / allLetters.length)),
      isTarget: letter === target.hebrew,
      popped: false,
    }));

    setTargetLetter(target.hebrew);
    setTargetLetterObj({ hebrew: target.name, english: target.english });
    setBalloons(newBalloons);
  }, [config.balloons]);

  useEffect(() => {
    if (phase === "playing") {
      generateRound();
    }
  }, [phase, round, generateRound]);

  // Speak the target letter name when it appears
  useEffect(() => {
    if (phase === "playing" && targetLetterObj) {
      const t = setTimeout(() => speakBilingual(targetLetterObj.hebrew, targetLetterObj.english), 700);
      return () => clearTimeout(t);
    }
  }, [targetLetterObj, phase, speakBilingual]);

  const handlePop = useCallback((balloon: Balloon) => {
    if (isLocked || balloon.popped) return;
    setIsLocked(true);

    setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));
    playPop();

    if (balloon.isTarget) {
      playCorrect();
      setScore(s => s + 1);
      setShowCorrect(true);
      if (targetLetterObj) speakBilingual(targetLetterObj.hebrew, targetLetterObj.english);
      setTimeout(() => {
        setShowCorrect(false);
        if (round + 1 >= config.rounds) {
          playCheer();
          setPhase("complete");
        } else {
          setRound(r => r + 1);
        }
        setIsLocked(false);
      }, 800);
    } else {
      playWrong();
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        setIsLocked(false);
      }, 600);
    }
  }, [isLocked, round, config.rounds, playCorrect, playWrong, playCheer, playPop, targetLetterObj, speakBilingual]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setRound(0);
    setPhase("playing");
  }, []);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl"
        >
          🎈
        </motion.div>
        <h1 className="text-4xl font-black">בלונים</h1>
        <p className="text-lg text-foreground/70">!פוצצו את הבלון הנכון</p>
        <BigButton onClick={() => setPhase("difficulty")} variant="success">
          !יאללה 🎮
        </BigButton>
      </div>
    );
  }

  if (phase === "difficulty") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black">🎈 בלונים</h1>
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
        onPlayAgain={() => { setRound(0); setScore(0); setPhase("playing"); }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <ProgressBar current={round} total={config.rounds} />
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-md px-6 py-3"
      >
        <p className="text-xl font-bold">
          !פוצצו את <span className="text-3xl text-game-purple">{targetLetter}</span>
        </p>
      </motion.div>

      <div className="relative w-full h-[50vh] min-h-[260px] max-h-[460px] bg-gradient-to-t from-game-green/20 to-info/10 rounded-3xl overflow-hidden">
        <AnimatePresence>
          {balloons.filter(b => !b.popped).map((balloon) => (
            <motion.button
              key={balloon.id}
              initial={{ y: 400, opacity: 0 }}
              animate={{
                y: -100,
                opacity: 1,
                x: [0, 15, -15, 10, -10, 0],
              }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{
                y: { duration: config.speed, ease: "linear" },
                x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.3 },
              }}
              onClick={() => handlePop(balloon)}
              className="absolute cursor-pointer touch-none"
              style={{ left: `${balloon.x}%` }}
            >
              <div className="relative">
                <svg width="70" height="90" viewBox="0 0 70 90">
                  <ellipse cx="35" cy="35" rx="30" ry="35" fill={balloon.color} />
                  <ellipse cx="35" cy="35" rx="30" ry="35" fill="white" opacity="0.15" />
                  <ellipse cx="25" cy="22" rx="8" ry="12" fill="white" opacity="0.3" transform="rotate(-20, 25, 22)" />
                  <polygon points="35,70 32,78 38,78" fill={balloon.color} />
                  <line x1="35" y1="78" x2="35" y2="90" stroke="#999" strokeWidth="1" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-black pb-6">
                  {balloon.letter}
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <CorrectAnimation show={showCorrect} />
      <TryAgainAnimation show={showWrong} />
    </div>
  );
}
