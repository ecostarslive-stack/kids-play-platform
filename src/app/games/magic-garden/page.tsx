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
type GrowthStage = 0 | 1 | 2 | 3; // 0=empty, 1=seed, 2=sprout, 3=bloom

interface PlantSpot {
  id: number;
  stage: GrowthStage;
  plantIdx: number | null;
  waterCount: number;
}

interface Plant {
  id: string;
  name: { he: string; en: string };
  stages: string[]; // emojis for each stage 1-3
  color: string;
}

type Phase = "intro" | "playing" | "complete";

// ── Data ──────────────────────────────────────────────────────────────────────
const PLANTS: Plant[] = [
  { id: "rose",      name: { he: "ורד",      en: "Rose"       }, stages: ["🌱", "🌿", "🌹"], color: "#FF6F91" },
  { id: "sunflower", name: { he: "חמנייה",   en: "Sunflower"  }, stages: ["🌱", "🌿", "🌻"], color: "#FFC75F" },
  { id: "tulip",     name: { he: "צבעוני",   en: "Tulip"      }, stages: ["🌱", "🌿", "🌷"], color: "#FF9EC0" },
  { id: "tree",      name: { he: "עץ",       en: "Tree"       }, stages: ["🌱", "🌿", "🌳"], color: "#51CF66" },
  { id: "cactus",    name: { he: "קקטוס",    en: "Cactus"     }, stages: ["🌱", "🌵", "🌵"], color: "#7EC8A4" },
  { id: "mushroom",  name: { he: "פטרייה",   en: "Mushroom"   }, stages: ["🌱", "🍄", "🍄"], color: "#BC8A5F" },
  { id: "cherry",    name: { he: "דובדבן",   en: "Cherry"     }, stages: ["🌱", "🌿", "🍒"], color: "#E34234" },
  { id: "grape",     name: { he: "ענבים",    en: "Grapes"     }, stages: ["🌱", "🌿", "🍇"], color: "#845EC2" },
];

const NUM_SPOTS = 4;

function makeSpots(): PlantSpot[] {
  return Array.from({ length: NUM_SPOTS }, (_, i) => ({
    id: i,
    stage: 0,
    plantIdx: null,
    waterCount: 0,
  }));
}

