"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { shuffleArray } from "@/lib/utils";

interface DailyWord {
  hebrew: string;
  english: string;
  transliteration: string;
  emoji: string;
  funFact: string;
  category: string;
}

const wordBank: DailyWord[] = [
  { hebrew: "שמש", english: "Sun", transliteration: "She-mesh", emoji: "☀️", funFact: "The sun rises every morning in Israel too!", category: "Nature" },
  { hebrew: "ירח", english: "Moon", transliteration: "Ya-re-akh", emoji: "🌙", funFact: "The Hebrew calendar follows the moon!", category: "Nature" },
  { hebrew: "כלב", english: "Dog", transliteration: "Ke-lev", emoji: "🐶", funFact: "Dogs are very popular pets in Israel!", category: "Animals" },
  { hebrew: "חתול", english: "Cat", transliteration: "Kha-tul", emoji: "🐱", funFact: "There are many street cats in Israel!", category: "Animals" },
  { hebrew: "מים", english: "Water", transliteration: "Ma-yim", emoji: "💧", funFact: "Water is very precious in Israel!", category: "Food" },
  { hebrew: "לחם", english: "Bread", transliteration: "Le-khem", emoji: "🍞", funFact: "Challah is a special braided bread!", category: "Food" },
  { hebrew: "פרח", english: "Flower", transliteration: "Pe-rakh", emoji: "🌸", funFact: "Israel has beautiful wildflowers in spring!", category: "Nature" },
  { hebrew: "כוכב", english: "Star", transliteration: "Ko-khav", emoji: "⭐", funFact: "The Star of David has 6 points!", category: "Nature" },
  { hebrew: "שלום", english: "Peace / Hello", transliteration: "Sha-lom", emoji: "✌️", funFact: "Shalom means both hello, goodbye, AND peace!", category: "Greetings" },
  { hebrew: "אהבה", english: "Love", transliteration: "A-ha-va", emoji: "❤️", funFact: "Love is one of the most beautiful words in Hebrew!", category: "Feelings" },
  { hebrew: "משפחה", english: "Family", transliteration: "Mish-pa-kha", emoji: "👨‍👩‍👧‍👦", funFact: "Family is very important in Israeli culture!", category: "People" },
  { hebrew: "חבר", english: "Friend", transliteration: "Kha-ver", emoji: "🤝", funFact: "Making friends is easy when you speak Hebrew!", category: "People" },
  { hebrew: "ספר", english: "Book", transliteration: "Se-fer", emoji: "📖", funFact: "Israel publishes more books per person than any country!", category: "Things" },
  { hebrew: "בית", english: "House", transliteration: "Ba-yit", emoji: "🏠", funFact: "Many homes in Israel have flat roofs!", category: "Things" },
  { hebrew: "גלידה", english: "Ice Cream", transliteration: "Gli-da", emoji: "🍦", funFact: "Israelis love ice cream, especially in summer!", category: "Food" },
  { hebrew: "ים", english: "Sea", transliteration: "Yam", emoji: "🌊", funFact: "Israel has the Mediterranean Sea and the Dead Sea!", category: "Nature" },
  { hebrew: "שמח", english: "Happy", transliteration: "Sa-me-akh", emoji: "😊", funFact: "Being happy is called 'simcha' in Hebrew!", category: "Feelings" },
  { hebrew: "גיבור", english: "Hero", transliteration: "Gi-bor", emoji: "🦸", funFact: "You're a hero for learning Hebrew!", category: "People" },
  { hebrew: "קשת", english: "Rainbow", transliteration: "Ke-shet", emoji: "🌈", funFact: "Rainbows appear after rain in Israel too!", category: "Nature" },
  { hebrew: "מוזיקה", english: "Music", transliteration: "Mu-zi-ka", emoji: "🎵", funFact: "Israeli music mixes many cultures!", category: "Things" },
  { hebrew: "ריקוד", english: "Dance", transliteration: "Ri-kud", emoji: "💃", funFact: "The Hora is a famous Israeli circle dance!", category: "Things" },
  { hebrew: "תפוח", english: "Apple", transliteration: "Ta-pu-akh", emoji: "🍎", funFact: "Apples with honey are eaten on the Jewish New Year!", category: "Food" },
  { hebrew: "פרפר", english: "Butterfly", transliteration: "Par-par", emoji: "🦋", funFact: "Say it twice: par-par! It sounds fun!", category: "Animals" },
  { hebrew: "אריה", english: "Lion", transliteration: "Ar-ye", emoji: "🦁", funFact: "The lion is a symbol of Jerusalem!", category: "Animals" },
  { hebrew: "נסיכה", english: "Princess", transliteration: "Ne-si-kha", emoji: "👸", funFact: "Every girl is a princess - nesikha!", category: "People" },
  { hebrew: "אבא", english: "Dad", transliteration: "A-ba", emoji: "👨", funFact: "Abba is one of the first words babies say!", category: "Family" },
  { hebrew: "אמא", english: "Mom", transliteration: "I-ma", emoji: "👩", funFact: "Ima is one of the first words babies say!", category: "Family" },
  { hebrew: "תודה", english: "Thank You", transliteration: "To-da", emoji: "🙏", funFact: "Always say toda - people love hearing it!", category: "Greetings" },
  { hebrew: "יופי", english: "Beautiful / Great", transliteration: "Yo-fi", emoji: "✨", funFact: "Israelis say 'yofi' to mean 'great' or 'cool'!", category: "Feelings" },
  { hebrew: "סבבה", english: "Cool / Alright", transliteration: "Sa-ba-ba", emoji: "😎", funFact: "Sababa is Israeli slang for 'cool' or 'no problem'!", category: "Slang" },
];

