import type { ActivityLevel, BiologicalSex, CaloricTargetTier, MacroSplit } from "../types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const CALORIC_TIER_DELTAS: Record<CaloricTargetTier, number> = {
  gentle_deficit: -200,
  moderate_deficit: -300,
  standard_deficit: -500,
  maintenance: 0,
  gentle_surplus: 200,
  moderate_surplus: 300,
  standard_surplus: 500,
};

export const CLINICAL_MIN_CALORIES: Record<BiologicalSex, number> = {
  female: 1200,
  male: 1500,
};

export const MAX_SAFE_SURPLUS_KCAL = 750;

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula:
 * Male: 10 * weight (kg) + 6.25 * height (cm) - 5 * age + 5
 * Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age - 161
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  biologicalSex: BiologicalSex;
}): number {
  if (params.weightKg <= 0 || params.heightCm <= 0 || params.age <= 0) {
    throw new Error("Weight, height, and age must be strictly positive values.");
  }
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
  if (!multiplier) {
    throw new Error(`Invalid activity level: ${params.activityLevel}`);
  }
  return Math.round(params.bmr * multiplier);
}

export interface TargetCaloriesResult {
  targetCalories: number;
  rawCalories: number;
  guardrailApplied: boolean;
  guardrailReason?: "clinical_floor" | "bmr_floor" | "surplus_ceiling";
  note?: string;
}

/**
 * Calculate target calories with clinical and metabolic guardrails:
 * - Hard Guardrail 1: Never below safe clinical floor (1,200 kcal female / 1,500 kcal male)
 * - Hard Guardrail 2: Never below BMR for deficit tiers to protect metabolic health
 * - Hard Guardrail 3: Never exceed +750 kcal surplus
 */
export function calculateTargetCalories(params: {
  bmr: number;
  tdee: number;
  caloricTier: CaloricTargetTier;
  biologicalSex: BiologicalSex;
}): TargetCaloriesResult {
  const delta = CALORIC_TIER_DELTAS[params.caloricTier];
  const rawCalories = params.tdee + delta;
  const floor = CLINICAL_MIN_CALORIES[params.biologicalSex];

  // 1. Clinical minimum floor check
  if (rawCalories < floor) {
    return {
      targetCalories: floor,
      rawCalories,
      guardrailApplied: true,
      guardrailReason: "clinical_floor",
      note: `Prescribed calories capped at clinical safe floor (${floor} kcal/day) for ${params.biologicalSex}.`,
    };
  }

  // 2. BMR floor check for deficits
  if (delta < 0 && rawCalories < params.bmr) {
    return {
      targetCalories: params.bmr,
      rawCalories,
      guardrailApplied: true,
      guardrailReason: "bmr_floor",
      note: `Prescribed deficit capped at Basal Metabolic Rate (${params.bmr} kcal/day) to prevent metabolic slowdown and hormonal impairment.`,
    };
  }

  // 3. Maximum surplus ceiling check
  if (delta > MAX_SAFE_SURPLUS_KCAL) {
    const capped = params.tdee + MAX_SAFE_SURPLUS_KCAL;
    return {
      targetCalories: Math.round(capped),
      rawCalories,
      guardrailApplied: true,
      guardrailReason: "surplus_ceiling",
      note: `Surplus capped at maximum safe physiological ceiling (+${MAX_SAFE_SURPLUS_KCAL} kcal/day).`,
    };
  }

  return {
    targetCalories: Math.round(rawCalories),
    rawCalories,
    guardrailApplied: false,
  };
}

/**
 * Calculate Macro Allocation:
 * - Protein: 1.6g to 2.2g per kg (for overweight individuals, uses goal weight or adjusted body weight)
 * - Fats: ~25% of total calories (9 kcal/g)
 * - Carbs: Remaining calories (4 kcal/g)
 */
export function calculateMacroSplit(params: {
  targetCalories: number;
  weightKg: number;
  goalWeightKg?: number;
  proteinRatioGPerKg?: number;
}): MacroSplit {
  const proteinRatio = params.proteinRatioGPerKg ?? 2.0;

  // Use goal weight if provided and significantly lower than current weight (overweight safety guardrail)
  const effectiveWeight = params.goalWeightKg && params.goalWeightKg < params.weightKg
    ? params.goalWeightKg + (params.weightKg - params.goalWeightKg) * 0.25 // Adjusted body weight formula
    : params.weightKg;

  const proteinGrams = Math.round(effectiveWeight * proteinRatio);
  const proteinCalories = proteinGrams * 4;

  // Fats set to 25% of target calories
  const fatCalories = Math.round(params.targetCalories * 0.25);
  const fatsGrams = Math.round(fatCalories / 9);

  // Remaining calories to carbohydrates
  const remainingCalories = Math.max(0, params.targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    calories: params.targetCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
  };
}
