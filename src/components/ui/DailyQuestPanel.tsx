"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { useLanguage } from "@/providers/LanguageProvider";

interface Props {
  compact?: boolean; // show as a collapsed strip on home page
}

export function DailyQuestPanel({ compact }: Props) {
  const { quests } = useDailyQuests();
  const { isHebrew } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!quests) return null;

  const doneCount = quests.quests.filter((q) => q.done).length;
  const totalStarReward = quests.quests.reduce((sum, q) => sum + (q.done ? q.rewardStars : 0), 0);

  if (compact) {
    return (
      <motion.button
        className="w-full rounded-2xl overflow-hidden shadow-md"
        onClick={() => setExpanded((e) => !e)}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Header strip */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-white font-black text-sm">
              {isHebrew ? "משימות יומיות" : "Daily Quests"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex gap-1">
              {quests.quests.map((q) => (
                <motion.div
                  key={q.id}
                  className="w-3 h-3 rounded-full border-2 border-white/60"
                  style={{ background: q.done ? "#fff" : "transparent" }}
                  animate={q.done ? { scale: [1, 1.4, 1] } : {}}
                />
              ))}
            </div>
            <span className="text-white font-bold text-sm">{doneCount}/3</span>
            <span className="text-white/80 text-sm">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Expanded quests */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 px-3 py-2 flex flex-col gap-2"
            >
              {quests.quests.map((q) => (
                <QuestRow key={q.id} quest={q} isHebrew={isHebrew} />
              ))}
              {quests.allDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-1"
                >
                  <p className="font-black text-orange-600 text-sm">
                    🏆 {isHebrew ? `כל המשימות הושלמו! +${totalStarReward}⭐` : `All quests done! +${totalStarReward}⭐`}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Full panel (for /daily-challenge page or standalone)
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-xl">
          {isHebrew ? "📋 משימות היום" : "📋 Today's Quests"}
        </h2>
        <span className="font-bold text-foreground/50 text-sm">{doneCount}/3</span>
      </div>
      {quests.quests.map((q) => (
        <QuestRow key={q.id} quest={q} isHebrew={isHebrew} large />
      ))}
      {quests.allDone && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl p-4 text-center"
          style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
        >
          <p className="text-white font-black text-lg">
            🏆 {isHebrew ? "כל המשימות הושלמו!" : "All quests complete!"}
          </p>
          <p className="text-white/90 text-sm mt-1">
            +{totalStarReward}⭐ {isHebrew ? "כוכבים" : "stars"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function QuestRow({
  quest,
  isHebrew,
  large,
}: {
  quest: { id: string; icon: string; labelHe: string; labelEn: string; progress: number; target: number; done: boolean; rewardStars: number };
  isHebrew: boolean;
  large?: boolean;
}) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100);

  return (
    <motion.div
      className={`flex items-center gap-3 rounded-xl ${large ? "p-3 bg-white shadow-sm" : "py-1"}`}
      animate={quest.done ? { opacity: [1, 0.7, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <span className={large ? "text-3xl" : "text-xl"}>{quest.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-bold leading-tight truncate ${large ? "text-sm" : "text-xs"} ${quest.done ? "line-through text-foreground/40" : ""}`}>
          {isHebrew ? quest.labelHe : quest.labelEn}
        </p>
        {/* Progress bar */}
        {!quest.done && quest.target > 1 && (
          <div className="mt-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #f59e0b, #f97316)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
        {quest.target > 1 && (
          <p className="text-[10px] text-foreground/40 mt-0.5">{quest.progress}/{quest.target}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {quest.done ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >✅</motion.span>
        ) : (
          <span className={`text-foreground/40 font-bold ${large ? "text-xs" : "text-[10px]"}`}>+{quest.rewardStars}⭐</span>
        )}
      </div>
    </motion.div>
  );
}
