"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { speakText } from "@/lib/voice/ttsEngine";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { useDailyQuests } from "@/hooks/useDailyQuests";

// ── Types ──────────────────────────────────────────────────────────────────────
type GrowthStage = 0 | 1 | 2 | 3 | 4;
// 0 = empty soil, 1 = seed planted, 2 = sprout, 3 = growing, 4 = full bloom

interface PlantDef {
  id: string;
  nameHe: string;
  nameEn: string;
  stages: string[]; // emoji for stages 1-4
  color: string;
  waterNeeded: number; // taps to reach each next stage
}

interface SoilPlot {
  id: number;
  stage: GrowthStage;
  plantId: string | null;
  waterTaps: number;
}

interface SeedToken {
  id: string;
  plantId: string;
  used: boolean;
}

// ── Plant definitions ──────────────────────────────────────────────────────────
const PLANTS: PlantDef[] = [
  { id: "sunflower", nameHe: "חמנייה",  nameEn: "Sunflower", stages: ["🌰","🌱","🌿","🌻"], color: "#FFC75F", waterNeeded: 2 },
  { id: "rose",      nameHe: "ורד",      nameEn: "Rose",       stages: ["🌰","🌱","🌿","🌹"], color: "#FF6F91", waterNeeded: 2 },
  { id: "tulip",     nameHe: "צבעוני",   nameEn: "Tulip",      stages: ["🌰","🌱","🌿","🌷"], color: "#FF9EC0", waterNeeded: 2 },
  { id: "tree",      nameHe: "עץ",       nameEn: "Tree",       stages: ["🌰","🌱","🌿","🌳"], color: "#51CF66", waterNeeded: 3 },
  { id: "cherry",    nameHe: "דובדבן",   nameEn: "Cherry",     stages: ["🌰","🌱","🌿","🍒"], color: "#E34234", waterNeeded: 2 },
  { id: "cactus",    nameHe: "קקטוס",    nameEn: "Cactus",     stages: ["🌰","🌵","🌵","🌵"], color: "#7EC8A4", waterNeeded: 1 },
];

const NUM_PLOTS = 4;

function makePlots(): SoilPlot[] {
  return Array.from({ length: NUM_PLOTS }, (_, i) => ({
    id: i,
    stage: 0,
    plantId: null,
    waterTaps: 0,
  }));
}

function makeSeeds(count = 3): SeedToken[] {
  const shuffled = [...PLANTS].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((p) => ({ id: `seed-${p.id}-${Date.now()}`, plantId: p.id, used: false }));
}

