import { NextRequest, NextResponse } from "next/server";
import { db, foods, sql } from "@masrfit/database";
import { calculateIngredientSwap, FoodNutritionPer100g } from "@masrfit/shared";
import { z } from "zod";

const IngredientSwapRequestSchema = z.object({
  sourceFoodId: z.string().uuid("Invalid source food ID"),
  sourceGrams: z.number().positive("Source grams must be greater than 0"),
  targetFoodId: z.string().uuid("Invalid target food ID"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = IngredientSwapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sourceFoodId, sourceGrams, targetFoodId } = parsed.data;

    // Fetch both foods from database
    const fetchedFoods = await db
      .select()
      .from(foods)
      .where(sql`${foods.id} IN (${sourceFoodId}::uuid, ${targetFoodId}::uuid)`);

    const sourceItem = fetchedFoods.find((f) => f.id === sourceFoodId);
    const targetItem = fetchedFoods.find((f) => f.id === targetFoodId);

    if (!sourceItem || !targetItem) {
      return NextResponse.json(
        { error: "Food item not found", message: "One or both food items could not be found in the database." },
        { status: 404 }
      );
    }

    const sourceFoodNutrition: FoodNutritionPer100g = {
      id: sourceItem.id,
      nameEn: sourceItem.nameEn,
      nameAr: sourceItem.nameAr,
      category: sourceItem.category as FoodNutritionPer100g["category"],
      caloriesPer100g: Number(sourceItem.caloriesPer100g),
      proteinPer100g: Number(sourceItem.proteinPer100g),
      carbsPer100g: Number(sourceItem.carbsPer100g),
      fatsPer100g: Number(sourceItem.fatsPer100g),
      householdPortions: sourceItem.householdPortions as FoodNutritionPer100g["householdPortions"],
    };

    const targetFoodNutrition: FoodNutritionPer100g = {
      id: targetItem.id,
      nameEn: targetItem.nameEn,
      nameAr: targetItem.nameAr,
      category: targetItem.category as FoodNutritionPer100g["category"],
      caloriesPer100g: Number(targetItem.caloriesPer100g),
      proteinPer100g: Number(targetItem.proteinPer100g),
      carbsPer100g: Number(targetItem.carbsPer100g),
      fatsPer100g: Number(targetItem.fatsPer100g),
      householdPortions: targetItem.householdPortions as FoodNutritionPer100g["householdPortions"],
    };

    const swapResult = calculateIngredientSwap({
      sourceFood: sourceFoodNutrition,
      sourceGrams,
      targetFood: targetFoodNutrition,
    });

    return NextResponse.json({
      success: true,
      sourceFood: {
        id: sourceItem.id,
        nameEn: sourceItem.nameEn,
        nameAr: sourceItem.nameAr,
        grams: sourceGrams,
        macros: swapResult.sourceMacros,
      },
      replacementFood: {
        id: targetItem.id,
        nameEn: targetItem.nameEn,
        nameAr: targetItem.nameAr,
        grams: swapResult.replacementGrams,
        macros: swapResult.replacementMacros,
        nearestHouseholdPortion: swapResult.nearestHouseholdPortion,
      },
      macroDeltas: {
        calories: swapResult.calorieDelta,
        proteinG: swapResult.proteinDelta,
        carbsG: swapResult.carbsDelta,
        fatsG: swapResult.fatsDelta,
      },
      withinMacroThreshold: swapResult.withinMacroThreshold,
      primaryMacro: swapResult.primaryMacro,
    });
  } catch (error) {
    console.error("[Ingredient Swap API Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
