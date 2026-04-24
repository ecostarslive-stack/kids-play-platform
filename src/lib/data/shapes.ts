import type { ShapeItem } from "@/lib/types";

export const shapes: ShapeItem[] = [
  {
    id: "circle",
    hebrew: "עיגול",
    english: "Circle",
    audio: "/audio/shapes/igul.mp3",
    svgPath: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0",
  },
  {
    id: "square",
    hebrew: "ריבוע",
    english: "Square",
    audio: "/audio/shapes/ribua.mp3",
    svgPath: "M15,15 L85,15 L85,85 L15,85 Z",
  },
  {
    id: "triangle",
    hebrew: "משולש",
    english: "Triangle",
    audio: "/audio/shapes/meshulash.mp3",
    svgPath: "M50,10 L90,85 L10,85 Z",
  },
  {
    id: "star",
    hebrew: "כוכב",
    english: "Star",
    audio: "/audio/shapes/kokhav.mp3",
    svgPath: "M50,5 L61,35 L95,35 L68,57 L79,90 L50,70 L21,90 L32,57 L5,35 L39,35 Z",
  },
  {
    id: "heart",
    hebrew: "לב",
    english: "Heart",
    audio: "/audio/shapes/lev.mp3",
    svgPath: "M50,88 C25,65 5,50 5,30 C5,12 20,5 35,5 C42,5 48,10 50,15 C52,10 58,5 65,5 C80,5 95,12 95,30 C95,50 75,65 50,88 Z",
  },
  {
    id: "diamond",
    hebrew: "מעוין",
    english: "Diamond",
    audio: "/audio/shapes/meuin.mp3",
    svgPath: "M50,5 L90,50 L50,95 L10,50 Z",
  },
];
