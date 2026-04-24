"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_STORAGE_KEY = "kids-games-muted";

type Oscillator = "sine" | "square" | "triangle" | "sawtooth";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    __kidsGamesAudioCtx?: AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  if (w.__kidsGamesAudioCtx) return w.__kidsGamesAudioCtx;
  const Ctor = window.AudioContext || w.webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  w.__kidsGamesAudioCtx = ctx;
  return ctx;
}

function isMutedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
}

export function useGameSound() {
  const mutedRef = useRef<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const m = isMutedFromStorage();
    mutedRef.current = m;
    setIsMuted(m);
    const onStorage = (e: StorageEvent) => {
      if (e.key === MUTE_STORAGE_KEY) {
        const v = e.newValue === "1";
        mutedRef.current = v;
        setIsMuted(v);
      }
    };
    const onCustom = () => {
      const v = isMutedFromStorage();
      mutedRef.current = v;
      setIsMuted(v);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("kids-games-mute-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kids-games-mute-changed", onCustom);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
      window.dispatchEvent(new Event("kids-games-mute-changed"));
    }
  }, []);

  const tone = useCallback(
    (opts: {
      freq: number;
      start?: number;
      duration?: number;
      type?: Oscillator;
      volume?: number;
      freqEnd?: number;
    }) => {
      if (mutedRef.current) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const {
        freq,
        start = 0,
        duration = 0.15,
        type = "sine",
        volume = 0.2,
        freqEnd,
      } = opts;

      const t0 = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (freqEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, freqEnd),
          t0 + duration
        );
      }

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },
    []
  );

  const noiseBurst = useCallback(
    (opts: { start?: number; duration?: number; volume?: number }) => {
      if (mutedRef.current) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const { start = 0, duration = 0.08, volume = 0.15 } = opts;
      const t0 = ctx.currentTime + start;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      src.connect(gain).connect(ctx.destination);
      src.start(t0);
      src.stop(t0 + duration + 0.02);
    },
    []
  );

  const playCorrect = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
    const variant = Math.floor(Math.random() * 3);
    if (variant === 0) {
      tone({ freq: 523.25, duration: 0.12, type: "sine", volume: 0.22 });
      tone({ freq: 659.25, start: 0.1, duration: 0.12, type: "sine", volume: 0.22 });
      tone({ freq: 783.99, start: 0.2, duration: 0.18, type: "sine", volume: 0.22 });
    } else if (variant === 1) {
      tone({ freq: 587.33, duration: 0.1, type: "triangle", volume: 0.22 });
      tone({ freq: 783.99, start: 0.09, duration: 0.14, type: "triangle", volume: 0.22 });
      tone({ freq: 1046.5, start: 0.2, duration: 0.18, type: "sine", volume: 0.2 });
    } else {
      tone({ freq: 659.25, duration: 0.1, type: "sine", volume: 0.22 });
      tone({ freq: 880, start: 0.08, duration: 0.14, type: "sine", volume: 0.22 });
      tone({ freq: 1174.66, start: 0.2, duration: 0.22, type: "triangle", volume: 0.2 });
    }
  }, [tone]);

  const playWrong = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([80, 40, 80]);
    tone({ freq: 330, duration: 0.18, type: "square", volume: 0.12 });
    tone({ freq: 220, start: 0.16, duration: 0.24, type: "square", volume: 0.12 });
  }, [tone]);

  const playCheer = useCallback(() => {
    tone({ freq: 523.25, duration: 0.1, type: "triangle", volume: 0.22 });
    tone({ freq: 659.25, start: 0.1, duration: 0.1, type: "triangle", volume: 0.22 });
    tone({ freq: 783.99, start: 0.2, duration: 0.1, type: "triangle", volume: 0.22 });
    tone({ freq: 1046.5, start: 0.3, duration: 0.35, type: "triangle", volume: 0.25 });
    tone({ freq: 1318.5, start: 0.32, duration: 0.35, type: "sine", volume: 0.18 });
  }, [tone]);

  const playPop = useCallback(() => {
    tone({
      freq: 800,
      freqEnd: 180,
      duration: 0.1,
      type: "sine",
      volume: 0.25,
    });
    noiseBurst({ start: 0, duration: 0.06, volume: 0.08 });
  }, [tone, noiseBurst]);

  const playClick = useCallback(() => {
    tone({ freq: 1200, duration: 0.04, type: "square", volume: 0.1 });
  }, [tone]);

  const playFlip = useCallback(() => {
    tone({ freq: 700, duration: 0.05, type: "triangle", volume: 0.15 });
    tone({ freq: 1000, start: 0.05, duration: 0.05, type: "triangle", volume: 0.15 });
  }, [tone]);

  const playNote = useCallback(
    (freq: number, duration = 0.35) => {
      tone({ freq, duration, type: "sine", volume: 0.25 });
      tone({ freq: freq * 2, duration, type: "sine", volume: 0.08 });
    },
    [tone]
  );

  const playWhoosh = useCallback(() => {
    tone({
      freq: 200,
      freqEnd: 900,
      duration: 0.25,
      type: "sawtooth",
      volume: 0.08,
    });
  }, [tone]);

  const playSparkle = useCallback(() => {
    tone({ freq: 1320, duration: 0.08, type: "sine", volume: 0.15 });
    tone({ freq: 1760, start: 0.07, duration: 0.08, type: "sine", volume: 0.15 });
    tone({ freq: 2637, start: 0.14, duration: 0.12, type: "sine", volume: 0.15 });
  }, [tone]);

  // Back-compat: previous API accepted a string URL. New synth ignores it.
  const play = useCallback(
    (_src?: string) => {
      void _src;
      playClick();
    },
    [playClick]
  );

  return {
    play,
    playCorrect,
    playWrong,
    playCheer,
    playPop,
    playClick,
    playFlip,
    playNote,
    playWhoosh,
    playSparkle,
    isMuted,
    toggleMute,
  };
}
