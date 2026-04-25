"use client";

import { useCallback } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { speakText, cancelSpeech } from "@/lib/voice/ttsEngine";

/**
 * Bilingual speech hook — the core of language immersion.
 *
 * Strategy:
 *  - If app language = Hebrew  → speak Hebrew first (known), then English (learning)
 *  - If app language = English → speak English first (known), then Hebrew (learning)
 *
 * Backed by research: hear known language for context, then target language.
 * Speed: 0.9 — natural, clear, not slow-talker style.
 *
 * Provider is abstracted via ttsEngine — can be "browser" or "azure".
 * Switch via NEXT_PUBLIC_TTS_PROVIDER=azure env var.
 *
 * Usage:
 *   const { speakBilingual, speakWord, speakSingle } = useBilingualSpeak();
 *   speakBilingual("כלב", "Dog");          // both languages
 *   speakWord({ he: "כלב", en: "Dog" });   // same, type-safe
 *   speakSingle("שלום");                   // one word, current language
 */

interface BilingualWord {
  he: string;
  en: string;
}

const PAUSE_MS = 420;

export function useBilingualSpeak() {
  const { isHebrew } = useLanguage();

  const speakBilingual = useCallback(async (he: string, en: string) => {
    cancelSpeech();

    if (isHebrew) {
      await speakText(he, "he-IL", { rate: 0.9, pitch: 1.1 });
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      await speakText(en, "en-US", { rate: 0.9, pitch: 1.15 });
    } else {
      await speakText(en, "en-US", { rate: 0.9, pitch: 1.15 });
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      await speakText(he, "he-IL", { rate: 0.9, pitch: 1.1 });
    }
  }, [isHebrew]);

  const speakSingle = useCallback((text: string) => {
    cancelSpeech();
    const lang = isHebrew ? "he-IL" as const : "en-US" as const;
    speakText(text, lang, { rate: 0.9, pitch: 1.1 });
  }, [isHebrew]);

  const speakWord = useCallback((word: BilingualWord) => {
    speakBilingual(word.he, word.en);
  }, [speakBilingual]);

  const speakNav = useCallback((word: BilingualWord) => {
    cancelSpeech();
    const [text, lang] = isHebrew
      ? [word.en, "en-US" as const]
      : [word.he, "he-IL" as const];
    speakText(text, lang, { rate: 0.95, pitch: 1.1 });
  }, [isHebrew]);

  const cancelSpeak = useCallback(() => {
    cancelSpeech();
  }, []);

  return { speakBilingual, speakWord, speakSingle, speakNav, cancelSpeak };
}
