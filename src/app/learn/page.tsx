"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { lessons } from "@/lib/data/lessons";
import { BigButton } from "@/components/ui/BigButton";

const STORAGE_KEY = "hebrew-learn-progress";

interface LearnProgress {
  completedLessons: string[];
  currentLesson: string;
  scores: Record<string, number>;
  wordsLearned: number;
  lastPlayed: string;
}

function loadProgress(): LearnProgress {
  if (typeof window === "undefined") return { completedLessons: [], currentLesson: "greetings", scores: {}, wordsLearned: 0, lastPlayed: "" };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { completedLessons: [], currentLesson: "greetings", scores: {}, wordsLearned: 0, lastPlayed: "" };
}

const categoryColors: Record<string, string> = {
  basics: "from-blue-400 to-blue-500",
  people: "from-pink-400 to-rose-500",
  nature: "from-green-400 to-emerald-500",
  daily: "from-orange-400 to-amber-500",
};

export default function LearnPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress>(() => loadProgress());

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const totalWords = lessons.reduce((sum, l) => sum + l.words.length, 0);
  const completedCount = progress.completedLessons.length;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6 min-h-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-black">🎓 ללמוד עברית</h1>
        <p className="text-foreground/60 mt-1">!המסע שלכם לדיבור בעברית</p>
      </div>

      {/* Progress overview */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex gap-6 justify-center text-center">
        <div>
          <p className="text-2xl font-black text-game-purple">{completedCount}/{lessons.length}</p>
          <p className="text-xs text-foreground/60">שיעורים</p>
        </div>
        <div>
          <p className="text-2xl font-black text-success">{progress.wordsLearned}</p>
          <p className="text-xs text-foreground/60">מילים</p>
        </div>
        <div>
          <p className="text-2xl font-black text-warning">
            {Object.values(progress.scores).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-xs text-foreground/60">⭐ כוכבים</p>
        </div>
      </div>

      {totalWords > 0 && (
        <p className="text-xs text-foreground/40 -mt-4">
          {totalWords} מילים סה&quot;כ במסלול
        </p>
      )}

      {/* Lesson Map */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {lessons.map((lesson, i) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === progress.currentLesson;
          const isUnlocked = isCompleted || isCurrent ||
            (i === 0) ||
            progress.completedLessons.includes(lessons[i - 1]?.id);

          return (
            <motion.button
              key={lesson.id}
              initial={{ x: i % 2 === 0 ? -40 : 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
              onClick={() => isUnlocked && router.push(`/learn/${lesson.id}`)}
              disabled={!isUnlocked}
              className={`rounded-2xl p-4 flex items-center gap-4 shadow-md transition-all text-start
                ${isCompleted
                  ? "bg-gradient-to-l " + categoryColors[lesson.category] + " text-white"
                  : isCurrent
                  ? "bg-white ring-3 ring-info shadow-lg"
                  : isUnlocked
                  ? "bg-white hover:shadow-lg"
                  : "bg-gray-100 opacity-50"
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${isCompleted ? "bg-white/20" : "bg-gray-100"}`}>
                {isUnlocked ? lesson.emoji : "🔒"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{lesson.title}</span>
                  {isCurrent && !isCompleted && (
                    <span className="text-xs bg-info/20 text-info px-2 py-0.5 rounded-full font-bold">חדש</span>
                  )}
                </div>
                <p className={`text-sm ${isCompleted ? "text-white/80" : "text-foreground/60"}`}>
                  {lesson.description}
                </p>
                <p className={`text-xs mt-0.5 ${isCompleted ? "text-white/60" : "text-foreground/40"}`}>
                  {lesson.words.length} מילים · {lesson.phrases.length} ביטויים
                </p>
              </div>
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <div className="flex">
                    {Array.from({ length: Math.min(progress.scores[lesson.id] || 0, 3) }).map((_, j) => (
                      <span key={j} className="text-lg">⭐</span>
                    ))}
                  </div>
                ) : isUnlocked ? (
                  <span className="text-2xl">▶️</span>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Back to games */}
      <BigButton onClick={() => router.push("/")} variant="secondary">
        🏠 חזרה למשחקים
      </BigButton>
    </div>
  );
}
