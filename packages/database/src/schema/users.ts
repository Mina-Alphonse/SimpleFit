import { pgTable, text, timestamp, uuid, integer, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  biologicalSex: text("biological_sex").notNull(), // 'male' | 'female'
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }).notNull(),
  currentWeightKg: numeric("current_weight_kg", { precision: 5, scale: 2 }).notNull(),
  goalWeightKg: numeric("goal_weight_kg", { precision: 5, scale: 2 }),
  activityLevel: text("activity_level").notNull(),
  fitnessExperience: text("fitness_experience").notNull(),
  trainingEnvironment: text("training_environment").notNull(),
  trainingDaysPerWeek: integer("training_days_per_week").default(3).notNull(),
  sessionDurationMins: integer("session_duration_mins").default(45).notNull(),
  caloricTier: text("caloric_tier").notNull(),
  planCadence: text("plan_cadence").default("weekly").notNull(),
  budgetTier: text("budget_tier").default("standard").notNull(),
  bmr: integer("bmr").notNull(),
  tdee: integer("tdee").notNull(),
  targetCalories: integer("target_calories").notNull(),
  targetProteinG: integer("target_protein_g").notNull(),
  targetCarbsG: integer("target_carbs_g").notNull(),
  targetFatsG: integer("target_fats_g").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
