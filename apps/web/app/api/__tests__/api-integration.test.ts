import { describe, it, expect, beforeAll } from "vitest";
import { GET as healthHandler } from "../health/route";
import { GET as foodSearchHandler } from "../foods/search/route";
import { POST as ingredientSwapHandler } from "../nutrition/swap/ingredient/route";
import { POST as exerciseSwapHandler } from "../workouts/swap/exercise/route";
import { POST as onboardingCalculateHandler } from "../onboarding/calculate/route";
import { POST as diningOutHandler } from "../adherence/dining-out/route";
import { POST as reconciliationHandler } from "../adherence/reconciliation/route";
import { POST as workoutLogHandler } from "../workouts/log/route";
import { signAccessToken, verifyToken } from "../../../lib/auth";
import { db, foods, exercises, sql } from "@masrfit/database";
import { NextRequest } from "next/server";

describe("Phase 4: Backend APIs, Auth & Security Layer Integration Tests", () => {
  let sampleFoodId1: string;
  let sampleFoodId2: string;
  let sampleExerciseId: string;

  beforeAll(async () => {
    // Retrieve seeded food and exercise IDs for test requests
    const foodList = await db.select({ id: foods.id, nameEn: foods.nameEn }).from(foods).limit(2);
    sampleFoodId1 = foodList[0]?.id;
    sampleFoodId2 = foodList[1]?.id;

    const exList = await db.select({ id: exercises.id }).from(exercises).limit(1);
    sampleExerciseId = exList[0]?.id;
  });

  describe("1. System Health Monitoring (/api/health)", () => {
    it("returns 200 with healthy database and redis status", async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.status).toBe("healthy");
      expect(json.services.database).toBe("healthy");
      expect(json.services.redis).toBe("healthy");
      expect(json.latencyMs.database).toBeGreaterThan(0);
      expect(json.latencyMs.redis).toBeGreaterThan(0);
    });
  });

  describe("2. Bilingual Food Search & Redis Caching (/api/foods/search)", () => {
    it("returns fuzzy search results for English food query", async () => {
      const req = new NextRequest("http://localhost:3000/api/foods/search?q=koshary&limit=5");
      const response = await foodSearchHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.count).toBeGreaterThan(0);
      expect(json.data[0].nameEn.toLowerCase()).toContain("koshary");
      expect(Array.isArray(json.data[0].householdPortions)).toBe(true);
    });

    it("returns fuzzy search results for Arabic food query with Cairo terms", async () => {
      const req = new NextRequest("http://localhost:3000/api/foods/search?q=فول&limit=5");
      const response = await foodSearchHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.count).toBeGreaterThan(0);
      expect(json.data[0].nameAr).toContain("فول");
    });
  });

  describe("3. 1-Click Ingredient Swap API (/api/nutrition/swap/ingredient)", () => {
    it("calculates exact ±5% macro-matched replacement grams", async () => {
      const req = new NextRequest("http://localhost:3000/api/nutrition/swap/ingredient", {
        method: "POST",
        body: JSON.stringify({
          sourceFoodId: sampleFoodId1,
          sourceGrams: 100,
          targetFoodId: sampleFoodId2,
        }),
      });

      const response = await ingredientSwapHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.replacementFood.grams).toBeGreaterThan(0);
      expect(json.macroDeltas).toBeDefined();
    });
  });

  describe("4. Biomechanical Exercise Swap API (/api/workouts/swap/exercise)", () => {
    it("returns biomechanically equivalent swaps with Equipment Busy mode", async () => {
      const req = new NextRequest("http://localhost:3000/api/workouts/swap/exercise", {
        method: "POST",
        body: JSON.stringify({
          currentExerciseId: sampleExerciseId,
          equipmentBusyMode: true,
          homeMode: false,
        }),
      });

      const response = await exerciseSwapHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.currentExercise).toBeDefined();
    });
  });

  describe("5. Diagnostic Onboarding Calculation API (/api/onboarding/calculate)", () => {
    it("validates diagnostic profile and returns guardrail-checked targets", async () => {
      const req = new NextRequest("http://localhost:3000/api/onboarding/calculate", {
        method: "POST",
        body: JSON.stringify({
          age: 28,
          biologicalSex: "male",
          heightCm: 180,
          weightKg: 85,
          activityLevel: "moderate",
          fitnessExperience: "beginner",
          trainingEnvironment: "gym",
          daysPerWeek: 4,
          sessionDurationMins: "45",
          caloricTier: "moderate_deficit",
          planCadence: "weekly",
          budgetTier: "standard",
          injuryFlags: [],
          allergies: [],
        }),
      });

      const response = await onboardingCalculateHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.diagnosticSummary.targetCalories).toBeGreaterThan(1500);
      expect(json.diagnosticSummary.macros.proteinG).toBeGreaterThan(100);
    });
  });

  describe("6. Real-Life Adherence APIs (/api/adherence/*)", () => {
    it("returns daytime trimmed allowance and Egyptian dining advice for Mashweyat", async () => {
      const req = new NextRequest("http://localhost:3000/api/adherence/dining-out", {
        method: "POST",
        body: JSON.stringify({
          targetCalories: 2200,
          dailyProteinG: 160,
          bufferKcal: 800,
          eventType: "egyptian_grill",
          biologicalSex: "male",
        }),
      });

      const response = await diningOutHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.plan.eveningBufferKcal).toBe(800);
      expect(json.plan.daytimeProteinTargetG).toBe(120);
      expect(json.plan.orderingTipsAr.length).toBeGreaterThan(0);
    });

    it("calculates guilt-free surplus reconciliation with +2,000 steps boost", async () => {
      const req = new NextRequest("http://localhost:3000/api/adherence/reconciliation", {
        method: "POST",
        body: JSON.stringify({
          targetCalories: 2200,
          consumedCalories: 3000,
          remainingDaysInWeek: 4,
          bmr: 1750,
          biologicalSex: "male",
        }),
      });

      const response = await reconciliationHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.reconciliationPlan.dailyDeficitAdjustmentKcal).toBe(200);
      expect(json.reconciliationPlan.extraDailyStepsTarget).toBe(2000);
      expect(json.reconciliationPlan.reassuranceMessageAr).toContain("ماء");
    });
  });

  describe("7. Workout Logger & Double Progression API (/api/workouts/log)", () => {
    it("evaluates double progression and awards progression badge", async () => {
      const req = new NextRequest("http://localhost:3000/api/workouts/log", {
        method: "POST",
        body: JSON.stringify({
          prescription: {
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 10,
            currentWeightKg: 50,
            equipmentType: "barbell",
          },
          completedSets: [
            { setNumber: 1, weightKg: 50, reps: 10, effort: "good_form" },
            { setNumber: 2, weightKg: 50, reps: 10, effort: "good_form" },
            { setNumber: 3, weightKg: 50, reps: 10, effort: "easy" },
          ],
        }),
      });

      const response = await workoutLogHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.progressionEvaluation.shouldProgress).toBe(true);
      expect(json.progressionEvaluation.nextWeightKg).toBe(52.5);
      expect(json.progressionEvaluation.badgeLabel).toContain("DOUBLE PROGRESSION UNLOCKED");
    });
  });

  describe("8. Security & JWT Token Rotation", () => {
    it("signs and verifies an OWASP-compliant JWT access token", async () => {
      const payload = {
        userId: "user-123-uuid",
        email: "cairo.athlete@masrfit.ai",
        role: "user",
      };

      const token = await signAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe("user-123-uuid");
      expect(verified?.email).toBe("cairo.athlete@masrfit.ai");
    });
  });
});
