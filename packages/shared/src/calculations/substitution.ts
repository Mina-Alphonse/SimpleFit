export interface MacroProfile {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export type ExtendedFoodCategory =
  | "staple"
  | "protein"
  | "carb"
  | "fat"
  | "traditional_main"
  | "dessert"
  | "beverage"
  | "snack"
  | "fiber"
  | "vegetable"
  | "fruit"
  | "poultry"
  | "cold_cut"
  | "seafood"
  | "canned";

export interface FoodNutritionPer100g {
  id?: string;
  nameEn: string;
  nameAr?: string;
  category: ExtendedFoodCategory;
  subCategory?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  fiberPer100g?: number;
  isFastingFriendly?: boolean;
  allergies?: string[];
  householdPortions?: Array<{
    unitEn: string;
    unitAr: string;
    grams: number;
  }>;
}

export interface IngredientSwapResult {
  targetFood?: FoodNutritionPer100g;
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

export type NutritionFoodGroup = "carb" | "protein" | "fat" | "vegetable_fiber" | "fruit";

/**
 * Determine high-level nutritional group for strict same-type food substitutions
 */
export function getFoodNutritionGroup(food: FoodNutritionPer100g): NutritionFoodGroup {
  if (food.category === "fruit") return "fruit";
  if (food.category === "vegetable" || food.category === "fiber") return "vegetable_fiber";
  if (
    food.category === "protein" ||
    food.category === "poultry" ||
    food.category === "cold_cut" ||
    food.category === "seafood"
  ) {
    return "protein";
  }
  if (food.category === "fat") return "fat";
  if (food.category === "carb" || food.category === "staple") return "carb";

  // For canned foods, snacks, or traditional items, inspect macro contribution
  const carbCal = food.carbsPer100g * 4;
  const proteinCal = food.proteinPer100g * 4;
  const fatCal = food.fatsPer100g * 9;

  if (proteinCal >= carbCal && proteinCal >= fatCal) return "protein";
  if (fatCal >= carbCal && fatCal >= proteinCal) return "fat";
  return "carb";
}

/**
 * Determine the primary macronutrient driver for a food item
 */
export function getPrimaryMacro(food: FoodNutritionPer100g): "carbs" | "protein" | "fats" {
  const group = getFoodNutritionGroup(food);
  if (group === "protein") return "protein";
  if (group === "carb" || group === "fruit" || group === "vegetable_fiber") return "carbs";
  if (group === "fat") return "fats";

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
    targetGrams = Math.round((sourceMacros.calories / Math.max(1, params.targetFood.caloriesPer100g)) * 100);
  }

  // Guardrail against negative or tiny grams
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
    targetFood: params.targetFood,
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

export interface PaginatedSwapQuery {
  sourceFood: FoodNutritionPer100g;
  sourceGrams: number;
  candidates: FoodNutritionPer100g[];
  currentMealFoodNames?: string[];
  currentMealFoodIds?: string[];
  isChristianFasting?: boolean;
  fastingSeafoodAllowed?: boolean;
  userAllergies?: string[];
  dislikedFoods?: string[];
  offset?: number;
  limit?: number; // max 5
}

export interface PaginatedSwapResponse {
  items: IngredientSwapResult[];
  totalAvailable: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  nextOffset: number | null;
}

/**
 * Filter and paginate ingredient alternatives adhering to all strict business rules:
 * 1. Must be of the same type/food group.
 * 2. Must guarantee ±5% macro matching.
 * 3. Must NOT suggest any item already present in the current meal.
 * 4. Must respect Christian Fasting rules (vegan/plant-based + seafood when allowed).
 * 5. Must respect user allergies and disliked foods.
 * 6. Returns <= 5 items per page with load more pagination.
 */
export function findPaginatedIngredientSwaps(params: PaginatedSwapQuery): PaginatedSwapResponse {
  const sourceGroup = getFoodNutritionGroup(params.sourceFood);
  const offset = params.offset ?? 0;
  const limit = Math.min(params.limit ?? 5, 5); // enforce <= 5 items

  const mealIds = new Set((params.currentMealFoodIds || []).filter(Boolean));
  const mealNames = new Set(
    (params.currentMealFoodNames || []).map((n) => n.trim().toLowerCase())
  );
  const userAllergies = new Set((params.userAllergies || []).map((a) => a.toLowerCase()));
  const disliked = new Set((params.dislikedFoods || []).map((d) => d.toLowerCase()));

  // Filter candidates strictly
  const validCandidates = params.candidates.filter((candidate) => {
    // 1. Cannot be the same food item
    if (candidate.nameEn.toLowerCase() === params.sourceFood.nameEn.toLowerCase()) return false;
    if (candidate.id && params.sourceFood.id && candidate.id === params.sourceFood.id) return false;

    // 2. MUST NOT be already present in the current meal
    if (candidate.id && mealIds.has(candidate.id)) return false;
    if (mealNames.has(candidate.nameEn.toLowerCase())) return false;
    if (candidate.nameAr && mealNames.has(candidate.nameAr.toLowerCase())) return false;

    // 3. MUST be of the SAME TYPE/GROUP
    const candGroup = getFoodNutritionGroup(candidate);
    if (candGroup !== sourceGroup) return false;

    // 4. Christian Fasting Filter
    if (params.isChristianFasting) {
      if (candidate.isFastingFriendly === false) return false;
      // If seafood is not allowed in current fast, filter out seafood
      if (
        params.fastingSeafoodAllowed === false &&
        (candidate.category === "seafood" || candidate.subCategory === "seafood")
      ) {
        return false;
      }
    }

    // 5. User Allergies Filter
    if (candidate.allergies && candidate.allergies.some((a) => userAllergies.has(a.toLowerCase()))) {
      return false;
    }

    // 6. Disliked Foods Filter
    if (
      disliked.has(candidate.nameEn.toLowerCase()) ||
      (candidate.nameAr && disliked.has(candidate.nameAr.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  // Calculate swaps and keep those within ±5%
  const matchingSwaps: IngredientSwapResult[] = [];
  for (const candidate of validCandidates) {
    const swap = calculateIngredientSwap({
      sourceFood: params.sourceFood,
      sourceGrams: params.sourceGrams,
      targetFood: candidate,
    });
    if (swap.withinMacroThreshold) {
      matchingSwaps.push(swap);
    }
  }

  // Sort by closest macro delta
  matchingSwaps.sort((a, b) => Math.abs(a.calorieDelta) - Math.abs(b.calorieDelta));

  const totalAvailable = matchingSwaps.length;
  const pagedItems = matchingSwaps.slice(offset, offset + limit);
  const nextOffset = offset + limit < totalAvailable ? offset + limit : null;

  return {
    items: pagedItems,
    totalAvailable,
    offset,
    limit,
    hasMore: nextOffset !== null,
    nextOffset,
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
  portionMultiplier: number;
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
  maxTolerancePercent?: number;
}): WholeMealSwapMatch[] {
  const tolerance = params.maxTolerancePercent ?? 0.05;
  const matches: WholeMealSwapMatch[] = [];

  for (const candidate of params.candidates) {
    if (candidate.id === params.sourceMeal.id) continue;
    if (candidate.mealType !== params.sourceMeal.mealType) continue;

    const multiplier = Number((params.sourceMeal.calories / Math.max(1, candidate.calories)).toFixed(2));
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
 */
export function calculateExerciseSwap(params: {
  currentExercise: ExerciseDefinition;
  candidateLibrary: ExerciseDefinition[];
  options?: ExerciseSwapOptions;
}): ExerciseDefinition[] {
  const opts = params.options || {};

  return params.candidateLibrary.filter((candidate) => {
    if (candidate.id === params.currentExercise.id) return false;
    if (candidate.movementPattern !== params.currentExercise.movementPattern) return false;
    if (candidate.primaryMuscle !== params.currentExercise.primaryMuscle) return false;

    if (opts.equipmentBusyMode && candidate.equipment === params.currentExercise.equipment) {
      return false;
    }

    if (opts.homeMode && !["dumbbell", "bodyweight", "bands"].includes(candidate.equipment)) {
      return false;
    }

    if (opts.userAvailableEquipment && opts.userAvailableEquipment.length > 0) {
      if (!opts.userAvailableEquipment.includes(candidate.equipment)) {
        return false;
      }
    }

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
