import type { ActivityLevel, BiologicalSex, CaloricTargetTier, MacroSplit } from "../types";

/**
 * Activity Multipliers for Mifflin-St Jeor TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/**
 * Caloric adjustment deltas per tier
 */
export const CALORIC_TIER_DELTAS: Record<CaloricTargetTier, number> = {
  gentle_deficit: -200,
  moderate_deficit: -300,
  standard_deficit: -500,
  maintenance: 0,
  gentle_surplus: 200,
  moderate_surplus: 300,
  standard_surplus: 500,
};

/**
 * Safe clinical intake floors (kcal)
 */
export const CLINICAL_MIN_CALORIES: Record<BiologicalSex, number> = {
  female: 1200,
  male: 1500,
};

/**
 * Maximum safe surplus cap (kcal)
 */
export const MAX_SAFE_SURPLUS_KCAL = 750;

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 * Male: 10 * weight (kg) + 6.25 * height (cm) - 5 * age + 5
 * Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age - 161
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  biologicalSex: BiologicalSex;
}): number {
  const base = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age;
  return params.biologicalSex === "male" ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(params: {
  bmr: number;
  activityLevel: ActivityLevel;
}): number {
  const multiplier = ACTIVITY_MULTIPLIERS[params.activityLevel];
  return Math.round(params.bmr * multiplier);
}

/**
 * Calculate safe target calories with guardrails:
 * - Never below clinical floor (1200 kcal female / 1500 kcal male)
 * - Never below BMR for aggressive deficit
 * - Never above +750 kcal surplus
 */
export function calculateTargetCalories(params: {
  bmr: number;
  tdee: number;
  caloricTier: CaloricTargetTier;
  biologicalSex: BiologicalSex;
}): { targetCalories: number; guardrailApplied: boolean; note?: string } {
  const delta = CALORIC_TIER_DELTAS[params.caloricTier];
  let calculated = params.tdee + delta;
  let guardrailApplied = false;
  let note: string | undefined;

  const floor = CLINICAL_MIN_CALORIES[params.biologicalSex];

  if (calculated < floor) {
    calculated = floor;
    guardrailApplied = true;
    note = `Target capped at clinical minimum floor (${floor} kcal/day).`;
  } else if (calculated < params.bmr && delta < 0) {
    calculated = params.bmr;
    guardrailApplied = true;
    note = `Target capped at Basal Metabolic Rate (${params.bmr} kcal/day) to prevent metabolic slowdown.`;
  } else if (delta > MAX_SAFE_SURPLUS_KCAL) {
    calculated = params.tdee + MAX_SAFE_SURPLUS_KCAL;
    guardrailApplied = true;
    note = `Surplus capped at maximum safe ceiling (+${MAX_SAFE_SURPLUS_KCAL} kcal/day).`;
  }

  return { targetCalories: Math.round(calculated), guardrailApplied, note };
}

/**
 * Distribute target calories into Macronutrients:
 * - Protein: 1.8g to 2.2g per kg (default 2.0g)
 * - Fats: ~25% of total calories (9 kcal/g)
 * - Carbs: Remaining calories (4 kcal/g)
 */
export function calculateMacroSplit(params: {
  targetCalories: number;
  weightKg: number;
  proteinRatioGPerKg?: number;
}): MacroSplit {
  const proteinGPerKg = params.proteinRatioGPerKg ?? 2.0;
  const proteinGrams = Math.round(params.weightKg * proteinGPerKg);
  const proteinCalories = proteinGrams * 4;

  const fatCalories = Math.round(params.targetCalories * 0.25);
  const fatsGrams = Math.round(fatCalories / 9);

  const remainingCalories = Math.max(0, params.targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    calories: params.targetCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
  };
}
