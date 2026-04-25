/**
 * TTS Engine Abstraction
 *
 * Supports three providers:
 *   "browser" — Web Speech API (free, built-in, Hebrew quality varies)
 *   "azure"   — Azure Neural TTS he-IL Hila / en-US Jenny (requires API key)
 *   "google"  — Google Cloud TTS he-IL Wavenet (requires API key, 1M chars/month free)
 *
 * Switch provider via env var NEXT_PUBLIC_TTS_PROVIDER=google|azure|browser
 */

export type TTSLang = "he-IL" | "en-US";

export interface TTSOptions {
  rate?: number;
  pitch?: number;
}

function browserSpeak(text: string, lang: TTSLang, opts: TTSOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1.1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function browserCancel() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

const azureVoices: Record<TTSLang, string> = {
  "he-IL": "he-IL-HilaNeural",
  "en-US": "en-US-JennyNeural",
};

const googleVoices: Record<TTSLang, string> = {
  "he-IL": "he-IL-Wavenet-A",
  "en-US": "en-US-Wavenet-F",
};

let sharedAudio: HTMLAudioElement | null = null;

function playAudioBlob(blob: Blob, text: string, lang: TTSLang, opts: TTSOptions): Promise<void> {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    if (sharedAudio) { sharedAudio.pause(); sharedAudio.src = ""; }
    sharedAudio = new Audio(url);
    sharedAudio.playbackRate = opts.rate ?? 0.9;
    sharedAudio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    sharedAudio.onerror = () => { URL.revokeObjectURL(url); browserSpeak(text, lang, opts).then(resolve); };
    sharedAudio.play().catch(() => browserSpeak(text, lang, opts).then(resolve));
  });
}

async function cloudSpeak(provider: "azure" | "google", text: string, lang: TTSLang, opts: TTSOptions = {}): Promise<void> {
  try {
    const voice = provider === "google" ? googleVoices[lang] : azureVoices[lang];
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, text, lang, voice, rate: opts.rate ?? 0.9, pitch: opts.pitch ?? 1.1 }),
    });
    if (!response.ok) return browserSpeak(text, lang, opts);
    return playAudioBlob(await response.blob(), text, lang, opts);
  } catch {
    return browserSpeak(text, lang, opts);
  }
}

function cloudCancel() {
  if (sharedAudio) { sharedAudio.pause(); sharedAudio.src = ""; sharedAudio = null; }
}

function getProvider(): "azure" | "google" | "browser" {
  if (typeof process !== "undefined") {
    const p = process.env.NEXT_PUBLIC_TTS_PROVIDER;
    if (p === "azure") return "azure";
    if (p === "google") return "google";
  }
  return "browser";
}

export function speakText(text: string, lang: TTSLang, opts?: TTSOptions): Promise<void> {
  const provider = getProvider();
  if (provider === "azure") return cloudSpeak("azure", text, lang, opts ?? {});
  if (provider === "google") return cloudSpeak("google", text, lang, opts ?? {});
  return browserSpeak(text, lang, opts);
}

export function cancelSpeech(): void {
  browserCancel();
  cloudCancel();
}
