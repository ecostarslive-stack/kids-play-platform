"use client";

/**
 * Tap the Animal — age 3-5
 * Show 4-6 big animal emojis, hear the name, tap the right one.
 * Fast-paced, immediate reward, high engagement.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { BackButton } from "@/components/ui/BackButton";

const ANIMALS = [
  { id: "cat",      emoji: "🐱", he: "חתול",   en: "Cat"      },
  { id: "dog",      emoji: "🐶", he: "כלב",    en: "Dog"      },
  { id: "lion",     emoji: "🦁", he: "אריה",   en: "Lion"     },
  { id: "elephant", emoji: "🐘", he: "פיל",    en: "Elephant" },
  { id: "monkey",   emoji: "🐒", he: "קוף",    en: "Monkey"   },
  { id: "rabbit",   emoji: "🐰", he: "ארנב",   en: "Rabbit"   },
  { id: "frog",     emoji: "🐸", he: "צפרדע",  en: "Frog"     },
  { id: "bear",     emoji: "🐻", he: "דב",     en: "Bear"     },
  { id: "cow",      emoji: "🐮", he: "פרה",    en: "Cow"      },
  { id: "duck",     emoji: "🦆", he: "ברווז",  en: "Duck"     },
  { id: "horse",    emoji: "🐴", he: "סוס",    en: "Horse"    },
  { id: "pig",      emoji: "🐷", he: "חזיר",   en: "Pig"      },
  { id: "sheep",    emoji: "🐑", he: "כבשה",   en: "Sheep"    },
  { id: "bird",     emoji: "🐦", he: "ציפור",  en: "Bird"     },
  { id: "fish",     emoji: "🐟", he: "דג",     en: "Fish"     },
];

const TOTAL_ROUNDS = 10;
const GRID_SIZE = 4; // 4 animals per round

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound() {
  const pool = shuffle(ANIMALS).slice(0, GRID_SIZE);
  const target = pool[Math.floor(Math.random() * pool.length)];
  return { pool, target };
}

type Phase = "intro" | "playing" | "complete";

export default function TapAnimalPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(() => generateRound());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [locked, setLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  // Speak the target animal name using Web Speech API
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    u.rate = 0.8;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  }, []);

  const startRound = useCallback((r: number) => {
    const rd = generateRound();
    setCurrentRound(rd);
    setFeedback(null);
    setLocked(false);
    setRound(r);
    track(() => speak(rd.target.he), 300);
  }, [speak, track]);

  const handleTap = useCallback((animalId: string) => {
    if (locked) return;
    setLocked(true);

    if (animalId === currentRound.target.id) {
      playCorrect();
      setFeedback("correct");
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (newStreak >= 3) {
        setShowStreak(true);
        track(() => setShowStreak(false), 1200);
      }

      track(() => {
        if (round + 1 >= TOTAL_ROUNDS) {
          playCheer();
          setPhase("complete");
        } else {
          startRound(round + 1);
        }
      }, 700);
    } else {
      playWrong();
      setFeedback("wrong");
      setStreak(0);
      track(() => {
        setFeedback(null);
        setLocked(false);
      }, 800);
    }
  }, [locked, currentRound, score, streak, round, playCorrect, playWrong, playCheer, startRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl"
        >
          🐱
        </motion.div>
        <h1 className="text-4xl font-black text-center">חיות</h1>
        <p className="text-lg text-foreground/70 text-center">שמעו את השם — לחצו על הבעל חיים הנכון!</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setPhase("playing"); startRound(0); }}
          className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-black text-2xl py-5 px-10 rounded-3xl shadow-xl"
        >
          !יאללה 🐾
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
        onPlayAgain={() => { setScore(0); setStreak(0); setPhase("playing"); startRound(0); }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4 pt-2 pb-6">
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <div className="flex items-center gap-2 text-yellow-500 font-black text-lg">
          <span>⭐</span><span>{score}</span>
        </div>
        <div className="text-foreground/50 text-sm font-bold">{round + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
          animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Target prompt */}
      <motion.div
        key={currentRound.target.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl px-8 py-4 text-white text-center shadow-lg w-full"
      >
        <p className="text-sm opacity-80 mb-1">לחצו על</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-3xl font-black">{currentRound.target.he}</p>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => speak(currentRound.target.he)}
            className="text-2xl bg-white/20 rounded-full p-2"
          >
            🔊
          </motion.button>
        </div>
        <p className="text-sm opacity-70 mt-1">{currentRound.target.en}</p>
      </motion.div>

      {/* Streak indicator */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            key="streak"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-purple-800 font-black text-xl px-6 py-3 rounded-2xl shadow-xl"
          >
            🔥 {streak} ברצף!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animal grid */}
      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        {currentRound.pool.map((animal) => {
          const isTarget = animal.id === currentRound.target.id;
          const isWrong = feedback === "wrong" && !isTarget && locked;
          return (
            <motion.button
              key={`${round}-${animal.id}`}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTap(animal.id)}
              initial={{ scale: 0, rotate: Math.random() * 20 - 10 }}
              animate={{
                scale: feedback === "correct" && isTarget ? [1, 1.3, 1] : 1,
                rotate: 0,
                backgroundColor: feedback === "correct" && isTarget
                  ? ["#fff", "#86efac", "#fff"]
                  : isWrong ? ["#fff", "#fca5a5", "#fff"] : "#fff",
              }}
              transition={{ delay: Math.random() * 0.1, type: "spring", stiffness: 300 }}
              className="flex flex-col items-center justify-center gap-2 bg-white rounded-3xl shadow-md p-4 min-h-[120px] border-4 border-transparent"
              style={{
                borderColor: feedback === "correct" && isTarget ? "#22c55e" : "transparent",
              }}
            >
              <span className="text-6xl">{animal.emoji}</span>
              <span className="font-black text-base text-gray-700">{animal.he}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
