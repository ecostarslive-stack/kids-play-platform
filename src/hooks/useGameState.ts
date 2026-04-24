"use client";

import { useReducer, useCallback } from "react";
import type { GameState, GamePhase } from "@/lib/types";

type GameAction =
  | { type: "START" }
  | { type: "CORRECT" }
  | { type: "WRONG" }
  | { type: "NEXT" }
  | { type: "COMPLETE" }
  | { type: "RESET"; totalItems: number };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return { ...state, phase: "playing" };
    case "CORRECT":
      return {
        ...state,
        score: state.score + 1,
        correctAnswers: state.correctAnswers + 1,
      };
    case "WRONG":
      return {
        ...state,
        wrongAnswers: state.wrongAnswers + 1,
      };
    case "NEXT":
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return createInitialState(action.totalItems);
    default:
      return state;
  }
}

function createInitialState(totalItems: number): GameState {
  return {
    phase: "intro",
    score: 0,
    currentIndex: 0,
    totalItems,
    correctAnswers: 0,
    wrongAnswers: 0,
  };
}

export function useGameState(totalItems: number) {
  const [state, dispatch] = useReducer(gameReducer, totalItems, createInitialState);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const correct = useCallback(() => dispatch({ type: "CORRECT" }), []);
  const wrong = useCallback(() => dispatch({ type: "WRONG" }), []);
  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const complete = useCallback(() => dispatch({ type: "COMPLETE" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET", totalItems }), [totalItems]);

  return { state, start, correct, wrong, next, complete, reset };
}
