"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { DifficultySelector, Difficulty } from "@/components/ui/DifficultySelector";

const simonColors = [
  { id: "red", color: "#FF6B6B", activeColor: "#FF4040", hebrew: "אדום", freq: 261.63 },
  { id: "blue", color: "#339AF0", activeColor: "#1C7ED6", hebrew: "כחול", freq: 329.63 },
  { id: "green", color: "#51CF66", activeColor: "#37B24D", hebrew: "ירוק", freq: 392.0 },
  { id: "yellow", color: "#FFC75F", activeColor: "#FFB020", hebrew: "צהוב", freq: 523.25 },
];

const freqById: Record<string, number> = Object.fromEntries(
  simonColors.map((c) => [c.id, c.freq])
);

const difficultyConfig = {
  easy: { maxRounds: 5, showSpeed: 800, pauseBetween: 400 },
  medium: { maxRounds: 8, showSpeed: 600, pauseBetween: 300 },
  hard: { maxRounds: 12, showSpeed: 400, pauseBetween: 200 },
};

type Phase = "intro" | "difficulty" | "showing" | "input" | "complete" | "gameover";

export default function SimonPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer, playNote } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  const config = difficultyConfig[difficulty];

  const clearTimeouts = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  }, []);

  const playSequence = useCallback((seq: string[]) => {
    setPhase("showing");
    clearTimeouts();

    seq.forEach((colorId, i) => {
      const showTimeout = setTimeout(() => {
        setActiveButton(colorId);
        playNote(freqById[colorId], Math.min(0.4, config.showSpeed / 1000));
      }, i * (config.showSpeed + config.pauseBetween));

      const hideTimeout = setTimeout(() => {
        setActiveButton(null);
      }, i * (config.showSpeed + config.pauseBetween) + config.showSpeed);

      timeoutRef.current.push(showTimeout, hideTimeout);
    });

    const endTimeout = setTimeout(() => {
      setPhase("input");
      setPlayerIndex(0);
    }, seq.length * (config.showSpeed + config.pauseBetween) + 200);
    timeoutRef.current.push(endTimeout);
  }, [config, clearTimeouts, playNote]);

  const startNewRound = useCallback((currentSequence: string[]) => {
    const nextColor = simonColors[Math.floor(Math.random() * simonColors.length)].id;
    const newSequence = [...currentSequence, nextColor];
    setSequence(newSequence);
    setRound(r => r + 1);
    setTimeout(() => playSequence(newSequence), 600);
  }, [playSequence]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setRound(0);
    setSequence([]);
    const firstColor = simonColors[Math.floor(Math.random() * simonColors.length)].id;
    const firstSequence = [firstColor];
    setSequence(firstSequence);
    setRound(1);
    setPhase("showing");
    setTimeout(() => playSequence(firstSequence), 800);
  }, [playSequence]);

  const handleButtonPress = useCallback((colorId: string) => {
    if (phase !== "input") return;

    setActiveButton(colorId);
    playNote(freqById[colorId], 0.25);
    setTimeout(() => setActiveButton(null), 200);

    if (colorId === sequence[playerIndex]) {
      const nextIndex = playerIndex + 1;

      if (nextIndex >= sequence.length) {
        setScore(s => s + 1);
        playCorrect();

        if (round >= config.maxRounds) {
          playCheer();
          setPhase("complete");
        } else {
          startNewRound(sequence);
        }
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      playWrong();
      setPhase("gameover");
    }
  }, [phase, sequence, playerIndex, round, config.maxRounds, playCorrect, playWrong, playCheer, playNote, startNewRound]);

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl"
        >
          🔔
        </motion.div>
        <h1 className="text-4xl font-black">סימון אומר</h1>
        <p className="text-lg text-foreground/70">!זכרו את הרצף וחזרו עליו</p>
        <BigButton onClick={() => setPhase("difficulty")} variant="success">
          !יאללה 🎮
        </BigButton>
      </div>
    );
  }

  if (phase === "difficulty") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black">🔔 סימון אומר</h1>
        <DifficultySelector onSelect={startGame} />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={config.maxRounds}
        onPlayAgain={() => startGame(difficulty)}
        onGoHome={() => router.push("/")}
      />
    );
  }

  if (phase === "gameover") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="text-7xl"
        >
          😅
        </motion.div>
        <h2 className="text-3xl font-black">!אופס</h2>
        <p className="text-xl text-foreground/70">הגעתם עד סיבוב {round}</p>
        <p className="text-lg">⭐ ניקוד: {score}</p>
        <div className="flex gap-3">
          <BigButton onClick={() => startGame(difficulty)} variant="success">🔄 שוב</BigButton>
          <BigButton onClick={() => router.push("/")} variant="secondary">🏠 הביתה</BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <span className="text-lg font-bold text-foreground/60">סיבוב {round}</span>
      </div>

      <motion.p
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-center"
      >
        {phase === "showing" ? "👀 !תסתכלו" : "👆 !תורכם"}
      </motion.p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[min(320px,80vw)]">
        {simonColors.map((sc) => (
          <motion.button
            key={sc.id}
            whileTap={phase === "input" ? { scale: 0.9 } : {}}
            onClick={() => handleButtonPress(sc.id)}
            disabled={phase !== "input"}
            className="aspect-square rounded-3xl shadow-lg transition-all duration-150 border-4 border-white/30"
            style={{
              backgroundColor: activeButton === sc.id ? sc.activeColor : sc.color,
              transform: activeButton === sc.id ? "scale(1.08)" : "scale(1)",
              boxShadow: activeButton === sc.id ? `0 0 30px ${sc.color}80` : undefined,
            }}
          >
            <span className="text-white text-lg font-bold opacity-60">{sc.hebrew}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-1 mt-2">
        {sequence.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              phase === "input" && i < playerIndex ? "bg-success" :
              phase === "input" && i === playerIndex ? "bg-warning" : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
