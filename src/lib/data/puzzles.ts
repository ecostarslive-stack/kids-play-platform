export interface PuzzleData {
  id: string;
  name: string;
  emoji: string;
  pieces: string[];
}

export const puzzles: PuzzleData[] = [
  {
    id: "animals",
    name: "חיות",
    emoji: "🦁",
    pieces: ["🐱", "🐶", "🐰", "🐻", "🦊", "🐸", "🐵", "🐷", "🐮"],
  },
  {
    id: "fruits",
    name: "פירות",
    emoji: "🍎",
    pieces: ["🍎", "🍌", "🍊", "🍇", "🍓", "🍑", "🍒", "🥝", "🍍"],
  },
  {
    id: "vehicles",
    name: "כלי תחבורה",
    emoji: "🚗",
    pieces: ["🚗", "🚌", "🚂", "✈️", "🚢", "🚲", "🏍️", "🚁", "🛸"],
  },
];
