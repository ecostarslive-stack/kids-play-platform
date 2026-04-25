"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBilingualSpeak } from "@/hooks/useBilingualSpeak";
import { useGameJuice } from "@/hooks/useGameJuice";
import { ParticleBurst } from "@/components/ui/ParticleBurst";
import { CompletionCelebration } from "@/components/feedback/CompletionCelebration";
import { BigButton } from "@/components/ui/BigButton";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ingredient {
  id: string;
  emoji: string;
  he: string;
  en: string;
  color: string;
}

interface Recipe {
  id: string;
  name: { he: string; en: string };
  emoji: string;
  ingredientIds: string[];
  bgColor: string;
}

type Phase = "intro" | "playing" | "complete";

// ── Data ──────────────────────────────────────────────────────────────────────
const INGREDIENTS: Ingredient[] = [
  { id: "tomato",  emoji: "🍅", he: "עגבנייה",  en: "Tomato",   color: "#FF6B6B" },
  { id: "cheese",  emoji: "🧀", he: "גבינה",    en: "Cheese",   color: "#FFC75F" },
  { id: "bread",   emoji: "🍞", he: "לחם",      en: "Bread",    color: "#D4A574" },
  { id: "carrot",  emoji: "🥕", he: "גזר",      en: "Carrot",   color: "#FF8C42" },
  { id: "egg",     emoji: "🥚", he: "ביצה",     en: "Egg",      color: "#FFF9C4" },
  { id: "apple",   emoji: "🍎", he: "תפוח",     en: "Apple",    color: "#FF6B6B" },
  { id: "milk",    emoji: "🥛", he: "חלב",      en: "Milk",     color: "#E8F5E9" },
  { id: "flour",   emoji: "🌾", he: "קמח",      en: "Flour",    color: "#F5F5DC" },
  { id: "butter",  emoji: "🧈", he: "חמאה",     en: "Butter",   color: "#FFFACD" },
  { id: "potato",  emoji: "🥔", he: "תפוח אדמה", en: "Potato",  color: "#DEB887" },
  { id: "onion",   emoji: "🧅", he: "בצל",      en: "Onion",    color: "#C8A4D4" },
  { id: "mushroom",emoji: "🍄", he: "פטרייה",   en: "Mushroom", color: "#BC8A5F" },
];

const RECIPES: Recipe[] = [
  {
    id: "pizza",
    name: { he: "פיצה", en: "Pizza" },
    emoji: "🍕",
    ingredientIds: ["tomato", "cheese", "flour"],
    bgColor: "#FFF3E0",
  },
  {
    id: "salad",
    name: { he: "סלט", en: "Salad" },
    emoji: "🥗",
    ingredientIds: ["tomato", "carrot", "onion"],
    bgColor: "#E8F5E9",
  },
  {
    id: "omelette",
    name: { he: "חביתה", en: "Omelette" },
    emoji: "🍳",
    ingredientIds: ["egg", "butter", "milk"],
    bgColor: "#FFFDE7",
  },
  {
    id: "cake",
    name: { he: "עוגה", en: "Cake" },
    emoji: "🎂",
    ingredientIds: ["flour", "egg", "butter"],
    bgColor: "#FCE4EC",
  },
  {
    id: "soup",
    name: { he: "מרק", en: "Soup" },
    emoji: "🍲",
    ingredientIds: ["potato", "carrot", "mushroom"],
    bgColor: "#FFF8E1",
  },
];

