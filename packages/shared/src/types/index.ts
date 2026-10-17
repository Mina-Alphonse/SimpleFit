export type BiologicalSex = "male" | "female";

export type ActivityLevel =
  | "sedentary"      // Desk job, little/no exercise, <5k steps
  | "light"          // Lightly active, 5k-7.5k steps, light exercise 1-3 days
  | "moderate"       // Moderately active, 7.5k-10k steps, moderate exercise 3-5 days
  | "very_active"    // Very active, 10k-12.5k steps, hard exercise 6-7 days
  | "extra_active";  // Physical labor job or 2x/day training, 15k+ steps

export type FitnessExperience = "beginner" | "intermediate" | "advanced";

export type TrainingEnvironment = "gym" | "home_dumbbells" | "bodyweight";

export type WorkoutFrequency = 2 | 3 | 4 | 5 | 6;

export type CaloricTargetTier =
  | "gentle_deficit"     // -200 kcal
  | "moderate_deficit"   // -300 kcal
  | "standard_deficit"   // -500 kcal
  | "maintenance"        // 0 kcal
  | "gentle_surplus"     // +200 kcal
  | "moderate_surplus"   // +300 kcal
  | "standard_surplus";  // +500 kcal

export type PlanCadence = "weekly" | "biweekly" | "monthly";

export type BudgetTier = "economy" | "standard" | "flexible";

export interface MacroSplit {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface FoodPortionUnit {
  unitNameEn: string;
  unitNameAr: string;
  gramsPerUnit: number;
}

export type FoodCategory =
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

export interface FoodItem {
  id: string;
  nameEn: string;
  nameAr: string;
  category: FoodCategory;
  subCategory?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  fiberPer100g?: number;
  isFastingFriendly?: boolean; // Coptic Christian fasting compliance (plant-based / vegan + seafood)
  allergies?: string[];        // ['dairy', 'gluten', 'eggs', 'seafood', 'nuts', 'soy']
  portionUnits: FoodPortionUnit[];
}

export interface ExerciseItem {
  id: string;
  nameEn: string;
  nameAr: string;
  primaryMuscle: string;
  movementPattern: "horizontal_push" | "horizontal_pull" | "vertical_push" | "vertical_pull" | "squat" | "hinge" | "lunge" | "isolation" | "core";
  equipment: "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight" | "bands";
  difficulty: "beginner" | "intermediate" | "advanced";
  alternativeIds: string[];
}

// User Profile Dietary & Fasting Preferences
export interface UserDietaryPreferences {
  isChristianFasting: boolean;      // صيام مسيحي / صيام الأقباط
  fastingSeafoodAllowed?: boolean;  // هل مسموح بالأسماك (أيام الصوم المصرح فيها كالرومي وصوم الميلاد والرسل)
  allergies: string[];              // ['dairy', 'gluten', 'eggs', 'seafood', 'nuts', 'soy']
  dislikedFoods: string[];          // List of food names/IDs user dislikes
}

// Check-in Cycle & Plan Modification Types
export interface CheckInSubmission {
  currentWeightKg: number;
  adherenceScore: number;           // 0 to 100 percentage
  energyRating: "low" | "normal" | "high";
  hungerRating: "low" | "manageable" | "high";
  cycleCadence: PlanCadence;        // 'weekly' | 'biweekly' | 'monthly'
  previousTargetCalories: number;
  previousWeightKg: number;
  notes?: string;
}

export interface CheckInEvaluationResult {
  status: "maintain" | "adjust_deficit" | "adjust_surplus" | "increase_calories" | "boost_activity";
  weightDeltaKg: number;
  weeklyRateKg: number;
  newTargetCalories: number;
  calorieAdjustment: number;
  suggestedStepDelta: number;
  summaryEn: string;
  summaryAr: string;
  shouldModifyPlan: boolean;
  nextCheckInDays: number;
}
