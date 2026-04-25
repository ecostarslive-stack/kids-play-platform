"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { speakText } from "@/lib/voice/ttsEngine";

// ── Word data — Hebrew words with their letters + bilingual labels ─────────────
interface WordEntry {
  word: string;          // the full Hebrew word
  letters: string[];     // individual letters in RTL order (visual)
  he: string;            // Hebrew word name
  en: string;            // English translation
  emoji: string;         // visual cue
  color: string;         // theme color
}

const WORDS: WordEntry[] = [
  { word: "כלב",  letters: ["כ","ל","ב"],  he: "כֶּלֶב",  en: "Dog",     emoji: "🐕", color: "#FF6B6B" },
  { word: "חתול", letters: ["ח","ת","ו","ל"], he: "חָתוּל", en: "Cat",   emoji: "🐱", color: "#A29BFE" },
  { word: "בית",  letters: ["ב","י","ת"],  he: "בַּיִת",  en: "House",   emoji: "🏠", color: "#74B9FF" },
  { word: "ספר",  letters: ["ס","פ","ר"],  he: "סֵפֶר",  en: "Book",    emoji: "📚", color: "#55EFC4" },
  { word: "ילד",  letters: ["י","ל","ד"],  he: "יֶלֶד",  en: "Boy",     emoji: "👦", color: "#FDCB6E" },
  { word: "פרח",  letters: ["פ","ר","ח"],  he: "פֶּרַח",  en: "Flower",  emoji: "🌸", color: "#FF7675" },
  { word: "שמש",  letters: ["ש","מ","ש"],  he: "שֶׁמֶש",  en: "Sun",     emoji: "☀️", color: "#F9CA24" },
  { word: "אריה", letters: ["א","ר","י","ה"], he: "אַרְיֵה", en: "Lion", emoji: "🦁", color: "#E17055" },
  { word: "דג",   letters: ["ד","ג"],      he: "דָּג",    en: "Fish",    emoji: "🐟", color: "#0984E3" },
  { word: "עץ",   letters: ["ע","ץ"],      he: "עֵץ",    en: "Tree",    emoji: "🌳", color: "#00B894" },
];

// Map Hebrew letter character → its name (for phonetic sound on drag)
const LETTER_NAMES: Record<string, { name: string; en: string }> = {};
for (const l of hebrewLetters) {
  LETTER_NAMES[l.hebrew] = { name: l.name, en: l.english };
  if (l.finalForm) LETTER_NAMES[l.finalForm] = { name: l.name, en: l.english };
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DraggableLetter {
  id: string;      // unique per instance
  char: string;    // the letter character
  slotIdx: number; // which slot it belongs to
  startX: number;  // initial scattered position %
  startY: number;
}

type Phase = "intro" | "playing" | "complete";

const ROUNDS = 6;

function pickWords(): WordEntry[] {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUNDS);
}