const STORAGE_KEY = "daily-word-collection";

function getDayIndex(): number {
  const start = new Date(2025, 0, 1).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) % wordBank.length;
}

function loadCollection(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveCollection(words: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); } catch {}
}

type Phase = "reveal" | "learn" | "quiz" | "collection";

export default function DailyWordPage() {
  const router = useRouter();
  const { speakHebrew, speakEnglish, speakBoth, isSpeaking } = useVoice();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const todayWord = useMemo(() => wordBank[getDayIndex()], []);
  const [phase, setPhase] = useState<Phase>("reveal");
  const [revealed, setRevealed] = useState(false);
  const [collection, setCollection] = useState<string[]>(() => loadCollection());
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (!collection.includes(todayWord.hebrew)) {
      const updated = [...new Set([...collection, todayWord.hebrew])];
      setCollection(updated);
      saveCollection(updated);
    }
  }, [todayWord, collection]);

  const revealWord = useCallback(() => {
    setRevealed(true);
    setTimeout(() => speakBoth(todayWord.english, todayWord.hebrew), 500);
  }, [todayWord, speakBoth]);

  const startQuiz = useCallback(() => {
    const others = wordBank.filter(w => w.hebrew !== todayWord.hebrew).map(w => w.english);
    const distractors = shuffleArray(others).slice(0, 3);
    setQuizOptions(shuffleArray([todayWord.english, ...distractors]));
    setPhase("quiz");
    setTimeout(() => speakHebrew(todayWord.hebrew), 300);
  }, [todayWord, speakHebrew]);

  const handleQuizAnswer = useCallback((answer: string) => {
    if (quizDone) return;
    if (answer === todayWord.english) {
      playCorrect();
      setShowFeedback("correct");
      setQuizDone(true);
      playCheer();
    } else {
      playWrong();
      setShowFeedback("wrong");
      setTimeout(() => setShowFeedback(null), 600);
    }
  }, [todayWord, quizDone, playCorrect, playWrong, playCheer]);

  if (phase === "collection") {
    const collectedWords = wordBank.filter(w => collection.includes(w.hebrew));
    return (
      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-4">
        <h1 className="text-2xl font-black">📚 My Word Collection</h1>
        <p className="text-foreground/60">{collectedWords.length} / {wordBank.length} words collected</p>
        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
          {wordBank.map((word) => {
            const collected = collection.includes(word.hebrew);
            return (
              <motion.button
                key={word.hebrew}
                whileTap={collected ? { scale: 0.95 } : {}}
                onClick={() => collected && speakBoth(word.english, word.hebrew)}
                className={`rounded-xl p-2 text-center shadow-sm
                  ${collected ? "bg-white" : "bg-gray-100 opacity-40"}`}
              >
                <span className="text-2xl block">{collected ? word.emoji : "❓"}</span>
                <span className="text-xs font-bold block">{collected ? word.hebrew : "?"}</span>
              </motion.button>
            );
          })}
        </div>
        <BigButton onClick={() => setPhase("reveal")} variant="secondary">← Back</BigButton>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <h2 className="text-2xl font-black">🧠 Quick Quiz!</h2>
        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-3">
          <p className="text-lg text-foreground/60">What does this mean?</p>
          <p className="text-4xl font-black text-game-purple">{todayWord.hebrew}</p>
          <VoiceButton onClick={() => speakHebrew(todayWord.hebrew)} isSpeaking={isSpeaking} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {quizOptions.map((opt, i) => (
            <motion.button
              key={opt}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuizAnswer(opt)}
              className={`bg-white rounded-2xl shadow-md p-4 text-lg font-bold transition-all
                ${quizDone && opt === todayWord.english ? "ring-4 ring-success bg-success/10" : ""}
                ${showFeedback === "wrong" && opt !== todayWord.english ? "" : ""}`}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        {quizDone && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
            <span className="text-5xl">🎉</span>
            <p className="text-xl font-black text-success">Correct!</p>
            <div className="flex gap-3">
              <BigButton onClick={() => setPhase("collection")} variant="secondary">📚 Collection</BigButton>
              <BigButton onClick={() => router.push("/")} variant="success">🏠 Home</BigButton>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Reveal phase
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-black text-center">
        ✨ Word of the Day
      </motion.h1>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-game-purple to-game-pink rounded-3xl p-12 shadow-xl cursor-pointer"
            onClick={revealWord}
          >
            <span className="text-7xl block text-center">🎁</span>
            <p className="text-white text-lg font-bold mt-4">Tap to reveal!</p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-3 max-w-sm w-full"
          >
            <span className="text-7xl">{todayWord.emoji}</span>
            <p className="text-5xl font-black text-game-purple">{todayWord.hebrew}</p>
            <p className="text-lg italic text-foreground/50">{todayWord.transliteration}</p>
            <p className="text-2xl font-bold">{todayWord.english}</p>

            <VoiceButton
              onClick={() => speakBoth(todayWord.english, todayWord.hebrew)}
              isSpeaking={isSpeaking}
              size="lg"
              label="Listen"
            />

            <div className="bg-info/10 rounded-xl p-3 mt-2">
              <p className="text-sm text-info font-bold">💡 {todayWord.funFact}</p>
            </div>

            <p className="text-xs text-foreground/40 mt-1">#{todayWord.category}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-3">
          <BigButton onClick={startQuiz} variant="success">🧠 Quiz Me!</BigButton>
          <BigButton onClick={() => setPhase("collection")} variant="secondary">📚 Collection</BigButton>
        </motion.div>
      )}
    </div>
  );
}