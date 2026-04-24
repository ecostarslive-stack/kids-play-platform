"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";
import { colors } from "@/lib/data/colors";
import { shuffleArray, pickRandom } from "@/lib/utils";

// ── Config ─────────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 8;

// Things to paint — each has an outline SVG path and a display position
interface PaintTarget {
  id: string;
  emoji: string;
  label: { he: string; en: string };
  // Rough color hint — not needed for logic but helps visual
}

const PAINT_TARGETS: PaintTarget[] = [
  { id: "house",    emoji: "🏠", label: { he: "בית",     en: "House"    } },
  { id: "car",      emoji: "🚗", label: { he: "מכונית",  en: "Car"      } },
  { id: "flower",   emoji: "🌸", label: { he: "פרח",     en: "Flower"   } },
  { id: "sun",      emoji: "☀️", label: { he: "שמש",     en: "Sun"      } },
  { id: "fish",     emoji: "🐟", label: { he: "דג",      en: "Fish"     } },
  { id: "star",     emoji: "⭐", label: { he: "כוכב",    en: "Star"     } },
  { id: "balloon",  emoji: "🎈", label: { he: "בלון",    en: "Balloon"  } },
  { id: "apple",    emoji: "🍎", label: { he: "תפוח",    en: "Apple"    } },
  { id: "butterfly",emoji: "🦋", label: { he: "פרפר",    en: "Butterfly"} },
  { id: "heart",    emoji: "❤️", label: { he: "לב",      en: "Heart"    } },
];

