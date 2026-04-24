export interface HebrewWord {
  id: string;
  word: string;
  letters: string[];
  english: string;
  emoji: string;
  difficulty: "easy" | "medium" | "hard";
}

export const hebrewWords: HebrewWord[] = [
  // Easy - 2-3 letter words
  { id: "dog", word: "כלב", letters: ["כ", "ל", "ב"], english: "Dog", emoji: "🐶", difficulty: "easy" },
  { id: "cat", word: "חתול", letters: ["ח", "ת", "ו", "ל"], english: "Cat", emoji: "🐱", difficulty: "easy" },
  { id: "fish", word: "דג", letters: ["ד", "ג"], english: "Fish", emoji: "🐟", difficulty: "easy" },
  { id: "sun", word: "שמש", letters: ["ש", "מ", "ש"], english: "Sun", emoji: "☀️", difficulty: "easy" },
  { id: "mom", word: "אמא", letters: ["א", "מ", "א"], english: "Mom", emoji: "👩", difficulty: "easy" },
  { id: "dad", word: "אבא", letters: ["א", "ב", "א"], english: "Dad", emoji: "👨", difficulty: "easy" },
  { id: "water", word: "מים", letters: ["מ", "י", "ם"], english: "Water", emoji: "💧", difficulty: "easy" },
  { id: "bread", word: "לחם", letters: ["ל", "ח", "ם"], english: "Bread", emoji: "🍞", difficulty: "easy" },
  // Medium - 3-4 letter words
  { id: "flower", word: "פרח", letters: ["פ", "ר", "ח"], english: "Flower", emoji: "🌸", difficulty: "medium" },
  { id: "house", word: "בית", letters: ["ב", "י", "ת"], english: "House", emoji: "🏠", difficulty: "medium" },
  { id: "book", word: "ספר", letters: ["ס", "פ", "ר"], english: "Book", emoji: "📖", difficulty: "medium" },
  { id: "moon", word: "ירח", letters: ["י", "ר", "ח"], english: "Moon", emoji: "🌙", difficulty: "medium" },
  { id: "tree", word: "עץ", letters: ["ע", "ץ"], english: "Tree", emoji: "🌳", difficulty: "medium" },
  { id: "bird", word: "ציפור", letters: ["צ", "י", "פ", "ו", "ר"], english: "Bird", emoji: "🐦", difficulty: "medium" },
  // Hard - 4+ letter words
  { id: "butterfly", word: "פרפר", letters: ["פ", "ר", "פ", "ר"], english: "Butterfly", emoji: "🦋", difficulty: "hard" },
  { id: "elephant", word: "פיל", letters: ["פ", "י", "ל"], english: "Elephant", emoji: "🐘", difficulty: "hard" },
  { id: "school", word: "בית ספר", letters: ["ב", "י", "ת", " ", "ס", "פ", "ר"], english: "School", emoji: "🏫", difficulty: "hard" },
  { id: "balloon", word: "בלון", letters: ["ב", "ל", "ו", "ן"], english: "Balloon", emoji: "🎈", difficulty: "hard" },
  { id: "rainbow", word: "קשת", letters: ["ק", "ש", "ת"], english: "Rainbow", emoji: "🌈", difficulty: "hard" },
  { id: "star", word: "כוכב", letters: ["כ", "ו", "כ", "ב"], english: "Star", emoji: "⭐", difficulty: "hard" },
  { id: "giraffe", word: "גירפה", letters: ["ג", "י", "ר", "פ", "ה"], english: "Giraffe", emoji: "🦒", difficulty: "hard" },
  { id: "icecream", word: "גלידה", letters: ["ג", "ל", "י", "ד", "ה"], english: "Ice cream", emoji: "🍦", difficulty: "hard" },
  { id: "banana", word: "בננה", letters: ["ב", "נ", "נ", "ה"], english: "Banana", emoji: "🍌", difficulty: "hard" },
];
