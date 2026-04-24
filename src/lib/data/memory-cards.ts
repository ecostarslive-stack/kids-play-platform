export interface MemoryCardData {
  id: string;
  emoji: string;
  hebrew: string;
  english: string;
}

export const memoryCardPairs: MemoryCardData[] = [
  { id: "cat", emoji: "🐱", hebrew: "חתול", english: "Cat" },
  { id: "dog", emoji: "🐶", hebrew: "כלב", english: "Dog" },
  { id: "fish", emoji: "🐟", hebrew: "דג", english: "Fish" },
  { id: "bird", emoji: "🐦", hebrew: "ציפור", english: "Bird" },
  { id: "flower", emoji: "🌸", hebrew: "פרח", english: "Flower" },
  { id: "sun", emoji: "☀️", hebrew: "שמש", english: "Sun" },
  { id: "moon", emoji: "🌙", hebrew: "ירח", english: "Moon" },
  { id: "star", emoji: "⭐", hebrew: "כוכב", english: "Star" },
  { id: "apple", emoji: "🍎", hebrew: "תפוח", english: "Apple" },
  { id: "banana", emoji: "🍌", hebrew: "בננה", english: "Banana" },
];