type Phase = "intro" | "playing" | "complete";

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ColorsPage() {
  const router = useRouter();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst, wrongFeedback } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundOrder] = useState(() => shuffleArray([...colors]).slice(0, TOTAL_ROUNDS));
  const [paintTargetOrder] = useState(() => shuffleArray([...PAINT_TARGETS]));
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [painted, setPainted] = useState<string | null>(null); // color id that was correctly picked
  const [isRoundDone, setIsRoundDone] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [options, setOptions] = useState<typeof colors>([]);

  const currentColor = roundOrder[roundIdx];
  const paintTarget = paintTargetOrder[roundIdx % paintTargetOrder.length];

  // Setup round
  useEffect(() => {
    if (phase !== "playing" || !currentColor) return;
    setPainted(null);
    setIsRoundDone(false);
    setWrongId(null);

    // 3 distractor colors
    const distractors = pickRandom(
      colors.filter((c) => c.id !== currentColor.id),
      3
    );
    setOptions(shuffleArray([currentColor, ...distractors]));

    const t = setTimeout(() => speakBilingual(currentColor.hebrew, currentColor.english), 500);
    return () => { clearTimeout(t); cancelSpeak(); };
  }, [roundIdx, phase, currentColor, speakBilingual, cancelSpeak]);

  const handlePick = useCallback(
    (color: (typeof colors)[number], tapX: number, tapY: number) => {
      if (isRoundDone) return;

      if (color.id === currentColor.id) {
        // Correct!
        setPainted(color.id);
        setIsRoundDone(true);
        setScore((s) => s + 10);
        speakBilingual(currentColor.hebrew, currentColor.english);
        burst(tapX, tapY, ["🎨", "✨", "🌟", "💫"], 10);
        celebrate(180, 250);

        setTimeout(() => {
          if (roundIdx + 1 >= TOTAL_ROUNDS) {
            setPhase("complete");
          } else {
            setRoundIdx((i) => i + 1);
          }
        }, 1800);
      } else {
        // Wrong
        setWrongId(color.id);
        wrongFeedback();
        setTimeout(() => setWrongId(null), 600);
      }
    },
    [isRoundDone, currentColor, roundIdx, speakBilingual, burst, celebrate, wrongFeedback]
  );

  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(135deg, #FF6B6B20 0%, #339AF020 50%, #51CF6620 100%)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >
          🎨
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black" style={{ color: "#6C5CE7" }}>צבעים</h1>
          <p className="text-xl font-bold" style={{ color: "#A29BFE" }}>Colors</p>
          <p className="text-sm text-foreground/60 mt-2">צבעו את הציור בצבע הנכון! 🖌️</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !בואו לצבוע 🎨
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

  const paintedColor = painted ? colors.find((c) => c.id === painted) : null;

  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto gap-4 px-3 pt-2 pb-4"
      style={{ background: "linear-gradient(180deg, #F8F0FF 0%, #EEF2FF 100%)" }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Progress */}
      <div className="bg-white/70 rounded-2xl px-3 py-2 flex items-center justify-between">
        <p className="text-sm font-black" style={{ color: "#6C5CE7" }}>
          {roundIdx + 1} / {TOTAL_ROUNDS}
        </p>
        <div className="flex-1 mx-3 bg-purple-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-400"
            animate={{ width: `${((roundIdx) / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-sm font-bold text-foreground/40">{score} pts</p>
      </div>

      {/* Easel / canvas area */}
      <div className="flex flex-col items-center gap-2">
        {/* Canvas */}
        <motion.div
          key={roundIdx}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative rounded-3xl shadow-xl border-4 border-white flex items-center justify-center"
          style={{
            width: 200,
            height: 200,
            background: paintedColor
              ? `radial-gradient(circle at 40% 40%, ${paintedColor.hex}CC, ${paintedColor.hex})`
              : "#F5F5F5",
            transition: "background 0.5s ease",
          }}
        >
          {/* Big emoji subject */}
          <motion.span
            className="select-none"
            animate={painted ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontSize: "6rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
          >
            {paintTarget.emoji}
          </motion.span>

          {/* "Unpainted" overlay — crosshatch pattern */}
          {!painted && (
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #00000008 0, #00000008 2px, transparent 0, transparent 50%)",
                backgroundSize: "10px 10px",
              }}
            />
          )}

          {/* Paint bucket cursor hint */}
          {!painted && (
            <motion.span
              className="absolute bottom-3 right-3 text-2xl"
              animate={{ rotate: [-10, 10, -10], y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🪣
            </motion.span>
          )}
        </motion.div>

        {/* Subject label */}
        <div className="text-center">
          <p className="text-sm font-bold text-foreground/50">
            {paintTarget.label.he} · {paintTarget.label.en}
          </p>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center bg-white/60 rounded-2xl py-2 px-4">
        <p className="text-base font-black" style={{ color: "#6C5CE7" }}>
          ?איזה צבע זה
        </p>
        <p className="text-sm font-bold text-foreground/50">Which color is this?</p>
        {/* Color name hint */}
        <AnimatePresence>
          {!painted && (
            <motion.div
              key={currentColor?.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mt-1"
            >
              <motion.div
                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: currentColor?.hex }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-lg font-black" style={{ color: currentColor?.hex }}>
                {currentColor?.hebrew}
              </span>
              <span className="text-sm text-foreground/50">{currentColor?.english}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color buckets */}
      <div className="grid grid-cols-4 gap-3">
        {options.map((color) => {
          const isWrong = wrongId === color.id;
          const isCorrect = painted === color.id;
          return (
            <motion.button
              key={`${roundIdx}-${color.id}`}
              initial={{ scale: 0 }}
              animate={{
                scale: isWrong ? [1, 0.8, 1.1, 1] : 1,
                rotate: isWrong ? [-8, 8, -5, 0] : 0,
              }}
              transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                if (isRoundDone) return;
                const rect = e.currentTarget.getBoundingClientRect();
                handlePick(color, rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
              className="flex flex-col items-center gap-1 rounded-2xl p-2 border-2 shadow-md"
              style={{
                backgroundColor: color.hex,
                borderColor: isCorrect ? "#FFD700" : isWrong ? "#FF4444" : "white",
                borderWidth: isCorrect ? 3 : 2,
                opacity: isRoundDone && !isCorrect ? 0.4 : 1,
              }}
            >
              <span className="text-2xl">🪣</span>
              <span
                className="text-[9px] font-black text-center leading-tight"
                style={{
                  color: ["white", "yellow"].includes(color.id) ? "#333" : "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {color.hebrew}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
