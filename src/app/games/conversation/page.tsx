"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { shuffleArray } from "@/lib/utils";

interface DialogueLine {
  speaker: "friend" | "you";
  hebrew: string;
  english: string;
  isQuestion?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  titleHebrew: string;
  emoji: string;
  setting: string;
  dialogue: DialogueLine[];
  playerAnswer: { hebrew: string; english: string; transliteration: string };
  distractors: string[];
}

const scenarios: Scenario[] = [
  {
    id: "greeting",
    title: "Meeting a Friend",
    titleHebrew: "פוגשים חבר",
    emoji: "👋",
    setting: "At the park",
    dialogue: [
      { speaker: "friend", hebrew: "!שלום", english: "Hello!", isQuestion: false },
      { speaker: "friend", hebrew: "?מה שלומך", english: "How are you?", isQuestion: true },
    ],
    playerAnswer: { hebrew: "טוב, תודה", english: "Good, thank you", transliteration: "Tov, toda" },
    distractors: ["לילה טוב", "להתראות", "סליחה"],
  },
  {
    id: "name",
    title: "What's Your Name?",
    titleHebrew: "?מה השם שלך",
    emoji: "🏷️",
    setting: "At school",
    dialogue: [
      { speaker: "friend", hebrew: "!שלום", english: "Hello!" },
      { speaker: "friend", hebrew: "?מה השם שלך", english: "What is your name?", isQuestion: true },
    ],
    playerAnswer: { hebrew: "השם שלי...", english: "My name is...", transliteration: "Ha-shem she-li..." },
    distractors: ["אני רעב", "תודה רבה", "בוקר טוב"],
  },
  {
    id: "hungry",
    title: "At the Table",
    titleHebrew: "ליד השולחן",
    emoji: "🍽️",
    setting: "At home",
    dialogue: [
      { speaker: "friend", hebrew: "?אתה רעב", english: "Are you hungry?", isQuestion: true },
    ],
    playerAnswer: { hebrew: "!כן, בבקשה", english: "Yes, please!", transliteration: "Ken, bevakasha!" },
    distractors: ["לא, תודה", "לילה טוב", "מה שלומך"],
  },
  {
    id: "play",
    title: "Let's Play!",
    titleHebrew: "!בוא נשחק",
    emoji: "🎮",
    setting: "At a friend's house",
    dialogue: [
      { speaker: "friend", hebrew: "?אתה רוצה לשחק", english: "Do you want to play?", isQuestion: true },
    ],
    playerAnswer: { hebrew: "!כן, בוא נשחק", english: "Yes, let's play!", transliteration: "Ken, bo nesakhek!" },
    distractors: ["אני עייף", "להתראות", "סליחה"],
  },
  {
    id: "thankyou",
    title: "Saying Thanks",
    titleHebrew: "אומרים תודה",
    emoji: "🎁",
    setting: "Birthday party",
    dialogue: [
      { speaker: "friend", hebrew: "!הנה מתנה בשבילך", english: "Here's a gift for you!" },
      { speaker: "friend", hebrew: "!יום הולדת שמח", english: "Happy Birthday!", isQuestion: false },
    ],
    playerAnswer: { hebrew: "!תודה רבה", english: "Thank you very much!", transliteration: "Toda raba!" },
    distractors: ["שלום", "לילה טוב", "מה שלומך"],
  },
  {
    id: "goodbye",
    title: "Saying Goodbye",
    titleHebrew: "אומרים להתראות",
    emoji: "👋",
    setting: "End of the day",
    dialogue: [
      { speaker: "friend", hebrew: "!היה כיף", english: "It was fun!" },
      { speaker: "friend", hebrew: "!להתראות", english: "Goodbye!", isQuestion: false },
    ],
    playerAnswer: { hebrew: "!להתראות, ביי", english: "Goodbye, bye!", transliteration: "Lehitraot, bye!" },
    distractors: ["בוקר טוב", "כן, בבקשה", "אני רעב"],
  },
  {
    id: "morning",
    title: "Good Morning",
    titleHebrew: "בוקר טוב",
    emoji: "🌅",
    setting: "Waking up",
    dialogue: [
      { speaker: "friend", hebrew: "!בוקר טוב", english: "Good morning!", isQuestion: false },
      { speaker: "friend", hebrew: "?ישנת טוב", english: "Did you sleep well?", isQuestion: true },
    ],
    playerAnswer: { hebrew: "!כן, תודה, בוקר טוב", english: "Yes, thanks, good morning!", transliteration: "Ken, toda, boker tov!" },
    distractors: ["לילה טוב", "להתראות", "אני רעב"],
  },
  {
    id: "sorry",
    title: "Saying Sorry",
    titleHebrew: "מתנצלים",
    emoji: "🙈",
    setting: "At the playground",
    dialogue: [
      { speaker: "friend", hebrew: "!אאוץ", english: "Ouch!" },
    ],
    playerAnswer: { hebrew: "!סליחה, את בסדר", english: "Sorry, are you OK?", transliteration: "Slikha, at beseder?" },
    distractors: ["תודה", "שלום", "בוקר טוב"],
  },
];

type Phase = "intro" | "playing" | "complete";

