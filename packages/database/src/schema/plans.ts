import { pgTable, text, timestamp, uuid, integer, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const mealPlans = pgTable(
  "meal_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    cadence: text("cadence").notNull(), // weekly, biweekly, monthly
    totalCalories: integer("total_calories").notNull(),
    proteinG: integer("protein_g").notNull(),
    carbsG: integer("carbs_g").notNull(),
    fatsG: integer("fats_g").notNull(),
    // Array of days containing meals, foods, portions, and swap history
    planDays: jsonb("plan_days").notNull(),
    groceryList: jsonb("grocery_list").default([]),
    isActive: text("is_active").default("true").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("meal_plans_user_id_idx").on(table.userId)]
);

export const workoutPrograms = pgTable(
  "workout_programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    splitType: text("split_type").notNull(), // full_body, upper_lower, push_pull_legs
    frequencyDaysPerWeek: integer("frequency_days_per_week").notNull(),
    programDays: jsonb("program_days").notNull(),
    isActive: text("is_active").default("true").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("workout_programs_user_id_idx").on(table.userId)]
);
