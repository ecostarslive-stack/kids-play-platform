"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";

// ─── Types ───────────────────────────────────────────────────────────────────
type CareAction = "wash" | "brush" | "feed" | "decorate" | "hug";
type Phase = "intro" | "playing" | "complete";

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface ActionConfig {
  id: CareAction;
  emoji: string;
  label: { he: string; en: string };
  color: string;
  bgColor: string;
  particleEmoji: string;
  ponyReaction: string;
  effect: string; // what the pony looks like after
  stat: "clean" | "happy" | "full" | "pretty" | "loved";
}

// ─── Config ───────────────────────────────────────────────────────────────────
const ACTIONS: ActionConfig[] = [
  {
    id: "wash",
    emoji: "🚿",
    label: { he: "לרחוץ", en: "Wash" },
    color: "#339AF0",
    bgColor: "#EBF4FF",
    particleEmoji: "💧",
    ponyReaction: "😊",
    effect: "✨",
    stat: "clean",
  },
  {
    id: "brush",
    emoji: "🪮",
    label: { he: "לסרק", en: "Brush" },
    color: "#F06595",
    bgColor: "#FFF0F6",
    particleEmoji: "✨",
    ponyReaction: "😍",
    effect: "💖",
    stat: "pretty",
  },
  {
    id: "feed",
    emoji: "🥕",
    label: { he: "להאכיל", en: "Feed" },
    color: "#FF922B",
    bgColor: "#FFF4E6",
    particleEmoji: "🌟",
    ponyReaction: "😋",
    effect: "🌟",
    stat: "full",
  },
  {
    id: "decorate",
    emoji: "🌸",
    label: { he: "לקשט", en: "Decorate" },
    color: "#845EC2",
    bgColor: "#F3F0FF",
    particleEmoji: "🌸",
    ponyReaction: "🥰",
    effect: "🌈",
    stat: "pretty",
  },
  {
    id: "hug",
    emoji: "🤗",
    label: { he: "לחבק", en: "Hug" },
    color: "#51CF66",
    bgColor: "#EBFBEE",
    particleEmoji: "💕",
    ponyReaction: "😄",
    effect: "💕",
    stat: "loved",
  },
];

const STAT_LABELS: Record<string, { he: string; en: string }> = {
  clean: { he: "נקיון", en: "Clean" },
  happy: { he: "שמחה", en: "Happy" },
  full: { he: "שבעה", en: "Full" },
  pretty: { he: "יפה", en: "Pretty" },
  loved: { he: "אהבה", en: "Love" },
};

const STAT_EMOJIS: Record<string, string> = {
  clean: "🛁",
  happy: "😊",
  full: "🥕",
  pretty: "💅",
  loved: "💕",
};

