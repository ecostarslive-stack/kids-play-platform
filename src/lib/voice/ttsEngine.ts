/**
 * TTS Engine Abstraction
 *
 * Supports two providers:
 *   "browser" — Web Speech API (free, built-in, Hebrew quality varies)
 *   "azure"   — Azure Neural TTS he-IL Hila / en-US Jenny (requires API key)
 *
 * Switch provider via env var NEXT_PUBLIC_TTS_PROVIDER=azure
 * Azure also needs NEXT_PUBLIC_TTS_PROVIDER=azure and a /api/tts route server-side.
 *
 * The API contract is simple:
 *   speakText(text, lang, options?) → Promise<void>
 */

export type TTSLang = "he-IL" | "en-US";

export interface TTSOptions {
  rate?: number;   // 0.5–2.0, default 0.9
  pitch?: number;  // 0.5–2.0, default 1.1
}

// ── Browser TTS ──────────────────────────────────────────────────────────────

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

// ── Azure TTS (via /api/tts proxy) ───────────────────────────────────────────

const azureVoices: Record<TTSLang, string> = {
  "he-IL": "he-IL-HilaNeural",   // Natural Israeli Hebrew, female
  "en-US": "en-US-JennyNeural",  // Natural US English, warm & child-friendly
};

let azureAudio: HTMLAudioElement | null = null;

async function azureSpeak(text: string, lang: TTSLang, opts: TTSOptions = {}): Promise<void> {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        lang,
        voice: azureVoices[lang],
        rate: opts.rate ?? 0.9,
        pitch: opts.pitch ?? 1.1,
      }),
    });

    if (!response.ok) {
      // Fallback to browser TTS if Azure fails
      return browserSpeak(text, lang, opts);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      if (azureAudio) {
        azureAudio.pause();
        azureAudio.src = "";
      }
      azureAudio = new Audio(url);
      azureAudio.playbackRate = opts.rate ?? 0.9;
      azureAudio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      azureAudio.onerror = () => { URL.revokeObjectURL(url); browserSpeak(text, lang, opts).then(resolve); };
      azureAudio.play().catch(() => browserSpeak(text, lang, opts).then(resolve));
    });
  } catch {
    // Always fallback to browser on any error
    return browserSpeak(text, lang, opts);
  }
}

function azureCancel() {
  if (azureAudio) {
    azureAudio.pause();
    azureAudio.src = "";
    azureAudio = null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function getProvider(): "azure" | "browser" {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TTS_PROVIDER === "azure") {
    return "azure";
  }
  return "browser";
}

export function speakText(text: string, lang: TTSLang, opts?: TTSOptions): Promise<void> {
  const provider = getProvider();
  if (provider === "azure") return azureSpeak(text, lang, opts);
  return browserSpeak(text, lang, opts);
}

export function cancelSpeech(): void {
  browserCancel();
  azureCancel();
}
