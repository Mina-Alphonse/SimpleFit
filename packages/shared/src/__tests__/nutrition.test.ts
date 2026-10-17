import { describe, it, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
  CLINICAL_MIN_CALORIES,
} from "../calculations/nutrition";

describe("Phase 3: Quantitative Nutrition Engine & Guardrails", () => {
  describe("Mifflin-St Jeor BMR Calculation", () => {
    it("calculates BMR accurately for standard male", () => {
      // 10 * 80 + 6.25 * 180 - 5 * 25 + 5 = 800 + 1125 - 125 + 5 = 1805
      const bmr = calculateBMR({
        weightKg: 80,
        heightCm: 180,
        age: 25,
        biologicalSex: "male",
      });
      expect(bmr).toBe(1805);
    });

    it("calculates BMR accurately for standard female", () => {
      // 10 * 65 + 6.25 * 165 - 5 * 30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25 -> 1370
      const bmr = calculateBMR({
        weightKg: 65,
        heightCm: 165,
        age: 30,
        biologicalSex: "female",
      });
      expect(bmr).toBe(1370);
    });

    it("throws error for non-positive inputs", () => {
      expect(() =>
        calculateBMR({ weightKg: -5, heightCm: 170, age: 25, biologicalSex: "male" })
      ).toThrow();
    });
  });

  describe("TDEE Calculation", () => {
    it("calculates TDEE across different activity multipliers", () => {
      const bmr = 1800;
      expect(calculateTDEE({ bmr, activityLevel: "sedentary" })).toBe(Math.round(1800 * 1.2));
      expect(calculateTDEE({ bmr, activityLevel: "light" })).toBe(Math.round(1800 * 1.375));
      expect(calculateTDEE({ bmr, activityLevel: "moderate" })).toBe(Math.round(1800 * 1.55));
      expect(calculateTDEE({ bmr, activityLevel: "very_active" })).toBe(Math.round(1800 * 1.725));
      expect(calculateTDEE({ bmr, activityLevel: "extra_active" })).toBe(Math.round(1800 * 1.9));
    });
  });

  describe("Target Calories & Safety Guardrails", () => {
    it("applies standard deficit without guardrails when within safe parameters", () => {
      // BMR 1800, TDEE 2790, Deficit -500 -> 2290 (> BMR 1800 and > floor 1500)
      const res = calculateTargetCalories({
        bmr: 1800,
        tdee: 2790,
        caloricTier: "standard_deficit",
        biologicalSex: "male",
      });
      expect(res.targetCalories).toBe(2290);
      expect(res.guardrailApplied).toBe(false);
    });

    it("enforces Clinical Floor Guardrail (female 1,200 kcal floor)", () => {
      // Female with low TDEE: 1400 kcal, choosing -500 deficit -> raw 900 -> capped at 1200
      const res = calculateTargetCalories({
        bmr: 1100,
        tdee: 1400,
        caloricTier: "standard_deficit",
        biologicalSex: "female",
      });
      expect(res.targetCalories).toBe(CLINICAL_MIN_CALORIES.female);
      expect(res.guardrailApplied).toBe(true);
      expect(res.guardrailReason).toBe("clinical_floor");
      expect(res.note).toContain("clinical safe floor");
    });

    it("enforces BMR Floor Guardrail for aggressive deficit to protect metabolic rate", () => {
      // Male with BMR 1850, TDEE 2200 (sedentary), choosing -500 -> raw 1700 (< BMR 1850) -> capped at 1850
      const res = calculateTargetCalories({
        bmr: 1850,
        tdee: 2200,
        caloricTier: "standard_deficit",
        biologicalSex: "male",
      });
      expect(res.targetCalories).toBe(1850);
      expect(res.guardrailApplied).toBe(true);
      expect(res.guardrailReason).toBe("bmr_floor");
      expect(res.note).toContain("Basal Metabolic Rate");
    });
  });

  describe("Macro Split Allocation", () => {
    it("allocates optimal protein, 25% fats, and remainder carbs", () => {
      const macros = calculateMacroSplit({
        targetCalories: 2000,
        weightKg: 75,
        proteinRatioGPerKg: 2.0,
      });

      // Protein: 75 * 2.0 = 150g -> 600 kcal
      expect(macros.proteinGrams).toBe(150);

      // Fats: 25% of 2000 = 500 kcal / 9 = 56g
      expect(macros.fatsGrams).toBe(56);

      // Carbs: 2000 - 600 - 504 = 896 kcal / 4 = 224g
      expect(macros.carbsGrams).toBeGreaterThan(200);
      expect(macros.calories).toBe(2000);
    });

    it("uses adjusted body weight for overweight individuals to prevent excessive protein targets", () => {
      // 120kg beginner with goal weight of 80kg
      const macros = calculateMacroSplit({
        targetCalories: 2200,
        weightKg: 120,
        goalWeightKg: 80,
        proteinRatioGPerKg: 2.0,
      });

      // Adjusted weight = 80 + (120 - 80) * 0.25 = 90kg
      // Protein target = 90 * 2.0 = 180g (instead of 240g for 120kg)
      expect(macros.proteinGrams).toBe(180);
      expect(macros.proteinGrams).toBeLessThan(240);
    });
  });
});
