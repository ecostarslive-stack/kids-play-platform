"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";
import { BigButton } from "@/components/ui/BigButton";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { puzzles } from "@/lib/data/puzzles";
import { shuffleArray } from "@/lib/utils";

type Phase = "intro" | "playing" | "complete";

export default function PuzzlePage() {
  const router = useRouter();
  const { playCorrect, playWrong, playCheer } = useGameSound();

  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedPuzzle, setSelectedPuzzle] = useState(puzzles[0]);
  const [pieces, setPieces] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const startGame = useCallback(
    (puzzle: typeof puzzles[0]) => {
      setSelectedPuzzle(puzzle);
      let shuffled = shuffleArray([...puzzle.pieces]);
      // Make sure it's not already solved
      while (shuffled.join("") === puzzle.pieces.join("")) {
        shuffled = shuffleArray([...puzzle.pieces]);
      }
      setPieces(shuffled);
      setSelectedIndex(null);
      setMoves(0);
      setPhase("playing");
    },
    []
  );

  const handlePieceClick = useCallback(
    (index: number) => {
      if (selectedIndex === null) {
        setSelectedIndex(index);
        return;
      }

      if (selectedIndex === index) {
        setSelectedIndex(null);
        return;
      }

      // Swap pieces
      const newPieces = [...pieces];
      [newPieces[selectedIndex], newPieces[index]] = [newPieces[index], newPieces[selectedIndex]];
      setPieces(newPieces);
      setMoves((m) => m + 1);
      setSelectedIndex(null);

      // Check if correct position for swapped pieces
      if (
        newPieces[selectedIndex] === selectedPuzzle.pieces[selectedIndex] ||
        newPieces[index] === selectedPuzzle.pieces[index]
      ) {
        playCorrect();
      }

      // Check if puzzle is complete
      if (newPieces.join("") === selectedPuzzle.pieces.join("")) {
        setTimeout(() => {
          playCheer();
          setPhase("complete");
        }, 500);
      }
    },
    [selectedIndex, pieces, selectedPuzzle, playCorrect, playCheer]
  );

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl"
        >
          🧩
        </motion.div>
        <h1 className="text-4xl font-black">פאזל</h1>
        <p className="text-lg text-foreground/70">!סדרו את החלקים במקום הנכון</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {puzzles.map((puzzle) => (
            <motion.button
              key={puzzle.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startGame(puzzle)}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4
                text-xl font-bold hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl">{puzzle.emoji}</span>
              <span>{puzzle.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={Math.max(0, 10 - moves)}
        total={10}
        onPlayAgain={() => startGame(selectedPuzzle)}
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <span className="text-lg font-bold">🔄 מהלכים: {moves}</span>
        <span className="text-lg font-bold">{selectedPuzzle.name} {selectedPuzzle.emoji}</span>
      </div>

      {/* Target order reference */}
      <div className="bg-white/50 rounded-2xl p-3">
        <p className="text-sm font-bold text-center mb-2 text-foreground/60">:הסדר הנכון</p>
        <div className="grid grid-cols-9 gap-1">
          {selectedPuzzle.pieces.map((piece, i) => (
            <span key={i} className="text-lg text-center">{piece}</span>
          ))}
        </div>
      </div>

      {/* Puzzle grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
        {pieces.map((piece, index) => {
          const isCorrect = piece === selectedPuzzle.pieces[index];
          const isSelected = selectedIndex === index;

          return (
            <motion.button
              key={`${index}-${piece}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePieceClick(index)}
              className={`aspect-square rounded-2xl shadow-md text-4xl flex items-center justify-center
                transition-all ${
                  isSelected
                    ? "ring-4 ring-info bg-info/10 scale-110"
                    : isCorrect
                    ? "bg-success/10 ring-2 ring-success"
                    : "bg-white"
                }`}
            >
              {piece}
            </motion.button>
          );
        })}
      </div>

      <BigButton
        onClick={() => setPhase("intro")}
        variant="secondary"
      >
        🔙 בחרו פאזל אחר
      </BigButton>
    </div>
  );
}
