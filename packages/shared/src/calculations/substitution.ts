export interface MacroProfile {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface FoodNutritionPer100g {
  id?: string;
  nameEn: string;
  nameAr?: string;
  category: "staple" | "protein" | "carb" | "fat" | "traditional_main" | "dessert" | "beverage" | "snack";
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  householdPortions?: Array<{
    unitEn: string;
    unitAr: string;
    grams: number;
  }>;
}

export interface IngredientSwapResult {
  replacementGrams: number;
  sourceMacros: MacroProfile;
  replacementMacros: MacroProfile;
  calorieDelta: number;
  proteinDelta: number;
  carbsDelta: number;
  fatsDelta: number;
  withinMacroThreshold: boolean; // within +/- 5% of primary macro
  primaryMacro: "carbs" | "protein" | "fats";
  nearestHouseholdPortion?: {
    unitEn: string;
    unitAr: string;
    count: number;
    actualGrams: number;
  };
}

/**
 * Determine the primary macronutrient driver for a food item
 */
export function getPrimaryMacro(food: FoodNutritionPer100g): "carbs" | "protein" | "fats" {
  if (food.category === "protein") return "protein";
  if (food.category === "carb" || food.category === "staple") return "carbs";
  if (food.category === "fat") return "fats";

  const carbCal = food.carbsPer100g * 4;
  const proteinCal = food.proteinPer100g * 4;
  const fatCal = food.fatsPer100g * 9;

  if (proteinCal >= carbCal && proteinCal >= fatCal) return "protein";
  if (fatCal >= carbCal && fatCal >= proteinCal) return "fats";
  return "carbs";
}

/**
 * Level 1: Single Ingredient Swap (±5% Primary Macro Matching)
 * Dynamically recalculates the exact gram weight of the replacement food
 * so that the primary macro (carbs, protein, or fat) matches within ±5%.
 */
export function calculateIngredientSwap(params: {
  sourceFood: FoodNutritionPer100g;
  sourceGrams: number;
  targetFood: FoodNutritionPer100g;
}): IngredientSwapResult {
  const primary = getPrimaryMacro(params.sourceFood);

  // Compute source macros
  const sFactor = params.sourceGrams / 100;
  const sourceMacros: MacroProfile = {
    calories: Math.round(params.sourceFood.caloriesPer100g * sFactor),
    proteinG: Number((params.sourceFood.proteinPer100g * sFactor).toFixed(1)),
    carbsG: Number((params.sourceFood.carbsPer100g * sFactor).toFixed(1)),
    fatsG: Number((params.sourceFood.fatsPer100g * sFactor).toFixed(1)),
  };

  // Determine target grams based on primary macronutrient equivalence
  let targetGrams = 100;
  if (primary === "carbs" && params.targetFood.carbsPer100g > 0) {
    targetGrams = Math.round((sourceMacros.carbsG / params.targetFood.carbsPer100g) * 100);
  } else if (primary === "protein" && params.targetFood.proteinPer100g > 0) {
    targetGrams = Math.round((sourceMacros.proteinG / params.targetFood.proteinPer100g) * 100);
  } else if (primary === "fats" && params.targetFood.fatsPer100g > 0) {
    targetGrams = Math.round((sourceMacros.fatsG / params.targetFood.fatsPer100g) * 100);
  } else {
    // Fallback to calorie matching if primary macro per 100g is zero
    targetGrams = Math.round((sourceMacros.calories / params.targetFood.caloriesPer100g) * 100);
  }

  // Guardrail against negative or zero grams
  targetGrams = Math.max(10, targetGrams);

  const tFactor = targetGrams / 100;
  const replacementMacros: MacroProfile = {
    calories: Math.round(params.targetFood.caloriesPer100g * tFactor),
    proteinG: Number((params.targetFood.proteinPer100g * tFactor).toFixed(1)),
    carbsG: Number((params.targetFood.carbsPer100g * tFactor).toFixed(1)),
    fatsG: Number((params.targetFood.fatsPer100g * tFactor).toFixed(1)),
  };

  const calorieDelta = replacementMacros.calories - sourceMacros.calories;
  const proteinDelta = Number((replacementMacros.proteinG - sourceMacros.proteinG).toFixed(1));
  const carbsDelta = Number((replacementMacros.carbsG - sourceMacros.carbsG).toFixed(1));
  const fatsDelta = Number((replacementMacros.fatsG - sourceMacros.fatsG).toFixed(1));

  // Verify whether the primary macro is within ±5%
  let withinMacroThreshold = false;
  if (primary === "carbs" && sourceMacros.carbsG > 0) {
    withinMacroThreshold = Math.abs(carbsDelta) / sourceMacros.carbsG <= 0.051;
  } else if (primary === "protein" && sourceMacros.proteinG > 0) {
    withinMacroThreshold = Math.abs(proteinDelta) / sourceMacros.proteinG <= 0.051;
  } else if (primary === "fats" && sourceMacros.fatsG > 0) {
    withinMacroThreshold = Math.abs(fatsDelta) / sourceMacros.fatsG <= 0.051;
  } else {
    withinMacroThreshold = Math.abs(calorieDelta) / Math.max(1, sourceMacros.calories) <= 0.051;
  }

  // Match closest household portion if target has portions defined
  let nearestHouseholdPortion: IngredientSwapResult["nearestHouseholdPortion"];
  if (params.targetFood.householdPortions && params.targetFood.householdPortions.length > 0) {
    let closestDiff = Infinity;
    for (const portion of params.targetFood.householdPortions) {
      const count = Number((targetGrams / portion.grams).toFixed(1));
      const actualGrams = Math.round(count * portion.grams);
      const diff = Math.abs(actualGrams - targetGrams);
      if (diff < closestDiff) {
        closestDiff = diff;
        nearestHouseholdPortion = {
          unitEn: portion.unitEn,
          unitAr: portion.unitAr,
          count,
          actualGrams,
        };
      }
    }
  }

  return {
    replacementGrams: targetGrams,
    sourceMacros,
    replacementMacros,
    calorieDelta,
    proteinDelta,
    carbsDelta,
    fatsDelta,
    withinMacroThreshold,
    primaryMacro: primary,
    nearestHouseholdPortion,
  };
}

export interface MealOption {
  id: string;
  nameEn: string;
  nameAr: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  items: Array<{
    foodId: string;
    foodNameEn: string;
    foodNameAr: string;
    grams: number;
    householdUnit?: string;
  }>;
}

export interface WholeMealSwapMatch {
  meal: MealOption;
  portionMultiplier: number; // Factor to scale meal (e.g. 0.95x or 1.05x) to match target
  adjustedMacros: MacroProfile;
  calorieDelta: number;
  proteinDelta: number;
  withinTolerance: boolean;
}

/**
 * Level 2: Whole Meal Swap (Culturally Matched Egyptian Meal Swap within ±5% Calories & Protein)
 */
export function calculateWholeMealSwap(params: {
  sourceMeal: MealOption;
  candidates: MealOption[];
  maxTolerancePercent?: number; // default 5%
}): WholeMealSwapMatch[] {
  const tolerance = params.maxTolerancePercent ?? 0.05;
  const matches: WholeMealSwapMatch[] = [];

  for (const candidate of params.candidates) {
    if (candidate.id === params.sourceMeal.id) continue;
    if (candidate.mealType !== params.sourceMeal.mealType) continue;

    // Calculate portion multiplier to scale candidate's calories to match source meal
    const multiplier = Number((params.sourceMeal.calories / Math.max(1, candidate.calories)).toFixed(2));

    // Cap scaling multiplier within practical range (0.75x to 1.35x)
    if (multiplier < 0.75 || multiplier > 1.35) continue;

    const adjustedMacros: MacroProfile = {
      calories: Math.round(candidate.calories * multiplier),
      proteinG: Number((candidate.proteinG * multiplier).toFixed(1)),
      carbsG: Number((candidate.carbsG * multiplier).toFixed(1)),
      fatsG: Number((candidate.fatsG * multiplier).toFixed(1)),
    };

    const calorieDelta = Math.abs(adjustedMacros.calories - params.sourceMeal.calories);
    const proteinDelta = Math.abs(adjustedMacros.proteinG - params.sourceMeal.proteinG);

    const caloriePercentDiff = calorieDelta / params.sourceMeal.calories;
    const proteinPercentDiff = proteinDelta / Math.max(1, params.sourceMeal.proteinG);

    const withinTolerance = caloriePercentDiff <= tolerance && proteinPercentDiff <= 0.08;

    matches.push({
      meal: candidate,
      portionMultiplier: multiplier,
      adjustedMacros,
      calorieDelta: adjustedMacros.calories - params.sourceMeal.calories,
      proteinDelta: Number((adjustedMacros.proteinG - params.sourceMeal.proteinG).toFixed(1)),
      withinTolerance,
    });
  }

  // Sort by closest calorie and protein match
  return matches.sort((a, b) => Math.abs(a.calorieDelta) + Math.abs(a.proteinDelta) * 4 - (Math.abs(b.calorieDelta) + Math.abs(b.proteinDelta) * 4));
}

export interface ExerciseDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  movementPattern: string;
  primaryMuscle: string;
  equipment: "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight" | "bands";
  difficulty: "beginner" | "intermediate" | "advanced";
  alternativeIds: string[];
}

