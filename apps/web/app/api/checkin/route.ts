import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { db, profiles, dailyNutritionLogs, sql } from "@simplefit/database";
import { evaluateCheckIn, CheckInSubmission } from "@simplefit/shared";

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

    const body: CheckInSubmission = await req.json();

    // Evaluate check-in
    const evaluation = evaluateCheckIn(body);

    // If user is authenticated and plan requires modification, update profile target calories
    if (userId) {
      if (evaluation.shouldModifyPlan) {
        await db
          .update(profiles)
          .set({
            targetCalories: evaluation.newTargetCalories,
            currentWeightKg: String(body.currentWeightKg),
            updatedAt: new Date(),
          })
          .where(sql`${profiles.userId} = ${userId}`);
      }

      // Log check-in entry to daily_nutrition_logs
      await db.insert(dailyNutritionLogs).values({
        userId,
        loggedDate: new Date().toISOString().split("T")[0],
        consumedCalories: evaluation.newTargetCalories,
        consumedProteinG: 0,
        consumedCarbsG: 0,
        consumedFatsG: 0,
        morningWeightKg: String(body.currentWeightKg),
        stepCount: evaluation.suggestedStepDelta,
        surplusReconciled: {
          checkInStatus: evaluation.status,
          weeklyRateKg: evaluation.weeklyRateKg,
          weightDeltaKg: evaluation.weightDeltaKg,
          notes: body.notes || "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: unknown) {
    console.error("Check-in API Error:", err);
    return NextResponse.json(
      { error: "Failed to process check-in", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
