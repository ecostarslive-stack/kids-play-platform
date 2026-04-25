"use client";

/**
 * Tap the Animal — bilingual immersive version
 * Shows 4 large animal cards. Hear the name in BOTH languages.
 * On correct tap: hear it again (known → learning).
 * Visual: big emoji cards with gradient backgrounds, bounce + glow on correct.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BackButton } from "@/components/ui/BackButton";
import { useLanguage } from "@/providers/LanguageProvider";

const ANIMALS = [
  { id: "cat",      emoji: "🐱", he: "חתול",    en: "Cat",      color: "#f97316" },
  { id: "dog",      emoji: "🐶", he: "כלב",     en: "Dog",      color: "#3b82f6" },
  { id: "lion",     emoji: "🦁", he: "אריה",    en: "Lion",     color: "#eab308" },
  { id: "elephant", emoji: "🐘", he: "פיל",     en: "Elephant", color: "#8b5cf6" },
  { id: "monkey",   emoji: "🐒", he: "קוף",     en: "Monkey",   color: "#f59e0b" },
  { id: "rabbit",   emoji: "🐰", he: "ארנב",    en: "Rabbit",   color: "#ec4899" },
  { id: "frog",     emoji: "🐸", he: "צפרדע",   en: "Frog",     color: "#22c55e" },
  { id: "bear",     emoji: "🐻", he: "דב",      en: "Bear",     color: "#a16207" },
  { id: "cow",      emoji: "🐮", he: "פרה",     en: "Cow",      color: "#14b8a6" },
  { id: "duck",     emoji: "🦆", he: "ברווז",   en: "Duck",     color: "#0ea5e9" },
  { id: "horse",    emoji: "🐴", he: "סוס",     en: "Horse",    color: "#d97706" },
  { id: "pig",      emoji: "🐷", he: "חזיר",    en: "Pig",      color: "#f43f5e" },
  { id: "owl",      emoji: "🦉", he: "ינשוף",   en: "Owl",      color: "#7c3aed" },
  { id: "penguin",  emoji: "🐧", he: "פינגווין", en: "Penguin", color: "#0284c7" },
  { id: "fox",      emoji: "🦊", he: "שועל",    en: "Fox",      color: "#ea580c" },
  { id: "turtle",   emoji: "🐢", he: "צב",      en: "Turtle",   color: "#16a34a" },
];

const TOTAL_ROUNDS = 12;
const GRID_SIZE = 4;

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
type Feedback = { id: string; type: "correct" | "wrong" } | null;

export default function TapAnimalPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { isHebrew } = useLanguage();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(() => generateRound());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [locked, setLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); cancelSpeak(); }, [cancelSpeak]);

  const startRound = useCallback((r: number) => {
    const rd = generateRound();
    setCurrentRound(rd);
    setFeedback(null);
    setLocked(false);
    setRound(r);
    // Speak target in both languages after cards appear
    track(() => speakBilingual(rd.target.he, rd.target.en), 600);
  }, [speakBilingual, track]);

  const handleTap = useCallback((animalId: string) => {
    if (locked) return;
    setLocked(true);

    if (animalId === currentRound.target.id) {
      playCorrect();
      setFeedback({ id: animalId, type: "correct" });
      const newCombo = combo + 1;
      setCombo(newCombo);

      if (newCombo >= 3) {
        setShowCombo(true);
        track(() => setShowCombo(false), 1400);
      }

      setScore(s => s + 1);
      // Speak again on correct — reinforce
      track(() => speakBilingual(currentRound.target.he, currentRound.target.en), 200);
      track(() => {
        if (round + 1 >= TOTAL_ROUNDS) { playCheer(); setPhase("complete"); }
        else startRound(round + 1);
      }, 1400);
    } else {
      playWrong();
      setCombo(0);
      setFeedback({ id: animalId, type: "wrong" });
      // Speak correct answer so child learns
      track(() => speakBilingual(currentRound.target.he, currentRound.target.en), 300);
      track(() => { setFeedback(null); setLocked(false); }, 1200);
    }
  }, [locked, currentRound, combo, round, playCorrect, playWrong, playCheer, speakBilingual, startRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="relative"
        >
          <div className="text-[100px] filter drop-shadow-xl">🦁</div>
          <motion.div
            className="absolute -top-2 -right-2 text-3xl"
            animate={{ scale: [1, 1.4, 1], rotate: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >⭐</motion.div>
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black bg-gradient-to-br from-green-500 to-emerald-600 bg-clip-text text-transparent">
            {isHebrew ? "חיות" : "Animals"}
          </h1>
          <p className="text-foreground/60 mt-2">{isHebrew ? "שמעו ולחצו על הבעל חיים הנכון!" : "Listen and tap the right animal!"}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setPhase("playing"); startRound(0); }}
          className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-black text-2xl py-5 px-12 rounded-3xl shadow-2xl"
          style={{ boxShadow: "0 8px 30px rgba(34,197,94,0.4)" }}
        >
          {isHebrew ? "יאללה 🐾" : "Let's Go 🐾"}
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
        onPlayAgain={() => { setScore(0); setCombo(0); setPhase("playing"); startRound(0); }}
        onGoHome={() => router.push("/")}
        slug="tap-animal"
      />
    );
  }

  const target = currentRound.target;

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 pt-2 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <div className="flex items-center gap-1 text-yellow-500 font-black text-lg">
          <span>⭐</span><span>{score}</span>
          {combo >= 2 && <span className="text-orange-500 text-sm ml-1">x{combo}🔥</span>}
        </div>
        <div className="text-foreground/50 text-sm font-bold">{round + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
          animate={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Prompt card */}
      <motion.div
        key={`prompt-${round}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full rounded-3xl p-4 text-white shadow-xl flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${target.color}dd, ${target.color})`, boxShadow: `0 8px 25px ${target.color}55` }}
      >
        <div>
          <p className="text-sm opacity-80">{isHebrew ? "לחצו על" : "Tap the"}</p>
          <p className="text-3xl font-black">{isHebrew ? target.he : target.en}</p>
          <p className="text-base opacity-75 font-bold">{isHebrew ? target.en : target.he}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => speakBilingual(target.he, target.en)}
          className="bg-white/25 rounded-2xl p-3 text-2xl backdrop-blur-sm"
        >
          🔊
        </motion.button>
      </motion.div>

      {/* Combo badge */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            key="combo"
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/3 z-50 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-black text-xl px-6 py-3 rounded-2xl shadow-2xl"
          >
            🔥 {combo} {isHebrew ? "ברצף!" : "combo!"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animal grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {currentRound.pool.map((animal, idx) => {
          const fb = feedback?.id === animal.id ? feedback.type : null;
          return (
            <motion.button
              key={`${round}-${animal.id}`}
              onClick={() => handleTap(animal.id)}
              initial={{ scale: 0, rotate: (idx % 2 === 0 ? -8 : 8) }}
              animate={{
                scale: fb === "correct" ? [1, 1.25, 1.1] : fb === "wrong" ? [1, 0.88, 1] : 1,
                rotate: 0,
              }}
              transition={{ delay: idx * 0.07, type: "spring", stiffness: 320, damping: 20 }}
              className="relative flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg min-h-[130px] overflow-hidden border-4"
              style={{
                background: fb === "correct"
                  ? "linear-gradient(135deg, #86efac, #22c55e)"
                  : fb === "wrong"
                    ? "linear-gradient(135deg, #fca5a5, #ef4444)"
                    : `linear-gradient(145deg, ${animal.color}22, ${animal.color}11)`,
                borderColor: fb === "correct" ? "#22c55e" : fb === "wrong" ? "#ef4444" : `${animal.color}55`,
              }}
            >
              {/* Glow ring on correct */}
              {fb === "correct" && (
                <motion.div
                  className="absolute inset-0 rounded-3xl border-4 border-green-400"
                  animate={{ opacity: [1, 0], scale: [1, 1.08] }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <span className="text-6xl filter drop-shadow-md">{animal.emoji}</span>
              <span className="font-black text-base" style={{ color: `${animal.color}` }}>
                {isHebrew ? animal.he : animal.en}
              </span>
              {/* Learning language label */}
              <span className="text-xs opacity-60 font-semibold">
                {isHebrew ? animal.en : animal.he}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
