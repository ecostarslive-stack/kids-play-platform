export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
} as const;

export const SPRING_CONFIG = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 10 },
  stiff: { type: "spring" as const, stiffness: 400, damping: 30 },
} as const;

export const GAME_CONFIG = {
  MEMORY_PAIRS: 6,
  PUZZLE_PIECES: 9,
  FLIP_DELAY: 800,
  CORRECT_DELAY: 1000,
  CELEBRATION_DURATION: 3000,
} as const;
