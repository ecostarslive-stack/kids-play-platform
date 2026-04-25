"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { speakText } from "@/lib/voice/ttsEngine";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";

interface ShapeDef {
  id: string;
  nameHe: string;
  nameEn: string;
  color: string;
  svgPath: string;
  viewBox: string;
}

const SHAPES: ShapeDef[] = [
  { id: "circle",   nameHe: "עיגול",   nameEn: "Circle",   color: "#f43f5e", svgPath: "M 50 10 A 40 40 0 1 1 49.99 10 Z",                                                                                          viewBox: "0 0 100 100" },
  { id: "square",   nameHe: "ריבוע",   nameEn: "Square",   color: "#3b82f6", svgPath: "M 10 10 H 90 V 90 H 10 Z",                                                                                                   viewBox: "0 0 100 100" },
  { id: "triangle", nameHe: "משולש",   nameEn: "Triangle", color: "#f59e0b", svgPath: "M 50 8 L 92 88 L 8 88 Z",                                                                                                    viewBox: "0 0 100 100" },
  { id: "star",     nameHe: "כוכב",    nameEn: "Star",     color: "#a855f7", svgPath: "M 50 5 L 61 35 L 95 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 5 35 L 39 35 Z",                                          viewBox: "0 0 100 100" },
  { id: "diamond",  nameHe: "יהלום",   nameEn: "Diamond",  color: "#06b6d4", svgPath: "M 50 5 L 95 50 L 50 95 L 5 50 Z",                                                                                           viewBox: "0 0 100 100" },
  { id: "heart",    nameHe: "לב",      nameEn: "Heart",    color: "#ec4899", svgPath: "M 50 85 C 20 65 5 45 5 30 C 5 15 17 8 30 10 C 38 11 46 16 50 22 C 54 16 62 11 70 10 C 83 8 95 15 95 30 C 95 45 80 65 50 85 Z", viewBox: "0 0 100 100" },
];

function makeRounds() {
  return [...SHAPES].sort(() => Math.random() - 0.5).map((shape) => {
    const others = SHAPES.filter((s) => s.id !== shape.id).sort(() => Math.random() - 0.5).slice(0, 2);
    return {
      holeShapeId: shape.id,
      pieces: [shape.id, others[0].id, others[1].id].sort(() => Math.random() - 0.5),
    };
  });
}

function ShapeSvg({ shape, fill, stroke, strokeW = 3, size = 80 }: { shape: ShapeDef; fill: string; stroke?: string; strokeW?: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox={shape.viewBox} style={{ overflow: "visible" }}>
      <path d={shape.svgPath} fill={fill} stroke={stroke ?? "none"} strokeWidth={strokeW} strokeLinejoin="round" />
    </svg>
  );
}

function DraggablePiece({ shape, isDragging, isPlaced, onDragStart, onDragEnd }: {
  shape: ShapeDef; isDragging: boolean; isPlaced: boolean;
  onDragStart: () => void; onDragEnd: (pt: { x: number; y: number }) => void;
}) {
  if (isPlaced) return <div className="w-20 h-20 flex items-center justify-center"><ShapeSvg shape={shape} fill={shape.color + "44"} size={60} /></div>;
  return (
    <motion.div
      drag dragSnapToOrigin
      onDragStart={onDragStart}
      onDragEnd={(_e, info) => onDragEnd(info.point)}
      animate={{ scale: isDragging ? 1.25 : [1, 1.05, 1] }}
      transition={isDragging ? {} : { repeat: Infinity, duration: 2.5 }}
      whileTap={{ scale: 1.1 }}
      className="w-20 h-20 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 select-none"
      style={{ touchAction: "none" }}
    >
      <ShapeSvg shape={shape} fill={shape.color} stroke="white" strokeW={3} size={68} />
    </motion.div>
  );
}

