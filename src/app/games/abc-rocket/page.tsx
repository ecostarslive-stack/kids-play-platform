"use client";

/**
 * ABC Rocket — letter recognition with bilingual immersion
 * A rocket is heading to a planet. Letters rain down.
 * Tap the correct letter to fuel the rocket.
 * On correct: rocket boosts, hears "alef... A!"
 * High visual excitement, progressive difficulty.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { useGameSound } from "@/hooks/useGameSound";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { BackButton } from "@/components/ui/BackButton";
import { useLanguage } from "@/providers/LanguageProvider";

const LETTERS = [
  { id: "alef",  he: "א",  en: "A", sound: "אָלֶף",   enSound: "A" },
  { id: "bet",   he: "ב",  en: "B", sound: "בֵּית",    enSound: "B" },
  { id: "gimel", he: "ג",  en: "C", sound: "גִּימֶל",  enSound: "C" },
  { id: "dalet", he: "ד",  en: "D", sound: "דָּלֶת",   enSound: "D" },
  { id: "he",    he: "ה",  en: "E", sound: "הֵא",      enSound: "E" },
  { id: "vav",   he: "ו",  en: "F", sound: "וָו",      enSound: "F" },
  { id: "zayin", he: "ז",  en: "G", sound: "זַיִן",    enSound: "G" },
  { id: "chet",  he: "ח",  en: "H", sound: "חֵית",     enSound: "H" },
  { id: "tet",   he: "ט",  en: "I", sound: "טֵית",     enSound: "I" },
  { id: "yod",   he: "י",  en: "J", sound: "יוֹד",     enSound: "J" },
  { id: "kaf",   he: "כ",  en: "K", sound: "כַּף",     enSound: "K" },
  { id: "lamed", he: "ל",  en: "L", sound: "לָמֶד",    enSound: "L" },
  { id: "mem",   he: "מ",  en: "M", sound: "מֵם",      enSound: "M" },
  { id: "nun",   he: "נ",  en: "N", sound: "נוּן",     enSound: "N" },
  { id: "samech",he: "ס",  en: "O", sound: "סָמֶך",    enSound: "O" },
  { id: "ayin",  he: "ע",  en: "P", sound: "עַיִן",    enSound: "P" },
];

const TOTAL_ROUNDS = 12;
const CHOICES = 4;

const PLANET_COLORS = ["#FF6B6B","#4ECDC4","#845EC2","#FF922B","#339AF0","#51CF66","#FF6F91"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound(round: number) {
  const pool = shuffle(LETTERS).slice(0, CHOICES);
  const target = pool[Math.floor(Math.random() * pool.length)];
  const planetColor = PLANET_COLORS[round % PLANET_COLORS.length];
  return { pool, target, planetColor };
}

type Phase = "intro" | "playing" | "complete";
type FeedbackMap = Record<string, "correct" | "wrong">;

export default function AbcRocketPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();
  const { speakBilingual } = useBilingualSpeak();
  const { isHebrew } = useLanguage();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(() => generateRound(0));
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [locked, setLocked] = useState(false);
  const [rocketBoost, setRocketBoost] = useState(false);
  const [fuel, setFuel] = useState(0); // 0-100 progress

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter(t => t !== id); fn(); }, ms);
    timeoutsRef.current.push(id);
  }, []);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const startRound = useCallback((r: number) => {
    const rd = generateRound(r);
    setCurrentRound(rd);
    setFeedback({});
    setLocked(false);
    setRound(r);
    setFuel(Math.round((r / TOTAL_ROUNDS) * 100));
    track(() => speakBilingual(rd.target.sound, rd.target.enSound), 500);
  }, [speakBilingual, track]);

  const handleTap = useCallback((letterId: string) => {
    if (locked) return;
    setLocked(true);

    if (letterId === currentRound.target.id) {
      playCorrect();
      setFeedback({ [letterId]: "correct" });
      setRocketBoost(true);
      setScore(s => s + 1);
      track(() => speakBilingual(currentRound.target.sound, currentRound.target.enSound), 200);
      track(() => setRocketBoost(false), 700);
      track(() => {
        if (round + 1 >= TOTAL_ROUNDS) { playCheer(); setPhase("complete"); }
        else startRound(round + 1);
      }, 1200);
    } else {
      playWrong();
      setFeedback(prev => ({ ...prev, [letterId]: "wrong" }));
      track(() => { setFeedback(prev => { const n = {...prev}; delete n[letterId]; return n; }); setLocked(false); }, 900);
    }
  }, [locked, currentRound, round, playCorrect, playWrong, playCheer, speakBilingual, startRound, track]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-[100px] filter drop-shadow-2xl"
        >🚀</motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {isHebrew ? "ABC רקטה" : "ABC Rocket"}
          </h1>
          <p className="text-foreground/60 mt-2">{isHebrew ? "הצילו את הרקטה — לחצו על האות הנכונה!" : "Save the rocket — tap the right letter!"}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setPhase("playing"); startRound(0); }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-2xl py-5 px-12 rounded-3xl shadow-2xl"
          style={{ boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}
        >
          {isHebrew ? "לכו 🚀" : "Launch 🚀"}
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
        onPlayAgain={() => { setScore(0); setPhase("playing"); startRound(0); }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 pt-2 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <BackButton />
        <div className="text-yellow-500 font-black text-lg">⭐ {score}</div>
        <div className="text-foreground/50 text-sm font-bold">{round + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Fuel bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs font-bold text-foreground/50 mb-1">
          <span>⛽ {isHebrew ? "דלק לרקטה" : "Rocket fuel"}</span>
          <span>{fuel}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, #6366f1, #a855f7, #ec4899)` }}
            animate={{ width: `${fuel}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Space scene */}
      <div className="relative w-full rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", minHeight: 160 }}>

        {/* Stars */}
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 95}%`,
              top: `${Math.random() * 85}%`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}

        {/* Planet (target destination) */}
        <motion.div
          className="absolute right-4 top-4 flex items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
          style={{
            width: 56, height: 56,
            background: `radial-gradient(circle at 35% 35%, ${currentRound.planetColor}cc, ${currentRound.planetColor})`,
            boxShadow: `0 0 20px ${currentRound.planetColor}80`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          🌍
        </motion.div>

        {/* Rocket */}
        <motion.div
          className="absolute left-4 bottom-4 text-5xl filter drop-shadow-lg"
          animate={{
            y: rocketBoost ? [-10, -30, -10] : [0, -6, 0],
            x: rocketBoost ? [0, 8, 0] : 0,
            scale: rocketBoost ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: rocketBoost ? 0.5 : 2, repeat: rocketBoost ? 0 : Infinity, ease: "easeInOut" }}
        >
          🚀
          {rocketBoost && (
            <motion.div
              className="absolute -bottom-4 left-2 text-2xl"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              🔥
            </motion.div>
          )}
        </motion.div>

        {/* Target letter display */}
        <motion.div
          key={`target-${round}`}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-2 text-center">
            <p className="text-white/70 text-xs font-bold">{isHebrew ? "מצאו את" : "Find the"}</p>
            <p className="text-white text-4xl font-black">{isHebrew ? currentRound.target.he : currentRound.target.en}</p>
            <p className="text-white/60 text-sm font-bold">{isHebrew ? currentRound.target.en : currentRound.target.he}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => speakBilingual(currentRound.target.sound, currentRound.target.enSound)}
            className="mt-2 bg-white/20 rounded-xl px-4 py-1 text-white text-sm font-bold"
          >
            🔊 {isHebrew ? "שמעו" : "Hear it"}
          </motion.button>
        </motion.div>
      </div>

      {/* Letter choices */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {currentRound.pool.map((letter, idx) => {
          const fb = feedback[letter.id];
          return (
            <motion.button
              key={`${round}-${letter.id}`}
              onClick={() => handleTap(letter.id)}
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: 0, opacity: 1,
                scale: fb === "correct" ? [1, 1.2, 1] : fb === "wrong" ? [1, 0.9, 1] : 1,
              }}
              transition={{ delay: idx * 0.06, type: "spring", stiffness: 300 }}
              className="rounded-3xl min-h-[90px] flex flex-col items-center justify-center gap-1 shadow-lg border-4 transition-all font-black"
              style={{
                background: fb === "correct"
                  ? "linear-gradient(135deg, #86efac, #22c55e)"
                  : fb === "wrong"
                    ? "linear-gradient(135deg, #fca5a5, #ef4444)"
                    : "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                borderColor: fb === "correct" ? "#22c55e" : fb === "wrong" ? "#ef4444" : "#818cf8",
                color: fb ? "white" : "#3730a3",
              }}
            >
              <span className="text-4xl">{isHebrew ? letter.he : letter.en}</span>
              <span className="text-sm opacity-70">{isHebrew ? letter.en : letter.he}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
