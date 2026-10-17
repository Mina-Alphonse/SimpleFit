import { pgTable, text, timestamp, uuid, integer, numeric, jsonb, index, date } from "drizzle-orm/pg-core";
import { users } from "./users";

export const workoutLogs = pgTable(
  "workout_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    loggedDate: date("logged_date").notNull(),
    workoutName: text("workout_name").notNull(),
    durationMinutes: integer("duration_minutes"),
    // Array of completed sets: [{ exerciseId, weightKg, reps, effort: "easy" | "good_form" | "hard_max" }]
    exercisesCompleted: jsonb("exercises_completed").notNull(),
    progressionApplied: jsonb("progression_applied").default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("workout_logs_user_date_idx").on(table.userId, table.loggedDate),
  ]
);

export const dailyNutritionLogs = pgTable(
  "daily_nutrition_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    loggedDate: date("logged_date").notNull(),
    consumedCalories: integer("consumed_calories").notNull(),
    consumedProteinG: integer("consumed_protein_g").notNull(),
    consumedCarbsG: integer("consumed_carbs_g").notNull(),
    consumedFatsG: integer("consumed_fats_g").notNull(),
    stepCount: integer("step_count").default(0),
    morningWeightKg: numeric("morning_weight_kg", { precision: 5, scale: 2 }),
    // Surplus reconciliation status if excess calories logged
    surplusReconciled: jsonb("surplus_reconciled"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("daily_nutrition_logs_user_date_idx").on(table.userId, table.loggedDate),
  ]
);
