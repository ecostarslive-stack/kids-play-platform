"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { shuffleArray, pickRandom } from "@/lib/utils";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { colors } from "@/lib/data/colors";
import { shapes } from "@/lib/data/shapes";

const STORAGE_KEY = "ari-adventure-progress";

interface LevelData {
  id: number;
  world: string;
  worldEmoji: string;
  title: string;
  bgGradient: string;
  friend: { emoji: string; name: string };
  storyIntro: string[];
  storyOutro: string[];
  challengeType: "letters" | "counting" | "colors" | "shapes" | "memory" | "mixed";
}

const levels: LevelData[] = [
  {
    id: 1,
    world: "היער הקסום",
    worldEmoji: "🌳",
    title: "ההתחלה",
    bgGradient: "from-green-300 to-emerald-200",
    friend: { emoji: "🐿️", name: "סנאי" },
    storyIntro: [
      "🦁 פעם היה גור אריות קטן בשם אריה...",
      "🌳 הוא גר ביער קסום ושמח...",
      "👑 יום אחד, הכתר הזהוב של ממלכת החיות נעלם!",
      "🦁 \"אני אמצא את הכתר!\" אמר אריה בגבורה",
      "🌳 אבל קודם, הוא צריך לעבור את היער הקסום...",
      "🔤 !עזרו לאריה למצוא את האותיות הנכונות",
    ],
    storyOutro: [
      "🎉 !אריה עבר את היער בהצלחה",
      "🐿️ \"אני סנאי! אני רוצה להצטרף אליך!\"",
      "🦁🐿️ עכשיו הם שניים במסע!",
      "🏔️ ...מה מחכה להם בהר הגבוה?",
    ],
    challengeType: "letters",
  },
  {
    id: 2,
    world: "ההר הגבוה",
    worldEmoji: "🏔️",
    title: "טיפוס אל הפסגה",
    bgGradient: "from-stone-300 to-slate-200",
    friend: { emoji: "🦅", name: "נשר" },
    storyIntro: [
      "🦁🐿️ אריה וסנאי הגיעו להר הגבוה...",
      "🏔️ ההר כל כך גבוה שהוא נוגע בעננים!",
      "🪨 יש אבנים עם מספרים שצריך לספור...",
      "🔢 !ספרו את האבנים כדי לטפס למעלה",
    ],
    storyOutro: [
      "🎉 !הגעתם לפסגה",
      "🦅 \"אני נשר! ראיתי משהו מנצנץ ליד הנהר!\"",
      "🦁🐿️🦅 עכשיו הם שלושה!",
      "🌊 ...האם זה הכתר? רצים לנהר!",
    ],
    challengeType: "counting",
  },
  {
    id: 3,
    world: "הנהר הסוער",
    worldEmoji: "🌊",
    title: "בונים גשר",
    bgGradient: "from-blue-300 to-cyan-200",
    friend: { emoji: "🐟", name: "דגיג" },
    storyIntro: [
      "🦁🐿️🦅 החברים הגיעו לנהר גדול...",
      "🌊 המים סוערים! אי אפשר לשחות!",
      "🌈 צריך לבנות גשר מצבעים!",
      "🎨 !התאימו את הצבעים כדי לבנות גשר",
    ],
    storyOutro: [
      "🌉 !הגשר מוכן, אפשר לעבור",
      "🐟 \"שלום! אני דגיג! שמעתי שמישהו אמר כתר?\"",
      "🦁🐿️🦅🐟 עכשיו הם ארבעה!",
      "🏜️ ...דגיג מספר שהכתר נראה במדבר!",
    ],
    challengeType: "colors",
  },
  {
    id: 4,
    world: "המדבר החם",
    worldEmoji: "🏜️",
    title: "צורות בחול",
    bgGradient: "from-amber-300 to-yellow-200",
    friend: { emoji: "🐪", name: "גמלון" },
    storyIntro: [
      "🦁🐿️🦅🐟 הגיעו למדבר החם והחולי...",
      "🏜️ החול מסתיר צורות מסתוריות!",
      "🔷 מי יודע איזו צורה מתחבאת?",
      "🔍 !מצאו את הצורות החבויות",
    ],
    storyOutro: [
      "🎉 !מצאתם את כל הצורות",
      "🐪 \"אני גמלון! אני יודע את הדרך למערה!\"",
      "🦁🐿️🦅🐟🐪 חמישה חברים!",
      "🌋 ...גמלון אומר שהכתר נמצא במערה חשוכה",
    ],
    challengeType: "shapes",
  },
  {
    id: 5,
    world: "המערה החשוכה",
    worldEmoji: "🦇",
    title: "אור בחושך",
    bgGradient: "from-violet-400 to-indigo-300",
    friend: { emoji: "🦇", name: "עטלפי" },
    storyIntro: [
      "🦁🐿️🦅🐟🐪 נכנסים למערה החשוכה...",
      "🌑 חשוך כאן! צריך זיכרון טוב!",
      "✨ יש אורות מהבהבים שצריך לזכור!",
      "🧠 !זכרו את הרצף של האורות",
    ],
    storyOutro: [
      "💡 !המערה מוארת עכשיו",
      "🦇 \"אני עטלפי! ראיתי את הכתר בטירה!\"",
      "🦁🐿️🦅🐟🐪🦇 שישה חברים!",
      "🏰 !הכתר בטירה הזהובה! אחרון... ממש קרוב",
    ],
    challengeType: "memory",
  },
  {
    id: 6,
    world: "הטירה הזהובה",
    worldEmoji: "🏰",
    title: "הכתר האבוד",
    bgGradient: "from-yellow-300 to-amber-200",
    friend: { emoji: "👑", name: "הכתר" },
    storyIntro: [
      "🏰 !הגיעו לטירה הזהובה",
      "🦁🐿️🦅🐟🐪🦇 כל החברים יחד!",
      "👑 הכתר מוגן באתגר אחרון...",
      "💪 !השתמשו בכל מה שלמדתם",
    ],
    storyOutro: [
      "👑 !!!מצאתם את הכתר",
      "🦁 אריה הניח את הכתר בחזרה על כס המלכות!",
      "🎊 כל החיות חגגו! אריה הגיבור!",
      "🌟 \"הכוח האמיתי הוא החברים שעשינו בדרך\"",
      "🦁🐿️🦅🐟🐪🦇 ...סוף! או שאולי... זו רק ההתחלה?",
    ],
    challengeType: "mixed",
  },
];

