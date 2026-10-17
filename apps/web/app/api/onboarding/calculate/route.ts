import { NextRequest, NextResponse } from "next/server";
import {
  OnboardingProfileSchema,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
} from "@simplefit/shared";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OnboardingProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Calculate BMR
    const bmr = calculateBMR({
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      age: data.age,
      biologicalSex: data.biologicalSex,
    });

    // 2. Calculate TDEE
    const tdee = calculateTDEE({
      bmr,
      activityLevel: data.activityLevel,
    });

    // 3. Calculate Target Calories with Guardrails
    const targetResult = calculateTargetCalories({
      bmr,
      tdee,
      caloricTier: data.caloricTier,
      biologicalSex: data.biologicalSex,
    });

    // 4. Calculate Macro Split
    const macros = calculateMacroSplit({
      targetCalories: targetResult.targetCalories,
      weightKg: data.weightKg,
      proteinRatioGPerKg: 2.0,
    });

    return NextResponse.json({
      success: true,
      diagnosticSummary: {
        bmr,
        tdee,
        targetCalories: targetResult.targetCalories,
        rawCalculatedCalories: targetResult.rawCalories,
        guardrailApplied: targetResult.guardrailApplied,
        guardrailReason: targetResult.guardrailReason,
        guardrailNote: targetResult.note,
        caloricTier: data.caloricTier,
        macros: {
          calories: macros.calories,
          proteinG: macros.proteinGrams,
          carbsG: macros.carbsGrams,
          fatsG: macros.fatsGrams,
        },
        planCadence: data.planCadence,
        budgetTier: data.budgetTier,
        trainingSchedule: {
          daysPerWeek: data.daysPerWeek,
          durationMins: data.sessionDurationMins,
          environment: data.trainingEnvironment,
          experience: data.fitnessExperience,
        },
      },
    });
  } catch (error) {
    console.error("[Onboarding Calculation Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
