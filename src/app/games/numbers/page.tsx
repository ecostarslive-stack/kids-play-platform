"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
const FALL_DURATION_MS = 3000;
const SPAWN_INTERVAL_MS = 900;
const MAX_ITEMS = 7;
const BASKET_W = 90; // px — basket width for hit detection
const BASKET_CATCH_ZONE = 55; // px from bottom where catch happens

const EMOJIS_BY_VALUE = ["🍎","⭐","🌸","🎈","🐟","🦋","🍌","🔵","🍊","💎"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface FallingItem {
  uid: number;
  xPct: number;   // 5-85 percent of container width (left edge)
  emoji: string;
  spawnTime: number; // Date.now() when spawned
}

type Phase = "intro" | "playing" | "complete";
let uidSeq = 0;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NumbersPage() {
  const router = useRouter();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundOrder] = useState(() => shuffleArray([...numbers]).slice(0, TOTAL_ROUNDS));
  const [roundIdx, setRoundIdx] = useState(0);
  const [collected, setCollected] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [isRoundDone, setIsRoundDone] = useState(false);
  // basketX: 0-100 (% of container), represents CENTER of basket
  const [basketX, setBasketX] = useState(50);
  const [catchEffect, setCatchEffect] = useState<{ uid: number; emoji: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const basketXRef = useRef(50); // live ref for collision checks
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collisionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundDoneRef = useRef(false);

  const currentNumber = roundOrder[roundIdx];
  const targetValue = currentNumber?.value ?? 1;
  const targetEmoji = EMOJIS_BY_VALUE[(targetValue - 1) % EMOJIS_BY_VALUE.length];

  // Reset on new round
  useEffect(() => {
    if (phase !== "playing" || !currentNumber) return;
    setCollected(0);
    setFallingItems([]);
    setIsRoundDone(false);
    roundDoneRef.current = false;
    const t = setTimeout(() => speakBilingual(currentNumber.hebrew, currentNumber.english), 500);
    return () => { clearTimeout(t); cancelSpeak(); };
  }, [roundIdx, phase, currentNumber, speakBilingual, cancelSpeak]);

  // Spawn items
  useEffect(() => {
    if (phase !== "playing" || isRoundDone) return;
    spawnRef.current = setInterval(() => {
      setFallingItems((prev) => {
        if (prev.length >= MAX_ITEMS) return prev;
        return [...prev, {
          uid: ++uidSeq,
          xPct: 5 + Math.random() * 78,
          emoji: targetEmoji,
          spawnTime: Date.now(),
        }];
      });
    }, SPAWN_INTERVAL_MS);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [phase, roundIdx, isRoundDone, targetEmoji]);

  // Collision detection — runs every 80ms
  useEffect(() => {
    if (phase !== "playing" || isRoundDone) return;

    collisionRef.current = setInterval(() => {
      if (roundDoneRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const containerH = container.getBoundingClientRect().height;

      setFallingItems((prev) => {
        const now = Date.now();
        const toRemove: number[] = [];
        let caught = 0;

        for (const item of prev) {
          const elapsed = (now - item.spawnTime) / 1000;
          const progress = elapsed / (FALL_DURATION_MS / 1000); // 0→1
          const itemY = progress * containerH; // px from top

          // Remove items that fell off bottom
          if (itemY > containerH + 60) {
            toRemove.push(item.uid);
            continue;
          }

          // Catch zone: bottom 55px of container
          if (itemY >= containerH - BASKET_CATCH_ZONE) {
            // Check horizontal overlap
            const itemCenterPct = item.xPct + 3; // approx center
            const basketLeft = basketXRef.current - (BASKET_W / 2 / container.getBoundingClientRect().width * 100);
            const basketRight = basketXRef.current + (BASKET_W / 2 / container.getBoundingClientRect().width * 100);

            if (itemCenterPct >= basketLeft && itemCenterPct <= basketRight) {
              toRemove.push(item.uid);
              caught++;
            }
          }
        }

        if (caught > 0 && !roundDoneRef.current) {
          // Fire catch effects outside setState
          setTimeout(() => {
            setScore((s) => s + 10 * caught);
            setCatchEffect({ uid: Date.now(), emoji: targetEmoji });
            setTimeout(() => setCatchEffect(null), 400);

            setCollected((prev2) => {
              const next = prev2 + caught;
              if (next >= targetValue && !roundDoneRef.current) {
                roundDoneRef.current = true;
                setIsRoundDone(true);
                speakBilingual(currentNumber?.hebrew ?? "", currentNumber?.english ?? "");
                celebrate(window.innerWidth / 2, window.innerHeight / 2);
                setTimeout(() => {
                  if (roundIdx + 1 >= TOTAL_ROUNDS) {
                    setPhase("complete");
                  } else {
                    setRoundIdx((i) => i + 1);
                  }
                }, 1800);
              }
              return next;
            });
          }, 0);
        }

        return toRemove.length > 0 ? prev.filter((i) => !toRemove.includes(i.uid)) : prev;
      });
    }, 80);

    return () => { if (collisionRef.current) clearInterval(collisionRef.current); };
  }, [phase, roundIdx, isRoundDone, targetValue, targetEmoji, currentNumber, celebrate, speakBilingual]);

  // Handle basket drag — convert pointer x to basket % position
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(Math.max(xPct, 7), 93);
    setBasketX(clamped);
    basketXRef.current = clamped;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    const xPct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(Math.max(xPct, 7), 93);
    setBasketX(clamped);
    basketXRef.current = clamped;
  }, []);

  // ── Intro screen ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B8E4C9 100%)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >🧺</motion.div>
        <div className="text-center px-6">
          <h1 className="text-4xl font-black text-blue-700">מספרים</h1>
          <p className="text-xl font-bold text-blue-400">Numbers</p>
          <p className="text-sm text-foreground/60 mt-2">הזיזו את הסלסלה לתפוס את הפריטים! 🎯</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !בואו לתפוס 🧺
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
        onPlayAgain={() => { setRoundIdx(0); setScore(0); setPhase("playing"); }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto relative select-none"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B8E4C9 60%, #7EC850 100%)", minHeight: "100dvh", touchAction: "none" }}
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Sky clouds */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-4 pt-2 pointer-events-none">
        <motion.span animate={{ x: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity }} className="text-3xl">☁️</motion.span>
        <motion.span animate={{ x: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity }} className="text-2xl">☁️</motion.span>
      </div>

      {/* HUD */}
      <div className="mx-3 mt-3 bg-white/70 backdrop-blur rounded-2xl px-4 py-3 flex items-center justify-between z-10">
        <div>
          <p className="text-xs font-bold text-foreground/50">תפסו / Collect</p>
          <p className="text-4xl font-black text-blue-700">{targetValue}</p>
          <p className="text-sm font-bold text-foreground/70">{currentNumber?.hebrew} · {currentNumber?.english}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-3xl">{targetEmoji}</span>
            <div>
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
        <p className="text-xs font-bold text-foreground/40">{roundIdx + 1}/{TOTAL_ROUNDS}</p>
      </div>

      {/* Falling area */}
      <div
        ref={containerRef}
        className="flex-1 relative w-full overflow-hidden"
        style={{ minHeight: 320 }}
      >
        {/* Falling items */}
        <AnimatePresence>
          {fallingItems.map((item) => (
            <motion.div
              key={item.uid}
              className="absolute text-5xl pointer-events-none"
              style={{
                left: `${item.xPct}%`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
              }}
              initial={{ y: -80 }}
              animate={{ y: 900 }}
              transition={{ duration: FALL_DURATION_MS / 1000, ease: "linear" }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Catch flash effect */}
        <AnimatePresence>
          {catchEffect && (
            <motion.div
              key={catchEffect.uid}
              className="absolute text-4xl pointer-events-none z-20"
              style={{ left: `${basketX}%`, bottom: 70, transform: "translateX(-50%)" }}
              initial={{ scale: 1, opacity: 1, y: 0 }}
              animate={{ scale: 1.8, opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-14 rounded-t-3xl"
          style={{ background: "linear-gradient(180deg, #6AB04C 0%, #5A9A3A 100%)" }}
        />

        {/* Basket */}
        <motion.div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{
            left: `${basketX}%`,
            bottom: 10,
            transform: "translateX(-50%)",
            width: BASKET_W,
          }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        >
          {/* Basket emoji + wobble when catching */}
          <motion.span
            className="text-5xl"
            animate={catchEffect ? { rotate: [-8, 8, -5, 0], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            🧺
          </motion.span>
        </motion.div>

        {/* Move hint */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
          <motion.p
            className="text-white/60 font-bold text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ← הזיזו את האצבע →
          </motion.p>
        </div>

        {/* Round complete overlay */}
        <AnimatePresence>
          {isRoundDone && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
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