// ── Monster character that reacts ─────────────────────────────────────────────
function Monster({ happy, emoji }: { happy: boolean; emoji: string }) {
  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={happy ? { y: [0, -20, 0, -10, 0], rotate: [0, -10, 10, -5, 0] } : { y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.span
        style={{ fontSize: "5rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}
        animate={happy ? { scale: [1, 1.3, 0.9, 1.1, 1] } : { scale: [1, 1.05, 1] }}
        transition={happy ? { duration: 0.5 } : { duration: 2, repeat: Infinity }}
      >
        {emoji}
      </motion.span>
    </motion.div>
  );
}

// ── Slot component ─────────────────────────────────────────────────────────────
function LetterSlot({
  char,
  filled,
  isTarget,
}: {
  char: string;
  filled: boolean;
  isTarget: boolean;
}) {
  return (
    <motion.div
      animate={filled ? { scale: [1, 1.2, 0.95, 1], backgroundColor: "#FFD700" } : {}}
      transition={{ duration: 0.3 }}
      className="w-14 h-14 rounded-2xl border-3 flex items-center justify-center text-3xl font-black"
      style={{
        border: filled ? "3px solid #F9CA24" : "3px dashed #CBD5E0",
        backgroundColor: filled ? "#FFF9E6" : "#F7FAFC",
        color: filled ? "#2D3436" : "#CBD5E0",
        fontSize: "1.8rem",
        minWidth: 52,
      }}
    >
      {filled ? char : ""}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AlefBetPage() {
  const router = useRouter();
  const { speakBilingual, cancelSpeak } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [wordList] = useState<WordEntry[]>(() => pickWords());
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [filledSlots, setFilledSlots] = useState<Set<number>>(new Set());
  const [dragLetters, setDragLetters] = useState<DraggableLetter[]>([]);
  const [isRoundDone, setIsRoundDone] = useState(false);
  const [monsterHappy, setMonsterHappy] = useState(false);

  const currentWord = wordList[roundIdx];
  const letters = currentWord?.letters ?? [];

  // Setup round
  useEffect(() => {
    if (phase !== "playing" || !currentWord) return;
    setFilledSlots(new Set());
    setIsRoundDone(false);
    setMonsterHappy(false);

    // Scatter letters randomly around the lower portion of screen
    const scattered: DraggableLetter[] = letters.map((char, i) => ({
      id: `${roundIdx}-${i}`,
      char,
      slotIdx: i,
      startX: 10 + (i / Math.max(letters.length - 1, 1)) * 80 + (Math.random() - 0.5) * 20,
      startY: 55 + Math.random() * 25,
    }));
    setDragLetters(scattered);

    // Speak the word intro after brief delay
    const t = setTimeout(() => speakBilingual(currentWord.he, currentWord.en), 600);
    return () => { clearTimeout(t); cancelSpeak(); };
  }, [roundIdx, phase, currentWord, speakBilingual, cancelSpeak, letters.length]);

  const handleLetterDropped = useCallback(
    (letter: DraggableLetter, dropX: number, dropY: number) => {
      if (isRoundDone || filledSlots.has(letter.slotIdx)) return;

      // Speak the letter's phonetic name when placed
      const letterInfo = LETTER_NAMES[letter.char];
      if (letterInfo) {
        speakText(letterInfo.name, "he-IL", { rate: 0.85, pitch: 1.1 });
      }

      burst(dropX, dropY, ["✨", "💫", letter.char], 5);
      setScore((s) => s + 5);

      setFilledSlots((prev) => {
        const next = new Set(prev);
        next.add(letter.slotIdx);

        if (next.size >= letters.length) {
          // All letters placed! 🎉
          setIsRoundDone(true);
          setMonsterHappy(true);
          celebrate(180, 260);
          setScore((s) => s + 20);

          setTimeout(() => {
            speakBilingual(currentWord.he, currentWord.en);
          }, 400);

          setTimeout(() => {
            if (roundIdx + 1 >= ROUNDS) {
              setPhase("complete");
            } else {
              setRoundIdx((i) => i + 1);
            }
          }, 2000);
        }

        return next;
      });
    },
    [isRoundDone, filledSlots, letters.length, burst, celebrate, roundIdx, speakBilingual, currentWord]
  );

  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #E8F4FD 0%, #F3E5F5 100%)" }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >
          🔤
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-purple-700">אותיות הא-ב</h1>
          <p className="text-xl font-bold text-purple-400">Hebrew Letters</p>
          <p className="text-sm text-foreground/60 mt-2">סדרו את האותיות ובנו מילים 🧩</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !יאללה, בואו לשחק 🎮
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={ROUNDS * 25}
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
      className="flex-1 flex flex-col w-full max-w-md mx-auto relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(180deg, ${currentWord?.color}22 0%, #F8F0FF 40%, #EEF2FF 100%)`,
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Progress */}
      <div className="mx-3 mt-2 bg-white/70 rounded-2xl px-4 py-2 flex items-center justify-between">
        <p className="text-xs font-black text-purple-600">
          {roundIdx + 1} / {ROUNDS}
        </p>
        <div className="flex-1 mx-3 bg-purple-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-purple-400 rounded-full"
            animate={{ width: `${(roundIdx / ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs font-bold text-foreground/40">{score} pts</p>
      </div>

      {/* Stage */}
      <div className="flex flex-col items-center gap-3 mt-3 px-3">
        {/* Monster + emoji */}
        <Monster happy={monsterHappy} emoji={currentWord?.emoji ?? "😊"} />

        {/* Word label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-2xl font-black" style={{ color: currentWord?.color }}>
              {currentWord?.he}
            </p>
            <p className="text-sm font-bold text-foreground/50">{currentWord?.en}</p>
          </motion.div>
        </AnimatePresence>

        {/* Letter slots (RTL — Hebrew reads right to left) */}
        <div className="flex flex-row-reverse gap-2 mt-1">
          {letters.map((char, i) => (
            <LetterSlot
              key={`slot-${roundIdx}-${i}`}
              char={char}
              filled={filledSlots.has(i)}
              isTarget={false}
            />
          ))}
        </div>

        <p className="text-xs text-foreground/40 mt-1">
          גרור את האותיות למקומן · Drag the letters to their places
        </p>
      </div>

      {/* Draggable letters scattered below */}
      <div className="flex-1 relative" style={{ minHeight: 220 }}>
        <AnimatePresence>
          {dragLetters
            .filter((l) => !filledSlots.has(l.slotIdx))
            .map((letter) => (
              <DraggableLetter
                key={letter.id}
                letter={letter}
                color={currentWord?.color ?? "#6C5CE7"}
                onDropped={handleLetterDropped}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Draggable letter tile ─────────────────────────────────────────────────────
function DraggableLetter({
  letter,
  color,
  onDropped,
}: {
  letter: DraggableLetter;
  color: string;
  onDropped: (l: DraggableLetter, x: number, y: number) => void;
}) {
  const dragRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={dragRef}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ x: `${letter.startX - 50}vw`, y: `${letter.startY}%`, scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileTap={{ scale: 1.2, zIndex: 50 }}
      whileDrag={{ scale: 1.3, zIndex: 50, boxShadow: `0 12px 32px ${color}55` }}
      onDragEnd={(_, info) => {
        const el = dragRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Find if dropped over a slot — check if cy is in the upper portion (slot area)
        // Simple heuristic: if dragged upward significantly (y offset < -80px), place it
        if (info.offset.y < -60) {
          onDropped(letter, cx, cy);
        }
      }}
      className="absolute flex items-center justify-center rounded-2xl cursor-grab active:cursor-grabbing"
      style={{
        width: 60,
        height: 60,
        background: `linear-gradient(135deg, ${color}DD, ${color})`,
        color: "white",
        fontSize: "2rem",
        fontWeight: 900,
        boxShadow: `0 6px 20px ${color}44`,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {letter.char}
    </motion.div>
  );
}
