"use client";

/**
 * Word Match — bilingual card-matching game
 * Left column: Hebrew words | Right column: emoji images
 * Child matches word → picture. Both sides speak on tap.
 * Each correct match: speaks "כלב... Dog!" so they hear both.
 * Addictive: combo multiplier, shrink animation, confetti per match.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BackButton } from "@/components/ui/BackButton";
import { useLanguage } from "@/providers/LanguageProvider";

const WORD_BANK = [
  { id: "cat",    emoji: "🐱", he: "חתול",   en: "Cat"     },
  { id: "dog",    emoji: "🐶", he: "כלב",    en: "Dog"     },
  { id: "apple",  emoji: "🍎", he: "תפוח",   en: "Apple"   },
  { id: "ball",   emoji: "⚽", he: "כדור",   en: "Ball"    },
  { id: "sun",    emoji: "☀️", he: "שמש",    en: "Sun"     },
  { id: "moon",   emoji: "🌙", he: "ירח",    en: "Moon"    },
  { id: "tree",   emoji: "🌳", he: "עץ",     en: "Tree"    },
  { id: "fish",   emoji: "🐟", he: "דג",     en: "Fish"    },
  { id: "house",  emoji: "🏠", he: "בית",    en: "House"   },
  { id: "book",   emoji: "📚", he: "ספר",    en: "Book"    },
  { id: "car",    emoji: "🚗", he: "מכונית", en: "Car"     },
  { id: "star",   emoji: "⭐", he: "כוכב",   en: "Star"    },
  { id: "flower", emoji: "🌸", he: "פרח",    en: "Flower"  },
  { id: "water",  emoji: "💧", he: "מים",    en: "Water"   },
  { id: "bird",   emoji: "🐦", he: "ציפור",  en: "Bird"    },
  { id: "heart",  emoji: "❤️", he: "לב",     en: "Heart"   },
];

const PAIRS_PER_ROUND = 4;
const TOTAL_ROUNDS = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard(usedIds: Set<string>) {
  const available = WORD_BANK.filter(w => !usedIds.has(w.id));
  const pool = shuffle(available.length >= PAIRS_PER_ROUND ? available : WORD_BANK).slice(0, PAIRS_PER_ROUND);
  const words = shuffle([...pool]);
  const emojis = shuffle([...pool]);
  return { pool, words, emojis };
}

type Phase = "intro" | "playing" | "complete";

export default function WordMatchPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual, speakSingle } = useBilingualSpeak();
  const { isHebrew } = useLanguage();

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundNum, setRoundNum] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [board, setBoard] = useState(() => generateBoard(new Set()));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [sparkle, setSparkle] = useState<string | null>(null);
  const usedIdsRef = useRef<Set<string>>(new Set());

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const startRound = useCallback((rn: number, ids: Set<string>) => {
    const b = generateBoard(ids);
    setBoard(b);
    setSelectedWord(null);
    setMatched(new Set());
    setWrongPair(null);
    setLocked(false);
    setRoundNum(rn);
    // Intro: speak first word bilingual to set the tone
    track(() => speakBilingual(b.pool[0].he, b.pool[0].en), 700);
  }, [speakBilingual, track]);

  const handleWordTap = useCallback((id: string) => {
    if (locked || matched.has(id)) return;
    const word = WORD_BANK.find(w => w.id === id)!;
    speakSingle(isHebrew ? word.he : word.en);
    setSelectedWord(id);
  }, [locked, matched, speakSingle, isHebrew]);

  const handleEmojiTap = useCallback((id: string) => {
    if (locked || matched.has(id) || !selectedWord) return;
    const word = WORD_BANK.find(w => w.id === selectedWord)!;
    speakSingle(word.emoji); // just triggers visual feedback

    if (selectedWord === id) {
      // Correct match!
      playCorrect();
      const newMatched = new Set(matched);
      newMatched.add(id);
      setMatched(newMatched);
      setSparkle(id);
      track(() => setSparkle(null), 800);
      setCombo(c => c + 1);
      setTotalScore(s => s + 1);
      // Speak both languages — the core learning moment
      track(() => speakBilingual(word.he, word.en), 150);
      setSelectedWord(null);

      if (newMatched.size >= PAIRS_PER_ROUND) {
        // Round complete
        track(() => {
          if (roundNum + 1 >= TOTAL_ROUNDS) {
            playCheer();
            setPhase("complete");
          } else {
            board.pool.forEach(w => usedIdsRef.current.add(w.id));
            if (usedIdsRef.current.size > WORD_BANK.length - PAIRS_PER_ROUND) {
              usedIdsRef.current.clear();
            }
            startRound(roundNum + 1, usedIdsRef.current);
          }
        }, 900);
      }
    } else {
      // Wrong match
      playWrong();
      setCombo(0);
      setWrongPair(selectedWord);
      setLocked(true);
      track(() => {
        setWrongPair(null);
        setSelectedWord(null);
        setLocked(false);
      }, 900);
    }
  }, [locked, matched, selectedWord, roundNum, board, playCorrect, playWrong, playCheer, speakBilingual, speakSingle, startRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-[90px] filter drop-shadow-xl"
        >🃏</motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            {isHebrew ? "התאמת מילים" : "Word Match"}
          </h1>
          <p className="text-foreground/60 mt-2 text-base">
            {isHebrew ? "חברו מילה לתמונה המתאימה!" : "Match the word to the right picture!"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setPhase("playing"); startRound(0, usedIdsRef.current); }}
          className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-2xl py-5 px-12 rounded-3xl shadow-2xl"
          style={{ boxShadow: "0 8px 30px rgba(139,92,246,0.4)" }}
        >
          {isHebrew ? "!בואו נשחק" : "Let's Play!"}
        </motion.button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={totalScore}
        total={TOTAL_ROUNDS * PAIRS_PER_ROUND}
        onPlayAgain={() => {
          usedIdsRef.current.clear();
          setTotalScore(0);
          setCombo(0);
          setPhase("playing");
          startRound(0, usedIdsRef.current);
        }}
        onGoHome={() => router.push("/")}
        slug="word-match"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 pt-2 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <div className="flex items-center gap-2">
          <span className="text-yellow-500 font-black">⭐ {totalScore}</span>
          {combo >= 2 && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-orange-500 font-black text-sm"
            >
              🔥x{combo}
            </motion.span>
          )}
        </div>
        <div className="text-foreground/50 text-sm font-bold">{roundNum + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
          animate={{ width: `${(roundNum / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-foreground/60 font-bold">
        {isHebrew ? "חברו מילה לתמונה" : "Match word to picture"} —{" "}
        <span className="text-purple-500">{matched.size}/{PAIRS_PER_ROUND}</span>
      </p>

      {/* Matching board */}
      <div className="flex gap-4 w-full">
        {/* Words column */}
        <div className="flex flex-col gap-3 flex-1">
          {board.words.map((item) => {
            const isSelected = selectedWord === item.id;
            const isMatched = matched.has(item.id);
            const isWrong = wrongPair === item.id;
            return (
              <motion.button
                key={`w-${roundNum}-${item.id}`}
                onClick={() => handleWordTap(item.id)}
                initial={{ x: -30, opacity: 0 }}
                animate={{
                  x: 0, opacity: 1,
                  scale: isWrong ? [1, 1.05, 0.95, 1] : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                disabled={isMatched}
                className="rounded-2xl py-4 px-3 text-center font-black text-lg transition-all border-3 min-h-[62px] flex items-center justify-center"
                style={{
                  background: isMatched
                    ? "linear-gradient(135deg, #86efac, #22c55e)"
                    : isSelected
                      ? "linear-gradient(135deg, #c4b5fd, #8b5cf6)"
                      : isWrong
                        ? "linear-gradient(135deg, #fca5a5, #ef4444)"
                        : "white",
                  color: isMatched ? "white" : isSelected ? "white" : isWrong ? "white" : "#374151",
                  boxShadow: isSelected ? "0 4px 20px rgba(139,92,246,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                  border: `3px solid ${isMatched ? "#22c55e" : isSelected ? "#7c3aed" : isWrong ? "#ef4444" : "#e5e7eb"}`,
                }}
              >
                {isMatched ? "✓" : isHebrew ? item.he : item.en}
              </motion.button>
            );
          })}
        </div>

        {/* Emoji column */}
        <div className="flex flex-col gap-3 flex-1">
          {board.emojis.map((item) => {
            const isMatched = matched.has(item.id);
            const isSparkle = sparkle === item.id;
            return (
              <motion.button
                key={`e-${roundNum}-${item.id}`}
                onClick={() => handleEmojiTap(item.id)}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1, scale: isSparkle ? [1, 1.3, 1] : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                disabled={isMatched || !selectedWord}
                className="rounded-2xl py-3 min-h-[62px] flex flex-col items-center justify-center gap-1 border-3 transition-all"
                style={{
                  background: isMatched
                    ? "linear-gradient(135deg, #86efac, #22c55e)"
                    : "white",
                  boxShadow: isSparkle ? "0 4px 20px rgba(34,197,94,0.5)" : "0 2px 8px rgba(0,0,0,0.08)",
                  border: `3px solid ${isMatched ? "#22c55e" : "#e5e7eb"}`,
                  opacity: !selectedWord && !isMatched ? 0.6 : 1,
                }}
              >
                {isMatched ? (
                  <span className="text-3xl">✓</span>
                ) : (
                  <>
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-xs text-gray-400 font-semibold">{isHebrew ? item.en : item.he}</span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Instruction */}
      <AnimatePresence>
        {!selectedWord && matched.size < PAIRS_PER_ROUND && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-purple-400 font-bold text-center"
          >
            👆 {isHebrew ? "לחצו על מילה קודם" : "Tap a word first"}
          </motion.p>
        )}
        {selectedWord && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-emerald-500 font-bold text-center"
          >
            👆 {isHebrew ? "עכשיו בחרו תמונה" : "Now pick the picture"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
