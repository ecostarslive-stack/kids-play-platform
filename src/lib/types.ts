export interface GameItem {
  id: string;
  hebrew: string;
  english: string;
  audio?: string;
  image?: string;
}

export interface HebrewLetter extends GameItem {
  name: string;
  finalForm?: string;
}

export interface NumberItem extends GameItem {
  value: number;
}

export interface ColorItem extends GameItem {
  hex: string;
}

export interface ShapeItem extends GameItem {
  svgPath: string;
}

export interface MemoryCard {
  id: string;
  content: string;
  hebrew: string;
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  image: string;
}

export type GamePhase = "intro" | "playing" | "complete";

export interface GameState {
  phase: GamePhase;
  score: number;
  currentIndex: number;
  totalItems: number;
  correctAnswers: number;
  wrongAnswers: number;
}
