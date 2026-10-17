import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { db, users, profiles, mealPlans, sql } from "@simplefit/database";
import {
  OnboardingProfileSchema,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
  generatePersonalizedMealPlan,
} from "@simplefit/shared";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (!token) token = req.cookies.get("simplefit_token")?.value || null;

    let userId: string | null = null;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) userId = payload.userId;
    }

    const body = await req.json();
    const parsed = OnboardingProfileSchema.safeParse(body.profile || body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Quantitative Nutrition Engine
    const bmr = calculateBMR({
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      age: data.age,
      biologicalSex: data.biologicalSex,
    });

    const tdee = calculateTDEE({
      bmr,
      activityLevel: data.activityLevel,
    });

    const calorieTarget = calculateTargetCalories({
      bmr,
      tdee,
      caloricTier: data.caloricTier,
      biologicalSex: data.biologicalSex,
    });

    const macros = calculateMacroSplit({
      targetCalories: calorieTarget.targetCalories,
      weightKg: data.weightKg,
      proteinRatioGPerKg: 2.0,
    });

    // If no user is logged in, create an anonymous/guest user
    if (!userId) {
      const guestEmail = `guest.${Date.now()}@simplefit.ai`;
      const [newGuest] = await db
        .insert(users)
        .values({
          email: guestEmail,
          name: "Guest Athlete",
          role: "user",
        })
        .returning();
      userId = newGuest.id;
    }

    // 2. Insert or update user profile
    const [savedProfile] = await db
      .insert(profiles)
      .values({
        userId,
        age: data.age,
        biologicalSex: data.biologicalSex,
        heightCm: String(data.heightCm),
        currentWeightKg: String(data.weightKg),
        goalWeightKg: String(data.weightKg - 5),
        activityLevel: data.activityLevel,
        fitnessExperience: data.fitnessExperience,
        trainingEnvironment: data.trainingEnvironment,
        trainingDaysPerWeek: data.daysPerWeek,
        sessionDurationMins: Number(data.sessionDurationMins),
        caloricTier: data.caloricTier,
        planCadence: data.planCadence,
        budgetTier: data.budgetTier,
        bmr: bmr,
        tdee: tdee,
        targetCalories: calorieTarget.targetCalories,
        targetProteinG: macros.proteinGrams,
        targetCarbsG: macros.carbsGrams,
        targetFatsG: macros.fatsGrams,
      })
      .returning();

    // 2. Generate Real Personalized Egyptian Meal Plan
    const generatedDays = generatePersonalizedMealPlan({
      targetCalories: calorieTarget.targetCalories,
      targetProteinG: macros.proteinGrams,
      targetCarbsG: macros.carbsGrams,
      targetFatsG: macros.fatsGrams,
      planCadence: data.planCadence,
      isChristianFasting: Boolean(data.isChristianFasting),
      fastingSeafoodAllowed: data.fastingSeafoodAllowed !== false,
      allergies: data.allergies,
      dislikedFoods: data.dislikedFoods,
    });

    // 3. Deactivate previous meal plans and save active plan
    await db
      .update(mealPlans)
      .set({ isActive: "false" })
      .where(sql`${mealPlans.userId} = ${userId}`);

    const [savedPlan] = await db
      .insert(mealPlans)
      .values({
        userId,
        cadence: data.planCadence,
        totalCalories: calorieTarget.targetCalories,
        proteinG: macros.proteinGrams,
        carbsG: macros.carbsGrams,
        fatsG: macros.fatsGrams,
        planDays: generatedDays,
        groceryList: body.groceryList || [],
        isActive: "true",
      })
      .returning();

    return NextResponse.json({
      success: true,
      profile: savedProfile,
      mealPlan: savedPlan,
      generatedDays,
      calculation: {
        bmr: bmr,
        tdee: tdee,
        targetCalories: calorieTarget.targetCalories,
        macros,
        safetyNotes: calorieTarget.note,
      },
    });
  } catch (err: unknown) {
    console.error("Save Profile Error:", err);
    return NextResponse.json(
      { error: "Failed to persist profile", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
