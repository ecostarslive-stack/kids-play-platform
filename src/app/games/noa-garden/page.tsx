"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { shuffleArray, pickRandom } from "@/lib/utils";
import { hebrewLetters } from "@/lib/data/hebrew-letters";
import { colors } from "@/lib/data/colors";
import { shapes } from "@/lib/data/shapes";

const STORAGE_KEY = "noa-garden-progress";

interface LevelData {
  id: number;
  world: string;
  worldEmoji: string;
  title: string;
  bgGradient: string;
  creature: { emoji: string; name: string };
  gardenEmojis: string[];
  storyIntro: string[];
  storyOutro: string[];
  challengeType: "letters" | "colors" | "counting" | "shapes" | "memory" | "mixed";
}

const levels: LevelData[] = [
  {
    id: 1,
    world: "הזרעים הראשונים",
    worldEmoji: "🌱",
    title: "מתחילים לגדול",
    bgGradient: "from-lime-200 to-green-100",
    creature: { emoji: "🐛", name: "זחלי" },
    gardenEmojis: ["🌱", "🌱", "🌿"],
    storyIntro: [
      "👧 נועה מצאה דלת סודית בגינה של סבתא...",
      "🚪 היא פתחה את הדלת וגילתה גן קסום!",
      "😢 אבל הגן היה עצוב ואפור...",
      "✨ \"אני אחזיר לגן את הקסם!\" אמרה נועה",
      "🌱 בואו נשתול את הזרעים הראשונים!",
      "🔤 !מצאו את האותיות הנכונות כדי לשתול",
    ],
    storyOutro: [
      "🌱 !הזרעים נשתלו והתחילו לצמוח",
      "🐛 \"שלום! אני זחלי! תודה שהצלת את הגינה!\"",
      "👧🐛 נועה מצאה חבר חדש!",
      "🌸 ...מחר יפרחו פרחים צבעוניים!",
    ],
    challengeType: "letters",
  },
  {
    id: 2,
    world: "פרחי הקשת",
    worldEmoji: "🌸",
    title: "צבעים קסומים",
    bgGradient: "from-pink-200 to-rose-100",
    creature: { emoji: "🦋", name: "פרפרית" },
    gardenEmojis: ["🌱", "🌿", "🌸", "🌺"],
    storyIntro: [
      "👧🐛 נועה וזחלי חזרו לגן הקסום...",
      "🌸 ניצנים צבעוניים מתחילים להיפתח!",
      "🎨 אבל הם צריכים את הצבעים הנכונים!",
      "🌈 !התאימו צבעים כדי לפתוח את הפרחים",
    ],
    storyOutro: [
      "🌺 !הפרחים נפתחו בכל הצבעים",
      "🦋 \"איזה יופי! אני פרפרית! אפשר לגור פה?\"",
      "👧🐛🦋 !ברוכה הבאה לגן",
      "🍓 ...משהו מתוק מתחיל לגדול על העצים",
    ],
    challengeType: "colors",
  },
  {
    id: 3,
    world: "גן הפירות",
    worldEmoji: "🍓",
    title: "סופרים פירות",
    bgGradient: "from-orange-200 to-amber-100",
    creature: { emoji: "🐞", name: "חיפושית" },
    gardenEmojis: ["🌿", "🌸", "🌺", "🍎", "🍓"],
    storyIntro: [
      "👧🐛🦋 הגן מתמלא בפירות!",
      "🍎🍓🍊 כל כך הרבה פירות על העצים!",
      "🔢 ?כמה פירות יש מכל סוג",
      "🧮 !ספרו את הפירות הקסומים",
    ],
    storyOutro: [
      "🍓 !כל הפירות נספרו",
      "🐞 \"אני חיפושית! אני שומרת על הפירות!\"",
      "👧🐛🦋🐞 !הגן הולך וגדל",
      "🧚 ...נשמעים צלילים קסומים מהפינה הנסתרת",
    ],
    challengeType: "counting",
  },
  {
    id: 4,
    world: "הפיות הקטנות",
    worldEmoji: "🧚",
    title: "בתים לפיות",
    bgGradient: "from-violet-200 to-purple-100",
    creature: { emoji: "🧚", name: "פיונה" },
    gardenEmojis: ["🌸", "🌺", "🍓", "🏡", "🧚"],
    storyIntro: [
      "👧🐛🦋🐞 בפינת הגן יש פיות קטנטנות!",
      "🧚 הפיות צריכות בתים חדשים!",
      "🔷 צריך צורות כדי לבנות בתי פיות!",
      "🔍 !מצאו את הצורות הנכונות",
    ],
    storyOutro: [
      "🏡 !בתי הפיות מוכנים",
      "🧚 \"תודה רבה! אני פיונה הפיה! אתן לך מתנה...\"",
      "✨ פיונה נתנה לנועה שרביט קסמים!",
      "🌙 ...בלילה, הגן מתעורר באור מיוחד",
    ],
    challengeType: "shapes",
  },
  {
    id: 5,
    world: "גן הלילה",
    worldEmoji: "🌙",
    title: "אורות בחושך",
    bgGradient: "from-indigo-300 to-violet-200",
    creature: { emoji: "✨", name: "ניצוץ" },
    gardenEmojis: ["🌸", "🌺", "🍓", "🧚", "🌙", "✨"],
    storyIntro: [
      "🌙 הלילה ירד על הגן הקסום...",
      "✨ פרחים זוהרים מאירים בחושך!",
      "👧 נועה משתמשת בשרביט הקסם!",
      "🧠 !זכרו את סדר האורות הזוהרים",
    ],
    storyOutro: [
      "✨ !כל הגן זוהר באור קסום",
      "✨ \"אני ניצוץ! אור קטן עם לב גדול!\"",
      "👧🐛🦋🐞🧚✨ !כמה חברים יש לנועה",
      "🌈 ...מחר הגן ייפתח בפריחה מלאה!",
    ],
    challengeType: "memory",
  },
  {
    id: 6,
    world: "הגן פורח",
    worldEmoji: "🌈",
    title: "הקסם השלם",
    bgGradient: "from-yellow-200 to-pink-200",
    creature: { emoji: "🦄", name: "חד-קרן" },
    gardenEmojis: ["🌸", "🌺", "🍓", "🧚", "✨", "🦄", "🌈"],
    storyIntro: [
      "🌈 !הבוקר הגדול הגיע",
      "👧 נועה וכל חברי הגן מוכנים!",
      "🌸 צריך להשתמש בכל הקסם כדי להפריח את הגן!",
      "💪 !האתגר האחרון - בואו נעשה את זה",
    ],
    storyOutro: [
      "🌈 !!!הגן פורח בכל הצבעים",
      "🦄 \"אני חד-קרן הגן! הקסם חזר בזכותך!\"",
      "🎊 כל החיות והפיות חוגגים!",
      "👧 נועה חייכה. הגן הקסום חי שוב!",
      "✨ \"כל פעם שתבואי, יהיה כאן קסם חדש...\"",
      "🌸 ...סוף קסום! או שאולי... רק ההתחלה? 🌟",
    ],
    challengeType: "mixed",
  },
];

