import { db, pgClient } from "../client";
import { foods } from "../schema/foods";
import { exercises } from "../schema/exercises";
import { EGYPTIAN_FOODS_SEED } from "./data/foods";
import { EXERCISES_SEED } from "./data/exercises";
import { sql } from "drizzle-orm";

async function runSeed() {
  console.log("🚀 Starting SimpleFit Database Seeding...");

  try {
    // 1. Enable pg_trgm extension for fuzzy bilingual food search
    console.log("⚙️  Enabling PostgreSQL pg_trgm extension...");
    await pgClient.unsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // 2. Create GIN Trigram indexes on food names for fast fuzzy matching
    console.log("🔍 Creating GIN Trigram indexes on foods...");
    await pgClient.unsafe(`
      CREATE INDEX IF NOT EXISTS foods_name_en_trgm_idx ON foods USING gin (name_en gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS foods_name_ar_trgm_idx ON foods USING gin (name_ar gin_trgm_ops);
    `);

    // 3. Seed Egyptian Foods
    console.log(`🍲 Seeding ${EGYPTIAN_FOODS_SEED.length} localized Egyptian food items...`);
    for (const food of EGYPTIAN_FOODS_SEED) {
      // Check if food already exists
      const existing = await db
        .select({ id: foods.id })
        .from(foods)
        .where(sql`${foods.nameEn} = ${food.nameEn}`)
        .limit(1);

      if (existing.length === 0) {
        await db.insert(foods).values({
          nameEn: food.nameEn,
          nameAr: food.nameAr,
          category: food.category,
          subCategory: food.subCategory,
          caloriesPer100g: food.caloriesPer100g,
          proteinPer100g: food.proteinPer100g,
          carbsPer100g: food.carbsPer100g,
          fatsPer100g: food.fatsPer100g,
          fiberPer100g: food.fiberPer100g || "0",
          householdPortions: food.householdPortions,
          isVerified: "true",
        });
      }
    }
    console.log("✅ Egyptian Food Library successfully seeded.");

    // 4. Seed Biomechanical Exercises
    console.log(`🏋️ Seeding ${EXERCISES_SEED.length} biomechanical exercises...`);
    const keyToIdMap = new Map<string, string>();

    // Pass 1: Insert all exercises
    for (const ex of EXERCISES_SEED) {
      const existing = await db
        .select({ id: exercises.id })
        .from(exercises)
        .where(sql`${exercises.nameEn} = ${ex.nameEn}`)
        .limit(1);

      let exId: string;
      if (existing.length > 0) {
        exId = existing[0].id;
      } else {
        const inserted = await db
          .insert(exercises)
          .values({
            nameEn: ex.nameEn,
            nameAr: ex.nameAr,
            movementPattern: ex.movementPattern,
            primaryMuscle: ex.primaryMuscle,
            secondaryMuscles: ex.secondaryMuscles,
            equipment: ex.equipment,
            difficulty: ex.difficulty,
            instructionsEn: ex.instructionsEn,
            instructionsAr: ex.instructionsAr,
            alternativeExerciseIds: [],
          })
          .returning({ id: exercises.id });
        exId = inserted[0].id;
      }
      keyToIdMap.set(ex.idKey, exId);
    }

    // Pass 2: Connect Biomechanical Alternative Mappings (for 1-click swaps)
    console.log("🔗 Linking biomechanical swap alternatives...");
    for (const ex of EXERCISES_SEED) {
      const currentId = keyToIdMap.get(ex.idKey);
      if (!currentId) continue;

      const resolvedAlternativeIds = ex.alternativeKeys
        .map((altKey) => keyToIdMap.get(altKey))
        .filter((id): id is string => Boolean(id));

      await db
        .update(exercises)
        .set({ alternativeExerciseIds: resolvedAlternativeIds })
        .where(sql`${exercises.id} = ${currentId}::uuid`);
    }

    console.log("✅ Biomechanical Exercise Library successfully seeded & linked.");
    console.log("🎉 Phase 2 Database Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

runSeed();
