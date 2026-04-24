"use client";

import { motion } from "framer-motion";
import { VoiceButton } from "@/components/ui/VoiceButton";

interface WordCardProps {
  hebrew: string;
  english: string;
  transliteration: string;
  emoji: string;
  onPlayHebrew: () => void;
  onPlayEnglish: () => void;
  onPlayBoth: () => void;
  isSpeaking: boolean;
  isActive?: boolean;
}

export function WordCard({
  hebrew,
  english,
  transliteration,
  emoji,
  onPlayHebrew,
  onPlayEnglish,
  onPlayBoth,
  isSpeaking,
  isActive = false,
}: WordCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center gap-3 w-full max-w-sm
        ${isActive ? "ring-4 ring-info" : ""}`}
    >
      <span className="text-7xl">{emoji}</span>

      <div className="text-center">
        <p className="text-4xl font-black text-game-purple">{hebrew}</p>
        <p className="text-lg text-foreground/50 italic">{transliteration}</p>
        <p className="text-xl font-bold text-foreground/70 mt-1">{english}</p>
      </div>

      <div className="flex gap-3 mt-2">
        <VoiceButton onClick={onPlayHebrew} isSpeaking={isSpeaking} size="md" label="\u05E2\u05D1\u05E8\u05D9\u05EA" />
        <VoiceButton onClick={onPlayBoth} isSpeaking={isSpeaking} size="lg" label="\uD83D\uDD04" />
        <VoiceButton onClick={onPlayEnglish} isSpeaking={isSpeaking} size="md" label="English" />
      </div>
    </motion.div>
  );
}
