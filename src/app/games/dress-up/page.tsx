"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClothingItem {
  id: string;
  emoji: string;
  he: string;
  en: string;
  color: string;
  // Where on the character body it appears
  slot: "head" | "top" | "bottom" | "feet" | "accessory";
  // Position on character (top %, left %)
  pos: { top: number; left: number };
  size: number; // em size
}

type Phase = "intro" | "playing" | "complete";

// ── Clothing data ──────────────────────────────────────────────────────────────
const ALL_ITEMS: ClothingItem[] = [
  { id: "hat",      emoji: "🎩", he: "כובע",      en: "Hat",      color: "#6C5CE7", slot: "head",      pos: { top: 2, left: 50 },  size: 3.0 },
  { id: "crown",    emoji: "👑", he: "כתר",       en: "Crown",    color: "#FFD700", slot: "head",      pos: { top: 2, left: 50 },  size: 2.8 },
  { id: "bow",      emoji: "🎀", he: "פפיון",     en: "Bow",      color: "#FF6B9D", slot: "head",      pos: { top: 3, left: 66 },  size: 2.2 },
  { id: "tshirt",   emoji: "👕", he: "חולצה",     en: "T-Shirt",  color: "#00B894", slot: "top",       pos: { top: 38, left: 50 }, size: 3.5 },
  { id: "dress",    emoji: "👗", he: "שמלה",      en: "Dress",    color: "#FF6B9D", slot: "top",       pos: { top: 38, left: 50 }, size: 3.5 },
  { id: "jacket",   emoji: "🧥", he: "מעיל",      en: "Jacket",   color: "#0984E3", slot: "top",       pos: { top: 38, left: 50 }, size: 3.5 },
  { id: "pants",    emoji: "👖", he: "מכנסיים",   en: "Pants",    color: "#2D3436", slot: "bottom",    pos: { top: 60, left: 50 }, size: 3.2 },
  { id: "shorts",   emoji: "🩳", he: "מכנסון",    en: "Shorts",   color: "#E17055", slot: "bottom",    pos: { top: 60, left: 50 }, size: 3.0 },
  { id: "skirt",    emoji: "👙", he: "חצאית",     en: "Skirt",    color: "#A29BFE", slot: "bottom",    pos: { top: 60, left: 50 }, size: 3.0 },
  { id: "shoes",    emoji: "👟", he: "נעלים",     en: "Shoes",    color: "#FDCB6E", slot: "feet",      pos: { top: 82, left: 50 }, size: 2.8 },
  { id: "boots",    emoji: "👢", he: "מגפיים",    en: "Boots",    color: "#B2572A", slot: "feet",      pos: { top: 82, left: 50 }, size: 2.8 },
  { id: "bag",      emoji: "👜", he: "תיק",       en: "Bag",      color: "#E84393", slot: "accessory", pos: { top: 52, left: 76 }, size: 2.5 },
  { id: "glasses",  emoji: "🕶️", he: "משקפיים",  en: "Glasses",  color: "#2D3436", slot: "accessory", pos: { top: 21, left: 50 }, size: 2.4 },
  { id: "scarf",    emoji: "🧣", he: "צעיף",      en: "Scarf",    color: "#D63031", slot: "accessory", pos: { top: 31, left: 50 }, size: 2.2 },
  { id: "watch",    emoji: "⌚", he: "שעון",      en: "Watch",    color: "#636E72", slot: "accessory", pos: { top: 52, left: 22 }, size: 2.2 },
];

