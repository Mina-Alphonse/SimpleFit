import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    movementPattern: text("movement_pattern").notNull(), // horizontal_push, horizontal_pull, vertical_push, vertical_pull, squat, hinge, lunge, isolation, core
    primaryMuscle: text("primary_muscle").notNull(),
    secondaryMuscles: jsonb("secondary_muscles").default([]),
    equipment: text("equipment").notNull(), // barbell, dumbbell, cable, machine, bodyweight, bands
    difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
    instructionsEn: text("instructions_en"),
    instructionsAr: text("instructions_ar"),
    // List of alternative exercise IDs for 1-Click Biomechanical Swap
    alternativeExerciseIds: jsonb("alternative_exercise_ids").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("exercises_movement_pattern_idx").on(table.movementPattern),
    index("exercises_primary_muscle_idx").on(table.primaryMuscle),
    index("exercises_equipment_idx").on(table.equipment),
  ]
);
