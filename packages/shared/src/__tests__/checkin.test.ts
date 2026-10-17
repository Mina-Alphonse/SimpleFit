import { describe, it, expect } from "vitest";
import { evaluateCheckIn } from "../calculations/checkin";

describe("Check-in Cycle Evaluator & Plan Modification", () => {
  it("maintains current plan when weekly fat loss rate is optimal (-0.5 kg/week)", () => {
    const result = evaluateCheckIn({
      currentWeightKg: 83.5,
      previousWeightKg: 84.0,
      cycleCadence: "weekly",
      adherenceScore: 90,
      energyRating: "normal",
      hungerRating: "manageable",
      previousTargetCalories: 2200,
    });

    expect(result.status).toBe("maintain");
    expect(result.shouldModifyPlan).toBe(false);
    expect(result.calorieAdjustment).toBe(0);
    expect(result.newTargetCalories).toBe(2200);
    expect(result.nextCheckInDays).toBe(7);
    expect(result.summaryAr).toContain("أداء رائع ومثالي");
  });

  it("modifies plan when weight stalls despite high adherence (adjusts calories & steps)", () => {
    const result = evaluateCheckIn({
      currentWeightKg: 84.0,
      previousWeightKg: 84.0,
      cycleCadence: "biweekly",
      adherenceScore: 85,
      energyRating: "normal",
      hungerRating: "manageable",
      previousTargetCalories: 2200,
    });

    expect(result.status).toBe("adjust_deficit");
    expect(result.shouldModifyPlan).toBe(true);
    expect(result.calorieAdjustment).toBeLessThan(0);
    expect(result.newTargetCalories).toBe(2080); // 2200 - 120
    expect(result.suggestedStepDelta).toBe(1500);
    expect(result.nextCheckInDays).toBe(14);
    expect(result.summaryAr).toContain("كسر الثبات");
  });

  it("increases calories if user is losing weight too fast to protect lean muscle", () => {
    const result = evaluateCheckIn({
      currentWeightKg: 81.0,
      previousWeightKg: 84.0,
      cycleCadence: "biweekly", // -3 kg in 2 weeks = -1.5 kg/week
      adherenceScore: 95,
      energyRating: "low",
      hungerRating: "high",
      previousTargetCalories: 1800,
    });

    expect(result.status).toBe("increase_calories");
    expect(result.shouldModifyPlan).toBe(true);
    expect(result.calorieAdjustment).toBe(150);
    expect(result.newTargetCalories).toBe(1950);
    expect(result.summaryAr).toContain("لحماية العضلات");
  });

  it("advises consistency without cutting calories if adherence was low (<60%)", () => {
    const result = evaluateCheckIn({
      currentWeightKg: 84.2,
      previousWeightKg: 84.0,
      cycleCadence: "weekly",
      adherenceScore: 50,
      energyRating: "normal",
      hungerRating: "high",
      previousTargetCalories: 2200,
    });

    expect(result.status).toBe("maintain");
    expect(result.shouldModifyPlan).toBe(false);
    expect(result.calorieAdjustment).toBe(0);
    expect(result.newTargetCalories).toBe(2200);
    expect(result.summaryAr).toContain("التركيز على الالتزام");
  });
});