export default function ShapesPage() {
  const router = useRouter();
  const { particles, celebrate, wrongFeedback, screenFlash, shake } = useGameJuice();
  const [rounds] = useState(makeRounds);
  const [roundIdx, setRoundIdx] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const holeRef = useRef<HTMLDivElement>(null);

  const round = rounds[roundIdx];
  const holeShape = SHAPES.find((s) => s.id === round.holeShapeId)!;

  const handleDrop = useCallback((pieceId: string, point: { x: number; y: number }) => {
    setDraggingId(null);
    const rect = holeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const onHole = point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
    if (!onHole) return;

    if (pieceId === round.holeShapeId) {
      setPlacedId(pieceId);
      setScore((s) => s + 10);
      speakText(holeShape.nameHe, "he-IL");
      celebrate(rect.left + rect.width / 2, rect.top + rect.height / 2);
      setTimeout(() => {
        if (roundIdx + 1 >= rounds.length) { setShowComplete(true); }
        else { setRoundIdx((i) => i + 1); setPlacedId(null); }
      }, 900);
    } else {
      setWrongId(pieceId);
      wrongFeedback();
      setTimeout(() => setWrongId(null), 600);
    }
  }, [round, roundIdx, rounds.length, holeShape, celebrate, wrongFeedback]);

  if (showComplete) {
    return (
      <CompletionCelebration show score={score} total={rounds.length * 10} slug="shapes"
        onPlayAgain={() => { setRoundIdx(0); setScore(0); setPlacedId(null); setShowComplete(false); }}
        onGoHome={() => router.push("/")} />
    );
  }

  const pieces = round.pieces.map((id) => SHAPES.find((s) => s.id === id)!);

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto px-4 pt-4 pb-8 gap-5 select-none"
      style={{ background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)", minHeight: "100dvh" }}>
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      <div className="text-center">
        <h1 className="text-2xl font-black text-sky-800">🔷 מיון צורות</h1>
        <p className="text-sm text-sky-500">Shape Sorter</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {rounds.map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-full border-2 border-sky-300"
            style={{ background: i < roundIdx ? "#3b82f6" : i === roundIdx ? "#93c5fd" : "transparent" }} />
        ))}
      </div>

      {/* Shape name label */}
      <motion.div key={round.holeShapeId} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 rounded-2xl px-5 py-2 text-center shadow-sm">
        <p className="text-sky-700 font-black text-base">{holeShape.nameHe} · {holeShape.nameEn}</p>
      </motion.div>

      {/* Hole board */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div ref={holeRef} className="relative flex items-center justify-center rounded-3xl shadow-2xl border-4 border-white/50"
          style={{ width: 210, height: 210, background: "linear-gradient(135deg, #bfdbfe55, #e0f2fe88)" }}>
          {!placedId && (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ShapeSvg shape={holeShape} fill="rgba(255,255,255,0.15)" stroke="rgba(99,170,255,0.8)" strokeW={5} size={140} />
            </motion.div>
          )}
          <AnimatePresence>
            {placedId && (
              <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
                transition={{ type: "spring", stiffness: 280 }} className="absolute">
                <ShapeSvg shape={holeShape} fill={holeShape.color} stroke="white" strokeW={3} size={140} />
              </motion.div>
            )}
          </AnimatePresence>
          {!placedId && (
            <motion.div className="absolute -bottom-8 text-sky-400 font-black text-2xl pointer-events-none"
              animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}>↑</motion.div>
          )}
        </div>
      </div>

      {/* Piece tray */}
      <div className="w-full">
        <p className="text-center text-sky-500 font-bold text-xs mb-3">גרור את הצורה הנכונה לתוך הקופסה</p>
        <div className="flex justify-center gap-5">
          {pieces.map((shape) => (
            <motion.div key={`${round.holeShapeId}-${shape.id}`}
              animate={wrongId === shape.id ? { x: [-12, 12, -8, 8, 0] } : {}} transition={{ duration: 0.35 }}>
              <DraggablePiece shape={shape} isDragging={draggingId === shape.id} isPlaced={placedId === shape.id}
                onDragStart={() => setDraggingId(shape.id)} onDragEnd={(pt) => handleDrop(shape.id, pt)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
