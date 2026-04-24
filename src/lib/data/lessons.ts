export interface LessonWord {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string;
  emoji: string;
}

export interface LessonPhrase {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  titleHebrew: string;
  description: string;
  emoji: string;
  category: string;
  words: LessonWord[];
  phrases: LessonPhrase[];
  teacherIntro: string; // English intro spoken by teacher
  teacherOutro: string; // English outro
}

export const lessons: Lesson[] = [
  {
    id: "greetings",
    order: 1,
    title: "Greetings",
    titleHebrew: "ברכות",
    description: "Learn to say hello, goodbye, and be polite!",
    emoji: "👋",
    category: "basics",
    teacherIntro: "Hi there! Today we're going to learn how to say hello and goodbye in Hebrew! Are you ready? Let's go!",
    teacherOutro: "Amazing job! Now you can greet people in Hebrew! You're a superstar!",
    words: [
      { id: "shalom", hebrew: "שלום", english: "Hello / Goodbye", transliteration: "Sha-lom", emoji: "👋" },
      { id: "toda", hebrew: "תודה", english: "Thank you", transliteration: "To-da", emoji: "🙏" },
      { id: "bevakasha", hebrew: "בבקשה", english: "Please / You're welcome", transliteration: "Be-va-ka-sha", emoji: "😊" },
      { id: "ken", hebrew: "כן", english: "Yes", transliteration: "Ken", emoji: "✅" },
      { id: "lo", hebrew: "לא", english: "No", transliteration: "Lo", emoji: "❌" },
      { id: "slicha", hebrew: "סליחה", english: "Sorry / Excuse me", transliteration: "Sli-kha", emoji: "🙈" },
    ],
    phrases: [
      { id: "ma-shlomcha", hebrew: "מה שלומך?", english: "How are you?", transliteration: "Ma shlo-mkha?" },
      { id: "tov-toda", hebrew: "טוב, תודה", english: "Good, thank you", transliteration: "Tov, to-da" },
      { id: "boker-tov", hebrew: "בוקר טוב", english: "Good morning", transliteration: "Bo-ker tov" },
      { id: "laila-tov", hebrew: "לילה טוב", english: "Good night", transliteration: "Lai-la tov" },
    ],
  },
  {
    id: "family",
    order: 2,
    title: "My Family",
    titleHebrew: "המשפחה שלי",
    description: "Learn the names of family members!",
    emoji: "👨‍👩‍👧‍👦",
    category: "people",
    teacherIntro: "Let's learn about family in Hebrew! Who's in your family? Let's find out what to call them!",
    teacherOutro: "Wonderful! Now you can talk about your family in Hebrew!",
    words: [
      { id: "ima", hebrew: "אמא", english: "Mom", transliteration: "I-ma", emoji: "👩" },
      { id: "aba", hebrew: "אבא", english: "Dad", transliteration: "A-ba", emoji: "👨" },
      { id: "ach", hebrew: "אח", english: "Brother", transliteration: "Akh", emoji: "👦" },
      { id: "achot", hebrew: "אחות", english: "Sister", transliteration: "A-khot", emoji: "👧" },
      { id: "saba", hebrew: "סבא", english: "Grandpa", transliteration: "Sa-ba", emoji: "👴" },
      { id: "savta", hebrew: "סבתא", english: "Grandma", transliteration: "Sav-ta", emoji: "👵" },
      { id: "tinok", hebrew: "תינוק", english: "Baby", transliteration: "Ti-nok", emoji: "👶" },
    ],
    phrases: [
      { id: "yesh-li", hebrew: "יש לי אח", english: "I have a brother", transliteration: "Yesh li akh" },
      { id: "ani-ohev", hebrew: "אני אוהב את אמא", english: "I love mom", transliteration: "A-ni o-hev et i-ma" },
      { id: "mishpacha", hebrew: "משפחה", english: "Family", transliteration: "Mish-pa-kha" },
    ],
  },
  {
    id: "animals",
    order: 3,
    title: "Animals",
    titleHebrew: "חיות",
    description: "Meet the animals and learn their Hebrew names!",
    emoji: "🐾",
    category: "nature",
    teacherIntro: "Do you like animals? Let's learn what they're called in Hebrew! This is going to be fun!",
    teacherOutro: "You did it! Now you know so many animal names in Hebrew!",
    words: [
      { id: "kelev", hebrew: "כלב", english: "Dog", transliteration: "Ke-lev", emoji: "🐶" },
      { id: "chatul", hebrew: "חתול", english: "Cat", transliteration: "Kha-tul", emoji: "🐱" },
      { id: "dag", hebrew: "דג", english: "Fish", transliteration: "Dag", emoji: "🐟" },
      { id: "tzipor", hebrew: "ציפור", english: "Bird", transliteration: "Tzi-por", emoji: "🐦" },
      { id: "arnav", hebrew: "ארנב", english: "Rabbit", transliteration: "Ar-nav", emoji: "🐰" },
      { id: "pil", hebrew: "פיל", english: "Elephant", transliteration: "Pil", emoji: "🐘" },
      { id: "arie", hebrew: "אריה", english: "Lion", transliteration: "Ar-ye", emoji: "🦁" },
      { id: "parpar", hebrew: "פרפר", english: "Butterfly", transliteration: "Par-par", emoji: "🦋" },
    ],
    phrases: [
      { id: "ani-roeh", hebrew: "אני רואה כלב", english: "I see a dog", transliteration: "A-ni ro-eh ke-lev" },
      { id: "ze-chatul", hebrew: "זה חתול", english: "This is a cat", transliteration: "Ze kha-tul" },
    ],
  },
  {
    id: "food",
    order: 4,
    title: "Food & Drinks",
    titleHebrew: "אוכל ושתייה",
    description: "Learn about yummy food in Hebrew!",
    emoji: "🍕",
    category: "daily",
    teacherIntro: "Are you hungry? Let's learn about food and drinks in Hebrew! Yummy!",
    teacherOutro: "Great job! Now you can talk about food in Hebrew! Beteavon - that means bon appetit!",
    words: [
      { id: "lechem", hebrew: "לחם", english: "Bread", transliteration: "Le-khem", emoji: "🍞" },
      { id: "mayim", hebrew: "מים", english: "Water", transliteration: "Ma-yim", emoji: "💧" },
      { id: "tapuach", hebrew: "תפוח", english: "Apple", transliteration: "Ta-pu-akh", emoji: "🍎" },
      { id: "banana", hebrew: "בננה", english: "Banana", transliteration: "Ba-na-na", emoji: "🍌" },
      { id: "chalav", hebrew: "חלב", english: "Milk", transliteration: "Kha-lav", emoji: "🥛" },
      { id: "ugah", hebrew: "עוגה", english: "Cake", transliteration: "U-ga", emoji: "🎂" },
      { id: "glida", hebrew: "גלידה", english: "Ice cream", transliteration: "Gli-da", emoji: "🍦" },
    ],
    phrases: [
      { id: "ani-raev", hebrew: "אני רעב", english: "I'm hungry", transliteration: "A-ni ra-ev" },
      { id: "ani-tzame", hebrew: "אני צמא", english: "I'm thirsty", transliteration: "A-ni tza-me" },
      { id: "beteavon", hebrew: "בתיאבון", english: "Bon appetit", transliteration: "Be-te-a-von" },
    ],
  },
  {
    id: "colors-learn",
    order: 5,
    title: "Colors",
    titleHebrew: "צבעים",
    description: "Learn all the beautiful colors in Hebrew!",
    emoji: "🌈",
    category: "basics",
    teacherIntro: "Look around you! There are so many colors! Let's learn what they're called in Hebrew!",
    teacherOutro: "Fantastic! You know all the colors in Hebrew now! The world is so colorful!",
    words: [
      { id: "adom", hebrew: "אדום", english: "Red", transliteration: "A-dom", emoji: "🔴" },
      { id: "kahol", hebrew: "כחול", english: "Blue", transliteration: "Ka-khol", emoji: "🔵" },
      { id: "yarok", hebrew: "ירוק", english: "Green", transliteration: "Ya-rok", emoji: "🟢" },
      { id: "tsahov", hebrew: "צהוב", english: "Yellow", transliteration: "Tza-hov", emoji: "🟡" },
      { id: "katom", hebrew: "כתום", english: "Orange", transliteration: "Ka-tom", emoji: "🟠" },
      { id: "sagol", hebrew: "סגול", english: "Purple", transliteration: "Sa-gol", emoji: "🟣" },
      { id: "lavan", hebrew: "לבן", english: "White", transliteration: "La-van", emoji: "⬜" },
      { id: "shakhor", hebrew: "שחור", english: "Black", transliteration: "Sha-khor", emoji: "⬛" },
    ],
    phrases: [
      { id: "ze-adom", hebrew: "זה אדום", english: "This is red", transliteration: "Ze a-dom" },
      { id: "ha-shamayim", hebrew: "השמיים כחולים", english: "The sky is blue", transliteration: "Ha-sha-ma-yim kkhol-im" },
    ],
  },
  {
    id: "numbers-learn",
    order: 6,
    title: "Numbers",
    titleHebrew: "מספרים",
    description: "Count from 1 to 10 in Hebrew!",
    emoji: "🔢",
    category: "basics",
    teacherIntro: "Let's count in Hebrew! Can you count to ten? Let's learn together!",
    teacherOutro: "You can count to ten in Hebrew! That's amazing! You're so smart!",
    words: [
      { id: "echad", hebrew: "אחת", english: "One", transliteration: "A-khat", emoji: "1️⃣" },
      { id: "shtayim", hebrew: "שתיים", english: "Two", transliteration: "Shta-yim", emoji: "2️⃣" },
      { id: "shalosh", hebrew: "שלוש", english: "Three", transliteration: "Sha-losh", emoji: "3️⃣" },
      { id: "arba", hebrew: "ארבע", english: "Four", transliteration: "Ar-ba", emoji: "4️⃣" },
      { id: "chamesh", hebrew: "חמש", english: "Five", transliteration: "Kha-mesh", emoji: "5️⃣" },
      { id: "shesh", hebrew: "שש", english: "Six", transliteration: "Shesh", emoji: "6️⃣" },
      { id: "sheva", hebrew: "שבע", english: "Seven", transliteration: "She-va", emoji: "7️⃣" },
      { id: "shmone", hebrew: "שמונה", english: "Eight", transliteration: "Shmo-ne", emoji: "8️⃣" },
      { id: "tesha", hebrew: "תשע", english: "Nine", transliteration: "Te-sha", emoji: "9️⃣" },
      { id: "eser", hebrew: "עשר", english: "Ten", transliteration: "E-ser", emoji: "🔟" },
    ],
    phrases: [
      { id: "echad-shtayim", hebrew: "אחת, שתיים, שלוש", english: "One, two, three", transliteration: "A-khat, shta-yim, sha-losh" },
    ],
  },
  {
    id: "body",
    order: 7,
    title: "My Body",
    titleHebrew: "הגוף שלי",
    description: "Learn body parts in Hebrew!",
    emoji: "🤸",
    category: "people",
    teacherIntro: "Touch your head! Touch your nose! Let's learn body parts in Hebrew! It's going to be super fun!",
    teacherOutro: "Now you know your body parts in Hebrew! Try pointing and saying each one!",
    words: [
      { id: "rosh", hebrew: "ראש", english: "Head", transliteration: "Rosh", emoji: "🗣️" },
      { id: "einayim", hebrew: "עיניים", english: "Eyes", transliteration: "Ei-na-yim", emoji: "👀" },
      { id: "af", hebrew: "אף", english: "Nose", transliteration: "Af", emoji: "👃" },
      { id: "peh", hebrew: "פה", english: "Mouth", transliteration: "Peh", emoji: "👄" },
      { id: "oznayim", hebrew: "אוזניים", english: "Ears", transliteration: "Oz-na-yim", emoji: "👂" },
      { id: "yadayim", hebrew: "ידיים", english: "Hands", transliteration: "Ya-da-yim", emoji: "🤲" },
      { id: "raglayim", hebrew: "רגליים", english: "Legs / Feet", transliteration: "Rag-la-yim", emoji: "🦶" },
      { id: "beten", hebrew: "בטן", english: "Tummy", transliteration: "Be-ten", emoji: "😊" },
    ],
    phrases: [
      { id: "yesh-li-einayim", hebrew: "יש לי שתי עיניים", english: "I have two eyes", transliteration: "Yesh li shtei ei-na-yim" },
      { id: "rosh-gadol", hebrew: "ראש גדול", english: "Big head", transliteration: "Rosh ga-dol" },
    ],
  },
  {
    id: "actions",
    order: 8,
    title: "Actions",
    titleHebrew: "פעולות",
    description: "Learn action words - run, jump, eat!",
    emoji: "🏃",
    category: "daily",
    teacherIntro: "Let's get moving! We're going to learn action words in Hebrew! Can you jump? Can you run? Let's go!",
    teacherOutro: "Awesome! You learned so many action words! Now try doing each action and saying it in Hebrew!",
    words: [
      { id: "larutz", hebrew: "לרוץ", english: "To run", transliteration: "La-rutz", emoji: "🏃" },
      { id: "likpotz", hebrew: "לקפוץ", english: "To jump", transliteration: "Lik-potz", emoji: "🤸" },
      { id: "leechol", hebrew: "לאכול", english: "To eat", transliteration: "Le-e-khol", emoji: "🍽️" },
      { id: "lishtot", hebrew: "לשתות", english: "To drink", transliteration: "Lish-tot", emoji: "🥤" },
      { id: "lishon", hebrew: "לישון", english: "To sleep", transliteration: "Li-shon", emoji: "😴" },
      { id: "lesachek", hebrew: "לשחק", english: "To play", transliteration: "Le-sa-khek", emoji: "🎮" },
      { id: "lirkod", hebrew: "לרקוד", english: "To dance", transliteration: "Lir-kod", emoji: "💃" },
      { id: "lashir", hebrew: "לשיר", english: "To sing", transliteration: "La-shir", emoji: "🎤" },
    ],
    phrases: [
      { id: "bo-nesachek", hebrew: "!בוא נשחק", english: "Let's play!", transliteration: "Bo ne-sa-khek!" },
      { id: "ani-roked", hebrew: "אני רוקד", english: "I'm dancing", transliteration: "A-ni ro-ked" },
    ],
  },
  {
    id: "feelings",
    order: 9,
    title: "Feelings",
    titleHebrew: "רגשות",
    description: "Express your feelings in Hebrew!",
    emoji: "😊",
    category: "people",
    teacherIntro: "How are you feeling today? Happy? Tired? Let's learn how to say our feelings in Hebrew!",
    teacherOutro: "Great job! Now you can tell everyone how you feel in Hebrew! That's very important!",
    words: [
      { id: "sameach", hebrew: "שמח", english: "Happy", transliteration: "Sa-me-akh", emoji: "😊" },
      { id: "atzuv", hebrew: "עצוב", english: "Sad", transliteration: "A-tzuv", emoji: "😢" },
      { id: "ayef", hebrew: "עייף", english: "Tired", transliteration: "A-yef", emoji: "😴" },
      { id: "raev", hebrew: "רעב", english: "Hungry", transliteration: "Ra-ev", emoji: "🤤" },
      { id: "ohev", hebrew: "אוהב", english: "Love", transliteration: "O-hev", emoji: "❤️" },
      { id: "mefached", hebrew: "מפחד", english: "Scared", transliteration: "Me-fa-khed", emoji: "😨" },
      { id: "nirtza", hebrew: "נרגש", english: "Excited", transliteration: "Nir-gash", emoji: "🤩" },
      { id: "koes", hebrew: "כועס", english: "Angry", transliteration: "Ko-es", emoji: "😠" },
    ],
    phrases: [
      { id: "ani-sameach", hebrew: "!אני שמח", english: "I'm happy!", transliteration: "A-ni sa-me-akh!" },
      { id: "ani-ohev", hebrew: "אני אוהב אותך", english: "I love you", transliteration: "A-ni o-hev ot-kha" },
    ],
  },
  {
    id: "nature",
    order: 10,
    title: "Nature",
    titleHebrew: "טבע",
    description: "Explore nature with Hebrew words!",
    emoji: "🌳",
    category: "nature",
    teacherIntro: "Let's go outside and explore nature! There are so many beautiful things to see! Let's learn their Hebrew names!",
    teacherOutro: "You learned all about nature in Hebrew! Next time you're outside, try saying these words! Kol hakavod - well done!",
    words: [
      { id: "shemesh", hebrew: "שמש", english: "Sun", transliteration: "She-mesh", emoji: "☀️" },
      { id: "yareach", hebrew: "ירח", english: "Moon", transliteration: "Ya-re-akh", emoji: "🌙" },
      { id: "kochav", hebrew: "כוכב", english: "Star", transliteration: "Ko-khav", emoji: "⭐" },
      { id: "etz", hebrew: "עץ", english: "Tree", transliteration: "Etz", emoji: "🌳" },
      { id: "perach", hebrew: "פרח", english: "Flower", transliteration: "Pe-rakh", emoji: "🌸" },
      { id: "geshem", hebrew: "גשם", english: "Rain", transliteration: "Ge-shem", emoji: "🌧️" },
      { id: "shamayim", hebrew: "שמיים", english: "Sky", transliteration: "Sha-ma-yim", emoji: "🌤️" },
      { id: "yam", hebrew: "ים", english: "Sea", transliteration: "Yam", emoji: "🌊" },
    ],
    phrases: [
      { id: "hashemesh-zorachat", hebrew: "השמש זורחת", english: "The sun is shining", transliteration: "Ha-she-mesh zo-ra-khat" },
      { id: "yesh-kochavim", hebrew: "יש כוכבים בשמיים", english: "There are stars in the sky", transliteration: "Yesh ko-kha-vim ba-sha-ma-yim" },
    ],
  },
];