// ── Watering Can component ────────────────────────────────────────────────────
function WaterDrops({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 text-blue-400 text-sm pointer-events-none"
              style={{ left: `${40 + i * 15}%` }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 30, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              💧
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MagicGardenPage() {
  const router = useRouter();
  const { particles, celebrate, screenFlash, shake } = useGameJuice();
  const { fireEvent } = useDailyQuests();

  const [plots, setPlots] = useState<SoilPlot[]>(makePlots);
  const [seeds, setSeeds] = useState<SeedToken[]>(() => makeSeeds(3));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [wateringPlot, setWateringPlot] = useState<number | null>(null);
  const [bloomed, setBloomed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState<string | null>("גרור זרע לאדמה!");
  const plotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPlant = (id: string) => PLANTS.find((p) => p.id === id)!;

  // ── Drag seed to plot ──────────────────────────────────────────────────────
  const handleSeedDragEnd = useCallback(
    (seedId: string, info: { point: { x: number; y: number } }) => {
      setDraggingId(null);

      // Find which plot the seed was dropped on
      const targetIdx = plotRefs.current.findIndex((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
          info.point.x >= rect.left &&
          info.point.x <= rect.right &&
          info.point.y >= rect.top &&
          info.point.y <= rect.bottom
        );
      });

      if (targetIdx === -1) return;
      const plot = plots[targetIdx];
      if (plot.stage !== 0) return; // already has a plant

      const seed = seeds.find((s) => s.id === seedId);
      if (!seed || seed.used) return;

      const plant = getPlant(seed.plantId);

      // Plant the seed
      setPlots((prev) =>
        prev.map((p, i) =>
          i === targetIdx ? { ...p, stage: 1, plantId: seed.plantId, waterTaps: 0 } : p
        )
      );
      setSeeds((prev) => prev.map((s) => (s.id === seedId ? { ...s, used: true } : s)));

      speakText(plant.nameHe, "he-IL");
      setHint("עכשיו השקה את הצמח! 💧");

      celebrate(info.point.x, info.point.y);
    },
    [plots, seeds, celebrate]
  );

  // ── Tap to water a plot ────────────────────────────────────────────────────
  const handleWaterPlot = useCallback(
    (plotIdx: number) => {
      const plot = plots[plotIdx];
      if (plot.stage === 0 || plot.stage === 4 || !plot.plantId) return;

      const plant = getPlant(plot.plantId);
      const newTaps = plot.waterTaps + 1;

      setWateringPlot(plotIdx);
      setTimeout(() => setWateringPlot(null), 600);

      if (newTaps >= plant.waterNeeded) {
        // Level up the stage
        const newStage = Math.min(plot.stage + 1, 4) as GrowthStage;
        const updatedPlots = plots.map((p, i) =>
          i === plotIdx ? { ...p, stage: newStage, waterTaps: 0 } : p
        );
        setPlots(updatedPlots);

        if (newStage === 4) {
          // Full bloom!
          const el = plotRefs.current[plotIdx];
          const rect = el?.getBoundingClientRect();
          celebrate(
            rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            rect ? rect.top + rect.height / 2 : window.innerHeight / 2
          );
          speakText(plant.nameHe, "he-IL");
          setHint(null);
          fireEvent("flower_grown");

          const newBloomed = bloomed + 1;
          setBloomed(newBloomed);

          if (newBloomed >= NUM_PLOTS) {
            setTimeout(() => setFinished(true), 1200);
          } else {
            // Refill seeds if all used and there are still empty plots
            setTimeout(() => {
              setSeeds((prev) => {
                const allUsed = prev.every((s) => s.used);
                if (allUsed) return makeSeeds(3);
                return prev;
              });
              setHint("גרור עוד זרע! 🌱");
            }, 800);
          }
        } else {
          speakText(plant.stages[newStage - 1], "he-IL");
        }
      } else {
        setPlots((prev) =>
          prev.map((p, i) => (i === plotIdx ? { ...p, waterTaps: newTaps } : p))
        );
      }
    },
    [plots, bloomed, celebrate, fireEvent]
  );

  const restart = useCallback(() => {
    setPlots(makePlots());
    setSeeds(makeSeeds(3));
    setBloomed(0);
    setFinished(false);
    setHint("גרור זרע לאדמה!");
  }, []);

  if (finished) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #e8f5e9, #c8e6c9)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >🌺</motion.div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-green-700">הגן פרח!</h2>
          <p className="text-lg text-green-600">The garden bloomed!</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={restart}
            className="bg-green-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg text-lg"
          >
            🌱 שוב!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/")}
            className="bg-white text-green-700 font-black px-6 py-3 rounded-2xl shadow-lg text-lg border-2 border-green-300"
          >
            🏠 הבית
          </motion.button>
        </div>
      </div>
    );
  }

  const availableSeeds = seeds.filter((s) => !s.used);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col w-full max-w-md mx-auto px-3 pt-2 pb-4 gap-4 select-none"
      style={{ background: "linear-gradient(180deg, #e8f5e9 0%, #dcedc8 100%)", minHeight: "100dvh" }}
    >
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-black text-green-800">🌻 גן הקסם</h1>
        <p className="text-sm text-green-600">Magic Garden</p>
      </div>

      {/* Hint bubble */}
      <AnimatePresence mode="wait">
        {hint && (
          <motion.div
            key={hint}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/80 rounded-2xl px-4 py-2 text-center shadow-sm"
          >
            <p className="text-green-800 font-bold text-sm">{hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: NUM_PLOTS }).map((_, i) => (
          <motion.div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 border-green-300"
            style={{ background: i < bloomed ? "#4caf50" : "#fff" }}
            animate={i < bloomed ? { scale: [1, 1.3, 1] } : {}}
          >
            {i < bloomed ? "🌸" : "○"}
          </motion.div>
        ))}
      </div>

      {/* Garden plots */}
      <div className="grid grid-cols-2 gap-3">
        {plots.map((plot, i) => {
          const plant = plot.plantId ? getPlant(plot.plantId) : null;
          const stageEmoji = plant && plot.stage > 0 ? plant.stages[plot.stage - 1] : null;
          const isWatering = wateringPlot === i;
          const waterProgress = plant && plot.stage > 0 && plot.stage < 4
            ? plot.waterTaps / plant.waterNeeded
            : 0;

          return (
            <motion.div
              key={plot.id}
              ref={(el) => { plotRefs.current[i] = el; }}
              className="relative rounded-3xl overflow-hidden shadow-md cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #81c784 0%, #6d4c41 60%, #5d4037 100%)",
                minHeight: 130,
              }}
              whileTap={plot.stage > 0 && plot.stage < 4 ? { scale: 0.95 } : {}}
              onClick={() => handleWaterPlot(i)}
            >
              {/* Sky portion */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #b2ebf2 0%, #81c784 45%, #6d4c41 55%, #5d4037 100%)" }} />

              {/* Plant emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                {plot.stage === 0 ? (
                  <div className="flex flex-col items-center gap-1 opacity-30">
                    <span className="text-4xl">🌍</span>
                    <span className="text-xs text-white font-bold">הפל זרע</span>
                  </div>
                ) : (
                  <motion.div
                    className="flex flex-col items-center"
                    animate={plot.stage === 4 ? { rotate: [0, -5, 5, 0] } : {}}
                    transition={{ repeat: plot.stage === 4 ? Infinity : 0, duration: 3 }}
                  >
                    <motion.span
                      key={`${plot.id}-${plot.stage}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ fontSize: 32 + plot.stage * 10 }}
                    >
                      {stageEmoji}
                    </motion.span>
                    {plant && plot.stage < 4 && (
                      <span className="text-[10px] text-white font-bold mt-1 drop-shadow">
                        {plant.nameHe}
                      </span>
                    )}
                    {plant && plot.stage === 4 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-black text-white drop-shadow mt-1"
                      >
                        ✨ {plant.nameHe}
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Water drops animation */}
              <WaterDrops active={isWatering} />

              {/* Water progress bar */}
              {plant && plot.stage > 0 && plot.stage < 4 && (
                <div className="absolute bottom-2 left-3 right-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-400 rounded-full"
                    animate={{ width: `${waterProgress * 100}%` }}
                  />
                </div>
              )}

              {/* Water icon hint */}
              {plot.stage > 0 && plot.stage < 4 && (
                <motion.span
                  className="absolute top-2 right-2 text-lg"
                  animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >💧</motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Seed tray */}
      <div className="bg-amber-100 rounded-3xl p-3 shadow-inner">
        <p className="text-center text-amber-800 font-black text-xs mb-2">
          🌰 {availableSeeds.length > 0 ? "גרור זרע לאדמה!" : "כל הזרעים נשתלו 🌱"}
        </p>
        <div className="flex justify-center gap-4">
          <AnimatePresence>
            {availableSeeds.map((seed) => {
              const plant = getPlant(seed.plantId);
              return (
                <DraggableSeed
                  key={seed.id}
                  seed={seed}
                  plant={plant}
                  isDragging={draggingId === seed.id}
                  onDragStart={() => setDraggingId(seed.id)}
                  onDragEnd={(info) => handleSeedDragEnd(seed.id, info)}
                />
              );
            })}
          </AnimatePresence>
          {availableSeeds.length === 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl"
            >🌿</motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Draggable Seed ─────────────────────────────────────────────────────────────
function DraggableSeed({
  seed,
  plant,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  seed: SeedToken;
  plant: PlantDef;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: (info: { point: { x: number; y: number } }) => void;
}) {
  return (
    <motion.div
      drag
      dragSnapToOrigin
      onDragStart={onDragStart}
      onDragEnd={(_e, info) => onDragEnd(info)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isDragging ? 1.2 : 1,
        opacity: 1,
        y: isDragging ? -10 : [0, -4, 0],
        rotate: isDragging ? 15 : 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 300 },
      }}
      whileTap={{ scale: 1.15 }}
      className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing z-20"
      style={{ touchAction: "none" }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-3 border-white/60"
        style={{ background: plant.color + "cc" }}
      >
        <span className="text-3xl">🌰</span>
      </div>
      <span className="text-[10px] font-black text-amber-900 text-center leading-tight">
        {plant.nameHe}
      </span>
    </motion.div>
  );
}
