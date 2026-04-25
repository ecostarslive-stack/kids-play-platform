"use client";

/**
 * Count the Bubbles — age 3-5
 * Bubbles float up, count them and tap the right number.
 * Visual counting, bright colors, immediate feedback.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BackButton } from "@/components/ui/BackButton";

const BUBBLE_COLORS = [
  "#FF6B6B", "#4ECDC4", "#845EC2", "#FF922B",
  "#339AF0", "#51CF66", "#FF6F91", "#FFC75F",
  "#A29BFE", "#FD79A8",
];

const TOTAL_ROUNDS = 10;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Bubble {
  id: number;
  color: string;
  x: number; // percent
  size: number; // px
  duration: number;
  delay: number;
}

function generateRound(round: number) {
  // Gradually increase count as rounds progress (1-3 early, up to 1-8 later)
  const maxCount = Math.min(3 + Math.floor(round / 2), 8);
  const count = randInt(1, maxCount);

  const bubbles: Bubble[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    x: randInt(5, 85),
    size: randInt(44, 72),
    duration: randInt(4, 7),
    delay: i * 0.2,
  }));

  // Wrong choices: unique, ±1-3 range
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = Math.max(1, count + randInt(-3, 3));
    if (w !== count) wrongs.add(w);
  }
  const choices = [...Array.from(wrongs), count].sort(() => Math.random() - 0.5);

  return { count, bubbles, choices };
}

type Phase = "intro" | "playing" | "complete";

export default function CountBubblesPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual } = useBilingualSpeak();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(() => generateRound(0));
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; chosen: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const [showCount, setShowCount] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const nextRound = useCallback((r: number) => {
    setCurrentRound(generateRound(r));
    setFeedback(null);
    setLocked(false);
    setShowCount(false);
    setRound(r);
  }, []);

  const handleChoice = useCallback((n: number) => {
    if (locked) return;
    setLocked(true);

    if (n === currentRound.count) {
      playCorrect();
      setFeedback({ type: "correct", chosen: n });
      setShowCount(true);
      setScore(s => s + 1);
      // Speak the number in both languages
      const heNum = ["אפס","אחד","שניים","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה"][Math.min(currentRound.count, 10)];
      const enNum = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"][Math.min(currentRound.count, 10)];
      track(() => speakBilingual(heNum, enNum), 200);
      track(() => {
        if (round + 1 >= TOTAL_ROUNDS) {
          playCheer();
          setPhase("complete");
        } else {
          nextRound(round + 1);
        }
      }, 1000);
    } else {
      playWrong();
      setFeedback({ type: "wrong", chosen: n });
      track(() => {
        setFeedback(null);
        setLocked(false);
      }, 900);
    }
  }, [locked, currentRound, round, score, playCorrect, playWrong, playCheer, nextRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-7xl"
        >
          🫧
        </motion.div>
        <h1 className="text-4xl font-black text-center">ספרו בועות</h1>
        <p className="text-lg text-foreground/70 text-center">ספרו את הבועות ובחרו את המספר הנכון!</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setPhase("playing"); nextRound(0); }}
          className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-black text-2xl py-5 px-10 rounded-3xl shadow-xl"
        >
          !בואו נספור 🔢
        </motion.button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={TOTAL_ROUNDS}
        onPlayAgain={() => { setScore(0); setPhase("playing"); nextRound(0); }}
        onGoHome={() => router.push("/")}
        slug="count-bubbles"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 pt-2 pb-6">
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <div className="text-yellow-500 font-black text-lg">⭐ {score}</div>
        <div className="text-foreground/50 text-sm font-bold">{round + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full"
          animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl px-6 py-3 text-white text-center w-full">
        <p className="text-xl font-black">?כמה בועות יש</p>
      </div>

      {/* Bubble arena */}
      <div className="relative w-full h-[40vh] min-h-[220px] max-h-[360px] bg-gradient-to-b from-sky-100 to-blue-50 rounded-3xl overflow-hidden border-2 border-blue-200">
        <AnimatePresence mode="wait">
          {currentRound.bubbles.map((bubble) => (
            <motion.div
              key={`${round}-${bubble.id}`}
              className="absolute rounded-full flex items-center justify-center font-black text-white shadow-lg"
              style={{
                left: `${bubble.x}%`,
                width: bubble.size,
                height: bubble.size,
                background: `radial-gradient(circle at 35% 35%, ${bubble.color}cc, ${bubble.color})`,
                boxShadow: `0 0 0 3px ${bubble.color}40, inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
              initial={{ bottom: -80, opacity: 0 }}
              animate={{ bottom: ["0%", "90%"], opacity: [0, 1, 1, 0.7] }}
              transition={{
                bottom: { duration: bubble.duration, delay: bubble.delay, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
                opacity: { duration: 0.3, delay: bubble.delay },
              }}
            />
          ))}
        </AnimatePresence>

        {/* Show count overlay on correct */}
        <AnimatePresence>
          {showCount && (
            <motion.div
              key="count-overlay"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-green-400/30 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl px-8 py-4 shadow-xl text-center">
                <p className="text-6xl font-black text-green-600">{currentRound.count}</p>
                <p className="text-green-500 font-bold">!נכון</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Number choices */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {currentRound.choices.map((n) => {
          const isCorrect = feedback?.type === "correct" && n === currentRound.count;
          const isWrong = feedback?.type === "wrong" && n === feedback.chosen;
          return (
            <motion.button
              key={n}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleChoice(n)}
              animate={isCorrect ? { scale: [1, 1.2, 1], backgroundColor: ["#fff", "#86efac", "#86efac"] } :
                       isWrong ? { scale: [1, 0.9, 1], backgroundColor: ["#fff", "#fca5a5", "#fff"] } : {}}
              className="bg-white rounded-2xl shadow-md py-4 font-black text-3xl text-gray-700 border-2 border-transparent"
              style={{ borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "transparent" }}
            >
              {n}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