// ── Soil spot ─────────────────────────────────────────────────────────────────
function SoilSpot({
  spot,
  plant,
  onTap,
  isSelected,
}: {
  spot: PlantSpot;
  plant: Plant | null;
  onTap: () => void;
  isSelected: boolean;
}) {
  const stage = spot.stage;
  const emoji = stage === 0 ? null : plant?.stages[stage - 1] ?? "🌱";
  const needsWater = stage > 0 && stage < 3;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onTap}
      className="flex flex-col items-center gap-1 relative"
    >
      {/* Plant */}
      <div className="h-16 flex items-end justify-center">
        <AnimatePresence mode="wait">
          {emoji && (
            <motion.span
              key={`${spot.id}-${stage}`}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-4xl"
            >
              {emoji}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Soil mound */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="w-16 h-7 rounded-full flex items-center justify-center border-2 shadow-inner"
        style={{
          backgroundColor: isSelected ? "#8B6914" : "#A0522D",
          borderColor: isSelected ? "#FFD700" : "#7B3F00",
        }}
      >
        {stage === 0 && <span className="text-xs text-yellow-200 font-bold">+</span>}
        {needsWater && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-sm"
          >
            💧
          </motion.span>
        )}
        {stage === 3 && <span className="text-xs">✨</span>}
      </motion.div>

      {/* Plant name when bloomed */}
      {stage === 3 && plant && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs font-black" style={{ color: plant.color }}>{plant.name.he}</p>
          <p className="text-[10px] text-foreground/40">{plant.name.en}</p>
        </motion.div>
      )}
    </motion.button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MagicGardenPage() {
  const router = useRouter();
  const { speakBilingual } = useBilingualSpeak();
  const { particles, celebrate, screenFlash, shake, burst } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [spots, setSpots] = useState<PlantSpot[]>(makeSpots());
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [tool, setTool] = useState<"seed" | "water" | "sun">("seed");
  const [score, setScore] = useState(0);
  const [bloomCount, setBloomCount] = useState(0);
  const [nextPlantIdx, setNextPlantIdx] = useState(0);

  const totalBloomed = spots.filter((s) => s.stage === 3).length;
  const isComplete = totalBloomed >= NUM_SPOTS;

  const handleSpotTap = useCallback(
    (spotId: number) => {
      const spot = spots[spotId];

      if (tool === "seed" && spot.stage === 0) {
        // Plant a seed
        const plant = PLANTS[nextPlantIdx % PLANTS.length];
        speakBilingual("זרע", "Seed");
        setSpots((prev) =>
          prev.map((s) =>
            s.id === spotId ? { ...s, stage: 1, plantIdx: nextPlantIdx % PLANTS.length } : s
          )
        );
        setNextPlantIdx((n) => n + 1);
        setScore((s) => s + 5);
        burst(200 + spotId * 80, 300, ["🌱", "✨"], 4);
      } else if (tool === "water" && spot.stage > 0 && spot.stage < 3) {
        // Water the plant
        const newWater = spot.waterCount + 1;
        const newStage = newWater >= 2 ? Math.min(3, spot.stage + 1) as GrowthStage : spot.stage;
        const isNowBloomed = newStage === 3;

        setSpots((prev) =>
          prev.map((s) =>
            s.id === spotId
              ? { ...s, stage: newStage, waterCount: newStage > s.stage ? 0 : newWater }
              : s
          )
        );
        setScore((s) => s + 10);
        burst(200 + spotId * 80, 300, ["💧", "🌊"], 5);

        if (isNowBloomed && spot.plantIdx !== null) {
          const plant = PLANTS[spot.plantIdx];
          speakBilingual(plant.name.he, plant.name.en);
          celebrate(200 + spotId * 80, 280);
          setBloomCount((b) => b + 1);

          if (spots.filter((s) => s.stage === 3).length + 1 >= NUM_SPOTS) {
            setTimeout(() => setPhase("complete"), 1200);
          }
        } else {
          speakBilingual("מים", "Water");
        }
      } else if (tool === "sun") {
        // Sun boosts growth
        if (spot.stage > 0 && spot.stage < 3) {
          const newStage = Math.min(3, spot.stage + 1) as GrowthStage;
          const isNowBloomed = newStage === 3;
          setSpots((prev) =>
            prev.map((s) => (s.id === spotId ? { ...s, stage: newStage, waterCount: 0 } : s))
          );
          setScore((s) => s + 8);
          burst(200 + spotId * 80, 280, ["☀️", "✨", "🌟"], 6);
          if (isNowBloomed && spot.plantIdx !== null) {
            const plant = PLANTS[spot.plantIdx];
            speakBilingual(plant.name.he, plant.name.en);
            celebrate(200 + spotId * 80, 280);
          } else {
            speakBilingual("שמש", "Sun");
          }
        }
      }
    },
    [spots, tool, nextPlantIdx, speakBilingual, burst, celebrate]
  );

  if (phase === "intro") {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #E8F5E9 0%, #F1F8E9 100%)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >
          🌻
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-green-700">גינה קסומה</h1>
          <p className="text-lg font-bold text-green-500">Magic Garden</p>
          <p className="text-sm text-foreground/60 mt-2">שתלו, השקו ותראו את הפרחים פורחים!</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !בואו לגנן 🌱
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={NUM_SPOTS * 15}
        onPlayAgain={() => {
          setSpots(makeSpots()); setScore(0); setNextPlantIdx(0); setBloomCount(0); setPhase("playing");
        }}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div
      className="flex-1 flex flex-col w-full max-w-md mx-auto gap-4 px-3 pt-2 pb-4"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B8E4C9 40%, #7EC850 100%)" }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Sky elements */}
      <div className="flex justify-between items-start px-2">
        <motion.span animate={{ x: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }} className="text-3xl">☁️</motion.span>
        <motion.span animate={{ rotate: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl">☀️</motion.span>
        <motion.span animate={{ x: [4, -4, 4] }} transition={{ duration: 5, repeat: Infinity }} className="text-2xl">☁️</motion.span>
      </div>

      {/* Progress */}
      <div className="bg-white/50 rounded-2xl px-3 py-2 text-center">
        <p className="text-sm font-black text-green-700">
          {totalBloomed}/{NUM_SPOTS} פרחים פרחו · {totalBloomed}/{NUM_SPOTS} bloomed 🌸
        </p>
        <div className="w-full bg-green-100 rounded-full h-2 mt-1 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            animate={{ width: `${(totalBloomed / NUM_SPOTS) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Garden spots */}
      <div className="bg-green-800/20 rounded-3xl p-4 flex justify-around items-end min-h-[180px]">
        {spots.map((spot) => (
          <SoilSpot
            key={spot.id}
            spot={spot}
            plant={spot.plantIdx !== null ? PLANTS[spot.plantIdx] : null}
            onTap={() => handleSpotTap(spot.id)}
            isSelected={selectedSpot === spot.id}
          />
        ))}
      </div>

      {/* Tools */}
      <div className="bg-white/60 rounded-2xl p-3">
        <p className="text-xs font-bold text-center text-foreground/50 mb-2">בחרו כלי / Choose tool</p>
        <div className="flex justify-center gap-4">
          {(["seed", "water", "sun"] as const).map((t) => {
            const emoji = t === "seed" ? "🌱" : t === "water" ? "🚿" : "☀️";
            const label = t === "seed" ? "זרע" : t === "water" ? "מים" : "שמש";
            const labelEn = t === "seed" ? "Seed" : t === "water" ? "Water" : "Sun";
            return (
              <motion.button
                key={t}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setTool(t); speakBilingual(label, labelEn); }}
                className="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 border-2 transition-all"
                style={{
                  backgroundColor: tool === t ? "#4CAF50" : "white",
                  borderColor: tool === t ? "#2E7D32" : "#E5E7EB",
                }}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-bold" style={{ color: tool === t ? "white" : "#666" }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
