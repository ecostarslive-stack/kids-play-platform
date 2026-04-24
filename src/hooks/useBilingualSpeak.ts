"use client";

import { useCallback, useRef } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

/**
 * Bilingual speech hook — the core of language immersion.
 *
 * Strategy:
 *  - If app language = Hebrew  → speak Hebrew first (known), then English (learning)
 *  - If app language = English → speak English first (known), then Hebrew (learning)
 *
 * This is backed by research: hear known language for context, then target language.
 * Speed: 0.9 — natural, clear, not slow-talker style.
 *
 * Usage:
 *   const { speakBilingual, speakWord, speakNav } = useBilingualSpeak();
 *   speakBilingual("כלב", "Dog");  // speaks both languages in sequence
 *   speakWord({ he: "כלב", en: "Dog" }); // same, type-safe
 *   speakNav({ he: "דף הבית", en: "Home" }); // page navigation announce
 */

interface BilingualWord {
  he: string;
  en: string;
}

const PAUSE_MS = 420; // gap between languages

function speak(text: string, lang: "he-IL" | "en-US", rate = 0.9, pitch = 1.1): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function useBilingualSpeak() {
  const { isHebrew } = useLanguage();
  const queueRef = useRef<boolean>(false);

  /**
   * Speak a word in both languages.
   * Known language first → slight pause → learning language.
   */
  const speakBilingual = useCallback(async (he: string, en: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    queueRef.current = true;

    if (isHebrew) {
      // Hebrew speaker learning English
      await speak(he, "he-IL", 0.9, 1.1);
      await new Promise(r => setTimeout(r, PAUSE_MS));
      await speak(en, "en-US", 0.9, 1.15);
    } else {
      // English speaker learning Hebrew
      await speak(en, "en-US", 0.9, 1.15);
      await new Promise(r => setTimeout(r, PAUSE_MS));
      await speak(he, "he-IL", 0.9, 1.1);
    }
    queueRef.current = false;
  }, [isHebrew]);

  /** Speak just one word in the current language only */
  const speakSingle = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const lang = isHebrew ? "he-IL" : "en-US";
    speak(text, lang, 0.9, 1.1);
  }, [isHebrew]);

  /** Word object version */
  const speakWord = useCallback((word: BilingualWord) => {
    speakBilingual(word.he, word.en);
  }, [speakBilingual]);

  /** Page/nav announcement — slightly faster, once per direction */
  const speakNav = useCallback((word: BilingualWord) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Nav: say target language (the one they're learning) — reinforces vocabulary
    const [text, lang] = isHebrew
      ? [word.en, "en-US" as const]
      : [word.he, "he-IL" as const];
    speak(text, lang, 0.95, 1.1);
  }, [isHebrew]);

  const cancelSpeak = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speakBilingual, speakWord, speakSingle, speakNav, cancelSpeak };
}
