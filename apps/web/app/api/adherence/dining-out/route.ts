import { NextRequest, NextResponse } from "next/server";
import { calculateDiningOutBuffer, DiningOutEventType, BiologicalSex } from "@simplefit/shared";
import { z } from "zod";

const DiningOutRequestSchema = z.object({
  targetCalories: z.number().int().min(1200).max(5000),
  dailyProteinG: z.number().min(50).max(350),
  bufferKcal: z.number().int().min(400).max(1200).optional().default(800),
  eventType: z.enum([
    "egyptian_grill",
    "seafood",
    "fast_food",
    "italian_pizza_pasta",
    "oriental_cafe_dessert",
  ]),
  biologicalSex: z.enum(["male", "female"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DiningOutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const plan = calculateDiningOutBuffer({
      targetCalories: parsed.data.targetCalories,
      dailyProteinG: parsed.data.dailyProteinG,
      bufferKcal: parsed.data.bufferKcal,
      eventType: parsed.data.eventType as DiningOutEventType,
      biologicalSex: parsed.data.biologicalSex as BiologicalSex,
    });

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("[Dining Out Buffer Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
