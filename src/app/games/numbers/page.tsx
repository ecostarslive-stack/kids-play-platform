"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";
import { numbers } from "@/lib/data/numbers";
import { shuffleArray } from "@/lib/utils";

// ── Config ─────────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 8;
const FALL_DURATION_MS = 3200; // how long each item takes to fall
const SPAWN_INTERVAL_MS = 900; // spawn a new item every N ms
const MAX_ITEMS_FALLING = 6;

const FALL_EMOJIS: Record<number, string[]> = {
  1:  ["🍎"],
  2:  ["⭐", "⭐"],
  3:  ["🌸", "🌸", "🌸"],
  4:  ["🎈", "🎈", "🎈", "🎈"],
  5:  ["🐟", "🐟", "🐟", "🐟", "🐟"],
  6:  ["🦋", "🦋", "🦋", "🦋", "🦋", "🦋"],
  7:  ["🍌", "🍌", "🍌", "🍌", "🍌", "🍌", "🍌"],
  8:  ["🔵", "🔵", "🔵", "🔵", "🔵", "🔵", "🔵", "🔵"],
  9:  ["🍊", "🍊", "🍊", "🍊", "🍊", "🍊", "🍊", "🍊", "🍊"],
  10: ["💎", "💎", "💎", "💎", "💎", "💎", "💎", "💎", "💎", "💎"],
};

const EMOJIS_BY_VALUE = ["🍎","⭐","🌸","🎈","🐟","🦋","🍌","🔵","🍊","💎"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface FallingItem {
  uid: number;
  startX: number; // 5–85 viewport %
  delay: number;  // animation delay in seconds
  emoji: string;
}

type Phase = "intro" | "playing" | "complete";

let uid = 0;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NumbersPage() {
  const router = useRouter();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst, wrongFeedback } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundOrder] = useState(() => shuffleArray([...numbers]).slice(0, TOTAL_ROUNDS));
  const [roundIdx, setRoundIdx] = useState(0);
  const [collected, setCollected] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [poppedIds, setPoppedIds] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [isRoundDone, setIsRoundDone] = useState(false);

  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentNumber = roundOrder[roundIdx];
  const targetValue = currentNumber?.value ?? 1;
  const targetEmoji = EMOJIS_BY_VALUE[(targetValue - 1) % EMOJIS_BY_VALUE.length];

  // Speak the target number when round starts
  useEffect(() => {
    if (phase === "playing" && currentNumber) {
      setCollected(0);
      setFallingItems([]);
      setPoppedIds(new Set());
      setIsRoundDone(false);
      const t = setTimeout(() => speakBilingual(currentNumber.hebrew, currentNumber.english), 500);
      return () => { clearTimeout(t); cancelSpeak(); };
    }
  }, [roundIdx, phase, currentNumber, speakBilingual, cancelSpeak]);

  // Spawn falling items
  useEffect(() => {
    if (phase !== "playing" || isRoundDone) return;

    spawnRef.current = setInterval(() => {
      setFallingItems((prev) => {
        if (prev.length >= MAX_ITEMS_FALLING) return prev;
        const newItem: FallingItem = {
          uid: ++uid,
          startX: 5 + Math.random() * 80,
          delay: 0,
          emoji: targetEmoji,
        };
        return [...prev, newItem];
      });
    }, SPAWN_INTERVAL_MS);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase, roundIdx, isRoundDone, targetEmoji]);

  // Remove items that have fallen off screen
  const handleFallComplete = useCallback((itemUid: number) => {
    setFallingItems((prev) => prev.filter((i) => i.uid !== itemUid));
  }, []);

  const handleTap = useCallback(
    (item: FallingItem, tapX: number, tapY: number) => {
      if (isRoundDone || poppedIds.has(item.uid)) return;

      setPoppedIds((prev) => new Set([...prev, item.uid]));
      setFallingItems((prev) => prev.filter((i) => i.uid !== item.uid));

      burst(tapX, tapY, [item.emoji, "✨", "💫"], 6);
      setScore((s) => s + 10);

      setCollected((prev) => {
        const next = prev + 1;
        if (next >= targetValue) {
          // Round complete!
          celebrate(180, 300);
          setIsRoundDone(true);
          speakBilingual(currentNumber.hebrew, currentNumber.english);

          setTimeout(() => {
            if (roundIdx + 1 >= TOTAL_ROUNDS) {
              setPhase("complete");
            } else {
              setRoundIdx((i) => i + 1);
            }
          }, 1600);
        }
        return next;
      });
    },
    [isRoundDone, poppedIds, burst, celebrate, targetValue, roundIdx, speakBilingual, currentNumber]
  );

  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(180deg, #E3F2FD 0%, #F3E5F5 100%)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >
          🔢
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-blue-700">מספרים</h1>
          <p className="text-xl font-bold text-blue-400">Numbers</p>
          <p className="text-sm text-foreground/60 mt-2">תפסו את המספר הנכון של פריטים! 🎯</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !בואו לספור 🎮
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={TOTAL_ROUNDS * 10}
        onPlayAgain={() => {
          setRoundIdx(0);
          setScore(0);
          setPhase("playing");
        }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B8E4C9 60%, #7EC850 100%)" }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Sky clouds */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-4 pt-2 pointer-events-none">
        <motion.span animate={{ x: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity }} className="text-3xl">☁️</motion.span>
        <motion.span animate={{ x: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity }} className="text-2xl">☁️</motion.span>
      </div>

      {/* Target display */}
      <div className="mx-3 mt-3 bg-white/70 rounded-2xl px-4 py-3 flex items-center justify-between z-10">
        <div className="flex flex-col items-start">
          <p className="text-xs font-bold text-foreground/50">תפסו / Collect</p>
          <p className="text-4xl font-black text-blue-700">{targetValue}</p>
          <p className="text-sm font-bold text-foreground/70">
            {currentNumber?.hebrew} · {currentNumber?.english}
          </p>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-3xl">{targetEmoji}</span>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-700">{collected}</p>
              <p className="text-xs text-foreground/40">/ {targetValue}</p>
            </div>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2 mt-1 overflow-hidden" style={{ minWidth: 80 }}>
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${Math.min((collected / targetValue) * 100, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Round counter */}
        <p className="text-xs font-bold text-foreground/40">{roundIdx + 1}/{TOTAL_ROUNDS}</p>
      </div>

      {/* Falling items area */}
      <div className="flex-1 relative w-full" style={{ minHeight: 320 }}>
        <AnimatePresence>
          {fallingItems.map((item) => (
            <motion.button
              key={item.uid}
              initial={{ y: -60, x: `${item.startX}vw`, opacity: 1 }}
              animate={{ y: "100vh", opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: FALL_DURATION_MS / 1000, ease: "linear", delay: item.delay }}
              onAnimationComplete={() => handleFallComplete(item.uid)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleTap(item, rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
              className="absolute text-5xl select-none cursor-pointer"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                WebkitTapHighlightColor: "transparent",
              }}
              whileTap={{ scale: 1.4 }}
            >
              {item.emoji}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 rounded-t-3xl"
          style={{ background: "linear-gradient(180deg, #6AB04C 0%, #5A9A3A 100%)" }}
        />

        {/* "Nice!" feedback when round completes */}
        <AnimatePresence>
          {isRoundDone && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: "none" }}
            >
              <div className="bg-white/90 rounded-3xl px-8 py-4 text-center shadow-2xl">
                <p className="text-5xl mb-1">🎉</p>
                <p className="text-2xl font-black text-blue-700">{currentNumber?.hebrew}!</p>
                <p className="text-lg font-bold text-foreground/60">{currentNumber?.english}!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
