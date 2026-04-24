"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { TeacherBubble } from "@/components/learn/TeacherBubble";
import { LessonComplete } from "@/components/learn/LessonComplete";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { englishLessons, EnglishLesson, EnglishLessonWord } from "@/lib/data/english-lessons";
import { shuffleArray, pickRandom } from "@/lib/utils";

const STORAGE_KEY = "english-learn-progress";

interface LearnProgress {
  completedLessons: string[];
  currentLesson: string;
  scores: Record<string, number>;
  wordsLearned: number;
  lastPlayed: string;
}

function loadProgress(): LearnProgress {
  if (typeof window === "undefined") return { completedLessons: [], currentLesson: "greetings-en", scores: {}, wordsLearned: 0, lastPlayed: "" };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { completedLessons: [], currentLesson: "greetings-en", scores: {}, wordsLearned: 0, lastPlayed: "" };
}

function saveProgress(data: LearnProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastPlayed: new Date().toISOString() })); } catch {}
}

type Phase = "intro" | "learn" | "practice-listen" | "practice-match" | "quiz" | "complete";

export default function EnglishLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { speakHebrew, speakEnglish, speakBoth, isSpeaking, stop } = useVoice();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const lesson = useMemo(() => englishLessons.find((l) => l.id === lessonId), [lessonId]);
  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    return englishLessons.find((l) => l.order === lesson.order + 1) || null;
  }, [lesson]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [target, setTarget] = useState<EnglishLessonWord | null>(null);
  const [questionType, setQuestionType] = useState<"listen" | "match">("listen");
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  const PRACTICE_ROUNDS = lesson ? Math.min(lesson.words.length, 6) : 6;
  const QUIZ_ROUNDS = lesson ? Math.min(lesson.words.length, 8) : 8;

  const generateQuestion = useCallback(
    (words: EnglishLessonWord[], type: "listen" | "match") => {
      const targetWord = words[Math.floor(Math.random() * words.length)];
      setTarget(targetWord);
      setQuestionType(type);

      if (type === "listen") {
        const otherEmojis = words.filter((w) => w.id !== targetWord.id).map((w) => w.emoji);
        const distractors = pickRandom(otherEmojis, Math.min(3, otherEmojis.length));
        setOptions(shuffleArray([targetWord.emoji, ...distractors]));
        setTimeout(() => speakEnglish(targetWord.english), 300);
      } else {
        const otherWords = words.filter((w) => w.id !== targetWord.id).map((w) => w.english);
        const distractors = pickRandom(otherWords, Math.min(3, otherWords.length));
        setOptions(shuffleArray([targetWord.english, ...distractors]));
      }
    },
    [speakEnglish]
  );

  useEffect(() => {
    if (phase === "intro" && lesson) {
      setTimeout(() => speakHebrew(lesson.teacherIntro), 500);
    }
    return () => stop();
  }, [phase, lesson, speakHebrew, stop]);

  useEffect(() => {
    if (phase === "learn" && lesson && lesson.words[wordIndex]) {
      const word = lesson.words[wordIndex];
      setTimeout(() => {
        speakHebrew(word.hebrew, () => {
          setTimeout(() => speakEnglish(word.english), 300);
        });
      }, 500);
    }
  }, [phase, wordIndex, lesson, speakHebrew, speakEnglish]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLocked || !target || !lesson) return;
      setIsLocked(true);

      const correct = questionType === "listen" ? answer === target.emoji : answer === target.english;

      if (correct) {
        playCorrect();
        setScore((s) => s + 1);
        setShowFeedback("correct");
        speakHebrew("!כל הכבוד");
      } else {
        playWrong();
        setShowFeedback("wrong");
        speakHebrew(target.hebrew, () => speakEnglish(target.english));
      }

      setTimeout(() => {
        setShowFeedback(null);
        const nextQ = questionIndex + 1;
        const maxRounds = phase === "practice-listen" || phase === "practice-match" ? PRACTICE_ROUNDS : QUIZ_ROUNDS;

        if (nextQ >= maxRounds) {
          if (phase === "practice-listen") {
            setQuestionIndex(0);
            setPhase("practice-match");
          } else if (phase === "practice-match") {
            setQuestionIndex(0);
            setScore(0);
            setPhase("quiz");
          } else if (phase === "quiz") {
            const finalScore = score + (correct ? 1 : 0);
            setScore(finalScore);
            playCheer();
            const progress = loadProgress();
            const newProgress: LearnProgress = {
              ...progress,
              completedLessons: [...new Set([...progress.completedLessons, lessonId])],
              currentLesson: nextLesson?.id || progress.currentLesson,
              scores: { ...progress.scores, [lessonId]: Math.max(progress.scores[lessonId] || 0, Math.ceil(finalScore / 3)) },
              wordsLearned: progress.wordsLearned + (progress.completedLessons.includes(lessonId) ? 0 : lesson.words.length),
              lastPlayed: new Date().toISOString(),
            };
            saveProgress(newProgress);
            setPhase("complete");
          }
        } else {
          setQuestionIndex(nextQ);
          if (phase === "quiz") {
            generateQuestion(lesson.words, nextQ % 2 === 0 ? "listen" : "match");
          } else {
            generateQuestion(lesson.words, questionType);
          }
        }
        setIsLocked(false);
      }, 1200);
    },
    [isLocked, target, questionType, questionIndex, phase, score, lesson, lessonId, nextLesson, playCorrect, playWrong, playCheer, speakHebrew, speakEnglish, generateQuestion, PRACTICE_ROUNDS, QUIZ_ROUNDS]
  );

  if (!lesson) {
    return <div className="flex-1 flex items-center justify-center"><BigButton onClick={() => router.push("/learn-english")} variant="primary">חזרה לשיעורים</BigButton></div>;
  }

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl">{lesson.emoji}</motion.span>
        <h1 className="text-3xl font-black text-center">{lesson.title}</h1>
        <p className="text-lg text-foreground/60 text-center">{lesson.titleEnglish}</p>
        <TeacherBubble message={lesson.teacherIntro} show isSpeaking={isSpeaking} onTap={() => speakHebrew(lesson.teacherIntro)} />
        <p className="text-foreground/50 text-sm">{lesson.words.length} מילים ללמוד</p>
        <BigButton onClick={() => { stop(); setWordIndex(0); setPhase("learn"); }} variant="success">!📚 מתחילים ללמוד</BigButton>
      </div>
    );
  }

  if (phase === "learn") {
    const word = lesson.words[wordIndex];
    return (
      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-4">
        <ProgressBar current={wordIndex + 1} total={lesson.words.length} />
        <AnimatePresence mode="wait">
          <motion.div key={wordIndex} initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center gap-3 w-full max-w-sm">
            <span className="text-7xl">{word.emoji}</span>
            <p className="text-4xl font-black text-info">{word.english}</p>
            <p className="text-lg italic text-foreground/50">{word.pronunciation}</p>
            <p className="text-xl font-bold text-foreground/70">{word.hebrew}</p>
            <div className="flex gap-3 mt-2">
              <VoiceButton onClick={() => speakEnglish(word.english)} isSpeaking={isSpeaking} size="md" label="English" />
              <VoiceButton onClick={() => { speakHebrew(word.hebrew, () => setTimeout(() => speakEnglish(word.english), 300)); }} isSpeaking={isSpeaking} size="lg" label="🔄" />
              <VoiceButton onClick={() => speakHebrew(word.hebrew)} isSpeaking={isSpeaking} size="md" label="עברית" />
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-3 mt-2">
          {wordIndex > 0 && <BigButton onClick={() => { stop(); setWordIndex((i) => i - 1); }} variant="secondary">← הקודם</BigButton>}
          <BigButton onClick={() => { stop(); if (wordIndex + 1 >= lesson.words.length) { setQuestionIndex(0); setScore(0); setPhase("practice-listen"); generateQuestion(lesson.words, "listen"); } else { setWordIndex((i) => i + 1); } }} variant="success">
            {wordIndex + 1 >= lesson.words.length ? "!🎯 לתרגול" : "→ הבא"}
          </BigButton>
        </div>
        <p className="text-sm text-foreground/40">לחצו על הרמקול לשמוע את המילה</p>
      </div>
    );
  }

  if ((phase === "practice-listen" || phase === "practice-match" || phase === "quiz") && target) {
    const maxRounds = phase === "practice-listen" || phase === "practice-match" ? PRACTICE_ROUNDS : QUIZ_ROUNDS;
    const phaseTitle = phase === "practice-listen" ? "👂 הקשיבו ומצאו" : phase === "practice-match" ? "👀 ראו ובחרו" : "🧠 !זמן חידון";

    return (
      <div className="flex-1 flex flex-col items-center gap-5 px-4 py-4">
        <div className="flex items-center justify-between w-full max-w-md">
          <span className="text-lg font-bold">{phaseTitle}</span>
          <span className="text-lg font-bold">⭐ {score}</span>
        </div>
        <ProgressBar current={questionIndex} total={maxRounds} />
        <motion.div key={`${phase}-${questionIndex}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-3">
          {questionType === "listen" ? (
            <>
              <p className="text-lg font-bold text-foreground/60">?איזו תמונה זו</p>
              <VoiceButton onClick={() => speakEnglish(target.english)} isSpeaking={isSpeaking} size="lg" label="שמעו שוב" />
              <p className="text-sm text-foreground/40 italic">{target.pronunciation}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground/60">?מה זה באנגלית</p>
              <span className="text-6xl">{target.emoji}</span>
              <p className="text-xl font-bold">{target.hebrew}</p>
            </>
          )}
        </motion.div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt, i) => (
            <motion.button key={`${questionIndex}-${opt}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(opt)}
              className={`rounded-2xl shadow-md p-5 font-bold hover:shadow-lg transition-shadow
                ${questionType === "listen" ? "bg-white text-5xl" : "bg-white text-2xl"}
                ${showFeedback === "correct" && opt === (questionType === "listen" ? target.emoji : target.english) ? "ring-4 ring-success bg-success/10" : ""}`}>
              {opt}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {showFeedback === "correct" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><span className="text-9xl">🎉</span></motion.div>}
          {showFeedback === "wrong" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} className="text-8xl">🤔</motion.span></motion.div>}
        </AnimatePresence>
      </div>
    );
  }

  if (phase === "complete") {
    return <LessonComplete show lessonTitle={lesson.title + " - " + lesson.titleEnglish} wordsLearned={lesson.words.length} score={score} total={QUIZ_ROUNDS} hasNext={!!nextLesson} onNext={() => nextLesson && router.push(`/learn-english/${nextLesson.id}`)} onReplay={() => { setPhase("intro"); setScore(0); setWordIndex(0); setQuestionIndex(0); }} onHome={() => router.push("/learn-english")} />;
  }

  return null;
}
