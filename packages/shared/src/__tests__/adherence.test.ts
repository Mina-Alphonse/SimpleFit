import { describe, it, expect } from "vitest";
import {
  calculateDiningOutBuffer,
  calculateSurplusReconciliation,
} from "../calculations/adherence";

describe("Phase 3: Real-Life Adherence Tools", () => {
  describe("Going Out Tonight Buffer Mode", () => {
    it("allocates an 800 kcal evening buffer while strictly protecting daily protein", () => {
      const bufferPlan = calculateDiningOutBuffer({
        targetCalories: 2200,
        dailyProteinG: 160,
        bufferKcal: 800,
        eventType: "egyptian_grill",
        biologicalSex: "male",
      });

      expect(bufferPlan.eveningBufferKcal).toBe(800);
      expect(bufferPlan.daytimeAllowanceKcal).toBe(1400);

      // At least 75% of protein consumed pre-dinner: 160 * 0.75 = 120g
      expect(bufferPlan.daytimeProteinTargetG).toBe(120);

      // Daytime carbs and fats are trimmed
      expect(bufferPlan.daytimeFatsAllowanceG).toBeGreaterThan(15);
      expect(bufferPlan.daytimeCarbsAllowanceG).toBeGreaterThan(20);

      // Egyptian grill cultural advice returned
      expect(bufferPlan.orderingTipsEn.length).toBeGreaterThan(0);
      expect(bufferPlan.orderingTipsEn[0]).toContain("Shish Tawook");
      expect(bufferPlan.orderingTipsAr[0]).toContain("شيش طاووق");
    });

    it("caps custom buffer requests within safe bounds (500 to 1,000 kcal)", () => {
      const excessiveBuffer = calculateDiningOutBuffer({
        targetCalories: 2400,
        dailyProteinG: 150,
        bufferKcal: 1800, // Excessive
        eventType: "seafood",
        biologicalSex: "male",
      });

      expect(excessiveBuffer.eveningBufferKcal).toBe(1000);
    });
  });

  describe("Over-Target Surplus Reconciliation Protocol", () => {
    it("smoothly amortizes an 800 kcal weekend surplus across remaining 4 days", () => {
      const plan = calculateSurplusReconciliation({
        targetCalories: 2200,
        consumedCalories: 3000, // +800 kcal surplus
        remainingDaysInWeek: 4,
        bmr: 1750,
        biologicalSex: "male",
      });

      expect(plan.netSurplusKcal).toBe(800);
      expect(plan.reconciliationDays).toBe(4);

      // 800 / 4 = 200 kcal/day adjustment
      expect(plan.dailyDeficitAdjustmentKcal).toBe(200);
      expect(plan.adjustedDailyTargetKcal).toBe(2000);

      // Extra 2,000 daily steps prescribed
      expect(plan.extraDailyStepsTarget).toBe(2000);

      // Calming, beginner-friendly water retention explanation included
      expect(plan.reassuranceMessageEn).toContain("water");
      expect(plan.reassuranceMessageAr).toContain("ماء");
    });

    it("caps daily deficit adjustment at 300 kcal/day to prevent hunger rebound and crash fasting", () => {
      const heavySurplusPlan = calculateSurplusReconciliation({
        targetCalories: 2200,
        consumedCalories: 3800, // +1600 kcal surplus
        remainingDaysInWeek: 3,
        bmr: 1600,
        biologicalSex: "male",
      });

      // Raw would be 1600 / 3 = 533 kcal/day, which is too severe. It MUST be capped at 300 kcal/day.
      expect(heavySurplusPlan.dailyDeficitAdjustmentKcal).toBe(300);
      expect(heavySurplusPlan.adjustedDailyTargetKcal).toBe(1900);
      expect(heavySurplusPlan.adjustedDailyTargetKcal).toBeGreaterThanOrEqual(1600); // Above BMR
    });

    it("never allows adjusted calories to drop below the BMR floor", () => {
      const bmrFloorPlan = calculateSurplusReconciliation({
        targetCalories: 1800,
        consumedCalories: 2400,
        remainingDaysInWeek: 4,
        bmr: 1700, // BMR is 1700
        biologicalSex: "male",
      });

      // Target (1800) - Adjustment cannot breach BMR (1700)
      expect(bmrFloorPlan.adjustedDailyTargetKcal).toBeGreaterThanOrEqual(1700);
    });

    it("returns zero adjustment for negligible surplus (<= 100 kcal)", () => {
      const tinySurplus = calculateSurplusReconciliation({
        targetCalories: 2000,
        consumedCalories: 2050,
        remainingDaysInWeek: 5,
        bmr: 1600,
        biologicalSex: "female",
      });

      expect(tinySurplus.dailyDeficitAdjustmentKcal).toBe(0);
      expect(tinySurplus.adjustedDailyTargetKcal).toBe(2000);
      expect(tinySurplus.extraDailyStepsTarget).toBe(0);
    });
  });
});
