import { describe, it, expect } from "vitest";
import {
  calculateIngredientSwap,
  calculateWholeMealSwap,
  calculateExerciseSwap,
  FoodNutritionPer100g,
  MealOption,
  ExerciseDefinition,
} from "../calculations/substitution";

describe("Phase 3: The 3-Level Smart Substitution Engine (±5% Macro Matching)", () => {
  // Test food items
  const cookedRice: FoodNutritionPer100g = {
    nameEn: "Egyptian White Rice with Vermicelli",
    category: "carb",
    caloriesPer100g: 148,
    proteinPer100g: 2.8,
    carbsPer100g: 28.5,
    fatsPer100g: 2.6,
  };

  const baladiBread: FoodNutritionPer100g = {
    nameEn: "Baladi Bread",
    category: "carb",
    caloriesPer100g: 250,
    proteinPer100g: 8.5,
    carbsPer100g: 52.0,
    fatsPer100g: 1.2,
    householdPortions: [
      { unitEn: "1/4 Loaf", unitAr: "ربع رغيف", grams: 32 },
      { unitEn: "1/2 Loaf", unitAr: "نصف رغيف", grams: 65 },
      { unitEn: "1 Loaf", unitAr: "رغيف كامل", grams: 130 },
    ],
  };

  const bakedSweetPotato: FoodNutritionPer100g = {
    nameEn: "Egyptian Sweet Potato (Batata)",
    category: "carb",
    caloriesPer100g: 90,
    proteinPer100g: 1.8,
    carbsPer100g: 21.0,
    fatsPer100g: 0.2,
  };

  const grilledChicken: FoodNutritionPer100g = {
    nameEn: "Grilled Chicken Breast",
    category: "protein",
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatsPer100g: 3.6,
  };

  const grilledKofta: FoodNutritionPer100g = {
    nameEn: "Grilled Beef Kofta",
    category: "protein",
    caloriesPer100g: 220,
    proteinPer100g: 24.0,
    carbsPer100g: 4.0,
    fatsPer100g: 12.0,
  };

  describe("Level 1: Single Ingredient Swap (±5% Primary Macro Matching)", () => {
    it("swaps 100g Cooked Rice for Baladi Bread within ±5% carbs", () => {
      const swap = calculateIngredientSwap({
        sourceFood: cookedRice,
        sourceGrams: 100, // 28.5g carbs
        targetFood: baladiBread,
      });

      // Target bread grams: (28.5 / 52) * 100 = 55g
      expect(swap.replacementGrams).toBe(55);
      expect(swap.withinMacroThreshold).toBe(true);
      expect(swap.primaryMacro).toBe("carbs");

      // Verify carbs match closely
      const carbDiffPercent = Math.abs(swap.carbsDelta) / swap.sourceMacros.carbsG;
      expect(carbDiffPercent).toBeLessThanOrEqual(0.05);

      // Verify nearest household portion resolved
      expect(swap.nearestHouseholdPortion).toBeDefined();
      expect(swap.nearestHouseholdPortion?.unitEn).toContain("Loaf");
    });

    it("swaps 100g Cooked Rice for Baked Sweet Potato within ±5% carbs", () => {
      const swap = calculateIngredientSwap({
        sourceFood: cookedRice,
        sourceGrams: 100,
        targetFood: bakedSweetPotato,
      });

      // Target grams: (28.5 / 21) * 100 = ~136g
      expect(swap.replacementGrams).toBeGreaterThan(130);
      expect(swap.withinMacroThreshold).toBe(true);
      expect(Math.abs(swap.carbsDelta) / swap.sourceMacros.carbsG).toBeLessThanOrEqual(0.05);
    });

    it("swaps Grilled Chicken for Grilled Kofta within ±5% protein", () => {
      const swap = calculateIngredientSwap({
        sourceFood: grilledChicken,
        sourceGrams: 150, // 46.5g protein
        targetFood: grilledKofta,
      });

      expect(swap.primaryMacro).toBe("protein");
      expect(swap.withinMacroThreshold).toBe(true);
      const proteinDiffPercent = Math.abs(swap.proteinDelta) / swap.sourceMacros.proteinG;
      expect(proteinDiffPercent).toBeLessThanOrEqual(0.05);
    });
  });

  describe("Level 2: Culturally Matched Egyptian Whole Meal Swap", () => {
    const mealChickenRice: MealOption = {
      id: "meal-1",
      nameEn: "Grilled Chicken + Rice + Salad",
      nameAr: "فراخ مشوية وأرز وسلطة",
      mealType: "lunch",
      calories: 550,
      proteinG: 45,
      carbsG: 60,
      fatsG: 12,
      items: [],
    };

    const mealBeefTagine: MealOption = {
      id: "meal-2",
      nameEn: "Lean Beef Okra Tagine + 3/4 Baladi Loaf",
      nameAr: "طاجن بامية باللحمة البقري وعيش بلدي",
      mealType: "lunch",
      calories: 540,
      proteinG: 42,
      carbsG: 58,
      fatsG: 14,
      items: [],
    };

    const mealTunaSalad: MealOption = {
      id: "meal-3",
      nameEn: "Tuna Salad + Baladi Toast",
      nameAr: "سلطة تونة بالعيش المحمص",
      mealType: "lunch",
      calories: 520,
      proteinG: 44,
      carbsG: 50,
      fatsG: 14,
      items: [],
    };

    const breakfastFul: MealOption = {
      id: "meal-4",
      nameEn: "Ful Medames + Eggs + Bread",
      nameAr: "فول وبيض وعيش",
      mealType: "breakfast",
      calories: 450,
      proteinG: 25,
      carbsG: 50,
      fatsG: 15,
      items: [],
    };

    it("matches equivalent Egyptian lunch meals within ±5% calories & protein", () => {
      const matches = calculateWholeMealSwap({
        sourceMeal: mealChickenRice,
        candidates: [mealBeefTagine, mealTunaSalad, breakfastFul],
        maxTolerancePercent: 0.05,
      });

      // Breakfast should be filtered out
      expect(matches.some((m) => m.meal.id === "meal-4")).toBe(false);

      // Tagine and Tuna Salad should match
      expect(matches.length).toBe(2);
      expect(matches[0].withinTolerance).toBe(true);
      expect(Math.abs(matches[0].calorieDelta)).toBeLessThanOrEqual(550 * 0.05);
    });
  });

  describe("Level 3: Biomechanical Exercise Swap Engine", () => {
    const benchPress: ExerciseDefinition = {
      id: "ex-bench-barbell",
      nameEn: "Barbell Bench Press",
      nameAr: "بنش بار مستوي",
      movementPattern: "horizontal_push",
      primaryMuscle: "Chest",
      equipment: "barbell",
      difficulty: "intermediate",
      alternativeIds: ["ex-bench-dumbbell", "ex-chest-machine", "ex-pushups"],
    };

    const dumbbellPress: ExerciseDefinition = {
      id: "ex-bench-dumbbell",
      nameEn: "Dumbbell Bench Press",
      nameAr: "بنش مستوي بالدمبل",
      movementPattern: "horizontal_push",
      primaryMuscle: "Chest",
      equipment: "dumbbell",
      difficulty: "beginner",
      alternativeIds: [],
    };

    const machinePress: ExerciseDefinition = {
      id: "ex-chest-machine",
      nameEn: "Machine Chest Press",
      nameAr: "ضغط صدر بالجهاز",
      movementPattern: "horizontal_push",
      primaryMuscle: "Chest",
      equipment: "machine",
      difficulty: "beginner",
      alternativeIds: [],
    };

    const pushups: ExerciseDefinition = {
      id: "ex-pushups",
      nameEn: "Standard Push-Up",
      nameAr: "تمرين ضغط أرضي",
      movementPattern: "horizontal_push",
      primaryMuscle: "Chest",
      equipment: "bodyweight",
      difficulty: "beginner",
      alternativeIds: [],
    };

    const barbellSquat: ExerciseDefinition = {
      id: "ex-squat",
      nameEn: "Barbell Back Squat",
      nameAr: "سكوات بالبار",
      movementPattern: "squat",
      primaryMuscle: "Quadriceps",
      equipment: "barbell",
      difficulty: "intermediate",
      alternativeIds: [],
    };

    const exerciseLibrary = [benchPress, dumbbellPress, machinePress, pushups, barbellSquat];

    it("swaps exercise with biomechanically equivalent exercises targeting same pattern and muscle", () => {
      const swaps = calculateExerciseSwap({
        currentExercise: benchPress,
        candidateLibrary: exerciseLibrary,
      });

      // Squat must be filtered out
      expect(swaps.some((e) => e.id === "ex-squat")).toBe(false);
      // Bench press itself must be filtered out
      expect(swaps.some((e) => e.id === "ex-bench-barbell")).toBe(false);

      expect(swaps.length).toBe(3);
      expect(swaps.every((e) => e.movementPattern === "horizontal_push" && e.primaryMuscle === "Chest")).toBe(true);
    });

    it("handles 'Equipment Busy Mode' by excluding same equipment", () => {
      const swaps = calculateExerciseSwap({
        currentExercise: benchPress,
        candidateLibrary: exerciseLibrary,
        options: { equipmentBusyMode: true },
      });

      // No barbell exercises allowed
      expect(swaps.every((e) => e.equipment !== "barbell")).toBe(true);
    });

    it("handles 'Home Mode' by restricting to bodyweight and dumbbells", () => {
      const swaps = calculateExerciseSwap({
        currentExercise: benchPress,
        candidateLibrary: exerciseLibrary,
        options: { homeMode: true },
      });

      expect(swaps.every((e) => ["dumbbell", "bodyweight", "bands"].includes(e.equipment))).toBe(true);
      expect(swaps.some((e) => e.id === "ex-pushups")).toBe(true);
      expect(swaps.some((e) => e.id === "ex-bench-dumbbell")).toBe(true);
      expect(swaps.some((e) => e.id === "ex-chest-machine")).toBe(false);
    });

    it("filters out contraindicated exercises when injury flags are present", () => {
      const kneeSwaps = calculateExerciseSwap({
        currentExercise: dumbbellPress,
        candidateLibrary: [barbellSquat],
        options: { injuryFlags: ["knee_pain"] },
      });
      expect(kneeSwaps.length).toBe(0);
    });
  });
});