// Pick 8 random items per round (guaranteed at least one of each slot type where possible)
function pickItems(): ClothingItem[] {
  const slots: ClothingItem["slot"][] = ["head", "top", "bottom", "feet", "accessory"];
  const chosen: ClothingItem[] = [];
  // Pick one from each slot
  for (const slot of slots) {
    const pool = ALL_ITEMS.filter((i) => i.slot === slot);
    chosen.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  // Fill remaining 3 from the rest
  const rest = ALL_ITEMS.filter((i) => !chosen.find((c) => c.id === i.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [...chosen, ...rest].sort(() => Math.random() - 0.5);
}

// ── Character SVG ──────────────────────────────────────────────────────────────
function Character({ worn }: { worn: Map<string, ClothingItem> }) {
  const head = worn.get("head");
  const top = worn.get("top");
  const bottom = worn.get("bottom");
  const feet = worn.get("feet");

  return (
    <div className="relative" style={{ width: 130, height: 260 }}>
      {/* Body SVG */}
      <svg width="130" height="260" viewBox="0 0 130 260" fill="none">
        {/* Head */}
        <circle cx="65" cy="50" r="34" fill="#FFDDB3" stroke="#E8B88A" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="53" cy="45" r="5" fill="#2D3436" />
        <circle cx="77" cy="45" r="5" fill="#2D3436" />
        <circle cx="55" cy="43" r="2" fill="white" />
        <circle cx="79" cy="43" r="2" fill="white" />
        {/* Smile */}
        <path d="M52 60 Q65 72 78 60" stroke="#E8B88A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="44" cy="58" r="7" fill="#FFB3B3" opacity="0.5" />
        <circle cx="86" cy="58" r="7" fill="#FFB3B3" opacity="0.5" />
        {/* Neck */}
        <rect x="57" y="82" width="16" height="14" fill="#FFDDB3" />
        {/* Torso */}
        <rect x="35" y="94" width="60" height="70" rx="12"
          fill={top ? top.color + "99" : "#E0E0E0"} stroke={top ? top.color : "#CCC"} strokeWidth="2" />
        {/* Arms */}
        <rect x="15" y="96" width="20" height="55" rx="10"
          fill={top ? top.color + "99" : "#E0E0E0"} stroke={top ? top.color : "#CCC"} strokeWidth="2" />
        <rect x="95" y="96" width="20" height="55" rx="10"
          fill={top ? top.color + "99" : "#E0E0E0"} stroke={top ? top.color : "#CCC"} strokeWidth="2" />
        {/* Hands */}
        <circle cx="25" cy="155" r="10" fill="#FFDDB3" stroke="#E8B88A" strokeWidth="1.5" />
        <circle cx="105" cy="155" r="10" fill="#FFDDB3" stroke="#E8B88A" strokeWidth="1.5" />
        {/* Legs */}
        <rect x="42" y="162" width="20" height="65" rx="10"
          fill={bottom ? bottom.color + "CC" : "#B0BEC5"} stroke={bottom ? bottom.color : "#CCC"} strokeWidth="2" />
        <rect x="68" y="162" width="20" height="65" rx="10"
          fill={bottom ? bottom.color + "CC" : "#B0BEC5"} stroke={bottom ? bottom.color : "#CCC"} strokeWidth="2" />
        {/* Feet/Shoes */}
        <ellipse cx="52" cy="228" rx="16" ry="10"
          fill={feet ? feet.color + "DD" : "#78909C"} stroke={feet ? feet.color : "#CCC"} strokeWidth="2" />
        <ellipse cx="78" cy="228" rx="16" ry="10"
          fill={feet ? feet.color + "DD" : "#78909C"} stroke={feet ? feet.color : "#CCC"} strokeWidth="2" />
      </svg>

      {/* Clothing emoji overlays */}
      <AnimatePresence>
        {Array.from(worn.values()).map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute pointer-events-none select-none flex items-center justify-center"
            style={{
              top: `${item.pos.top}%`,
              left: `${item.pos.left}%`,
              transform: "translate(-50%, 0)",
              fontSize: `${item.size}em`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Clothing button ────────────────────────────────────────────────────────────
function ClothingButton({
  item,
  isWorn,
  onTap,
}: {
  item: ClothingItem;
  isWorn: boolean;
  onTap: (item: ClothingItem, el: HTMLButtonElement) => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => onTap(item, e.currentTarget as HTMLButtonElement)}
      animate={isWorn ? { scale: [1, 1.2, 0.9, 1] } : {}}
      className="flex flex-col items-center gap-0.5 rounded-2xl p-2 border-2 transition-all select-none"
      style={{
        backgroundColor: isWorn ? item.color + "30" : "white",
        borderColor: isWorn ? item.color : "#E5E7EB",
        minWidth: 60,
      }}
    >
      <span className="text-3xl">{item.emoji}</span>
      <span className="text-[9px] font-bold leading-tight text-center" style={{ color: item.color }}>
        {item.he}
      </span>
      {isWorn && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[8px] font-black text-green-500"
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DressUpPage() {
  const router = useRouter();
  const { speakBilingual } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [displayItems] = useState<ClothingItem[]>(() => pickItems());
  // worn: slot → item (only one per slot)
  const [worn, setWorn] = useState<Map<string, ClothingItem>>(new Map());
  const [score, setScore] = useState(0);

  const wornCount = worn.size;
  const GOAL = 5;
  const isComplete = wornCount >= GOAL;

  const handleTap = useCallback(
    (item: ClothingItem, el: HTMLButtonElement) => {
      speakBilingual(item.he, item.en);

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      setWorn((prev) => {
        const next = new Map(prev);

        if (next.has(item.slot) && next.get(item.slot)!.id === item.id) {
          // Toggle off same item
          next.delete(item.slot);
          return next;
        }

        const isNewSlot = !prev.has(item.slot);
        next.set(item.slot, item);

        // Side effects for new item
        burst(cx, cy, ["✨", "🌟", "💫", item.emoji], 6);
        if (isNewSlot) {
          setScore((s) => s + 10);
        }

        if (next.size >= GOAL) {
          celebrate(180, 200);
          setTimeout(() => setPhase("complete"), 1400);
        }

        return next;
      });
    },
    [speakBilingual, burst, celebrate]
  );

  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #FCE4EC 0%, #F3E5F5 100%)" }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="text-8xl"
        >
          👗
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-pink-600">להתלבש</h1>
          <p className="text-xl font-bold text-pink-400">Dress Up!</p>
          <p className="text-sm text-foreground/60 mt-2">הלבישו את הדמות עם בגדים מגניבים 👒</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="primary">
          !בואו נתלבש 🛍️
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={GOAL * 10}
        onPlayAgain={() => {
          setWorn(new Map());
          setScore(0);
          setPhase("playing");
        }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto gap-3 px-3 pt-1 pb-4"
      style={{ background: "linear-gradient(180deg, #FCE4EC 0%, #F8F0FF 50%, #E8F4FD 100%)" }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Progress bar */}
      <div className="bg-white/60 rounded-2xl px-3 py-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-black text-pink-600">
            {wornCount}/{GOAL} פריטים · {wornCount}/{GOAL} items 👗
          </p>
          <p className="text-xs font-bold text-foreground/40">{score} pts</p>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF6B9D, #A29BFE)" }}
            animate={{ width: `${(wornCount / GOAL) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Stage — character + background */}
      <div
        className="rounded-3xl flex items-end justify-center overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #98FB98 70%, #8FBC8F 100%)",
          minHeight: 260,
          paddingBottom: 12,
        }}
      >
        {/* Decorative clouds */}
        <motion.span
          animate={{ x: [-6, 6, -6] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-3 left-4 text-3xl"
        >
          ☁️
        </motion.span>
        <motion.span
          animate={{ x: [6, -6, 6] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-5 right-4 text-2xl"
        >
          ☁️
        </motion.span>
        <motion.span
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl"
        >
          ☀️
        </motion.span>

        {/* Character */}
        <motion.div
          animate={wornCount >= GOAL ? { y: [0, -12, 0, -8, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Character worn={worn} />
        </motion.div>

        {/* "All dressed!" label */}
        <AnimatePresence>
          {wornCount >= GOAL && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-3 left-0 right-0 text-center"
            >
              <span className="text-lg font-black text-white drop-shadow-md">
                🎉 מושלם! Perfect!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clothing grid */}
      <div className="bg-white/60 rounded-2xl p-3">
        <p className="text-xs font-bold text-center text-foreground/50 mb-2">
          בחרו בגדים / Pick clothes
        </p>
        <div className="grid grid-cols-4 gap-2">
          {displayItems.map((item) => {
            const isWorn = worn.get(item.slot)?.id === item.id;
            return (
              <ClothingButton
                key={item.id}
                item={item}
                isWorn={isWorn}
                onTap={handleTap}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
