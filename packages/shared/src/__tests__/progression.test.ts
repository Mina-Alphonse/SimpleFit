import { describe, it, expect } from "vitest";
import { evaluateDoubleProgression, ExercisePrescription, LoggedSet } from "../calculations/progression";

describe("Phase 3: Automated Double Progression Overload Engine", () => {
  const prescription: ExercisePrescription = {
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    currentWeightKg: 40,
    equipmentType: "barbell",
  };

  it("unlocks +2.5 kg Double Progression when all sets hit top reps with clean form", () => {
    const completedSets: LoggedSet[] = [
      { setNumber: 1, weightKg: 40, reps: 10, effort: "easy" },
      { setNumber: 2, weightKg: 40, reps: 10, effort: "good_form" },
      { setNumber: 3, weightKg: 40, reps: 10, effort: "good_form" },
    ];

    const result = evaluateDoubleProgression({ prescription, completedSets });

    expect(result.shouldProgress).toBe(true);
    expect(result.progressionType).toBe("increase_weight");
    expect(result.nextWeightKg).toBe(42.5);
    expect(result.nextTargetRepsMin).toBe(8);
    expect(result.nextTargetRepsMax).toBe(10);
    expect(result.badgeLabel).toContain("DOUBLE PROGRESSION UNLOCKED");
  });

  it("increases target reps for bodyweight movements when top reps are achieved", () => {
    const bwPrescription: ExercisePrescription = {
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      currentWeightKg: 0,
      equipmentType: "bodyweight",
    };

    const completedSets: LoggedSet[] = [
      { setNumber: 1, weightKg: 0, reps: 12, effort: "good_form" },
      { setNumber: 2, weightKg: 0, reps: 12, effort: "good_form" },
      { setNumber: 3, weightKg: 0, reps: 12, effort: "good_form" },
    ];

    const result = evaluateDoubleProgression({ prescription: bwPrescription, completedSets });

    expect(result.shouldProgress).toBe(true);
    expect(result.progressionType).toBe("increase_reps");
    expect(result.nextTargetRepsMax).toBe(14);
    expect(result.badgeLabel).toContain("PROGRESSION READY");
  });

  it("recommends weight consolidation if reps were met but 'hard_max' effort was logged", () => {
    const completedSets: LoggedSet[] = [
      { setNumber: 1, weightKg: 40, reps: 10, effort: "good_form" },
      { setNumber: 2, weightKg: 40, reps: 10, effort: "good_form" },
      { setNumber: 3, weightKg: 40, reps: 10, effort: "hard_max" }, // Strained or compromised form
    ];

    const result = evaluateDoubleProgression({ prescription, completedSets });

    expect(result.shouldProgress).toBe(false);
    expect(result.progressionType).toBe("maintain_and_consolidate");
    expect(result.nextWeightKg).toBe(40);
    expect(result.badgeLabel).toContain("CONSOLIDATE WEIGHT");
    expect(result.reasonEn).toContain("reported high difficulty");
  });

  it("encourages rep accumulation when user has not yet reached the top of the rep range", () => {
    const completedSets: LoggedSet[] = [
      { setNumber: 1, weightKg: 40, reps: 10, effort: "good_form" },
      { setNumber: 2, weightKg: 40, reps: 9, effort: "good_form" },
      { setNumber: 3, weightKg: 40, reps: 8, effort: "good_form" },
    ];

    const result = evaluateDoubleProgression({ prescription, completedSets });

    expect(result.shouldProgress).toBe(false);
    expect(result.progressionType).toBe("maintain_and_consolidate");
    expect(result.nextWeightKg).toBe(40);
    expect(result.reasonEn).toContain("Working through rep range");
  });

  it("handles empty set logs gracefully", () => {
    const result = evaluateDoubleProgression({ prescription, completedSets: [] });
    expect(result.shouldProgress).toBe(false);
    expect(result.nextWeightKg).toBe(40);
  });
});
