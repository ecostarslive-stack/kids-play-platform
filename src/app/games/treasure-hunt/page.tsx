"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CorrectAnimation } from "@/components/feedback/CorrectAnimation";
import { TryAgainAnimation } from "@/components/feedback/TryAgainAnimation";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { DifficultySelector, Difficulty } from "@/components/ui/DifficultySelector";
import { shuffleArray } from "@/lib/utils";

interface SceneItem {
  emoji: string;
  hebrew: string;
}

interface Scene {
  name: string;
  background: string;
  items: SceneItem[];
}

const scenes: Scene[] = [
  {
    name: "🌳 בגינה",
    background: "from-green-200 to-green-100",
    items: [
      { emoji: "🌸", hebrew: "פרח" }, { emoji: "🌳", hebrew: "עץ" }, { emoji: "🦋", hebrew: "פרפר" },
      { emoji: "🐛", hebrew: "זחל" }, { emoji: "🌻", hebrew: "חמנייה" }, { emoji: "🐝", hebrew: "דבורה" },
      { emoji: "🍃", hebrew: "עלה" }, { emoji: "🐌", hebrew: "חילזון" }, { emoji: "🌹", hebrew: "ורד" },
      { emoji: "🐞", hebrew: "חיפושית" }, { emoji: "🍄", hebrew: "פטרייה" }, { emoji: "🌿", hebrew: "צמח" },
    ],
  },
  {
    name: "🏠 בבית",
    background: "from-amber-100 to-orange-50",
    items: [
      { emoji: "🛋️", hebrew: "ספה" }, { emoji: "📺", hebrew: "טלוויזיה" }, { emoji: "🪑", hebrew: "כיסא" },
      { emoji: "🛏️", hebrew: "מיטה" }, { emoji: "🪟", hebrew: "חלון" }, { emoji: "🚪", hebrew: "דלת" },
      { emoji: "💡", hebrew: "מנורה" }, { emoji: "📖", hebrew: "ספר" }, { emoji: "🧸", hebrew: "דובי" },
      { emoji: "⏰", hebrew: "שעון" }, { emoji: "🖼️", hebrew: "תמונה" }, { emoji: "🪴", hebrew: "עציץ" },
    ],
  },
  {
    name: "🌊 בים",
    background: "from-blue-200 to-cyan-100",
    items: [
      { emoji: "🐟", hebrew: "דג" }, { emoji: "🐙", hebrew: "תמנון" }, { emoji: "🦀", hebrew: "סרטן" },
      { emoji: "🐚", hebrew: "צדפה" }, { emoji: "⛵", hebrew: "סירה" }, { emoji: "🏖️", hebrew: "חוף" },
      { emoji: "🦈", hebrew: "כריש" }, { emoji: "🐳", hebrew: "לווייתן" }, { emoji: "🪸", hebrew: "אלמוג" },
      { emoji: "🐢", hebrew: "צב" }, { emoji: "🦞", hebrew: "לובסטר" }, { emoji: "🐠", hebrew: "דג צבעוני" },
    ],
  },
  {
    name: "🚀 בחלל",
    background: "from-indigo-300 to-purple-200",
    items: [
      { emoji: "⭐", hebrew: "כוכב" }, { emoji: "🌙", hebrew: "ירח" }, { emoji: "🚀", hebrew: "טיל" },
      { emoji: "🛸", hebrew: "צלחת מעופפת" }, { emoji: "🌍", hebrew: "כדור הארץ" }, { emoji: "☀️", hebrew: "שמש" },
      { emoji: "🪐", hebrew: "כוכב לכת" }, { emoji: "👨‍🚀", hebrew: "אסטרונאוט" }, { emoji: "🌠", hebrew: "כוכב נופל" },
      { emoji: "🔭", hebrew: "טלסקופ" }, { emoji: "👽", hebrew: "חייזר" }, { emoji: "🌌", hebrew: "גלקסיה" },
    ],
  },
];

const diffConfig = {
  easy: { gridSize: 6, rounds: 6 },
  medium: { gridSize: 9, rounds: 8 },
  hard: { gridSize: 12, rounds: 10 },
};

type Phase = "intro" | "difficulty" | "playing" | "complete";

export default function TreasureHuntPage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [gridItems, setGridItems] = useState<SceneItem[]>([]);

  const config = diffConfig[difficulty];
  const currentScene = scenes[sceneIndex % scenes.length];

  const generateRound = useCallback((scIdx: number) => {
    const scene = scenes[scIdx % scenes.length];
    const items = shuffleArray([...scene.items]).slice(0, config.gridSize);
    const tIdx = Math.floor(Math.random() * items.length);
    setGridItems(items);
    setTargetIndex(tIdx);
  }, [config.gridSize]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setRound(0);
    setSceneIndex(0);
    setPhase("playing");
    generateRound(0);
  }, [generateRound]);

  const handleItemTap = useCallback((index: number) => {
    if (isLocked) return;
    setIsLocked(true);

    if (index === targetIndex) {
      playCorrect();
      setScore(s => s + 1);
      setShowCorrect(true);
      setTimeout(() => {
        setShowCorrect(false);
        const nextRound = round + 1;
        if (nextRound >= config.rounds) {
          playCheer();
          setPhase("complete");
        } else {
          const nextScene = nextRound % scenes.length;
          setSceneIndex(nextScene);
          setRound(nextRound);
          generateRound(nextScene);
        }
        setIsLocked(false);
      }, 800);
    } else {
      playWrong();
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        setIsLocked(false);
      }, 600);
    }
  }, [isLocked, targetIndex, round, config.rounds, sceneIndex, playCorrect, playWrong, playCheer, generateRound]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="text-8xl">
          🗺️
        </motion.div>
        <h1 className="text-4xl font-black">ציד אוצרות</h1>
        <p className="text-lg text-foreground/70">!מצאו את הפריט המבוקש</p>
        <BigButton onClick={() => setPhase("difficulty")} variant="success">!יאללה 🎮</BigButton>
      </div>
    );
  }

  if (phase === "difficulty") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black">🗺️ ציד אוצרות</h1>
        <DifficultySelector onSelect={startGame} />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={config.rounds}
        onPlayAgain={() => startGame(difficulty)}
        onGoHome={() => router.push("/")}
      />
    );
  }

  const target = gridItems[targetIndex];

  return (
    <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <ProgressBar current={round} total={config.rounds} />
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-foreground/50">{currentScene.name}</p>
        <motion.p
          key={round}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold mt-1"
        >
          ?איפה ה{target?.hebrew} <span className="text-3xl">{target?.emoji}</span>
        </motion.p>
      </div>

      <div className={`w-full rounded-3xl bg-gradient-to-b ${currentScene.background} p-4 shadow-inner`}>
        <div className={`grid ${config.gridSize <= 6 ? "grid-cols-3" : config.gridSize <= 9 ? "grid-cols-3" : "grid-cols-4"} gap-3`}>
          {gridItems.map((item, i) => (
            <motion.button
              key={`${round}-${i}`}
              initial={{ scale: 0, rotate: Math.random() * 20 - 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleItemTap(i)}
              className="aspect-square bg-white/60 rounded-2xl shadow-sm flex items-center justify-center
                hover:bg-white/80 active:bg-white transition-colors"
            >
              <span className="text-4xl">{item.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <CorrectAnimation show={showCorrect} />
      <TryAgainAnimation show={showWrong} />
    </div>
  );
}
