"use client";

/**
 * Color Splash — age 3-5
 * A big shape appears — tap the matching color from 4 choices.
 * Big targets, bright colors, satisfying splat animation on correct.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BackButton } from "@/components/ui/BackButton";

const COLORS = [
  { id: "red",    he: "אדום",    en: "Red",    hex: "#ef4444", light: "#fee2e2" },
  { id: "blue",   he: "כחול",    en: "Blue",   hex: "#3b82f6", light: "#dbeafe" },
  { id: "green",  he: "ירוק",    en: "Green",  hex: "#22c55e", light: "#dcfce7" },
  { id: "yellow", he: "צהוב",    en: "Yellow", hex: "#eab308", light: "#fef9c3" },
  { id: "orange", he: "כתום",    en: "Orange", hex: "#f97316", light: "#ffedd5" },
  { id: "purple", he: "סגול",    en: "Purple", hex: "#a855f7", light: "#f3e8ff" },
  { id: "pink",   he: "ורוד",    en: "Pink",   hex: "#ec4899", light: "#fce7f3" },
  { id: "brown",  he: "חום",     en: "Brown",  hex: "#92400e", light: "#fef3c7" },
];

const SHAPES = [
  { id: "circle",  path: "circle", label: "עיגול" },
  { id: "square",  path: "square", label: "ריבוע" },
  { id: "star",    path: "star",   label: "כוכב"  },
  { id: "heart",   path: "heart",  label: "לב"    },
];

const TOTAL_ROUNDS = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const pool = shuffle(COLORS).slice(0, 4);
  const target = pool[Math.floor(Math.random() * pool.length)];
  return { shape, pool, target };
}

function ShapeDisplay({ shape, color }: { shape: typeof SHAPES[number]; color: string }) {
  const s = 160;
  if (shape.id === "circle") {
    return <circle cx={s / 2} cy={s / 2} r={s / 2 - 8} fill={color} />;
  }
  if (shape.id === "square") {
    return <rect x={10} y={10} width={s - 20} height={s - 20} rx={20} fill={color} />;
  }
  if (shape.id === "star") {
    // 5-point star
    const cx = s / 2, cy = s / 2, r1 = s / 2 - 8, r2 = (s / 2 - 8) * 0.4;
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? r1 : r2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill={color} />;
  }
  // Heart
  const cx = s / 2, cy = s / 2 + 10;
  const heartPath = `M ${cx},${cy + 25} C ${cx - 60},${cy - 15} ${cx - 75},${cy - 55} ${cx - 40},${cy - 70} C ${cx - 15},${cy - 80} ${cx},${cy - 60} ${cx},${cy - 60} C ${cx},${cy - 60} ${cx + 15},${cy - 80} ${cx + 40},${cy - 70} C ${cx + 75},${cy - 55} ${cx + 60},${cy - 15} ${cx},${cy + 25} Z`;
  return <path d={heartPath} fill={color} />;
}

type Phase = "intro" | "playing" | "complete";

export default function ColorSplashPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual } = useBilingualSpeak();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(() => generateRound());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [splat, setSplat] = useState(false);
  const [locked, setLocked] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const nextRound = useCallback((r: number) => {
    setCurrentRound(generateRound());
    setFeedback(null);
    setSplat(false);
    setLocked(false);
    setRound(r);
  }, []);

  const handleColor = useCallback((colorId: string) => {
    if (locked) return;
    setLocked(true);

    if (colorId === currentRound.target.id) {
      playCorrect();
      setFeedback("correct");
      setSplat(true);
      setScore(s => s + 1);
      // Speak the color name in both languages
      track(() => speakBilingual(currentRound.target.he, currentRound.target.en), 150);
      track(() => {
        if (round + 1 >= TOTAL_ROUNDS) {
          playCheer();
          setPhase("complete");
        } else {
          nextRound(round + 1);
        }
      }, 900);
    } else {
      playWrong();
      setFeedback("wrong");
      track(() => {
        setFeedback(null);
        setLocked(false);
      }, 800);
    }
  }, [locked, currentRound, round, playCorrect, playWrong, playCheer, nextRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl"
        >
          🎨
        </motion.div>
        <h1 className="text-4xl font-black text-center">צבעים</h1>
        <p className="text-lg text-foreground/70 text-center">בחרו את הצבע הנכון של הצורה!</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setPhase("playing"); nextRound(0); }}
          className="bg-gradient-to-br from-pink-400 to-rose-500 text-white font-black text-2xl py-5 px-10 rounded-3xl shadow-xl"
        >
          !בואו נצבע 🖌️
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
      />
    );
  }

  const displayColor = feedback === "correct"
    ? currentRound.target.hex
    : "#e5e7eb"; // gray while waiting

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
          className="bg-gradient-to-r from-pink-400 to-rose-500 h-3 rounded-full"
          animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl px-6 py-3 text-white text-center w-full">
        <p className="text-xl font-black">
          ?מה הצבע של ה{currentRound.shape.label}
        </p>
      </div>

      {/* Shape display */}
      <motion.div
        key={`shape-${round}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <svg width="160" height="160" viewBox="0 0 160 160">
          <ShapeDisplay shape={currentRound.shape} color={displayColor} />
          {/* Shine overlay */}
          <ShapeDisplay shape={currentRound.shape} color="rgba(255,255,255,0.15)" />
        </svg>

        {/* Splat effect */}
        <AnimatePresence>
          {splat && (
            <>
              {["💦","✨","⭐","🌈"].map((e, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl pointer-events-none"
                  style={{ top: "50%", left: "50%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: (i % 2 === 0 ? 1 : -1) * (30 + i * 20),
                    y: -(20 + i * 25),
                    opacity: 0,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.7 }}
                >
                  {e}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Color choices */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {currentRound.pool.map((color) => {
          const isCorrect = feedback === "correct" && color.id === currentRound.target.id;
          const isWrong = feedback === "wrong" && locked;
          return (
            <motion.button
              key={color.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleColor(color.id)}
              animate={isCorrect ? { scale: [1, 1.1, 1] } : {}}
              className="rounded-3xl py-5 px-4 font-black text-xl text-white shadow-lg flex items-center justify-center gap-2 min-h-[72px]"
              style={{
                background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                opacity: isWrong && color.id !== currentRound.target.id ? 0.6 : 1,
                border: isCorrect ? `4px solid white` : "4px solid transparent",
              }}
            >
              {color.he}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