interface SaveData {
  currentLevel: number;
  sparkles: number[];
  creatures: string[];
  gardenState: string[];
  lastPlayed: string;
}

function loadProgress(): SaveData {
  if (typeof window === "undefined") return { currentLevel: 1, sparkles: [], creatures: [], gardenState: ["🌱"], lastPlayed: "" };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { currentLevel: 1, sparkles: [], creatures: [], gardenState: ["🌱"], lastPlayed: "" };
}

function saveProgress(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastPlayed: new Date().toISOString() }));
  } catch {}
}

type Phase = "garden" | "story-intro" | "challenge" | "story-outro" | "victory";

export default function NoaGardenPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [progress, setProgress] = useState<SaveData>(() => loadProgress());
  const [phase, setPhase] = useState<Phase>("garden");
  const [activeLevel, setActiveLevel] = useState<LevelData | null>(null);
  const [storyStep, setStoryStep] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeRound, setChallengeRound] = useState(0);

  const [options, setOptions] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState<"showing" | "input">("showing");
  const [memoryActive, setMemoryActive] = useState<number | null>(null);

  const CHALLENGE_ROUNDS = 5;
  const flowerColors = ["#FF6F91", "#845EC2", "#51CF66", "#FFD93D"];

  const startLevel = useCallback((level: LevelData) => {
    setActiveLevel(level);
    setStoryStep(0);
    setPhase("story-intro");
    setChallengeScore(0);
    setChallengeRound(0);
  }, []);

  const generateChallenge = useCallback((type: string, round: number) => {
    if (type === "letters" || (type === "mixed" && round % 4 === 0)) {
      const letter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
      const others = pickRandom(hebrewLetters.filter(l => l.id !== letter.id), 3).map(l => l.hebrew);
      setTarget(letter.hebrew);
      setOptions(shuffleArray([letter.hebrew, ...others]));
    } else if (type === "colors" || (type === "mixed" && round % 4 === 1)) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const others = pickRandom(colors.filter(c => c.id !== color.id), 3).map(c => c.hebrew);
      setTarget(color.hebrew);
      setOptions(shuffleArray([color.hebrew, ...others]));
    } else if (type === "counting" || (type === "mixed" && round % 4 === 2)) {
      const num = Math.floor(Math.random() * 10) + 1;
      setTarget(String(num));
      const others = pickRandom(
        Array.from({ length: 10 }, (_, i) => String(i + 1)).filter(n => n !== String(num)), 3
      );
      setOptions(shuffleArray([String(num), ...others]));
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
      seq.forEach((colorIdx, i) => {
        setTimeout(() => setMemoryActive(colorIdx), i * 700);
        setTimeout(() => setMemoryActive(null), i * 700 + 500);
      });
      setTimeout(() => {
        setMemoryPhase("input");
        setMemoryActive(null);
      }, seq.length * 700 + 300);
    }
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
      const newProgress: SaveData = {
        currentLevel: Math.max(progress.currentLevel, activeLevel.id + 1),
        sparkles: [...new Set([...progress.sparkles, activeLevel.id])],
        creatures: [...new Set([...progress.creatures, activeLevel.creature.emoji])],
        gardenState: activeLevel.gardenEmojis,
        lastPlayed: new Date().toISOString(),
      };
      setProgress(newProgress);
      saveProgress(newProgress);

      if (activeLevel.id === 6) {
        setPhase("victory");
      } else {
        setPhase("garden");
      }
    }
  }, [activeLevel, phase, storyStep, progress, generateChallenge]);

  const handleAnswer = useCallback((answer: string) => {
    if (isLocked || !activeLevel) return;
    setIsLocked(true);

    if (answer === target) {
      playCorrect();
      setChallengeScore(s => s + 1);
      setShowFeedback("correct");
      setTimeout(() => {
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
      setTimeout(() => {
        setShowFeedback(null);
        setIsLocked(false);
      }, 500);
    }
  }, [isLocked, target, activeLevel, challengeRound, playCorrect, playWrong, playCheer, generateChallenge]);

  const handleMemoryInput = useCallback((colorIdx: number) => {
    if (memoryPhase !== "input" || isLocked) return;

    setMemoryActive(colorIdx);
    setTimeout(() => setMemoryActive(null), 200);

    const newInput = [...memoryInput, colorIdx];
    setMemoryInput(newInput);

    if (colorIdx === memorySequence[newInput.length - 1]) {
      if (newInput.length === memorySequence.length) {
        playCorrect();
        setChallengeScore(s => s + 1);
        setIsLocked(true);
        setTimeout(() => {
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
        setTimeout(() => setMemoryActive(ci), i * 700);
        setTimeout(() => setMemoryActive(null), i * 700 + 500);
      });
      setTimeout(() => {
        setMemoryPhase("input");
        setMemoryActive(null);
      }, memorySequence.length * 700 + 300);
    }
  }, [memoryPhase, memoryInput, memorySequence, isLocked, challengeRound, playCorrect, playWrong, playCheer, generateChallenge]);

  // === RENDER ===

  if (phase === "victory") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-b from-pink-100 to-yellow-100 min-h-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="text-center">
            <span className="text-8xl block">🌈</span>
            <div className="flex justify-center gap-1 mt-2">
              {progress.gardenState.map((e, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }} className="text-3xl">{e}</motion.span>
              ))}
            </div>
          </div>
        </motion.div>
        <h1 className="text-4xl font-black text-center">!הגן פורח</h1>
        <p className="text-xl text-foreground/70 text-center">נועה הצליחה להחזיר את הקסם!</p>
        <div className="flex gap-2 text-3xl">
          {progress.creatures.map((c, i) => (
            <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>{c}</motion.span>
          ))}
        </div>
        <p className="text-lg">✨ {progress.sparkles.length} ניצוצות קסם</p>
        <div className="flex gap-3 mt-4">
          <BigButton onClick={() => { const fresh = { currentLevel: 1, sparkles: [], creatures: [], gardenState: ["🌱"], lastPlayed: "" }; setProgress(fresh); saveProgress(fresh); setPhase("garden"); }} variant="warning">🔄 מההתחלה</BigButton>
          <BigButton onClick={() => router.push("/")} variant="secondary">🏠 הביתה</BigButton>
        </div>
      </div>
    );
  }

  if (phase === "garden") {
    return (
      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-2 bg-gradient-to-b from-green-50 to-lime-50 min-h-full">
        <div className="text-center">
          <h1 className="text-3xl font-black">🌸 הגן הקסום של נועה</h1>
          {/* Mini garden display */}
          <div className="flex justify-center gap-1 mt-2 bg-white/50 rounded-full px-4 py-1">
            <span className="text-xl">👧</span>
            {progress.creatures.map((c, i) => <span key={i} className="text-xl">{c}</span>)}
          </div>
          <p className="text-sm text-foreground/60 mt-1">✨ {progress.sparkles.length} ניצוצות קסם</p>
        </div>

        {/* Animated garden preview */}
        <div className="bg-white/40 rounded-3xl p-4 w-full max-w-xs">
          <div className="flex flex-wrap justify-center gap-2">
            {progress.gardenState.map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                className="text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {levels.map((level, i) => {
            const isUnlocked = level.id <= progress.currentLevel;
            const isCompleted = progress.sparkles.includes(level.id);

            return (
              <motion.button
                key={level.id}
                initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => isUnlocked && startLevel(level)}
                disabled={!isUnlocked}
                className={`rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all
                  ${isCompleted ? "bg-pink-100 ring-2 ring-pink-400" :
                    isUnlocked ? "bg-white hover:shadow-lg" : "bg-gray-200 opacity-50"}`}
              >
                <span className="text-3xl">{isUnlocked ? level.worldEmoji : "🔒"}</span>
                <div className="text-start flex-1">
                  <p className="font-black text-lg">{level.world}</p>
                  <p className="text-sm text-foreground/60">{level.title}</p>
                </div>
                {isCompleted && <span className="text-2xl">✨</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "story-intro" || phase === "story-outro") {
    const storyLines = phase === "story-intro" ? activeLevel!.storyIntro : activeLevel!.storyOutro;
    const currentLine = storyLines[storyStep];

    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-6 px-4 bg-gradient-to-b ${activeLevel!.bgGradient} min-h-full`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={storyStep}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
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
          {storyStep + 1 < storyLines.length ? "✨ המשך" : phase === "story-intro" ? "!🌸 לאתגר" : "!🌟 קדימה"}
        </motion.button>

        <div className="flex gap-1">
          {storyLines.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= storyStep ? "bg-pink-500" : "bg-white/40"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "challenge" && activeLevel) {
    const isMemory = activeLevel.challengeType === "memory" ||
      (activeLevel.challengeType === "mixed" && challengeRound % 5 === 4);

    return (
      <div className={`flex-1 flex flex-col items-center gap-5 px-4 py-4 bg-gradient-to-b ${activeLevel.bgGradient} min-h-full`}>
        <div className="flex items-center justify-between w-full max-w-md">
          <span className="text-lg font-bold">{activeLevel.worldEmoji} {activeLevel.world}</span>
          <span className="text-lg font-bold">✨ {challengeScore}/{CHALLENGE_ROUNDS}</span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: CHALLENGE_ROUNDS }).map((_, i) => (
            <motion.div
              key={i}
              animate={i === challengeRound ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-4 h-4 rounded-full ${i < challengeRound ? "bg-pink-500" : i === challengeRound ? "bg-pink-300" : "bg-white/40"}`}
            />
          ))}
        </div>

        {isMemory ? (
          <>
            <p className="text-xl font-bold text-foreground/80">
              {memoryPhase === "showing" ? "👀 !תסתכלו על הפרחים" : "👆 !לחצו באותו סדר"}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
              {flowerColors.map((color, idx) => (
                <motion.button
                  key={idx}
                  whileTap={memoryPhase === "input" ? { scale: 0.9 } : {}}
                  onClick={() => handleMemoryInput(idx)}
                  disabled={memoryPhase !== "input"}
                  className="aspect-square rounded-full shadow-lg border-4 border-white/50 flex items-center justify-center text-3xl"
                  style={{
                    backgroundColor: memoryActive === idx ? color : `${color}66`,
                    transform: memoryActive === idx ? "scale(1.15)" : "scale(1)",
                    boxShadow: memoryActive === idx ? `0 0 30px ${color}` : undefined,
                    transition: "all 0.15s",
                  }}
                >
                  {memoryActive === idx ? "🌸" : "🌱"}
                </motion.button>
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
              <p className="text-sm text-foreground/60 text-center mt-1">?מצאו את התשובה הנכונה 🌸</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {options.map((opt, i) => (
                <motion.button
                  key={`${challengeRound}-${opt}-${i}`}
                  initial={{ scale: 0, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white/90 rounded-2xl shadow-md p-5 text-2xl font-bold hover:shadow-lg transition-shadow"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {showFeedback === "correct" && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <span className="text-9xl">🌟</span>
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
