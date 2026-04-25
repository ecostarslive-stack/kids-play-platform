"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { speakText } from "@/lib/voice/ttsEngine";

// ── Word data ─────────────────────────────────────────────────────────────────
interface WordEntry {
  word: string;
  letters: string[];   // in RTL order: index 0 = rightmost letter
  he: string;
  en: string;
  emoji: string;
  color: string;
}

// letters array is written in reading order (right→left for Hebrew)
// e.g. "כלב": first letter כ is rightmost → index 0
const WORDS: WordEntry[] = [
  { word: "כלב",  letters: ["כ","ל","ב"],     he: "כֶּלֶב",  en: "Dog",    emoji: "🐕", color: "#FF6B6B" },
  { word: "חתול", letters: ["ח","ת","ו","ל"],  he: "חָתוּל", en: "Cat",    emoji: "🐱", color: "#A29BFE" },
  { word: "בית",  letters: ["ב","י","ת"],      he: "בַּיִת",  en: "House",  emoji: "🏠", color: "#74B9FF" },
  { word: "ספר",  letters: ["ס","פ","ר"],      he: "סֵפֶר",  en: "Book",   emoji: "📚", color: "#55EFC4" },
  { word: "ילד",  letters: ["י","ל","ד"],      he: "יֶלֶד",  en: "Boy",    emoji: "👦", color: "#FDCB6E" },
  { word: "פרח",  letters: ["פ","ר","ח"],      he: "פֶּרַח",  en: "Flower", emoji: "🌸", color: "#FF7675" },
  { word: "שמש",  letters: ["ש","מ","ש"],      he: "שֶׁמֶש",  en: "Sun",    emoji: "☀️", color: "#F9CA24" },
  { word: "דג",   letters: ["ד","ג"],          he: "דָּג",    en: "Fish",   emoji: "🐟", color: "#0984E3" },
  { word: "עץ",   letters: ["ע","ץ"],          he: "עֵץ",    en: "Tree",   emoji: "🌳", color: "#00B894" },
  { word: "אריה", letters: ["א","ר","י","ה"],  he: "אַרְיֵה", en: "Lion",  emoji: "🦁", color: "#E17055" },
];

// letter char → phonetic name
const LETTER_NAMES: Record<string, { name: string }> = {};
for (const l of hebrewLetters) {
  LETTER_NAMES[l.hebrew] = { name: l.name };
  if (l.finalForm) LETTER_NAMES[l.finalForm] = { name: l.name };
}

interface ScatteredLetter {
  id: string;
  char: string;
  slotIdx: number;
  // position inside the drop zone (percentage)
  x: number; // 5..85
  y: number; // 5..75
}

type Phase = "intro" | "playing" | "complete";
const ROUNDS = 6;

function pickWords(): WordEntry[] {
  return [...WORDS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
}

// Spread letters evenly with slight randomness, guaranteed to stay in bounds
function scatterLetters(letters: string[], roundIdx: number): ScatteredLetter[] {
  const count = letters.length;
  return letters.map((char, i) => {
    const baseX = count === 1
      ? 40
      : 8 + (i / (count - 1)) * 74; // 8% to 82%
    const jitterX = (Math.random() - 0.5) * 12;
    const jitterY = (Math.random() - 0.5) * 20;
    return {
      id: `${roundIdx}-${i}`,
      char,
      slotIdx: i,
      x: Math.max(5, Math.min(80, baseX + jitterX)),
      y: Math.max(5, Math.min(75, 30 + jitterY)),
    };
  });
}

// ── Monster ───────────────────────────────────────────────────────────────────
function Monster({ happy, emoji }: { happy: boolean; emoji: string }) {
  return (
    <motion.span
      style={{ fontSize: "4.5rem", display: "block", textAlign: "center", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }}
      animate={happy
        ? { scale: [1, 1.35, 0.85, 1.1, 1], rotate: [0, -12, 12, -5, 0], y: [0, -18, 0] }
        : { scale: [1, 1.04, 1] }
      }
      transition={happy ? { duration: 0.6 } : { duration: 2.5, repeat: Infinity }}
    >
      {emoji}
    </motion.span>
  );
}

// ── Letter slot ───────────────────────────────────────────────────────────────
function LetterSlot({ char, filled, color }: { char: string; filled: boolean; color: string }) {
  return (
    <motion.div
      animate={filled ? { scale: [1, 1.25, 0.92, 1], backgroundColor: "#FFF9E6" } : {}}
      transition={{ duration: 0.35 }}
      style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        border: filled ? `3px solid ${color}` : "3px dashed #CBD5E0",
        backgroundColor: filled ? "#FFF9E6" : "#F7FAFC",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.75rem", fontWeight: 900,
        color: filled ? "#2D3436" : "transparent",
      }}
    >
      {filled ? char : ""}
    </motion.div>
  );
}

