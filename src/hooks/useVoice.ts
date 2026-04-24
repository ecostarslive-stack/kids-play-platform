"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface UseVoiceOptions {
  hebrewRate?: number;
  englishRate?: number;
  hebrewPitch?: number;
  englishPitch?: number;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const {
    hebrewRate = 0.75,
    englishRate = 0.85,
    hebrewPitch = 1.1,
    englishPitch = 1.0,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang: "he-IL" | "en-US", onEnd?: () => void) => {
      if (!isSupported) return;
      if (typeof window !== "undefined" && window.localStorage.getItem("kids-games-muted") === "1") {
        onEnd?.();
        return;
      }
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = lang === "he-IL" ? hebrewRate : englishRate;
      utterance.pitch = lang === "he-IL" ? hebrewPitch : englishPitch;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;

      // Small delay to ensure synthesis is ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [isSupported, stop, hebrewRate, englishRate, hebrewPitch, englishPitch]
  );

  const speakHebrew = useCallback(
    (text: string, onEnd?: () => void) => speak(text, "he-IL", onEnd),
    [speak]
  );

  const speakEnglish = useCallback(
    (text: string, onEnd?: () => void) => speak(text, "en-US", onEnd),
    [speak]
  );

  const speakBoth = useCallback(
    (english: string, hebrew: string, onEnd?: () => void) => {
      speakEnglish(english, () => {
        setTimeout(() => {
          speakHebrew(hebrew, onEnd);
        }, 400);
      });
    },
    [speakEnglish, speakHebrew]
  );

  const speakSequence = useCallback(
    (items: Array<{ text: string; lang: "he-IL" | "en-US" }>, onEnd?: () => void) => {
      let index = 0;
      const speakNext = () => {
        if (index >= items.length) {
          onEnd?.();
          return;
        }
        const item = items[index];
        index++;
        speak(item.text, item.lang, () => {
          setTimeout(speakNext, 300);
        });
      };
      speakNext();
    },
    [speak]
  );

  return {
    speakHebrew,
    speakEnglish,
    speakBoth,
    speakSequence,
    stop,
    isSpeaking,
    isSupported,
  };
}
