import { z } from "zod";

export const BiologicalSexSchema = z.enum(["male", "female"]);
export const ActivityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "very_active",
  "extra_active",
]);
export const FitnessExperienceSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const TrainingEnvironmentSchema = z.enum(["gym", "home_dumbbells", "bodyweight"]);
export const CaloricTargetTierSchema = z.enum([
  "gentle_deficit",
  "moderate_deficit",
  "standard_deficit",
  "maintenance",
  "gentle_surplus",
  "moderate_surplus",
  "standard_surplus",
]);
export const PlanCadenceSchema = z.enum(["weekly", "biweekly", "monthly"]);
export const BudgetTierSchema = z.enum(["economy", "standard", "flexible"]);

export const OnboardingProfileSchema = z.object({
  age: z.number().int().min(14, "Must be at least 14 years old").max(100, "Must be under 100 years old"),
  biologicalSex: BiologicalSexSchema,
  heightCm: z.number().min(120, "Height must be at least 120 cm").max(250, "Height must be under 250 cm"),
  weightKg: z.number().min(35, "Weight must be at least 35 kg").max(300, "Weight must be under 300 kg"),
  activityLevel: ActivityLevelSchema,
  fitnessExperience: FitnessExperienceSchema,
  trainingEnvironment: TrainingEnvironmentSchema,
  daysPerWeek: z.number().int().min(2).max(6),
  sessionDurationMins: z.enum(["30", "45", "60"]),
  caloricTier: CaloricTargetTierSchema,
  planCadence: PlanCadenceSchema,
  budgetTier: BudgetTierSchema,
  injuryFlags: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dislikedFoods: z.array(z.string()).default([]),
  isChristianFasting: z.boolean().default(false),
  fastingSeafoodAllowed: z.boolean().default(true),
});

export type OnboardingProfileInput = z.infer<typeof OnboardingProfileSchema>;

export const FoodSearchQuerySchema = z.object({
  query: z.string().min(1, "Search term cannot be empty").max(100),
  limit: z.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
});
