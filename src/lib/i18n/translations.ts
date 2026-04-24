export type Language = "he" | "en";

export interface Translations {
  common: {
    home: string;
    back: string;
    play: string;
    playAgain: string;
    start: string;
    next: string;
    previous: string;
    score: string;
    level: string;
    easy: string;
    medium: string;
    hard: string;
    chooseDifficulty: string;
    correct: string;
    tryAgain: string;
    completed: string;
    outOf: string;
    pairs: string;
    moves: string;
    round: string;
    stars: string;
    words: string;
    lessons: string;
    letsGo: string;
    wellDone: string;
    amazing: string;
    oops: string;
  };
  home: {
    title: string;
    subtitle: string;
    adventures: string;
    learningGames: string;
    funGames: string;
    newGames: string;
    learnHebrew: string;
    learnHebrewSub: string;
    learnEnglish: string;
    learnEnglishSub: string;
    myAchievements: string;
  };
  games: {
    alefBet: { title: string; subtitle: string; findLetter: string };
    numbers: { title: string; subtitle: string; howMany: string };
    colors: { title: string; subtitle: string; whatColor: string };
    shapes: { title: string; subtitle: string; whatShape: string };
    memory: { title: string; subtitle: string; findPairs: string };
    puzzle: { title: string; subtitle: string; arrange: string; correctOrder: string; choosePuzzle: string };
    balloonPop: { title: string; subtitle: string; popBalloon: string };
    simon: { title: string; subtitle: string; watch: string; yourTurn: string; reachedRound: string };
    wordBuilder: { title: string; subtitle: string; buildWords: string };
    treasureHunt: { title: string; subtitle: string; findItem: string; whereIs: string };
    ariAdventure: { title: string; subtitle: string };
    noaGarden: { title: string; subtitle: string };
    dailyWord: { title: string; subtitle: string };
    conversation: { title: string; subtitle: string };
    tapAnimal: { title: string; subtitle: string };
    countBubbles: { title: string; subtitle: string };
    colorSplash: { title: string; subtitle: string };
  };
  learn: {
    title: string;
    subtitle: string;
    wordsLearned: string;
    startLesson: string;
    nextLesson: string;
    practiceAgain: string;
    listenFind: string;
    seeSay: string;
    quizTime: string;
    whichPicture: string;
    whatInHebrew: string;
    listenAgain: string;
    tapToHear: string;
    lessonComplete: string;
    newWord: string;
  };
  difficulty: {
    easy: string;
    easyDesc: string;
    medium: string;
    mediumDesc: string;
    hard: string;
    hardDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  he: {
    common: {
      home: "דף הבית",
      back: "חזרה",
      play: "שחקו",
      playAgain: "שחקו שוב",
      start: "התחילו",
      next: "הבא",
      previous: "הקודם",
      score: "ניקוד",
      level: "שלב",
      easy: "קל",
      medium: "בינוני",
      hard: "קשה",
      chooseDifficulty: "בחרו רמת קושי",
      correct: "כל הכבוד!",
      tryAgain: "נסו שוב!",
      completed: "סיימתם!",
      outOf: "מתוך",
      pairs: "זוגות",
      moves: "מהלכים",
      round: "סיבוב",
      stars: "כוכבים",
      words: "מילים",
      lessons: "שיעורים",
      letsGo: "!יאללה, מתחילים 🎮",
      wellDone: "!כל הכבוד",
      amazing: "!מדהים",
      oops: "!אופס",
    },
    home: {
      title: "🎮 משחקי למידה",
      subtitle: "בחרו משחק והתחילו ללמוד! 🌟",
      adventures: "🌟 הרפתקאות",
      learningGames: "📚 משחקי למידה",
      funGames: "🎯 משחקי כיף",
      newGames: "🆕 משחקים חדשים",
      learnHebrew: "🎓 ללמוד עברית",
      learnHebrewSub: "10 שיעורים · עברית ← אנגלית · עם קול!",
      learnEnglish: "🎓 ללמוד אנגלית",
      learnEnglishSub: "8 שיעורים · אנגלית ← עברית · עם קול!",
      myAchievements: "🏅 ההישגים שלי",
    },
    games: {
      alefBet: { title: "אותיות", subtitle: "לומדים את הא-ב", findLetter: "?איפה האות הזו" },
      numbers: { title: "מספרים", subtitle: "סופרים עד 10", howMany: "?כמה יש כאן" },
      colors: { title: "צבעים", subtitle: "מכירים צבעים", whatColor: "?מה הצבע" },
      shapes: { title: "צורות", subtitle: "לומדים צורות", whatShape: "?מה השם של הצורה" },
      memory: { title: "זיכרון", subtitle: "משחק זיכרון", findPairs: "!מצאו את הזוגות" },
      puzzle: { title: "פאזל", subtitle: "סדרו את החלקים", arrange: "!סדרו את החלקים במקום הנכון", correctOrder: ":הסדר הנכון", choosePuzzle: "בחרו פאזל אחר" },
      balloonPop: { title: "בלונים", subtitle: "פוצצו את הבלון הנכון", popBalloon: "!פוצצו את" },
      simon: { title: "סימון אומר", subtitle: "זכרו וחזרו על הרצף", watch: "👀 !תסתכלו", yourTurn: "👆 !תורכם", reachedRound: "הגעתם עד סיבוב" },
      wordBuilder: { title: "בונים מילים", subtitle: "מרכיבים מילים מאותיות", buildWords: "!בנו מילים מאותיות" },
      treasureHunt: { title: "ציד אוצרות", subtitle: "מוצאים חפצים חבויים", findItem: "!מצאו את הפריט המבוקש", whereIs: "?איפה ה" },
      ariAdventure: { title: "המסע של אריה", subtitle: "הרפתקה עם גור האריות" },
      noaGarden: { title: "הגן של נועה", subtitle: "גן קסום שמחכה לך" },
      dailyWord: { title: "מילה יומית", subtitle: "לומדים מילה חדשה כל יום" },
      conversation: { title: "שיחון", subtitle: "תרגול שיחות בעברית" },
      tapAnimal: { title: "חיות", subtitle: "הקשיבו ולחצו על הבעל חיים" },
      countBubbles: { title: "ספרו בועות", subtitle: "ספרו ובחרו את המספר הנכון" },
      colorSplash: { title: "צבעים", subtitle: "בחרו את הצבע הנכון של הצורה" },
    },
    learn: {
      title: "🎓 ללמוד עברית",
      subtitle: "!המסע שלכם לדבר עברית",
      wordsLearned: "מילים נלמדו",
      startLesson: "📚 !מתחילים ללמוד",
      nextLesson: "➡️ השיעור הבא",
      practiceAgain: "🔄 תרגול נוסף",
      listenFind: "👂 הקשיבו ומצאו",
      seeSay: "👀 ראו ובחרו",
      quizTime: "🧠 !זמן חידון",
      whichPicture: "?איזו תמונה זו",
      whatInHebrew: "?מה זה בעברית",
      listenAgain: "שמעו שוב",
      tapToHear: "לחצו על הרמקול לשמוע",
      lessonComplete: "!השיעור הושלם",
      newWord: "חדש",
    },
    difficulty: {
      easy: "קל",
      easyDesc: "מתחילים בקלות",
      medium: "בינוני",
      mediumDesc: "אתגר קטן",
      hard: "קשה",
      hardDesc: "!גיבורים על",
    },
  },
  en: {
    common: {
      home: "Home",
      back: "Back",
      play: "Play",
      playAgain: "Play Again",
      start: "Start",
      next: "Next",
      previous: "Previous",
      score: "Score",
      level: "Level",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      chooseDifficulty: "Choose Difficulty",
      correct: "Well Done!",
      tryAgain: "Try Again!",
      completed: "Completed!",
      outOf: "out of",
      pairs: "pairs",
      moves: "moves",
      round: "round",
      stars: "stars",
      words: "words",
      lessons: "lessons",
      letsGo: "Let's Go! 🎮",
      wellDone: "Well Done!",
      amazing: "Amazing!",
      oops: "Oops!",
    },
    home: {
      title: "🎮 Learning Games",
      subtitle: "Pick a game and start learning! 🌟",
      adventures: "🌟 Adventures",
      learningGames: "📚 Learning Games",
      funGames: "🎯 Fun Games",
      newGames: "🆕 New Games",
      learnHebrew: "🎓 Learn Hebrew",
      learnHebrewSub: "10 lessons · English → Hebrew · With voice!",
      learnEnglish: "🎓 Learn English",
      learnEnglishSub: "8 lessons · Hebrew → English · With voice!",
      myAchievements: "🏅 My Achievements",
    },
    games: {
      alefBet: { title: "Letters", subtitle: "Learn the Alef-Bet", findLetter: "Find this letter!" },
      numbers: { title: "Numbers", subtitle: "Count to 10", howMany: "How many are there?" },
      colors: { title: "Colors", subtitle: "Learn colors", whatColor: "What color is this?" },
      shapes: { title: "Shapes", subtitle: "Learn shapes", whatShape: "What shape is this?" },
      memory: { title: "Memory", subtitle: "Card matching game", findPairs: "Find the pairs!" },
      puzzle: { title: "Puzzle", subtitle: "Arrange the pieces", arrange: "Put the pieces in the right place!", correctOrder: "Correct order:", choosePuzzle: "Choose another puzzle" },
      balloonPop: { title: "Balloons", subtitle: "Pop the right balloon", popBalloon: "Pop the" },
      simon: { title: "Simon Says", subtitle: "Remember the sequence", watch: "👀 Watch!", yourTurn: "👆 Your turn!", reachedRound: "You reached round" },
      wordBuilder: { title: "Word Builder", subtitle: "Build words from letters", buildWords: "Build words from letters!" },
      treasureHunt: { title: "Treasure Hunt", subtitle: "Find hidden items", findItem: "Find the item!", whereIs: "Where is the" },
      ariAdventure: { title: "Ari's Adventure", subtitle: "Journey with the lion cub" },
      noaGarden: { title: "Noa's Garden", subtitle: "A magical garden awaits" },
      dailyWord: { title: "Daily Word", subtitle: "Learn a new word every day" },
      conversation: { title: "Conversation", subtitle: "Practice Hebrew dialogues" },
      tapAnimal: { title: "Animals", subtitle: "Listen and tap the right animal" },
      countBubbles: { title: "Count Bubbles", subtitle: "Count and pick the right number" },
      colorSplash: { title: "Colors", subtitle: "Pick the right color for the shape" },
    },
    learn: {
      title: "🎓 Learn Hebrew",
      subtitle: "Your journey to speaking Hebrew!",
      wordsLearned: "Words Learned",
      startLesson: "📚 Let's Learn!",
      nextLesson: "Next Lesson ➡️",
      practiceAgain: "🔄 Practice Again",
      listenFind: "👂 Listen & Find",
      seeSay: "👀 See & Say",
      quizTime: "🧠 Quiz Time!",
      whichPicture: "Which picture is this?",
      whatInHebrew: "What is this in Hebrew?",
      listenAgain: "Listen again",
      tapToHear: "Tap the speaker to hear the word",
      lessonComplete: "Lesson Complete!",
      newWord: "NEW",
    },
    difficulty: {
      easy: "Easy",
      easyDesc: "Start simple",
      medium: "Medium",
      mediumDesc: "A little challenge",
      hard: "Hard",
      hardDesc: "Super hero mode!",
    },
  },
};