// ── Draggable letter ──────────────────────────────────────────────────────────
function DraggableLetter({
  letter, color, containerRef, onPlace,
}: {
  letter: ScatteredLetter;
  color: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPlace: (letter: ScatteredLetter, cx: number, cy: number) => void;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      whileTap={{ scale: 1.25, zIndex: 60 }}
      whileDrag={{ scale: 1.35, zIndex: 60, boxShadow: `0 14px 36px ${color}55` }}
      onDragEnd={(_, info) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // absolute position of the letter center after drag
        const el = document.getElementById(`dragletter-${letter.id}`);
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const cx = elRect.left + elRect.width / 2;
        const cy = elRect.top + elRect.height / 2;
        // If released in the top 50% of the container → place it
        const containerMidY = rect.top + rect.height * 0.48;
        if (cy < containerMidY || info.offset.y < -50) {
          onPlace(letter, cx, cy);
        }
      }}
      id={`dragletter-${letter.id}`}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: `${letter.x}%`,
        top: `${letter.y}%`,
        width: 56, height: 56, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}EE, ${color})`,
        color: "white", fontSize: "1.8rem", fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 6px 18px ${color}44`,
        touchAction: "none", userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {letter.char}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AlefBetPage() {
  const router = useRouter();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [wordList] = useState<WordEntry[]>(() => pickWords());
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [filledSlots, setFilledSlots] = useState<Set<number>>(new Set());
  const [scattered, setScattered] = useState<ScatteredLetter[]>([]);
  const [isRoundDone, setIsRoundDone] = useState(false);
  const [monsterHappy, setMonsterHappy] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentWord = wordList[roundIdx];

  // Setup round
  useEffect(() => {
    if (phase !== "playing" || !currentWord) return;
    setFilledSlots(new Set());
    setIsRoundDone(false);
    setMonsterHappy(false);
    setScattered(scatterLetters(currentWord.letters, roundIdx));
    const t = setTimeout(() => speakBilingual(currentWord.he, currentWord.en), 600);
    return () => { clearTimeout(t); cancelSpeak(); };
  }, [roundIdx, phase, currentWord, speakBilingual, cancelSpeak]);

  const handlePlace = useCallback(
    (letter: ScatteredLetter, cx: number, cy: number) => {
      if (isRoundDone) return;

      // Speak the letter's phonetic name
      const info = LETTER_NAMES[letter.char];
      if (info) speakText(info.name, "he-IL", { rate: 0.85, pitch: 1.1 });

      burst(cx, cy, ["✨", "💫", letter.char], 5);
      setScore((s) => s + 5);

      setFilledSlots((prev) => {
        const next = new Set(prev);
        next.add(letter.slotIdx);

        if (next.size >= currentWord.letters.length) {
          setIsRoundDone(true);
          setMonsterHappy(true);
          celebrate(180, 250);
          setScore((s) => s + 20);
          setTimeout(() => speakBilingual(currentWord.he, currentWord.en), 400);
          setTimeout(() => {
            if (roundIdx + 1 >= ROUNDS) setPhase("complete");
            else setRoundIdx((i) => i + 1);
          }, 2000);
        }
        return next;
      });
    },
    [isRoundDone, currentWord, burst, celebrate, roundIdx, speakBilingual]
  );

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #E8F4FD 0%, #F3E5F5 100%)" }}>
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
          transition={{ type: "spring", stiffness: 200 }} className="text-8xl">🔤</motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-purple-700">אותיות הא-ב</h1>
          <p className="text-xl font-bold text-purple-400">Hebrew Letters</p>
          <p className="text-sm text-foreground/60 mt-2">גרור את האותיות ובנה מילים 🧩</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">!בואו לשחק 🎮</BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration show score={score} total={ROUNDS * 25}
        onPlayAgain={() => { setRoundIdx(0); setScore(0); setPhase("playing"); }}
        onGoHome={() => router.push("/")}
        slug="alef-bet" />
    );
  }

  const letters = currentWord?.letters ?? [];

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto"
      style={{ background: `linear-gradient(180deg, ${currentWord?.color}18 0%, #F8F0FF 40%, #EEF2FF 100%)` }}>
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Progress */}
      <div className="mx-3 mt-2 bg-white/70 rounded-2xl px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-black text-purple-600">{roundIdx + 1}/{ROUNDS}</span>
        <div className="flex-1 bg-purple-100 rounded-full h-2 overflow-hidden">
          <motion.div className="h-full bg-purple-400 rounded-full"
            animate={{ width: `${(roundIdx / ROUNDS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs text-foreground/40">{score} pts</span>
      </div>

      {/* Top: monster + word label + slots */}
      <div className="flex flex-col items-center gap-2 pt-3 px-3">
        <Monster happy={monsterHappy} emoji={currentWord?.emoji ?? "😊"} />

        <AnimatePresence mode="wait">
          <motion.div key={roundIdx} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center">
            <p className="text-2xl font-black" style={{ color: currentWord?.color }}>{currentWord?.he}</p>
            <p className="text-sm font-bold text-foreground/50">{currentWord?.en}</p>
          </motion.div>
        </AnimatePresence>

        {/* Slots — RTL: right to left using dir="rtl" + flex-row */}
        <div dir="rtl" style={{ display: "flex", flexDirection: "row", gap: 8, marginTop: 4 }}>
          {letters.map((char, i) => (
            <LetterSlot key={`slot-${roundIdx}-${i}`} char={char}
              filled={filledSlots.has(i)} color={currentWord?.color ?? "#6C5CE7"} />
          ))}
        </div>

        <p className="text-[11px] text-foreground/40 mt-0.5">
          גרור אותיות למעלה לחריצים · Drag letters up to the slots
        </p>
      </div>

      {/* Drop zone — letters scattered here */}
      <div
        ref={containerRef}
        className="flex-1 relative mx-3 mt-3 mb-3 rounded-2xl overflow-hidden"
        style={{
          minHeight: 220,
          background: "rgba(255,255,255,0.4)",
          border: "2px dashed rgba(0,0,0,0.06)",
        }}
      >
        <AnimatePresence>
          {scattered
            .filter((l) => !filledSlots.has(l.slotIdx))
            .map((letter) => (
              <DraggableLetter
                key={letter.id}
                letter={letter}
                color={currentWord?.color ?? "#6C5CE7"}
                containerRef={containerRef}
                onPlace={handlePlace}
              />
            ))}
        </AnimatePresence>

        {/* Round done overlay */}
        <AnimatePresence>
          {isRoundDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-2xl px-6 py-3 text-center shadow-xl">
                <p className="text-3xl font-black" style={{ color: currentWord?.color }}>{currentWord?.he}!</p>
                <p className="text-base text-foreground/60">{currentWord?.en}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
