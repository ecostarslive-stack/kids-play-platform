"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AVATARS } from "@/lib/usePlayerStore";
import { useLanguage } from "@/providers/LanguageProvider";

interface Props {
  onDone: (name: string, avatarId: string) => void;
}

export function AvatarOnboarding({ onDone }: Props) {
  const { isHebrew } = useLanguage();
  const [step, setStep] = useState<"avatar" | "name">("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState("lion");
  const [name, setName] = useState("");

  const handleAvatarNext = () => setStep("name");

  const handleDone = () => {
    const finalName = name.trim() || (isHebrew ? "חבר" : "Friend");
    onDone(finalName, selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Floating stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["⭐","🌟","✨","💫"].map((s, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            style={{ left: `${15 + i * 22}%`, top: `${10 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.7 }}
          >
            {s}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "avatar" ? (
          <motion.div
            key="avatar-step"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h1 className="text-3xl font-black text-white text-center drop-shadow-lg">
              {isHebrew ? "!ברוך הבא" : "Welcome!"}
            </h1>
            <p className="text-lg text-white/90 font-bold text-center">
              {isHebrew ? "בחר/י את הגיבור שלך" : "Choose your hero"}
            </p>

            {/* Avatar grid */}
            <div className="grid grid-cols-4 gap-3 w-full">
              {AVATARS.map((av) => (
                <motion.button
                  key={av.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl p-2 aspect-square text-3xl transition-all
                    ${selectedAvatar === av.id
                      ? "bg-white shadow-xl scale-110 ring-4 ring-yellow-300"
                      : "bg-white/30 hover:bg-white/50"
                    }`}
                >
                  <span>{av.emoji}</span>
                </motion.button>
              ))}
            </div>

            {/* Selected preview */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">
                {AVATARS.find(a => a.id === selectedAvatar)?.emoji}
              </span>
              <span className="text-white font-bold text-lg">
                {isHebrew
                  ? AVATARS.find(a => a.id === selectedAvatar)?.label
                  : AVATARS.find(a => a.id === selectedAvatar)?.labelEn}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAvatarNext}
              className="w-full bg-white text-purple-600 font-black text-xl py-4 rounded-2xl shadow-lg"
            >
              {isHebrew ? "!בחרתי" : "This one!"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="name-step"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <span className="text-6xl">
              {AVATARS.find(a => a.id === selectedAvatar)?.emoji}
            </span>
            <h2 className="text-2xl font-black text-white text-center drop-shadow-lg">
              {isHebrew ? "מה השם שלך?" : "What's your name?"}
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDone()}
              placeholder={isHebrew ? "שם הילד/ה" : "Your name"}
              maxLength={16}
              className="w-full text-center text-2xl font-black rounded-2xl py-4 px-6 outline-none border-4 border-yellow-300 focus:border-yellow-400 shadow-lg bg-white text-purple-700"
              autoFocus
            />

            <p className="text-white/80 text-sm">
              {isHebrew ? "(אפשר לדלג ולהמשיך)" : "(you can skip)"}
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="w-full bg-yellow-300 text-purple-700 font-black text-xl py-4 rounded-2xl shadow-lg"
            >
              {isHebrew ? "!יאללה נשחק" : "Let's Play!"}
            </motion.button>

            <button
              onClick={() => setStep("avatar")}
              className="text-white/70 underline text-sm"
            >
              {isHebrew ? "חזרה" : "Back"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
