import { describe, it, expect, afterAll } from "vitest";
import { db, pgClient } from "../client";
import { foods } from "../schema/foods";
import { exercises } from "../schema/exercises";
import { sql } from "drizzle-orm";

describe("Phase 2 Verification: Database Queries & Trigram Fuzzy Search", () => {
  afterAll(async () => {
    await pgClient.end();
  });

  it("should have seeded Egyptian foods with dual measurement units", async () => {
    const result = await db
      .select()
      .from(foods)
      .where(sql`${foods.nameEn} ILIKE '%Ful Medames%'`);

    expect(result.length).toBeGreaterThan(0);
    const fulItem = result[0];
    expect(fulItem.nameAr).toContain("فول");
    expect(Number(fulItem.caloriesPer100g)).toBeGreaterThan(0);
    expect(Number(fulItem.proteinPer100g)).toBeGreaterThan(0);

    // Verify Egyptian household portion units exist
    const portions = fulItem.householdPortions as Array<{ unitEn: string; unitAr: string; grams: number }>;
    expect(Array.isArray(portions)).toBe(true);
    expect(portions.length).toBeGreaterThan(0);
    expect(portions[0].grams).toBeGreaterThan(0);
    expect(portions[0].unitAr).toBeDefined();
  });

  it("should perform instant bilingual trigram fuzzy search in English", async () => {
    // Fuzzy search for 'kosh' to match 'Egyptian Koshary'
    const result = await db
      .select({
        id: foods.id,
        nameEn: foods.nameEn,
        nameAr: foods.nameAr,
        similarity: sql<number>`similarity(${foods.nameEn}, 'koshary')`,
      })
      .from(foods)
      .where(sql`similarity(${foods.nameEn}, 'koshary') > 0.2`)
      .orderBy(sql`similarity(${foods.nameEn}, 'koshary') DESC`)
      .limit(5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].nameEn.toLowerCase()).toContain("koshary");
  });

  it("should perform instant bilingual trigram fuzzy search in Arabic", async () => {
    // Word-level trigram fuzzy search for Arabic term 'طعمية' (allowing common Egyptian spelling variants like 'طعميه')
    const result = await db
      .select({
        id: foods.id,
        nameEn: foods.nameEn,
        nameAr: foods.nameAr,
        similarity: sql<number>`word_similarity('طعميه', ${foods.nameAr})`,
      })
      .from(foods)
      .where(sql`word_similarity('طعميه', ${foods.nameAr}) > 0.3`)
      .orderBy(sql`word_similarity('طعميه', ${foods.nameAr}) DESC`)
      .limit(5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].nameAr).toContain("طعمية");
  });

  it("should have seeded biomechanical exercises with linked 1-click swap alternatives", async () => {
    const benchPressList = await db
      .select()
      .from(exercises)
      .where(sql`${exercises.movementPattern} = 'horizontal_push' AND ${exercises.equipment} = 'barbell'`);

    expect(benchPressList.length).toBeGreaterThan(0);
    const benchPress = benchPressList[0];
    expect(benchPress.primaryMuscle).toBe("Chest");

    // Verify swap alternatives are populated
    const altIds = benchPress.alternativeExerciseIds as string[];
    expect(Array.isArray(altIds)).toBe(true);
    expect(altIds.length).toBeGreaterThan(0);

    // Verify that linked alternatives exist in the database and have the same movement pattern
    const firstAlt = await db
      .select()
      .from(exercises)
      .where(sql`${exercises.id} = ${altIds[0]}::uuid`);

    expect(firstAlt.length).toBe(1);
    expect(firstAlt[0].movementPattern).toBe("horizontal_push");
    expect(firstAlt[0].primaryMuscle).toBe("Chest");
  });
});
