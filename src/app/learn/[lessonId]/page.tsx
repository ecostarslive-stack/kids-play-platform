"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { TeacherBubble } from "@/components/learn/TeacherBubble";
import { WordCard } from "@/components/learn/WordCard";
import { LessonComplete } from "@/components/learn/LessonComplete";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessons, Lesson, LessonWord } from "@/lib/data/lessons";
import { shuffleArray, pickRandom } from "@/lib/utils";

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

function saveProgress(data: LearnProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastPlayed: new Date().toISOString() }));
  } catch {}
}

type Phase = "intro" | "learn" | "practice-listen" | "practice-match" | "quiz" | "complete";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { speakHebrew, speakEnglish, speakBoth, isSpeaking, stop } = useVoice();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const lesson = useMemo(() => lessons.find((l) => l.id === lessonId), [lessonId]);
  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    return lessons.find((l) => l.order === lesson.order + 1) || null;
  }, [lesson]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [target, setTarget] = useState<LessonWord | null>(null);
  const [questionType, setQuestionType] = useState<"listen" | "match">("listen");
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const PRACTICE_ROUNDS = lesson ? Math.min(lesson.words.length, 6) : 6;
  const QUIZ_ROUNDS = lesson ? Math.min(lesson.words.length, 8) : 8;

  // Generate a question
  const generateQuestion = useCallback(
    (words: LessonWord[], type: "listen" | "match") => {
      const targetWord = words[Math.floor(Math.random() * words.length)];
      setTarget(targetWord);
      setQuestionType(type);

      if (type === "listen") {
        // Hear Hebrew, pick emoji
        const otherEmojis = words.filter((w) => w.id !== targetWord.id).map((w) => w.emoji);
        const distractors = pickRandom(otherEmojis, Math.min(3, otherEmojis.length));
        setOptions(shuffleArray([targetWord.emoji, ...distractors]));
        // Speak the Hebrew word
        setTimeout(() => speakHebrew(targetWord.hebrew), 300);
      } else {
        // See emoji, pick Hebrew word
        const otherWords = words.filter((w) => w.id !== targetWord.id).map((w) => w.hebrew);
        const distractors = pickRandom(otherWords, Math.min(3, otherWords.length));
        setOptions(shuffleArray([targetWord.hebrew, ...distractors]));
      }
    },
    [speakHebrew]
  );

  // Start intro voice
  useEffect(() => {
    if (phase === "intro" && lesson) {
      setTimeout(() => speakEnglish(lesson.teacherIntro), 500);
    }
    return () => stop();
  }, [phase, lesson, speakEnglish, stop]);

  // Auto-speak current word in learn phase
  useEffect(() => {
    if (phase === "learn" && lesson && lesson.words[wordIndex]) {
      const word = lesson.words[wordIndex];
      setTimeout(() => {
        speakEnglish(word.english, () => {
          setTimeout(() => speakHebrew(word.hebrew), 300);
        });
      }, 500);
    }
  }, [phase, wordIndex, lesson, speakEnglish, speakHebrew]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLocked || !target) return;
      setIsLocked(true);

      const correct =
        questionType === "listen"
          ? answer === target.emoji
          : answer === target.hebrew;

      if (correct) {
        playCorrect();
        setScore((s) => s + 1);
        setShowFeedback("correct");
        speakEnglish("Great job!");
      } else {
        playWrong();
        setShowFeedback("wrong");
        speakBoth("The answer is", target.hebrew);
      }

      setTimeout(() => {
        setShowFeedback(null);
        const nextQ = questionIndex + 1;
        const maxRounds =
          phase === "practice-listen" || phase === "practice-match"
            ? PRACTICE_ROUNDS
            : QUIZ_ROUNDS;

        if (nextQ >= maxRounds) {
          // Move to next phase
          if (phase === "practice-listen") {
            setQuestionIndex(0);
            setPhase("practice-match");
          } else if (phase === "practice-match") {
            setQuestionIndex(0);
            setTotalQuestions(score + (correct ? 1 : 0));
            setScore(0);
            setPhase("quiz");
          } else if (phase === "quiz") {
            // Quiz done
            const finalScore = score + (correct ? 1 : 0);
            setScore(finalScore);
            playCheer();

            // Save progress
            const progress = loadProgress();
            const newProgress: LearnProgress = {
              ...progress,
              completedLessons: [...new Set([...progress.completedLessons, lessonId])],
              currentLesson: nextLesson?.id || progress.currentLesson,
              scores: { ...progress.scores, [lessonId]: Math.max(progress.scores[lessonId] || 0, Math.ceil(finalScore / 3)) },
              wordsLearned: progress.wordsLearned + (progress.completedLessons.includes(lessonId) ? 0 : lesson!.words.length),
              lastPlayed: new Date().toISOString(),
            };
            saveProgress(newProgress);
            setPhase("complete");
          }
        } else {
          setQuestionIndex(nextQ);
          if (phase === "quiz") {
            // Alternate question types in quiz
            generateQuestion(lesson!.words, nextQ % 2 === 0 ? "listen" : "match");
          } else {
            generateQuestion(lesson!.words, questionType);
          }
        }
        setIsLocked(false);
      }, 1200);
    },
    [
      isLocked, target, questionType, questionIndex, phase, score, lesson, lessonId, nextLesson,
      playCorrect, playWrong, playCheer, speakEnglish, speakBoth, generateQuestion,
      PRACTICE_ROUNDS, QUIZ_ROUNDS,
    ]
  );

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <BigButton onClick={() => router.push("/learn")} variant="primary">Back to Lessons</BigButton>
      </div>
    );
  }

  // === INTRO PHASE ===
  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="text-8xl"
        >
          {lesson.emoji}
        </motion.span>
        <h1 className="text-3xl font-black text-center">{lesson.title}</h1>
        <p className="text-lg text-foreground/60 text-center">{lesson.titleHebrew}</p>

        <TeacherBubble
          message={lesson.teacherIntro}
          show
          isSpeaking={isSpeaking}
          onTap={() => speakEnglish(lesson.teacherIntro)}
        />

        <p className="text-foreground/50 text-sm">{lesson.words.length} words to learn</p>

        <BigButton
          onClick={() => {
            stop();
            setWordIndex(0);
            setPhase("learn");
          }}
          variant="success"
        >
          Let&apos;s Learn! 📚
        </BigButton>
      </div>
    );
  }

  // === LEARN PHASE (Word Cards) ===
  if (phase === "learn") {
    const word = lesson.words[wordIndex];
    return (
      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-4">
        <ProgressBar current={wordIndex + 1} total={lesson.words.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="w-full flex justify-center"
          >
            <WordCard
              hebrew={word.hebrew}
              english={word.english}
              transliteration={word.transliteration}
              emoji={word.emoji}
              isSpeaking={isSpeaking}
              isActive
              onPlayHebrew={() => speakHebrew(word.hebrew)}
              onPlayEnglish={() => speakEnglish(word.english)}
              onPlayBoth={() => speakBoth(word.english, word.hebrew)}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-2">
          {wordIndex > 0 && (
            <BigButton onClick={() => { stop(); setWordIndex((i) => i - 1); }} variant="secondary">
              ← Back
            </BigButton>
          )}
          <BigButton
            onClick={() => {
              stop();
              if (wordIndex + 1 >= lesson.words.length) {
                setQuestionIndex(0);
                setScore(0);
                setPhase("practice-listen");
                generateQuestion(lesson.words, "listen");
              } else {
                setWordIndex((i) => i + 1);
              }
            }}
            variant="success"
          >
            {wordIndex + 1 >= lesson.words.length ? "Practice! 🎯" : "Next →"}
          </BigButton>
        </div>

        <p className="text-sm text-foreground/40">
          Tap the speakers to hear the word
        </p>
      </div>
    );
  }

  // === PRACTICE & QUIZ PHASES ===
  if ((phase === "practice-listen" || phase === "practice-match" || phase === "quiz") && target) {
    const maxRounds =
      phase === "practice-listen" || phase === "practice-match"
        ? PRACTICE_ROUNDS
        : QUIZ_ROUNDS;

    const phaseTitle =
      phase === "practice-listen"
        ? "Listen & Find"
        : phase === "practice-match"
        ? "See & Say"
        : "Quiz Time!";

    const phaseEmoji =
      phase === "practice-listen" ? "👂" : phase === "practice-match" ? "👀" : "🧠";

    return (
      <div className="flex-1 flex flex-col items-center gap-5 px-4 py-4">
        <div className="flex items-center justify-between w-full max-w-md">
          <span className="text-lg font-bold">{phaseEmoji} {phaseTitle}</span>
          <span className="text-lg font-bold">⭐ {score}</span>
        </div>

        <ProgressBar current={questionIndex} total={maxRounds} />

        {/* Question */}
        <motion.div
          key={`${phase}-${questionIndex}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-3"
        >
          {questionType === "listen" ? (
            <>
              <p className="text-lg font-bold text-foreground/60">Which picture is this?</p>
              <VoiceButton
                onClick={() => speakHebrew(target.hebrew)}
                isSpeaking={isSpeaking}
                size="lg"
                label="Listen again"
              />
              <p className="text-sm text-foreground/40 italic">{target.transliteration}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground/60">What is this in Hebrew?</p>
              <span className="text-6xl">{target.emoji}</span>
              <p className="text-xl font-bold">{target.english}</p>
            </>
          )}
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt, i) => (
            <motion.button
              key={`${questionIndex}-${opt}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(opt)}
              className={`rounded-2xl shadow-md p-5 font-bold hover:shadow-lg transition-shadow
                ${questionType === "listen"
                  ? "bg-white text-5xl"
                  : "bg-white text-2xl"
                }
                ${showFeedback === "correct" && opt === (questionType === "listen" ? target.emoji : target.hebrew)
                  ? "ring-4 ring-success bg-success/10"
                  : ""
                }
                ${showFeedback === "wrong" && opt === (questionType === "listen" ? target.emoji : target.hebrew)
                  ? "ring-4 ring-warning bg-warning/10"
                  : ""
                }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {showFeedback === "correct" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <span className="text-9xl">🎉</span>
            </motion.div>
          )}
          {showFeedback === "wrong" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} className="text-8xl">🤔</motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === COMPLETE ===
  if (phase === "complete") {
    return (
      <LessonComplete
        show
        lessonTitle={lesson.title}
        wordsLearned={lesson.words.length}
        score={score}
        total={QUIZ_ROUNDS}
        hasNext={!!nextLesson}
        onNext={() => nextLesson && router.push(`/learn/${nextLesson.id}`)}
        onReplay={() => {
          setPhase("intro");
          setScore(0);
          setWordIndex(0);
          setQuestionIndex(0);
        }}
        onHome={() => router.push("/learn")}
      />
    );
  }

  return null;
}