interface SaveData {
  currentLevel: number;
  stars: number[];
  friends: string[];
  lastPlayed: string;
}

function loadProgress(): SaveData {
  if (typeof window === "undefined") return { currentLevel: 1, stars: [], friends: [], lastPlayed: "" };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { currentLevel: 1, stars: [], friends: [], lastPlayed: "" };
}

function saveProgress(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastPlayed: new Date().toISOString() }));
  } catch {}
}

type Phase = "map" | "story-intro" | "challenge" | "story-outro" | "victory";

export default function AriAdventurePage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [progress, setProgress] = useState<SaveData>(() => loadProgress());
  const [phase, setPhase] = useState<Phase>("map");
  const [activeLevel, setActiveLevel] = useState<LevelData | null>(null);
  const [storyStep, setStoryStep] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeRound, setChallengeRound] = useState(0);

  // Challenge state
  const [options, setOptions] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  // Memory challenge state
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState<"showing" | "input">("showing");
  const [memoryActive, setMemoryActive] = useState<number | null>(null);

  const CHALLENGE_ROUNDS = 5;
  const memoryColors = ["#FF6B6B", "#339AF0", "#51CF66", "#FFC75F"];

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trackTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== id);
      fn();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (phase === "map" || phase === "victory") {
      clearAllTimeouts();
    }
  }, [phase, clearAllTimeouts]);

  const startLevel = useCallback((level: LevelData) => {
    setActiveLevel(level);
    setStoryStep(0);
    setPhase("story-intro");
    setChallengeScore(0);
    setChallengeRound(0);
  }, []);

  const advanceStory = useCallback(() => {
    if (!activeLevel) return;
    const storyLines = phase === "story-intro" ? activeLevel.storyIntro : activeLevel.storyOutro;
    if (storyStep + 1 < storyLines.length) {
      setStoryStep(s => s + 1);
    } else if (phase === "story-intro") {
      setPhase("challenge");
      setChallengeRound(0);
      setChallengeScore(0);
      generateChallenge(activeLevel.challengeType, 0);
    } else {
      // Finished outro — save progress
      const newProgress: SaveData = {
        currentLevel: Math.max(progress.currentLevel, activeLevel.id + 1),
        stars: [...progress.stars, activeLevel.id],
        friends: [...new Set([...progress.friends, activeLevel.friend.emoji])],
        lastPlayed: new Date().toISOString(),
      };
      setProgress(newProgress);
      saveProgress(newProgress);

      if (activeLevel.id === 6) {
        setPhase("victory");
      } else {
        setPhase("map");
      }
    }
  }, [activeLevel, phase, storyStep, progress]);

  const generateChallenge = useCallback((type: string, round: number) => {
    if (type === "letters" || (type === "mixed" && round % 4 === 0)) {
      const letter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
      const others = pickRandom(hebrewLetters.filter(l => l.id !== letter.id), 3).map(l => l.hebrew);
      setTarget(letter.hebrew);
      setOptions(shuffleArray([letter.hebrew, ...others]));
    } else if (type === "counting" || (type === "mixed" && round % 4 === 1)) {
      const num = Math.floor(Math.random() * 10) + 1;
      setTarget(String(num));
      const others = pickRandom(
        Array.from({ length: 10 }, (_, i) => String(i + 1)).filter(n => n !== String(num)), 3
      );
      setOptions(shuffleArray([String(num), ...others]));
    } else if (type === "colors" || (type === "mixed" && round % 4 === 2)) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const others = pickRandom(colors.filter(c => c.id !== color.id), 3).map(c => c.hebrew);
      setTarget(color.hebrew);
      setOptions(shuffleArray([color.hebrew, ...others]));
    } else if (type === "shapes" || (type === "mixed" && round % 4 === 3)) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const others = pickRandom(shapes.filter(s => s.id !== shape.id), 3).map(s => s.hebrew);
      setTarget(shape.hebrew);
      setOptions(shuffleArray([shape.hebrew, ...others]));
    } else if (type === "memory") {
      const seqLength = Math.min(3 + round, 6);
      const seq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 4));
      setMemorySequence(seq);
      setMemoryInput([]);
      setMemoryPhase("showing");
      // Play sequence
      seq.forEach((colorIdx, i) => {
        trackTimeout(() => setMemoryActive(colorIdx), i * 700);
        trackTimeout(() => setMemoryActive(null), i * 700 + 500);
      });
      trackTimeout(() => {
        setMemoryPhase("input");
        setMemoryActive(null);
      }, seq.length * 700 + 300);
    }
  }, [trackTimeout]);

  const handleAnswer = useCallback((answer: string) => {
    if (isLocked || !activeLevel) return;
    setIsLocked(true);

    if (answer === target) {
      playCorrect();
      setChallengeScore(s => s + 1);
      setShowFeedback("correct");
      trackTimeout(() => {
        setShowFeedback(null);
        const nextRound = challengeRound + 1;
        if (nextRound >= CHALLENGE_ROUNDS) {
          playCheer();
          setStoryStep(0);
          setPhase("story-outro");
        } else {
          setChallengeRound(nextRound);
          generateChallenge(activeLevel.challengeType, nextRound);
        }
        setIsLocked(false);
      }, 700);
    } else {
      playWrong();
      setShowFeedback("wrong");
      trackTimeout(() => {
        setShowFeedback(null);
        setIsLocked(false);
      }, 500);
    }
  }, [isLocked, target, activeLevel, challengeRound, playCorrect, playWrong, playCheer, generateChallenge, trackTimeout]);

  const handleMemoryInput = useCallback((colorIdx: number) => {
    if (memoryPhase !== "input" || isLocked) return;

    setMemoryActive(colorIdx);
    trackTimeout(() => setMemoryActive(null), 200);

    const newInput = [...memoryInput, colorIdx];
    setMemoryInput(newInput);

    if (colorIdx === memorySequence[newInput.length - 1]) {
      if (newInput.length === memorySequence.length) {
        playCorrect();
        setChallengeScore(s => s + 1);
        setIsLocked(true);
        trackTimeout(() => {
          const nextRound = challengeRound + 1;
          if (nextRound >= CHALLENGE_ROUNDS) {
            playCheer();
            setStoryStep(0);
            setPhase("story-outro");
          } else {
            setChallengeRound(nextRound);
            generateChallenge("memory", nextRound);
          }
          setIsLocked(false);
        }, 700);
      }
    } else {
      playWrong();
      setMemoryInput([]);
      setMemoryPhase("showing");
      memorySequence.forEach((ci, i) => {
        trackTimeout(() => setMemoryActive(ci), i * 700);
        trackTimeout(() => setMemoryActive(null), i * 700 + 500);
      });
      trackTimeout(() => {
        setMemoryPhase("input");
        setMemoryActive(null);
      }, memorySequence.length * 700 + 300);
    }
  }, [memoryPhase, memoryInput, memorySequence, isLocked, challengeRound, playCorrect, playWrong, playCheer, generateChallenge, trackTimeout]);

  // === RENDER ===

  // Victory screen
  if (phase === "victory") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl">👑</motion.div>
        <h1 className="text-4xl font-black text-center">!אריה הגיבור</h1>
        <p className="text-xl text-foreground/70 text-center">מצאתם את הכתר והצלתם את הממלכה!</p>
        <div className="flex gap-2 text-3xl">
          {progress.friends.map((f, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}>{f}</motion.span>
          ))}
        </div>
        <p className="text-lg">⭐ {progress.stars.length} כוכבים</p>
        <div className="flex gap-3 mt-4">
          <BigButton onClick={() => { setProgress({ currentLevel: 1, stars: [], friends: [], lastPlayed: "" }); saveProgress({ currentLevel: 1, stars: [], friends: [], lastPlayed: "" }); setPhase("map"); }} variant="warning">🔄 מההתחלה</BigButton>
          <BigButton onClick={() => router.push("/")} variant="secondary">🏠 הביתה</BigButton>
        </div>
      </div>
    );
  }

  // Map screen
  if (phase === "map") {
    return (
      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-2">
        <div className="text-center">
          <h1 className="text-3xl font-black">🦁 המסע של אריה</h1>
          {progress.friends.length > 0 && (
            <div className="flex gap-1 justify-center mt-1">
              <span className="text-2xl">🦁</span>
              {progress.friends.map((f, i) => <span key={i} className="text-2xl">{f}</span>)}
            </div>
          )}
          <p className="text-sm text-foreground/60 mt-1">⭐ {progress.stars.length} כוכבים</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {levels.map((level, i) => {
            const isUnlocked = level.id <= progress.currentLevel;
            const isCompleted = progress.stars.includes(level.id);

            return (
              <motion.button
                key={level.id}
                initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => isUnlocked && startLevel(level)}
                disabled={!isUnlocked}
                className={`rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all
                  ${isCompleted ? "bg-success/20 ring-2 ring-success" :
                    isUnlocked ? "bg-white hover:shadow-lg" : "bg-gray-200 opacity-50"}`}
              >
                <span className="text-3xl">{isUnlocked ? level.worldEmoji : "🔒"}</span>
                <div className="text-start flex-1">
                  <p className="font-black text-lg">{level.world}</p>
                  <p className="text-sm text-foreground/60">{level.title}</p>
                </div>
                {isCompleted && <span className="text-2xl">⭐</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Story screens (intro/outro)
  if (phase === "story-intro" || phase === "story-outro") {
    const storyLines = phase === "story-intro" ? activeLevel!.storyIntro : activeLevel!.storyOutro;
    const currentLine = storyLines[storyStep];

    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-6 px-4 bg-gradient-to-b ${activeLevel!.bgGradient} min-h-full`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={storyStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-sm w-full text-center"
          >
            <p className="text-2xl font-bold leading-relaxed">{currentLine}</p>
          </motion.div>
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={advanceStory}
          className="bg-white/60 rounded-full px-8 py-3 text-lg font-bold shadow-md"
        >
          {storyStep + 1 < storyLines.length ? "המשך ←" : phase === "story-intro" ? "!לאתגר" : "!קדימה"}
        </motion.button>

        <div className="flex gap-1">
          {storyLines.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= storyStep ? "bg-foreground/60" : "bg-foreground/20"}`} />
          ))}
        </div>
      </div>
    );
  }

  // Challenge screen
  if (phase === "challenge" && activeLevel) {
    const isMemory = activeLevel.challengeType === "memory" ||
      (activeLevel.challengeType === "mixed" && challengeRound % 5 === 4);

    return (
      <div className={`flex-1 flex flex-col items-center gap-5 px-4 py-4 bg-gradient-to-b ${activeLevel.bgGradient} min-h-full`}>
        <div className="flex items-center justify-between w-full max-w-md">
          <span className="text-lg font-bold">{activeLevel.worldEmoji} {activeLevel.world}</span>
          <span className="text-lg font-bold">⭐ {challengeScore}/{CHALLENGE_ROUNDS}</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {Array.from({ length: CHALLENGE_ROUNDS }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < challengeRound ? "bg-success" : i === challengeRound ? "bg-warning" : "bg-white/40"}`} />
          ))}
        </div>

        {isMemory ? (
          <>
            <p className="text-xl font-bold text-white/90">
              {memoryPhase === "showing" ? "👀 !תסתכלו על הרצף" : "👆 !חזרו על הרצף"}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
              {memoryColors.map((color, idx) => (
                <motion.button
                  key={idx}
                  whileTap={memoryPhase === "input" ? { scale: 0.9 } : {}}
                  onClick={() => handleMemoryInput(idx)}
                  disabled={memoryPhase !== "input"}
                  className="aspect-square rounded-3xl shadow-lg border-4 border-white/30"
                  style={{
                    backgroundColor: memoryActive === idx ? color : `${color}99`,
                    transform: memoryActive === idx ? "scale(1.1)" : "scale(1)",
                    boxShadow: memoryActive === idx ? `0 0 25px ${color}` : undefined,
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <motion.div
              key={challengeRound}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/80 rounded-3xl p-6 shadow-lg"
            >
              <p className="text-3xl font-black text-center">{target}</p>
              <p className="text-sm text-foreground/60 text-center mt-1">?מצאו את התשובה הנכונה</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {options.map((opt, i) => (
                <motion.button
                  key={`${challengeRound}-${opt}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white rounded-2xl shadow-md p-5 text-2xl font-bold hover:shadow-lg transition-shadow"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback === "correct" && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <span className="text-9xl">🎉</span>
            </motion.div>
          )}
          {showFeedback === "wrong" && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} className="text-8xl">🤔</motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