export interface ExerciseSwapOptions {
  equipmentBusyMode?: boolean;
  homeMode?: boolean;
  userAvailableEquipment?: string[];
  injuryFlags?: string[];
}

/**
 * Level 3: Biomechanical Exercise Swap Engine
 * Swaps any exercise with a movement pattern & muscle equivalent,
 * supporting "Equipment Busy" and "Home Mode" toggles.
 */
export function calculateExerciseSwap(params: {
  currentExercise: ExerciseDefinition;
  candidateLibrary: ExerciseDefinition[];
  options?: ExerciseSwapOptions;
}): ExerciseDefinition[] {
  const opts = params.options || {};

  return params.candidateLibrary.filter((candidate) => {
    // 1. Exclude the current exercise itself
    if (candidate.id === params.currentExercise.id) return false;

    // 2. Strict Biomechanical Equivalence: same movement pattern & primary muscle
    if (candidate.movementPattern !== params.currentExercise.movementPattern) return false;
    if (candidate.primaryMuscle !== params.currentExercise.primaryMuscle) return false;

    // 3. Equipment Busy Mode: must require DIFFERENT equipment than current exercise
    if (opts.equipmentBusyMode && candidate.equipment === params.currentExercise.equipment) {
      return false;
    }

    // 4. Home Mode: must use dumbbells, resistance bands, or bodyweight only
    if (opts.homeMode && !["dumbbell", "bodyweight", "bands"].includes(candidate.equipment)) {
      return false;
    }

    // 5. User equipment availability constraint
    if (opts.userAvailableEquipment && opts.userAvailableEquipment.length > 0) {
      if (!opts.userAvailableEquipment.includes(candidate.equipment)) {
        return false;
      }
    }

    // 6. Injury filters (e.g., knee_pain filters out deep barbell back squats)
    if (opts.injuryFlags && opts.injuryFlags.length > 0) {
      if (opts.injuryFlags.includes("knee_pain") && candidate.equipment === "barbell" && candidate.movementPattern === "squat") {
        return false;
      }
      if (opts.injuryFlags.includes("lower_back") && candidate.movementPattern === "hinge" && candidate.equipment === "barbell") {
        return false;
      }
    }

    return true;
  });
}
