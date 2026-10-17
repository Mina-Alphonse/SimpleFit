import { NextRequest, NextResponse } from "next/server";
import { calculateSurplusReconciliation, BiologicalSex } from "@simplefit/shared";
import { z } from "zod";

const ReconciliationRequestSchema = z.object({
  targetCalories: z.number().int().min(1200).max(5000),
  consumedCalories: z.number().int().min(1000).max(10000),
  remainingDaysInWeek: z.number().int().min(1).max(7).default(4),
  bmr: z.number().int().min(1000).max(3500),
  biologicalSex: z.enum(["male", "female"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReconciliationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const plan = calculateSurplusReconciliation({
      targetCalories: parsed.data.targetCalories,
      consumedCalories: parsed.data.consumedCalories,
      remainingDaysInWeek: parsed.data.remainingDaysInWeek,
      bmr: parsed.data.bmr,
      biologicalSex: parsed.data.biologicalSex as BiologicalSex,
    });

    return NextResponse.json({
      success: true,
      reconciliationPlan: plan,
    });
  } catch (error) {
    console.error("[Reconciliation Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
