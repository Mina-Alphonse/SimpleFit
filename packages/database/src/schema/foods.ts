import { pgTable, text, timestamp, uuid, numeric, jsonb, index } from "drizzle-orm/pg-core";

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    category: text("category").notNull(), // 'staple', 'protein', 'carb', 'fat', 'traditional_main', 'dessert', 'beverage', 'snack'
    subCategory: text("sub_category"),
    caloriesPer100g: numeric("calories_per_100g", { precision: 6, scale: 2 }).notNull(),
    proteinPer100g: numeric("protein_per_100g", { precision: 6, scale: 2 }).notNull(),
    carbsPer100g: numeric("carbs_per_100g", { precision: 6, scale: 2 }).notNull(),
    fatsPer100g: numeric("fats_per_100g", { precision: 6, scale: 2 }).notNull(),
    fiberPer100g: numeric("fiber_per_100g", { precision: 6, scale: 2 }).default("0"),
    // Egyptian household units: [{ unitEn: "1/2 Loaf", unitAr: "نصف رغيف", grams: 65 }]
    householdPortions: jsonb("household_portions").notNull().default([]),
    isVerified: text("is_verified").default("true").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("foods_name_en_idx").on(table.nameEn),
    index("foods_name_ar_idx").on(table.nameAr),
    index("foods_category_idx").on(table.category),
  ]
);
