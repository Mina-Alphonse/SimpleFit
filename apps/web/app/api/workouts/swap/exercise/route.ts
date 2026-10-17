import { NextRequest, NextResponse } from "next/server";
import { db, exercises, sql } from "@simplefit/database";
import { calculateExerciseSwap, ExerciseDefinition } from "@simplefit/shared";
import { z } from "zod";

const ExerciseSwapRequestSchema = z.object({
  currentExerciseId: z.string().uuid("Invalid exercise ID"),
  equipmentBusyMode: z.boolean().optional().default(false),
  homeMode: z.boolean().optional().default(false),
  injuryFlags: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExerciseSwapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { currentExerciseId, equipmentBusyMode, homeMode, injuryFlags } = parsed.data;

    // Fetch the current exercise
    const currentList = await db
      .select()
      .from(exercises)
      .where(sql`${exercises.id} = ${currentExerciseId}::uuid`)
      .limit(1);

    if (currentList.length === 0) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const currentRaw = currentList[0];
    const currentExercise: ExerciseDefinition = {
      id: currentRaw.id,
      nameEn: currentRaw.nameEn,
      nameAr: currentRaw.nameAr,
      movementPattern: currentRaw.movementPattern,
      primaryMuscle: currentRaw.primaryMuscle,
      equipment: currentRaw.equipment as ExerciseDefinition["equipment"],
      difficulty: currentRaw.difficulty as ExerciseDefinition["difficulty"],
      alternativeIds: (currentRaw.alternativeExerciseIds as string[]) || [],
    };

    // Fetch candidate exercises with the same movement pattern & primary muscle
    const candidateList = await db
      .select()
      .from(exercises)
      .where(
        sql`${exercises.movementPattern} = ${currentExercise.movementPattern} AND ${exercises.primaryMuscle} = ${currentExercise.primaryMuscle}`
      );

    const candidates: ExerciseDefinition[] = candidateList.map((e) => ({
      id: e.id,
      nameEn: e.nameEn,
      nameAr: e.nameAr,
      movementPattern: e.movementPattern,
      primaryMuscle: e.primaryMuscle,
      equipment: e.equipment as ExerciseDefinition["equipment"],
      difficulty: e.difficulty as ExerciseDefinition["difficulty"],
      alternativeIds: (e.alternativeExerciseIds as string[]) || [],
    }));

    const validSwaps = calculateExerciseSwap({
      currentExercise,
      candidateLibrary: candidates,
      options: {
        equipmentBusyMode,
        homeMode,
        injuryFlags,
      },
    });

    return NextResponse.json({
      success: true,
      currentExercise,
      availableSwapsCount: validSwaps.length,
      swaps: validSwaps,
      activeFilters: {
        equipmentBusyMode,
        homeMode,
        injuryFlags,
      },
    });
  } catch (error) {
    console.error("[Exercise Swap API Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