export default function ConversationPage() {
  const router = useRouter();
  const { speakHebrew, speakEnglish, speakBoth, speakSequence, isSpeaking, stop } = useVoice();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [scenarioOrder, setScenarioOrder] = useState<Scenario[]>([]);

  const TOTAL = 6;
  const currentScenario = scenarioOrder[scenarioIndex];

  const startGame = useCallback(() => {
    const shuffled = shuffleArray([...scenarios]).slice(0, TOTAL);
    setScenarioOrder(shuffled);
    setScenarioIndex(0);
    setScore(0);
    setPhase("playing");
    setDialogueStep(0);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    if (phase === "playing" && currentScenario && dialogueStep < currentScenario.dialogue.length) {
      const line = currentScenario.dialogue[dialogueStep];
      setTimeout(() => speakHebrew(line.hebrew), 500);
    }
    if (phase === "playing" && currentScenario && dialogueStep >= currentScenario.dialogue.length && !showAnswer) {
      setShowAnswer(true);
      const opts = shuffleArray([currentScenario.playerAnswer.hebrew, ...currentScenario.distractors]);
      setOptions(opts);
    }
  }, [phase, currentScenario, dialogueStep, showAnswer, speakHebrew]);

  const advanceDialogue = useCallback(() => {
    if (!currentScenario) return;
    if (dialogueStep + 1 <= currentScenario.dialogue.length) {
      setDialogueStep(d => d + 1);
    }
  }, [currentScenario, dialogueStep]);

  const handleAnswer = useCallback((answer: string) => {
    if (isLocked || !currentScenario) return;
    setIsLocked(true);

    if (answer === currentScenario.playerAnswer.hebrew) {
      playCorrect();
      setScore(s => s + 1);
      setShowFeedback("correct");
      speakHebrew(currentScenario.playerAnswer.hebrew);
      setTimeout(() => {
        setShowFeedback(null);
        if (scenarioIndex + 1 >= TOTAL) {
          playCheer();
          setPhase("complete");
        } else {
          setScenarioIndex(i => i + 1);
          setDialogueStep(0);
          setShowAnswer(false);
        }
        setIsLocked(false);
      }, 1500);
    } else {
      playWrong();
      setShowFeedback("wrong");
      setTimeout(() => {
        setShowFeedback(null);
        setIsLocked(false);
      }, 600);
    }
  }, [isLocked, currentScenario, scenarioIndex, playCorrect, playWrong, playCheer, speakHebrew]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl">💬</motion.div>
        <h1 className="text-3xl font-black text-center">Conversation Practice</h1>
        <h2 className="text-xl text-foreground/60 text-center">תרגול שיחה</h2>
        <p className="text-foreground/50 text-center max-w-xs">Practice real Hebrew conversations! Listen to your friend and choose the right response.</p>
        <BigButton onClick={startGame} variant="success">Let&apos;s Talk! 💬</BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={TOTAL}
        onPlayAgain={startGame}
        onGoHome={() => router.push("/")}
      />
    );
  }

  if (!currentScenario) return null;

  return (
    <div className="flex-1 flex flex-col items-center gap-4 px-4 py-2 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <ScoreDisplay score={score} />
        <ProgressBar current={scenarioIndex} total={TOTAL} />
      </div>

      <div className="bg-white/50 rounded-2xl px-4 py-2 text-center">
        <p className="text-sm text-foreground/60">{currentScenario.setting}</p>
        <p className="font-bold">{currentScenario.emoji} {currentScenario.title}</p>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-3 w-full flex-1">
        {currentScenario.dialogue.slice(0, dialogueStep + 1).map((line, i) => (
          <motion.div
            key={i}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-end gap-2"
          >
            <span className="text-3xl">👧</span>
            <div className="bg-info/10 rounded-2xl rounded-bl-none px-4 py-3 max-w-[75%]">
              <p className="text-lg font-bold">{line.hebrew}</p>
              <p className="text-sm text-foreground/50">{line.english}</p>
            </div>
            <VoiceButton onClick={() => speakHebrew(line.hebrew)} isSpeaking={isSpeaking} size="sm" />
          </motion.div>
        ))}

        {dialogueStep < currentScenario.dialogue.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
            <BigButton onClick={advanceDialogue} variant="secondary">Continue ▶</BigButton>
          </motion.div>
        )}

        {/* Player's answer section */}
        {showAnswer && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <p className="text-center text-lg font-bold mb-3">🗣️ Your turn! What do you say?</p>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <motion.button
                  key={`${scenarioIndex}-${opt}`}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(opt)}
                  className={`bg-white rounded-2xl shadow-md px-4 py-3 text-start text-lg font-bold
                    hover:shadow-lg transition-all
                    ${showFeedback === "correct" && opt === currentScenario.playerAnswer.hebrew ? "ring-3 ring-success bg-success/10" : ""}`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {showFeedback === "correct" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-end gap-2 justify-end">
            <div className="bg-success/10 rounded-2xl rounded-br-none px-4 py-3">
              <p className="text-lg font-bold text-success">{currentScenario.playerAnswer.hebrew}</p>
              <p className="text-sm text-foreground/50">{currentScenario.playerAnswer.english}</p>
              <p className="text-xs text-foreground/40 italic">{currentScenario.playerAnswer.transliteration}</p>
            </div>
            <span className="text-3xl">🧒</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showFeedback === "wrong" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} className="text-8xl">🤔</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}