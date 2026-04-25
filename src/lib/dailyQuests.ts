// Daily quest system — persisted in localStorage

export interface Quest {
  id: string;
  icon: string;
  labelHe: string;
  labelEn: string;
  target: number; // how many times to complete
  progress: number;
  done: boolean;
  rewardStars: number;
}

export interface DailyQuestState {
  date: string; // YYYY-MM-DD
  quests: Quest[];
  allDone: boolean;
  bonusAwarded: boolean;
}

const STORAGE_KEY = "kids-play-daily-quests";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Pool of possible quests — 3 are picked per day based on day-of-year
const QUEST_POOL: Omit<Quest, "progress" | "done">[] = [
  { id: "play3",       icon: "🎮", labelHe: "שחק 3 משחקים",        labelEn: "Play 3 games",          target: 3,  rewardStars: 5  },
  { id: "alefbet",     icon: "🔤", labelHe: "סיים אלף-בית פעם אחת", labelEn: "Complete Alef-Bet",      target: 1,  rewardStars: 8  },
  { id: "catch10",     icon: "🔢", labelHe: "תפוס 10 פריטים במספרים", labelEn: "Catch 10 in Numbers",  target: 10, rewardStars: 6  },
  { id: "paint3",      icon: "🎨", labelHe: "צייר 3 ציורים בצבעים",  labelEn: "Paint 3 in Colors",    target: 3,  rewardStars: 5  },
  { id: "kitchen2",    icon: "🍳", labelHe: "בשל 2 מתכונים",         labelEn: "Cook 2 recipes",        target: 2,  rewardStars: 7  },
  { id: "garden3",     icon: "🌻", labelHe: "גדל 3 פרחים",           labelEn: "Grow 3 flowers",        target: 3,  rewardStars: 6  },
  { id: "dress3",      icon: "👗", labelHe: "לבש 3 תלבושות",         labelEn: "Try 3 outfits",         target: 3,  rewardStars: 5  },
  { id: "streak",      icon: "🔥", labelHe: "שחק היום",              labelEn: "Play today",            target: 1,  rewardStars: 3  },
  { id: "stars15",     icon: "⭐", labelHe: "אסוף 15 כוכבים",         labelEn: "Collect 15 stars",      target: 15, rewardStars: 10 },
  { id: "memory2",     icon: "🧠", labelHe: "סיים זיכרון 2 פעמים",   labelEn: "Finish Memory twice",   target: 2,  rewardStars: 6  },
];

function pickQuestsForDate(dateStr: string): Omit<Quest, "progress" | "done">[] {
  // Use date as seed to always pick same quests for same day
  const dayNum = Math.floor(new Date(dateStr).getTime() / 86400000);
  const indices: number[] = [];
  let seed = dayNum;
  while (indices.length < 3) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const idx = seed % QUEST_POOL.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map((i) => QUEST_POOL[i]);
}

function freshState(): DailyQuestState {
  const today = todayStr();
  const templates = pickQuestsForDate(today);
  return {
    date: today,
    quests: templates.map((q) => ({ ...q, progress: 0, done: false })),
    allDone: false,
    bonusAwarded: false,
  };
}

export function loadDailyQuests(): DailyQuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved: DailyQuestState = JSON.parse(raw);
    if (saved.date !== todayStr()) return freshState(); // new day
    return saved;
  } catch {
    return freshState();
  }
}

export function saveDailyQuests(state: DailyQuestState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Increment progress for a quest by event id.
 * Returns updated state (call saveDailyQuests after).
 */
export function progressQuest(state: DailyQuestState, questId: string, amount = 1): DailyQuestState {
  const quests = state.quests.map((q) => {
    if (q.id !== questId || q.done) return q;
    const progress = Math.min(q.progress + amount, q.target);
    const done = progress >= q.target;
    return { ...q, progress, done };
  });
  const allDone = quests.every((q) => q.done);
  return { ...state, quests, allDone };
}

/**
 * Generic event hook: maps a game action to which quest(s) it advances.
 */
export function recordGameEvent(
  state: DailyQuestState,
  event: "game_played" | "alefbet_complete" | "number_caught" | "color_painted" | "recipe_cooked" | "flower_grown" | "outfit_tried" | "star_earned" | "memory_complete"
): DailyQuestState {
  let next = state;
  switch (event) {
    case "game_played":
      next = progressQuest(next, "play3");
      next = progressQuest(next, "streak");
      break;
    case "alefbet_complete":
      next = progressQuest(next, "alefbet");
      break;
    case "number_caught":
      next = progressQuest(next, "catch10");
      break;
    case "color_painted":
      next = progressQuest(next, "paint3");
      break;
    case "recipe_cooked":
      next = progressQuest(next, "kitchen2");
      break;
    case "flower_grown":
      next = progressQuest(next, "garden3");
      break;
    case "outfit_tried":
      next = progressQuest(next, "dress3");
      break;
    case "star_earned":
      next = progressQuest(next, "stars15");
      break;
    case "memory_complete":
      next = progressQuest(next, "memory2");
      break;
  }
  return next;
}
