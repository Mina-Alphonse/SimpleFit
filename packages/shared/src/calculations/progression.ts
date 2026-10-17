export type EffortRating = "easy" | "good_form" | "hard_max";

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  effort: EffortRating;
}

export interface ExercisePrescription {
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  currentWeightKg: number;
  equipmentType?: "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight";
}

export interface ProgressionResult {
  shouldProgress: boolean;
  progressionType: "increase_weight" | "increase_reps" | "maintain_and_consolidate" | "deload_or_form_check";
  nextWeightKg: number;
  nextTargetRepsMin: number;
  nextTargetRepsMax: number;
  reasonEn: string;
  reasonAr: string;
  badgeLabel?: string;
}

/**
 * Evaluates completed sets against the prescribed rep range using beginner-friendly Double Progression logic:
 * - If all sets hit top of rep range with 'easy' or 'good_form' -> Advance weight (+2.5 kg) or add reps
 * - If reps met but last set was 'hard_max' -> Consolidate current load with better form next time
 * - If reps missed -> Continue working at current load to accumulate reps
 */
export function evaluateDoubleProgression(params: {
  prescription: ExercisePrescription;
  completedSets: LoggedSet[];
}): ProgressionResult {
  const { prescription, completedSets } = params;

  if (completedSets.length === 0) {
    return {
      shouldProgress: false,
      progressionType: "maintain_and_consolidate",
      nextWeightKg: prescription.currentWeightKg,
      nextTargetRepsMin: prescription.targetRepsMin,
      nextTargetRepsMax: prescription.targetRepsMax,
      reasonEn: "No sets logged for this session.",
      reasonAr: "لم يتم تسجيل أي مجموعات في هذا التمرين.",
    };
  }

  const allSetsCompleted = completedSets.length >= prescription.targetSets;
  const allSetsHitTopReps = completedSets.every((s) => s.reps >= prescription.targetRepsMax);
  const anyHardMax = completedSets.some((s) => s.effort === "hard_max");
  const allEasyOrGood = completedSets.every((s) => s.effort === "easy" || s.effort === "good_form");

  // Condition 1: Hit top of rep range across all sets with clean form / easy effort -> ADVANCE
  if (allSetsCompleted && allSetsHitTopReps && allEasyOrGood) {
    const isBodyweight = prescription.equipmentType === "bodyweight" || prescription.currentWeightKg === 0;

    if (isBodyweight) {
      // Progress by increasing rep target
      return {
        shouldProgress: true,
        progressionType: "increase_reps",
        nextWeightKg: 0,
        nextTargetRepsMin: prescription.targetRepsMin + 1,
        nextTargetRepsMax: prescription.targetRepsMax + 2,
        reasonEn: `Completed all ${prescription.targetSets} sets at ${prescription.targetRepsMax} reps with excellent form! Next session target: ${prescription.targetRepsMax + 2} reps.`,
        reasonAr: `تم إنهاء جميع المجموعات بعدد ${prescription.targetRepsMax} تكرارات بأداء ممتاز! هدف التمرين القادم: ${prescription.targetRepsMax + 2} تكرارات.`,
        badgeLabel: "PROGRESSION READY 🎯 (ترقية التكرارات)",
      };
    }

    // Weight progression (+2.5 kg standard increment, resetting reps to min range)
    const nextWeight = prescription.currentWeightKg + 2.5;
    return {
      shouldProgress: true,
      progressionType: "increase_weight",
      nextWeightKg: Number(nextWeight.toFixed(1)),
      nextTargetRepsMin: prescription.targetRepsMin,
      nextTargetRepsMax: prescription.targetRepsMax,
      reasonEn: `Hit top of rep range (${prescription.targetSets}×${prescription.targetRepsMax}) with clean form! Automatic double progression unlocked: +2.5 kg next session.`,
      reasonAr: `حققت الحد الأقصى للتكرارات (${prescription.targetSets}×${prescription.targetRepsMax}) بأداء ممتاز! تم تطبيق الترقية التلقائية: +2.5 كجم في التمرين القادم.`,
      badgeLabel: "DOUBLE PROGRESSION UNLOCKED 🎯 (+2.5 kg)",
    };
  }

  // Condition 2: Completed all reps, but hit failure/hard effort on final set -> Consolidate
  if (allSetsCompleted && allSetsHitTopReps && anyHardMax) {
    return {
      shouldProgress: false,
      progressionType: "maintain_and_consolidate",
      nextWeightKg: prescription.currentWeightKg,
      nextTargetRepsMin: prescription.targetRepsMin,
      nextTargetRepsMax: prescription.targetRepsMax,
      reasonEn: `Completed prescribed reps, but reported high difficulty. Maintain ${prescription.currentWeightKg} kg next session until all sets feel like 'Good Form'.`,
      reasonAr: `أكملت التكرارات لكن بصعوبة قصوى. حافظ على وزن ${prescription.currentWeightKg} كجم حتى تؤدي جميع المجموعات بأداء سلس ومريح.`,
      badgeLabel: "CONSOLIDATE WEIGHT 🛡️ (تثبيت الوزن)",
    };
  }

  // Condition 3: Missed top reps on some sets -> Accumulate reps
  const lowestReps = Math.min(...completedSets.map((s) => s.reps));
  return {
    shouldProgress: false,
    progressionType: "maintain_and_consolidate",
    nextWeightKg: prescription.currentWeightKg,
    nextTargetRepsMin: prescription.targetRepsMin,
    nextTargetRepsMax: prescription.targetRepsMax,
    reasonEn: `Working through rep range (${lowestReps} to ${prescription.targetRepsMax} reps logged). Keep weight at ${prescription.currentWeightKg} kg and aim for +1 rep per set.`,
    reasonAr: `في مرحلة بناء التكرارات. استمر على نفس الوزن (${prescription.currentWeightKg} كجم) وحاول زيادة تكرار واحد في الجلسة القادمة.`,
  };
}
