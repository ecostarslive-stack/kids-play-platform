export interface EnglishLessonWord {
  id: string;
  english: string;
  hebrew: string;
  pronunciation: string; // How to pronounce English in Hebrew letters
  emoji: string;
}

export interface EnglishLessonPhrase {
  id: string;
  english: string;
  hebrew: string;
  pronunciation: string;
}

export interface EnglishLesson {
  id: string;
  order: number;
  title: string;
  titleEnglish: string;
  description: string;
  emoji: string;
  category: string;
  words: EnglishLessonWord[];
  phrases: EnglishLessonPhrase[];
  teacherIntro: string;
  teacherOutro: string;
}

export const englishLessons: EnglishLesson[] = [
  {
    id: "greetings-en",
    order: 1,
    title: "\u05D1\u05E8\u05DB\u05D5\u05EA",
    titleEnglish: "Greetings",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05DC\u05D5\u05DE\u05E8 \u05E9\u05DC\u05D5\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83D\uDC4B",
    category: "basics",
    teacherIntro: "!\u05E9\u05DC\u05D5\u05DD \u05D7\u05D1\u05E8\u05D9\u05DD! \u05D4\u05D9\u05D5\u05DD \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D9\u05DA \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05E9\u05DC\u05D5\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05DE\u05D5\u05DB\u05E0\u05D9\u05DD? \u05D9\u05D0\u05DC\u05DC\u05D4",
    teacherOutro: "!\u05DE\u05D3\u05D4\u05D9\u05DD! \u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05DC\u05D1\u05E8\u05DA \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3",
    words: [
      { id: "hello", english: "Hello", hebrew: "\u05E9\u05DC\u05D5\u05DD", pronunciation: "\u05D4\u05B6\u05DC\u05D5\u05B9", emoji: "\uD83D\uDC4B" },
      { id: "goodbye", english: "Goodbye", hebrew: "\u05DC\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA", pronunciation: "\u05D2\u05D5\u05BC\u05D3\u05B0\u05D1\u05BC\u05B7\u05D9\u05D9", emoji: "\uD83D\uDC4B" },
      { id: "thanks", english: "Thank you", hebrew: "\u05EA\u05D5\u05D3\u05D4", pronunciation: "\u05EA\u05B6\u05E0\u05B0\u05E7 \u05D9\u05D5\u05BC", emoji: "\uD83D\uDE4F" },
      { id: "please", english: "Please", hebrew: "\u05D1\u05D1\u05E7\u05E9\u05D4", pronunciation: "\u05E4\u05B0\u05BC\u05DC\u05B4\u05D9\u05D6", emoji: "\uD83D\uDE0A" },
      { id: "yes", english: "Yes", hebrew: "\u05DB\u05DF", pronunciation: "\u05D9\u05B6\u05E1", emoji: "\u2705" },
      { id: "no", english: "No", hebrew: "\u05DC\u05D0", pronunciation: "\u05E0\u05D5\u05B9", emoji: "\u274C" },
    ],
    phrases: [
      { id: "how-are-you", english: "How are you?", hebrew: "?\u05DE\u05D4 \u05E9\u05DC\u05D5\u05DE\u05DA", pronunciation: "?\u05D4\u05B8\u05D0\u05D5\u05BC \u05D0\u05B8\u05E8 \u05D9\u05D5\u05BC" },
      { id: "im-fine", english: "I'm fine, thanks", hebrew: "\u05D0\u05E0\u05D9 \u05D1\u05E1\u05D3\u05E8, \u05EA\u05D5\u05D3\u05D4", pronunciation: "\u05D0\u05B7\u05D9\u05B0\u05DD \u05E4\u05B7\u05D9\u05D9\u05DF, \u05EA\u05B6\u05E0\u05B0\u05E7\u05B0\u05E1" },
      { id: "good-morning", english: "Good morning", hebrew: "\u05D1\u05D5\u05E7\u05E8 \u05D8\u05D5\u05D1", pronunciation: "\u05D2\u05D5\u05BC\u05D3 \u05DE\u05D5\u05B9\u05E8\u05B0\u05E0\u05B4\u05D9\u05E0\u05B0\u05D2" },
    ],
  },
  {
    id: "family-en",
    order: 2,
    title: "\u05DE\u05E9\u05E4\u05D7\u05D4",
    titleEnglish: "Family",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05D0\u05EA \u05E9\u05DE\u05D5\u05EA \u05D1\u05E0\u05D9 \u05D4\u05DE\u05E9\u05E4\u05D7\u05D4 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
    category: "people",
    teacherIntro: "!\u05D4\u05D9\u05D5\u05DD \u05E0\u05DC\u05DE\u05D3 \u05E2\u05DC \u05D4\u05DE\u05E9\u05E4\u05D7\u05D4 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05D1\u05D5\u05D0\u05D5 \u05E0\u05EA\u05D7\u05D9\u05DC",
    teacherOutro: "!\u05D9\u05D5\u05E4\u05D9! \u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05DC\u05E1\u05E4\u05E8 \u05E2\u05DC \u05D4\u05DE\u05E9\u05E4\u05D7\u05D4 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    words: [
      { id: "mom", english: "Mom", hebrew: "\u05D0\u05DE\u05D0", pronunciation: "\u05DE\u05B8\u05D0\u05DD", emoji: "\uD83D\uDC69" },
      { id: "dad", english: "Dad", hebrew: "\u05D0\u05D1\u05D0", pronunciation: "\u05D3\u05B6\u05D3", emoji: "\uD83D\uDC68" },
      { id: "brother", english: "Brother", hebrew: "\u05D0\u05D7", pronunciation: "\u05D1\u05B0\u05BC\u05E8\u05B8\u05D3\u05B6\u05E8", emoji: "\uD83D\uDC66" },
      { id: "sister", english: "Sister", hebrew: "\u05D0\u05D7\u05D5\u05EA", pronunciation: "\u05E1\u05B4\u05D9\u05E1\u05B0\u05D8\u05B6\u05E8", emoji: "\uD83D\uDC67" },
      { id: "baby", english: "Baby", hebrew: "\u05EA\u05D9\u05E0\u05D5\u05E7", pronunciation: "\u05D1\u05B5\u05D9\u05D1\u05BC\u05B4\u05D9", emoji: "\uD83D\uDC76" },
      { id: "grandma", english: "Grandma", hebrew: "\u05E1\u05D1\u05EA\u05D0", pronunciation: "\u05D2\u05B0\u05E8\u05B6\u05E0\u05B0\u05D3\u05B0\u05DE\u05B8\u05D0", emoji: "\uD83D\uDC75" },
      { id: "grandpa", english: "Grandpa", hebrew: "\u05E1\u05D1\u05D0", pronunciation: "\u05D2\u05B0\u05E8\u05B6\u05E0\u05B0\u05D3\u05B0\u05E4\u05BC\u05B8\u05D0", emoji: "\uD83D\uDC74" },
    ],
    phrases: [
      { id: "i-have", english: "I have a brother", hebrew: "\u05D9\u05E9 \u05DC\u05D9 \u05D0\u05D7", pronunciation: "\u05D0\u05B7\u05D9\u05D9 \u05D4\u05B6\u05D1 \u05D0\u05B6\u05D4 \u05D1\u05B0\u05BC\u05E8\u05B8\u05D3\u05B6\u05E8" },
      { id: "i-love", english: "I love my family", hebrew: "\u05D0\u05E0\u05D9 \u05D0\u05D5\u05D4\u05D1 \u05D0\u05EA \u05D4\u05DE\u05E9\u05E4\u05D7\u05D4 \u05E9\u05DC\u05D9", pronunciation: "\u05D0\u05B7\u05D9\u05D9 \u05DC\u05B8\u05D0\u05D1 \u05DE\u05B7\u05D9\u05D9 \u05E4\u05B6\u05DE\u05B4\u05D9\u05DC\u05B4\u05D9" },
    ],
  },
  {
    id: "animals-en",
    order: 3,
    title: "\u05D7\u05D9\u05D5\u05EA",
    titleEnglish: "Animals",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05E9\u05DE\u05D5\u05EA \u05D7\u05D9\u05D5\u05EA \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83D\uDC3E",
    category: "nature",
    teacherIntro: "!\u05D0\u05EA\u05DD \u05D0\u05D5\u05D4\u05D1\u05D9\u05DD \u05D7\u05D9\u05D5\u05EA? \u05D1\u05D5\u05D0\u05D5 \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D9\u05DA \u05E7\u05D5\u05E8\u05D0\u05D9\u05DD \u05DC\u05D4\u05DF \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    teacherOutro: "!\u05D5\u05D5\u05D0\u05D5! \u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05DE\u05DB\u05D9\u05E8\u05D9\u05DD \u05D4\u05DE\u05D5\u05DF \u05D7\u05D9\u05D5\u05EA \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    words: [
      { id: "dog", english: "Dog", hebrew: "\u05DB\u05DC\u05D1", pronunciation: "\u05D3\u05D5\u05B9\u05D2", emoji: "\uD83D\uDC36" },
      { id: "cat", english: "Cat", hebrew: "\u05D7\u05EA\u05D5\u05DC", pronunciation: "\u05E7\u05B6\u05D8", emoji: "\uD83D\uDC31" },
      { id: "fish", english: "Fish", hebrew: "\u05D3\u05D2", pronunciation: "\u05E4\u05B4\u05D9\u05E9\u05C1", emoji: "\uD83D\uDC1F" },
      { id: "bird", english: "Bird", hebrew: "\u05E6\u05D9\u05E4\u05D5\u05E8", pronunciation: "\u05D1\u05BC\u05B6\u05E8\u05B0\u05D3", emoji: "\uD83D\uDC26" },
      { id: "rabbit", english: "Rabbit", hebrew: "\u05D0\u05E8\u05E0\u05D1", pronunciation: "\u05E8\u05B6\u05D1\u05BC\u05B4\u05D9\u05D8", emoji: "\uD83D\uDC30" },
      { id: "lion", english: "Lion", hebrew: "\u05D0\u05E8\u05D9\u05D4", pronunciation: "\u05DC\u05B7\u05D9\u05D9\u05D0\u05D5\u05B9\u05DF", emoji: "\uD83E\uDD81" },
      { id: "elephant", english: "Elephant", hebrew: "\u05E4\u05D9\u05DC", pronunciation: "\u05D0\u05B6\u05DC\u05B6\u05E4\u05B6\u05E0\u05B0\u05D8", emoji: "\uD83D\uDC18" },
      { id: "butterfly", english: "Butterfly", hebrew: "\u05E4\u05E8\u05E4\u05E8", pronunciation: "\u05D1\u05BC\u05B8\u05D0\u05D8\u05B6\u05E8\u05B0\u05E4\u05B0\u05DC\u05B7\u05D9\u05D9", emoji: "\uD83E\uDD8B" },
    ],
    phrases: [
      { id: "i-see", english: "I see a dog", hebrew: "\u05D0\u05E0\u05D9 \u05E8\u05D5\u05D0\u05D4 \u05DB\u05DC\u05D1", pronunciation: "\u05D0\u05B7\u05D9\u05D9 \u05E1\u05B4\u05D9 \u05D0\u05B6\u05D4 \u05D3\u05D5\u05B9\u05D2" },
      { id: "its-a", english: "It's a cat", hebrew: "\u05D6\u05D4 \u05D7\u05EA\u05D5\u05DC", pronunciation: "\u05D0\u05B4\u05D9\u05D8\u05B0\u05E1 \u05D0\u05B6\u05D4 \u05E7\u05B6\u05D8" },
    ],
  },
  {
    id: "food-en",
    order: 4,
    title: "\u05D0\u05D5\u05DB\u05DC",
    titleEnglish: "Food",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05E9\u05DE\u05D5\u05EA \u05D0\u05D5\u05DB\u05DC \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83C\uDF55",
    category: "daily",
    teacherIntro: "!\u05E8\u05E2\u05D1\u05D9\u05DD? \u05D1\u05D5\u05D0\u05D5 \u05E0\u05DC\u05DE\u05D3 \u05DE\u05D9\u05DC\u05D9\u05DD \u05E2\u05DC \u05D0\u05D5\u05DB\u05DC \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05D9\u05D0\u05DE\u05D9",
    teacherOutro: "!\u05D0\u05EA\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5 \u05DC\u05D4\u05D6\u05DE\u05D9\u05DF \u05D0\u05D5\u05DB\u05DC \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05E1\u05D1\u05D1\u05D4",
    words: [
      { id: "bread", english: "Bread", hebrew: "\u05DC\u05D7\u05DD", pronunciation: "\u05D1\u05B0\u05BC\u05E8\u05B6\u05D3", emoji: "\uD83C\uDF5E" },
      { id: "water", english: "Water", hebrew: "\u05DE\u05D9\u05DD", pronunciation: "\u05D5\u05D5\u05B9\u05D8\u05B6\u05E8", emoji: "\uD83D\uDCA7" },
      { id: "apple", english: "Apple", hebrew: "\u05EA\u05E4\u05D5\u05D7", pronunciation: "\u05D0\u05B6\u05E4\u05B0\u05BC\u05DC", emoji: "\uD83C\uDF4E" },
      { id: "milk", english: "Milk", hebrew: "\u05D7\u05DC\u05D1", pronunciation: "\u05DE\u05B4\u05D9\u05DC\u05B0\u05E7", emoji: "\uD83E\uDD5B" },
      { id: "cake", english: "Cake", hebrew: "\u05E2\u05D5\u05D2\u05D4", pronunciation: "\u05E7\u05B5\u05D9\u05D9\u05E7", emoji: "\uD83C\uDF82" },
      { id: "ice-cream", english: "Ice cream", hebrew: "\u05D2\u05DC\u05D9\u05D3\u05D4", pronunciation: "\u05D0\u05B7\u05D9\u05D9\u05E1 \u05E7\u05B0\u05E8\u05B4\u05D9\u05DD", emoji: "\uD83C\uDF66" },
      { id: "banana", english: "Banana", hebrew: "\u05D1\u05E0\u05E0\u05D4", pronunciation: "\u05D1\u05BC\u05B8\u05E0\u05B8\u05E0\u05B8\u05D4", emoji: "\uD83C\uDF4C" },
    ],
    phrases: [
      { id: "im-hungry", english: "I'm hungry", hebrew: "\u05D0\u05E0\u05D9 \u05E8\u05E2\u05D1", pronunciation: "\u05D0\u05B7\u05D9\u05B0\u05DD \u05D4\u05B8\u05E0\u05B0\u05D2\u05B0\u05E8\u05B4\u05D9" },
      { id: "im-thirsty", english: "I'm thirsty", hebrew: "\u05D0\u05E0\u05D9 \u05E6\u05DE\u05D0", pronunciation: "\u05D0\u05B7\u05D9\u05B0\u05DD \u05EA\u05B6\u05E8\u05B0\u05E1\u05B0\u05D8\u05B4\u05D9" },
    ],
  },
  {
    id: "colors-en",
    order: 5,
    title: "\u05E6\u05D1\u05E2\u05D9\u05DD",
    titleEnglish: "Colors",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05E6\u05D1\u05E2\u05D9\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83C\uDF08",
    category: "basics",
    teacherIntro: "!\u05DB\u05DE\u05D4 \u05E6\u05D1\u05E2\u05D9\u05DD \u05D9\u05E4\u05D9\u05DD \u05E1\u05D1\u05D9\u05D1\u05E0\u05D5! \u05D1\u05D5\u05D0\u05D5 \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    teacherOutro: "!\u05DE\u05E2\u05D5\u05DC\u05D4! \u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05DE\u05DB\u05D9\u05E8\u05D9\u05DD \u05D0\u05EA \u05DB\u05DC \u05D4\u05E6\u05D1\u05E2\u05D9\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    words: [
      { id: "red", english: "Red", hebrew: "\u05D0\u05D3\u05D5\u05DD", pronunciation: "\u05E8\u05B6\u05D3", emoji: "\uD83D\uDD34" },
      { id: "blue", english: "Blue", hebrew: "\u05DB\u05D7\u05D5\u05DC", pronunciation: "\u05D1\u05B0\u05BC\u05DC\u05D5\u05BC", emoji: "\uD83D\uDD35" },
      { id: "green", english: "Green", hebrew: "\u05D9\u05E8\u05D5\u05E7", pronunciation: "\u05D2\u05B0\u05E8\u05B4\u05D9\u05DF", emoji: "\uD83D\uDFE2" },
      { id: "yellow", english: "Yellow", hebrew: "\u05E6\u05D4\u05D5\u05D1", pronunciation: "\u05D9\u05B6\u05DC\u05D5\u05B9", emoji: "\uD83D\uDFE1" },
      { id: "orange", english: "Orange", hebrew: "\u05DB\u05EA\u05D5\u05DD", pronunciation: "\u05D0\u05D5\u05B9\u05E8\u05B6\u05E0\u05B0\u05D2\u05F3", emoji: "\uD83D\uDFE0" },
      { id: "purple", english: "Purple", hebrew: "\u05E1\u05D2\u05D5\u05DC", pronunciation: "\u05E4\u05BC\u05B6\u05E8\u05B0\u05E4\u05BC\u05B0\u05DC", emoji: "\uD83D\uDFE3" },
      { id: "white", english: "White", hebrew: "\u05DC\u05D1\u05DF", pronunciation: "\u05D5\u05D5\u05B7\u05D9\u05D9\u05D8", emoji: "\u2B1C" },
      { id: "black", english: "Black", hebrew: "\u05E9\u05D7\u05D5\u05E8", pronunciation: "\u05D1\u05B0\u05BC\u05DC\u05B6\u05E7", emoji: "\u2B1B" },
    ],
    phrases: [
      { id: "its-red", english: "It's red", hebrew: "\u05D6\u05D4 \u05D0\u05D3\u05D5\u05DD", pronunciation: "\u05D0\u05B4\u05D9\u05D8\u05B0\u05E1 \u05E8\u05B6\u05D3" },
      { id: "my-fav", english: "My favorite color is blue", hebrew: "\u05D4\u05E6\u05D1\u05E2 \u05D4\u05D0\u05D4\u05D5\u05D1 \u05E2\u05DC\u05D9\u05D9 \u05D4\u05D5\u05D0 \u05DB\u05D7\u05D5\u05DC", pronunciation: "\u05DE\u05B7\u05D9\u05D9 \u05E4\u05B5\u05D9\u05D9\u05D1\u05B0\u05E8\u05B4\u05D9\u05D8 \u05E7\u05B8\u05D0\u05DC\u05D5\u05B9\u05E8 \u05D0\u05B4\u05D9\u05D6 \u05D1\u05B0\u05BC\u05DC\u05D5\u05BC" },
    ],
  },
  {
    id: "numbers-en",
    order: 6,
    title: "\u05DE\u05E1\u05E4\u05E8\u05D9\u05DD",
    titleEnglish: "Numbers",
    description: "!\u05E1\u05D5\u05E4\u05E8\u05D9\u05DD \u05E2\u05D3 \u05E2\u05E9\u05E8 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83D\uDD22",
    category: "basics",
    teacherIntro: "!\u05D1\u05D5\u05D0\u05D5 \u05E0\u05E1\u05E4\u05D5\u05E8 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05D0\u05D7\u05D3, \u05E9\u05EA\u05D9\u05D9\u05DD, \u05E9\u05DC\u05D5\u05E9... \u05D0\u05D1\u05DC \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    teacherOutro: "!\u05DE\u05E6\u05D5\u05D9\u05DF! \u05D0\u05EA\u05DD \u05E1\u05D5\u05E4\u05E8\u05D9\u05DD \u05DB\u05DE\u05D5 \u05D9\u05DC\u05D3\u05D9\u05DD \u05D0\u05DE\u05E8\u05D9\u05E7\u05D0\u05D9\u05DD",
    words: [
      { id: "one", english: "One", hebrew: "\u05D0\u05D7\u05EA", pronunciation: "\u05D5\u05B8\u05D5\u05D0\u05DF", emoji: "1\uFE0F\u20E3" },
      { id: "two", english: "Two", hebrew: "\u05E9\u05EA\u05D9\u05D9\u05DD", pronunciation: "\u05D8\u05D5\u05BC", emoji: "2\uFE0F\u20E3" },
      { id: "three", english: "Three", hebrew: "\u05E9\u05DC\u05D5\u05E9", pronunciation: "\u05EA\u05B0\u05E8\u05B4\u05D9", emoji: "3\uFE0F\u20E3" },
      { id: "four", english: "Four", hebrew: "\u05D0\u05E8\u05D1\u05E2", pronunciation: "\u05E4\u05D5\u05B9\u05E8", emoji: "4\uFE0F\u20E3" },
      { id: "five", english: "Five", hebrew: "\u05D7\u05DE\u05E9", pronunciation: "\u05E4\u05B7\u05D9\u05D9\u05D1", emoji: "5\uFE0F\u20E3" },
      { id: "six", english: "Six", hebrew: "\u05E9\u05E9", pronunciation: "\u05E1\u05B4\u05D9\u05E7\u05B0\u05E1", emoji: "6\uFE0F\u20E3" },
      { id: "seven", english: "Seven", hebrew: "\u05E9\u05D1\u05E2", pronunciation: "\u05E1\u05B6\u05D1\u05B6\u05DF", emoji: "7\uFE0F\u20E3" },
      { id: "eight", english: "Eight", hebrew: "\u05E9\u05DE\u05D5\u05E0\u05D4", pronunciation: "\u05D0\u05B5\u05D9\u05D9\u05D8", emoji: "8\uFE0F\u20E3" },
      { id: "nine", english: "Nine", hebrew: "\u05EA\u05E9\u05E2", pronunciation: "\u05E0\u05B7\u05D9\u05D9\u05DF", emoji: "9\uFE0F\u20E3" },
      { id: "ten", english: "Ten", hebrew: "\u05E2\u05E9\u05E8", pronunciation: "\u05D8\u05B6\u05DF", emoji: "\uD83D\uDD1F" },
    ],
    phrases: [
      { id: "counting", english: "One, two, three!", hebrew: "!\u05D0\u05D7\u05EA, \u05E9\u05EA\u05D9\u05D9\u05DD, \u05E9\u05DC\u05D5\u05E9", pronunciation: "!\u05D5\u05B8\u05D5\u05D0\u05DF, \u05D8\u05D5\u05BC, \u05EA\u05B0\u05E8\u05B4\u05D9" },
    ],
  },
  {
    id: "body-en",
    order: 7,
    title: "\u05D4\u05D2\u05D5\u05E3 \u05E9\u05DC\u05D9",
    titleEnglish: "My Body",
    description: "!\u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05D7\u05DC\u05E7\u05D9 \u05D2\u05D5\u05E3 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83E\uDD38",
    category: "people",
    teacherIntro: "!\u05EA\u05D2\u05E2\u05D5 \u05D1\u05E8\u05D0\u05E9! \u05EA\u05D2\u05E2\u05D5 \u05D1\u05D0\u05E3! \u05D1\u05D5\u05D0\u05D5 \u05E0\u05DC\u05DE\u05D3 \u05D7\u05DC\u05E7\u05D9 \u05D2\u05D5\u05E3 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    teacherOutro: "!\u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05DE\u05DB\u05D9\u05E8\u05D9\u05DD \u05D0\u05EA \u05DB\u05DC \u05D7\u05DC\u05E7\u05D9 \u05D4\u05D2\u05D5\u05E3 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA! \u05E0\u05D4\u05D3\u05E8",
    words: [
      { id: "head", english: "Head", hebrew: "\u05E8\u05D0\u05E9", pronunciation: "\u05D4\u05B6\u05D3", emoji: "\uD83D\uDDE3\uFE0F" },
      { id: "eyes", english: "Eyes", hebrew: "\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD", pronunciation: "\u05D0\u05B7\u05D9\u05D9\u05D6", emoji: "\uD83D\uDC40" },
      { id: "nose", english: "Nose", hebrew: "\u05D0\u05E3", pronunciation: "\u05E0\u05D5\u05B9\u05D6", emoji: "\uD83D\uDC43" },
      { id: "mouth", english: "Mouth", hebrew: "\u05E4\u05D4", pronunciation: "\u05DE\u05B8\u05D0\u05D5\u05BC\u05EA\u05F3", emoji: "\uD83D\uDC44" },
      { id: "ears", english: "Ears", hebrew: "\u05D0\u05D5\u05D6\u05E0\u05D9\u05D9\u05DD", pronunciation: "\u05D0\u05B4\u05D9\u05E8\u05B0\u05D6", emoji: "\uD83D\uDC42" },
      { id: "hands", english: "Hands", hebrew: "\u05D9\u05D3\u05D9\u05D9\u05DD", pronunciation: "\u05D4\u05B6\u05E0\u05B0\u05D3\u05B0\u05D6", emoji: "\uD83E\uDD32" },
      { id: "feet", english: "Feet", hebrew: "\u05E8\u05D2\u05DC\u05D9\u05D9\u05DD", pronunciation: "\u05E4\u05B4\u05D9\u05D8", emoji: "\uD83E\uDDB6" },
    ],
    phrases: [
      { id: "touch", english: "Touch your nose!", hebrew: "!\u05EA\u05D2\u05E2 \u05D1\u05D0\u05E3 \u05E9\u05DC\u05DA", pronunciation: "!\u05D8\u05B8\u05D0\u05E6\u05F3 \u05D9\u05D5\u05B9\u05E8 \u05E0\u05D5\u05B9\u05D6" },
    ],
  },
  {
    id: "feelings-en",
    order: 8,
    title: "\u05E8\u05D2\u05E9\u05D5\u05EA",
    titleEnglish: "Feelings",
    description: "!\u05DE\u05E1\u05E4\u05E8\u05D9\u05DD \u05D0\u05D9\u05DA \u05D0\u05E0\u05D7\u05E0\u05D5 \u05DE\u05E8\u05D2\u05D9\u05E9\u05D9\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    emoji: "\uD83D\uDE0A",
    category: "people",
    teacherIntro: "!\u05D0\u05D9\u05DA \u05D0\u05EA\u05DD \u05DE\u05E8\u05D2\u05D9\u05E9\u05D9\u05DD \u05D4\u05D9\u05D5\u05DD? \u05D1\u05D5\u05D0\u05D5 \u05E0\u05DC\u05DE\u05D3 \u05DC\u05E1\u05E4\u05E8 \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    teacherOutro: "!\u05E2\u05DB\u05E9\u05D9\u05D5 \u05D0\u05EA\u05DD \u05D9\u05DB\u05D5\u05DC\u05D9\u05DD \u05DC\u05E1\u05E4\u05E8 \u05DC\u05DB\u05D5\u05DC\u05DD \u05D0\u05D9\u05DA \u05D0\u05EA\u05DD \u05DE\u05E8\u05D2\u05D9\u05E9\u05D9\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    words: [
      { id: "happy", english: "Happy", hebrew: "\u05E9\u05DE\u05D7", pronunciation: "\u05D4\u05B6\u05E4\u05BC\u05B4\u05D9", emoji: "\uD83D\uDE0A" },
      { id: "sad", english: "Sad", hebrew: "\u05E2\u05E6\u05D5\u05D1", pronunciation: "\u05E1\u05B6\u05D3", emoji: "\uD83D\uDE22" },
      { id: "tired", english: "Tired", hebrew: "\u05E2\u05D9\u05D9\u05E3", pronunciation: "\u05D8\u05B7\u05D9\u05D9\u05B6\u05E8\u05B0\u05D3", emoji: "\uD83D\uDE34" },
      { id: "hungry", english: "Hungry", hebrew: "\u05E8\u05E2\u05D1", pronunciation: "\u05D4\u05B8\u05E0\u05B0\u05D2\u05B0\u05E8\u05B4\u05D9", emoji: "\uD83E\uDD24" },
      { id: "scared", english: "Scared", hebrew: "\u05DE\u05E4\u05D7\u05D3", pronunciation: "\u05E1\u05B0\u05E7\u05B6\u05E8\u05B0\u05D3", emoji: "\uD83D\uDE28" },
      { id: "excited", english: "Excited", hebrew: "\u05E0\u05E8\u05D2\u05E9", pronunciation: "\u05D0\u05B6\u05E7\u05B0\u05E1\u05B7\u05D9\u05D9\u05D8\u05B6\u05D3", emoji: "\uD83E\uDD29" },
      { id: "angry", english: "Angry", hebrew: "\u05DB\u05D5\u05E2\u05E1", pronunciation: "\u05D0\u05B6\u05E0\u05B0\u05D2\u05B0\u05E8\u05B4\u05D9", emoji: "\uD83D\uDE20" },
      { id: "love", english: "Love", hebrew: "\u05D0\u05D4\u05D1\u05D4", pronunciation: "\u05DC\u05B8\u05D0\u05D1", emoji: "\u2764\uFE0F" },
    ],
    phrases: [
      { id: "im-happy", english: "I'm happy!", hebrew: "!\u05D0\u05E0\u05D9 \u05E9\u05DE\u05D7", pronunciation: "!\u05D0\u05B7\u05D9\u05B0\u05DD \u05D4\u05B6\u05E4\u05BC\u05B4\u05D9" },
      { id: "i-love-you", english: "I love you", hebrew: "\u05D0\u05E0\u05D9 \u05D0\u05D5\u05D4\u05D1 \u05D0\u05D5\u05EA\u05DA", pronunciation: "\u05D0\u05B7\u05D9\u05D9 \u05DC\u05B8\u05D0\u05D1 \u05D9\u05D5\u05BC" },
    ],
  },
];