// ─── Pony SVG Component ───────────────────────────────────────────────────────
function PonySVG({
  reaction,
  decorations,
  isWet,
  isBrushed,
}: {
  reaction: string;
  decorations: string[];
  isWet: boolean;
  isBrushed: boolean;
}) {
  const maneColor = isBrushed ? "#FF6FBF" : "#FF8CC8";
  const bodyColor = isWet ? "#B8D4FF" : "#FFD6EC";

  return (
    <svg viewBox="0 0 220 220" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="110" cy="140" rx="70" ry="55" fill={bodyColor} stroke="#E8A0CC" strokeWidth="2" />
      {/* Belly shine */}
      <ellipse cx="100" cy="148" rx="30" ry="20" fill="white" opacity="0.3" />
      {/* Legs */}
      <rect x="68" y="178" width="16" height="36" rx="8" fill={bodyColor} stroke="#E8A0CC" strokeWidth="1.5" />
      <rect x="90" y="180" width="16" height="34" rx="8" fill={bodyColor} stroke="#E8A0CC" strokeWidth="1.5" />
      <rect x="112" y="180" width="16" height="34" rx="8" fill={bodyColor} stroke="#E8A0CC" strokeWidth="1.5" />
      <rect x="134" y="178" width="16" height="36" rx="8" fill={bodyColor} stroke="#E8A0CC" strokeWidth="1.5" />
      {/* Hooves */}
      <ellipse cx="76" cy="214" rx="9" ry="5" fill="#C77DBB" />
      <ellipse cx="98" cy="214" rx="9" ry="5" fill="#C77DBB" />
      <ellipse cx="120" cy="214" rx="9" ry="5" fill="#C77DBB" />
      <ellipse cx="142" cy="214" rx="9" ry="5" fill="#C77DBB" />
      {/* Tail */}
      <path d="M178 148 Q205 130 198 165 Q205 185 185 178" fill={maneColor} stroke="#E870B8" strokeWidth="1.5" />
      <path d="M178 148 Q210 145 200 175" fill="none" stroke="#FF6FB4" strokeWidth="2" />
      {/* Neck */}
      <ellipse cx="82" cy="102" rx="26" ry="34" fill={bodyColor} stroke="#E8A0CC" strokeWidth="2" transform="rotate(-15, 82, 102)" />
      {/* Head */}
      <ellipse cx="62" cy="72" rx="32" ry="28" fill={bodyColor} stroke="#E8A0CC" strokeWidth="2" />
      {/* Snout */}
      <ellipse cx="42" cy="84" rx="16" ry="12" fill="#FFB8DA" stroke="#E8A0CC" strokeWidth="1.5" />
      {/* Nostrils */}
      <ellipse cx="36" cy="87" rx="3" ry="2" fill="#E880B0" />
      <ellipse cx="46" cy="87" rx="3" ry="2" fill="#E880B0" />
      {/* Eyes */}
      <ellipse cx="68" cy="64" rx="9" ry="10" fill="white" />
      <ellipse cx="68" cy="65" rx="6" ry="7" fill="#5B4FCF" />
      <ellipse cx="68" cy="65" rx="3" ry="4" fill="#1a1a2e" />
      <circle cx="70" cy="63" r="1.5" fill="white" />
      {/* Eyelashes */}
      <line x1="62" y1="55" x2="60" y2="51" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="68" y1="54" x2="67" y2="50" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="74" y1="56" x2="75" y2="52" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
      {/* Ear */}
      <polygon points="78,50 88,34 96,50" fill={bodyColor} stroke="#E8A0CC" strokeWidth="1.5" />
      <polygon points="82,50 88,38 93,50" fill="#FFB8DA" />
      {/* Horn (unicorn!) */}
      <polygon points="88,28 92,8 96,28" fill="#FFD700" stroke="#FFC000" strokeWidth="1" />
      <line x1="88" y1="22" x2="96" y2="22" stroke="#FFC000" strokeWidth="0.8" opacity="0.6" />
      {/* Mane */}
      <path d="M82 46 Q72 52 68 68 Q78 58 88 62 Q78 70 74 84" fill={maneColor} stroke="#E870B8" strokeWidth="1" />
      <path d="M88 44 Q82 54 80 70" fill={maneColor} stroke="#FF90CC" strokeWidth="2" />
      {/* Smile / reaction mouth */}
      {reaction === "😋" ? (
        <path d="M36 92 Q42 98 48 92" fill="none" stroke="#E870B8" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M36 91 Q42 96 48 91" fill="none" stroke="#E870B8" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {/* Cheek blush */}
      <ellipse cx="54" cy="78" rx="6" ry="4" fill="#FF9EC0" opacity="0.5" />
      {/* Decorations layer */}
      {decorations.includes("🌸") && (
        <text x="88" y="50" fontSize="14" textAnchor="middle">🌸</text>
      )}
      {decorations.includes("💖") && (
        <text x="110" y="115" fontSize="16" textAnchor="middle">💖</text>
      )}
      {decorations.includes("🌈") && (
        <text x="155" y="95" fontSize="18" textAnchor="middle">🌈</text>
      )}
      {/* Water drops if wet */}
      {isWet && (
        <>
          <text x="45" y="108" fontSize="12" opacity="0.7">💧</text>
          <text x="130" y="120" fontSize="10" opacity="0.6">💧</text>
          <text x="90" y="175" fontSize="10" opacity="0.5">💧</text>
        </>
      )}
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PonyCarePage() {
  const router = useRouter();
  const { speakBilingual, speakSingle } = useBilingualSpeak();

  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState({ clean: 0, happy: 0, full: 0, pretty: 0, loved: 0 });
  const [ponyReaction, setPonyReaction] = useState("🙂");
  const [decorations, setDecorations] = useState<string[]>([]);
  const [isWet, setIsWet] = useState(false);
  const [isBrushed, setIsBrushed] = useState(false);
  const [activeAction, setActiveAction] = useState<CareAction | null>(null);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [ponyBounce, setPonyBounce] = useState(false);
  const [score, setScore] = useState(0);
  const [actionsUsed, setActionsUsed] = useState<Set<CareAction>>(new Set());
  const floatIdRef = useRef(0);

  // Total happiness = average of all stats
  const totalHappiness = Math.round(
    Object.values(stats).reduce((a, b) => a + b, 0) / Object.keys(stats).length
  );

  const isComplete = totalHappiness >= 80 || actionsUsed.size >= 5;

  // Floating particles
  const addParticles = useCallback((emoji: string, count = 6) => {
    const newItems: FloatingItem[] = Array.from({ length: count }, (_, i) => ({
      id: ++floatIdRef.current,
      emoji,
      x: 30 + Math.random() * 140,
      y: 60 + Math.random() * 120,
    }));
    setFloatingItems((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingItems((prev) =>
        prev.filter((item) => !newItems.find((ni) => ni.id === item.id))
      );
    }, 1200);
  }, []);

  const handleAction = useCallback(
    (action: ActionConfig) => {
      if (activeAction) return;
      setActiveAction(action.id);

      // Speak the action
      speakBilingual(action.label.he, action.label.en);

      // Update stat
      setStats((prev) => ({
        ...prev,
        [action.stat]: Math.min(100, prev[action.stat as keyof typeof prev] + 25),
      }));

      // Visual effects
      addParticles(action.particleEmoji, 8);
      setPonyReaction(action.ponyReaction);
      setPonyBounce(true);
      setScore((s) => s + 10);
      setActionsUsed((prev) => new Set([...prev, action.id]));

      if (action.id === "wash") setIsWet(true);
      if (action.id === "brush") {
        setIsBrushed(true);
        setIsWet(false);
      }
      if (action.id === "decorate" || action.id === "brush") {
        setDecorations((prev) =>
          prev.includes(action.effect) ? prev : [...prev, action.effect]
        );
      }

      setTimeout(() => {
        setActiveAction(null);
        setPonyBounce(false);
        setPonyReaction("😊");
      }, 1400);
    },
    [activeAction, speakBilingual, addParticles]
  );

  // Tap pony directly
  const handlePonyTap = useCallback(() => {
    if (activeAction) return;
    addParticles("💕", 5);
    setPonyReaction("🥰");
    speakBilingual("פוני", "Pony");
    setPonyBounce(true);
    setTimeout(() => {
      setPonyBounce(false);
      setPonyReaction("😊");
    }, 1000);
  }, [activeAction, addParticles, speakBilingual]);

  // Complete game
  useEffect(() => {
    if (isComplete && phase === "playing") {
      setTimeout(() => setPhase("complete"), 800);
    }
  }, [isComplete, phase]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="text-7xl"
        >
          🦄
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-pink-600 mb-1">טיפול בפוני</h1>
          <p className="text-lg text-pink-400 font-bold">Pony Care</p>
          <p className="text-base text-foreground/60 mt-2">רחצו, סרקו והאכילו את הפוני!</p>
        </motion.div>
        <BigButton
          onClick={() => {
            setPhase("playing");
            setTimeout(() => speakBilingual("פוני שמח", "Happy Pony"), 600);
          }}
          variant="success"
        >
          !בואו נתחיל 🦄
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={50}
        onPlayAgain={() => {
          setStats({ clean: 0, happy: 0, full: 0, pretty: 0, loved: 0 });
          setDecorations([]);
          setIsWet(false);
          setIsBrushed(false);
          setActionsUsed(new Set());
          setScore(0);
          setPonyReaction("🙂");
          setPhase("playing");
        }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto gap-3"
      style={{ background: "linear-gradient(180deg, #FFF0F8 0%, #F8F0FF 100%)" }}
    >
      {/* Header: happiness bar */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-pink-500">שמחת הפוני / Pony Happiness</span>
          <span className="text-sm font-black text-pink-600 ml-auto">{totalHappiness}%</span>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #FF6FBF, #FF9ECC, #FFD6EC)",
            }}
            animate={{ width: `${totalHappiness}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex gap-1.5 px-4 overflow-x-auto pb-1">
        {Object.entries(stats).map(([key, val]) => (
          <div
            key={key}
            className="flex flex-col items-center gap-0.5 bg-white/70 rounded-xl px-2 py-1 shadow-sm flex-shrink-0"
          >
            <span className="text-base">{STAT_EMOJIS[key]}</span>
            <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-pink-400 rounded-full"
                animate={{ width: `${val}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-[10px] font-bold text-foreground/50">{STAT_LABELS[key].en}</span>
          </div>
        ))}
      </div>

      {/* Pony stage */}
      <div className="relative mx-4 rounded-3xl overflow-hidden shadow-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #B8F0FF 0%, #90E0EF 30%, #7EC8DC 60%, #98E4A5 100%)",
          minHeight: 220,
        }}
      >
        {/* Sun */}
        <div className="absolute top-3 right-4 text-3xl">☀️</div>
        {/* Clouds */}
        <div className="absolute top-2 left-6 text-2xl opacity-80">☁️</div>
        {/* Grass hint */}
        <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl"
          style={{ background: "linear-gradient(0deg, #4CAF50 0%, transparent 100%)" }} />

        {/* Floating particles */}
        <AnimatePresence>
          {floatingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -60, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
              className="absolute pointer-events-none text-2xl"
              style={{ left: item.x, top: item.y }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pony */}
        <motion.div
          className="relative cursor-pointer"
          style={{ width: 200, height: 200 }}
          animate={ponyBounce ? { y: [-8, 0, -5, 0], scale: [1, 1.06, 1] } : { y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          onClick={handlePonyTap}
          whileTap={{ scale: 0.95 }}
        >
          <PonySVG
            reaction={ponyReaction}
            decorations={decorations}
            isWet={isWet}
            isBrushed={isBrushed}
          />
          {/* Reaction bubble */}
          <AnimatePresence>
            {ponyReaction !== "🙂" && ponyReaction !== "😊" && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, y: -10 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-6 left-0 text-3xl"
              >
                {ponyReaction}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-5 gap-2 px-4 pb-4">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => handleAction(action)}
            disabled={!!activeAction}
            className="flex flex-col items-center gap-1 rounded-2xl py-2 px-1 shadow-md border-2 transition-all"
            style={{
              backgroundColor: actionsUsed.has(action.id) ? action.bgColor : "white",
              borderColor: actionsUsed.has(action.id) ? action.color : "#E5E7EB",
            }}
          >
            <span className="text-2xl">{action.emoji}</span>
            <span className="text-[10px] font-bold text-center leading-tight" style={{ color: action.color }}>
              {action.label.he}
            </span>
            {actionsUsed.has(action.id) && (
              <span className="text-[10px]">✓</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