// ── Steam component ────────────────────────────────────────────────────────────
function Steam() {
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [-4, -16, -4], opacity: [0.7, 0.2, 0.7] }}
          transition={{ duration: 1.4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          className="text-lg"
        >
          💨
        </motion.div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MagicKitchenPage() {
  const router = useRouter();
  const { speakBilingual } = useBilingualSpeak();
  const { particles, celebrate, wrongFeedback, screenFlash, shake } = useGameJuice();

  const [phase, setPhase] = useState<Phase>("intro");
  const [recipeIdx, setRecipeIdx] = useState(0);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [cooking, setCooking] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const potRef = useRef<HTMLDivElement>(null);

  const recipe = RECIPES[recipeIdx];
  const neededIds = recipe.ingredientIds;
  const remaining = neededIds.filter((id) => !addedIds.includes(id));

  // Only show ingredients relevant + 4 random distractors
  const displayIngredients = INGREDIENTS.filter((ing) => {
    const isNeeded = neededIds.includes(ing.id);
    const isAdded = addedIds.includes(ing.id);
    return isNeeded && !isAdded;
  }).concat(
    INGREDIENTS.filter((ing) => !neededIds.includes(ing.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
  ).sort(() => Math.random() - 0.5);

  const handleIngredientTap = useCallback(
    (ing: Ingredient) => {
      if (cooking || done) return;

      speakBilingual(ing.he, ing.en);

      if (neededIds.includes(ing.id) && !addedIds.includes(ing.id)) {
        const newAdded = [...addedIds, ing.id];
        setAddedIds(newAdded);
        setScore((s) => s + 10);

        const potEl = potRef.current;
        const rect = potEl?.getBoundingClientRect();
        if (rect) {
          celebrate(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        if (newAdded.length >= neededIds.length) {
          // All ingredients added — cook!
          setCooking(true);
          setTimeout(() => {
            setCooking(false);
            setDone(true);
            setScore((s) => s + 20);
            speakBilingual(recipe.name.he, recipe.name.en);
          }, 1800);
        }
      } else if (!neededIds.includes(ing.id)) {
        // Wrong ingredient
        setWrongId(ing.id);
        wrongFeedback();
        setTimeout(() => setWrongId(null), 600);
      }
    },
    [cooking, done, neededIds, addedIds, speakBilingual, celebrate, wrongFeedback, recipe.name]
  );

  const nextRecipe = useCallback(() => {
    if (recipeIdx + 1 >= RECIPES.length) {
      setPhase("complete");
    } else {
      setRecipeIdx((i) => i + 1);
      setAddedIds([]);
      setCooking(false);
      setDone(false);
    }
  }, [recipeIdx]);

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "linear-gradient(180deg, #FFF8E1 0%, #FFF3E0 100%)" }}>
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >🍳</motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-orange-600">מטבח קסם</h1>
          <p className="text-lg font-bold text-orange-400">Magic Kitchen</p>
          <p className="text-base text-foreground/60 mt-2">הוסיפו את המרכיבים הנכונים למתכון!</p>
        </div>
        <BigButton onClick={() => setPhase("playing")} variant="success">
          !בואו לבשל 👨‍🍳
        </BigButton>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCelebration
        show
        score={score}
        total={RECIPES.length * 30}
        onPlayAgain={() => {
          setRecipeIdx(0); setAddedIds([]); setCooking(false); setDone(false); setScore(0); setPhase("playing");
        }}
        onGoHome={() => router.push("/")}
        slug="magic-kitchen"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto gap-3 px-3 pt-2 pb-4"
      style={{ background: "linear-gradient(180deg, #FFF8E1 0%, #FFF3E0 100%)" }}>
      <ParticleBurst particles={particles} screenFlash={screenFlash} shake={shake} />

      {/* Recipe card */}
      <motion.div
        key={recipe.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-3 shadow-md flex items-center gap-3"
        style={{ background: recipe.bgColor }}
      >
        <span className="text-4xl">{recipe.emoji}</span>
        <div className="flex-1">
          <p className="text-xs text-foreground/50 font-bold">המתכון שלנו / Recipe</p>
          <p className="text-xl font-black">{recipe.name.he} · {recipe.name.en}</p>
          <div className="flex gap-1 mt-1">
            {neededIds.map((id) => {
              const ing = INGREDIENTS.find((i) => i.id === id)!;
              const added = addedIds.includes(id);
              return (
                <motion.span
                  key={id}
                  animate={added ? { scale: [1, 1.3, 1] } : {}}
                  className={`text-xl ${added ? "opacity-40 grayscale" : ""}`}
                >
                  {ing.emoji}
                </motion.span>
              );
            })}
          </div>
        </div>
        <span className="text-sm font-bold text-foreground/40">{recipeIdx + 1}/{RECIPES.length}</span>
      </motion.div>

      {/* Pot */}
      <div className="flex flex-col items-center gap-1">
        <div ref={potRef} className="relative flex items-center justify-center">
          {cooking && <Steam />}
          <motion.div
            animate={cooking ? { rotate: [-2, 2, -2, 2, 0] } : {}}
            transition={{ duration: 0.4, repeat: cooking ? Infinity : 0 }}
            className="text-7xl select-none"
          >
            {done ? recipe.emoji : "🫕"}
          </motion.div>
          {/* Added ingredients mini display */}
          {addedIds.length > 0 && !done && (
            <div className="absolute -right-2 -top-1 flex flex-col gap-0.5">
              {addedIds.map((id) => (
                <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
                  {INGREDIENTS.find((i) => i.id === id)?.emoji}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {done && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-xl font-black text-green-600">🎉 מוכן! Ready!</p>
            <BigButton onClick={nextRecipe} variant="success">
              {recipeIdx + 1 < RECIPES.length ? "המתכון הבא ➡️" : "סיימנו! 🏆"}
            </BigButton>
          </motion.div>
        )}

        {!done && remaining.length > 0 && (
          <p className="text-sm text-foreground/50 font-bold">
            עוד {remaining.length} מרכיב{remaining.length > 1 ? "ים" : ""} · {remaining.length} more
          </p>
        )}
      </div>

      {/* Ingredients grid */}
      {!done && (
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence>
            {displayIngredients.slice(0, 8).map((ing, i) => {
              const isWrong = wrongId === ing.id;
              return (
                <motion.button
                  key={`${recipe.id}-${ing.id}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, x: isWrong ? [-8, 8, -6, 6, 0] : 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleIngredientTap(ing)}
                  className="flex flex-col items-center gap-1 bg-white rounded-2xl py-2 px-1 shadow-md border-2 active:shadow-sm"
                  style={{ borderColor: ing.color }}
                >
                  <span className="text-3xl">{ing.emoji}</span>
                  <span className="text-[10px] font-bold text-center leading-tight" style={{ color: ing.color }}>
                    {ing.he}
                  </span>
                  <span className="text-[9px] text-foreground/40">{ing.en}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
