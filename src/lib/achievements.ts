import type { PlayerData } from "@/lib/usePlayerStore";

export interface Achievement {
  id: string;
  emoji: string;
  titleHe: string;
  titleEn: string;
  descHe: string;
  descEn: string;
  check: (p: PlayerData) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_star",
    emoji: "⭐",
    titleHe: "כוכב ראשון",
    titleEn: "First Star",
    descHe: "השגת את הכוכב הראשון שלך",
    descEn: "Earned your first star",
    check: (p) => p.totalStars >= 1,
  },
  {
    id: "ten_stars",
    emoji: "🌟",
    titleHe: "10 כוכבים",
    titleEn: "10 Stars",
    descHe: "אספת 10 כוכבים",
    descEn: "Collected 10 stars",
    check: (p) => p.totalStars >= 10,
  },
  {
    id: "fifty_stars",
    emoji: "💫",
    titleHe: "50 כוכבים",
    titleEn: "50 Stars",
    descHe: "אספת 50 כוכבים",
    descEn: "Collected 50 stars",
    check: (p) => p.totalStars >= 50,
  },
  {
    id: "hundred_stars",
    emoji: "🏆",
    titleHe: "100 כוכבים",
    titleEn: "100 Stars",
    descHe: "גיבור מוחלט - 100 כוכבים!",
    descEn: "Absolute hero — 100 stars!",
    check: (p) => p.totalStars >= 100,
  },
  {
    id: "streak_2",
    emoji: "🔥",
    titleHe: "2 ימים ברצף",
    titleEn: "2-Day Streak",
    descHe: "שיחקת 2 ימים ברצף",
    descEn: "Played 2 days in a row",
    check: (p) => p.streakDays >= 2,
  },
  {
    id: "streak_5",
    emoji: "⚡",
    titleHe: "5 ימים ברצף",
    titleEn: "5-Day Streak",
    descHe: "שיחקת 5 ימים ברצף",
    descEn: "Played 5 days in a row",
    check: (p) => p.streakDays >= 5,
  },
  {
    id: "streak_7",
    emoji: "🦁",
    titleHe: "שבוע מלא",
    titleEn: "Full Week",
    descHe: "שבוע שלם של משחק יומי!",
    descEn: "A full week of daily play!",
    check: (p) => p.streakDays >= 7,
  },
  {
    id: "explorer",
    emoji: "🌈",
    titleHe: "חוקר",
    titleEn: "Explorer",
    descHe: "ברוך הבא לעולם המשחקים",
    descEn: "Welcome to the games world",
    check: (p) => p.onboardingDone,
  },
];

export function getUnlockedAchievements(player: PlayerData): Set<string> {
  return new Set(ACHIEVEMENTS.filter(a => a.check(player)).map(a => a.id));
}
