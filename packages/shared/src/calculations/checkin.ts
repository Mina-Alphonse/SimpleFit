import { CheckInSubmission, CheckInEvaluationResult, PlanCadence } from "../types";

/**
 * Intelligent Check-in Cycle Evaluator
 * Evaluates user progress across their weekly, bi-weekly, or monthly cycle
 * and deterministically decides if caloric/activity targets need modification or maintenance.
 */
export function evaluateCheckIn(params: CheckInSubmission): CheckInEvaluationResult {
  const {
    currentWeightKg,
    previousWeightKg,
    cycleCadence,
    adherenceScore,
    energyRating,
    hungerRating,
    previousTargetCalories,
  } = params;

  // Determine cycle duration in days
  const cycleDays = cycleCadence === "monthly" ? 28 : cycleCadence === "biweekly" ? 14 : 7;
  const weeks = cycleDays / 7;

  const weightDeltaKg = Number((currentWeightKg - previousWeightKg).toFixed(2));
  const weeklyRateKg = Number((weightDeltaKg / weeks).toFixed(2));

  let status: CheckInEvaluationResult["status"] = "maintain";
  let calorieAdjustment = 0;
  let suggestedStepDelta = 0;
  let shouldModifyPlan = false;
  let summaryEn = "";
  let summaryAr = "";

  // 1. Check for weight loss stalling with high adherence
  if (weeklyRateKg > -0.15 && adherenceScore >= 75) {
    status = "adjust_deficit";
    calorieAdjustment = -120;
    suggestedStepDelta = 1500;
    shouldModifyPlan = true;
    summaryEn = `Weight change (${weightDeltaKg > 0 ? "+" : ""}${weightDeltaKg} kg over ${cycleDays} days) indicates a plateau despite good adherence (${adherenceScore}%). Caloric intake is trimmed by -120 kcal/day and daily steps are boosted by +1,500 to break the plateau safely.`;
    summaryAr = `معدل تغير الوزن (${weightDeltaKg > 0 ? "+" : ""}${weightDeltaKg} كجم خلال ${cycleDays} يوماً) يشير إلى ثبات رغم التزامك الجيد (${adherenceScore}٪). تم خفض السعرات بمقدار -120 سعرة/يوم وزيادة النشاط بـ +1500 خطوة يومياً لكسر الثبات بأمان.`;
  }
  // 2. Check for rapid weight loss / metabolic fatigue
  else if (weeklyRateKg < -1.1 || (weeklyRateKg < -0.8 && hungerRating === "high" && energyRating === "low")) {
    status = "increase_calories";
    calorieAdjustment = 150;
    shouldModifyPlan = true;
    summaryEn = `Weight loss is proceeding too rapidly (${Math.abs(weeklyRateKg)} kg/week), risking muscle loss and energy crashes. Adding +150 kcal/day to protect lean mass and restore energy.`;
    summaryAr = `نزول الوزن سريع جداً (${Math.abs(weeklyRateKg)} كجم/أسبوع)، مما يعرض الكتلة العضلية للهدم والجهد. تم رفع السعرات بمقدار +150 سعرة/يوم لحماية العضلات واستعادة النشاط.`;
  }
  // 3. Low adherence check: coach consistency rather than cutting calories
  else if (adherenceScore < 60) {
    status = "maintain";
    calorieAdjustment = 0;
    shouldModifyPlan = false;
    summaryEn = `Adherence was lower than prescribed (${adherenceScore}%). Rather than cutting calories further, maintain current targets and focus on following scheduled meals.`;
    summaryAr = `نسبة الالتزام كانت منخفضة (${adherenceScore}٪). بدلاً من تقليل السعرات، سنبقي على الخطة الحالية كما هي مع التركيز على الالتزام بوجبات الأسبوع القادم.`;
  }
  // 4. Optimal progress: maintain current plan!
  else {
    status = "maintain";
    calorieAdjustment = 0;
    shouldModifyPlan = false;
    summaryEn = `Excellent progress! Your weekly rate of ${Math.abs(weeklyRateKg)} kg/week is within the optimal fat loss window. Maintaining current plan targets.`;
    summaryAr = `أداء رائع ومثالي! معدل نزولك (${Math.abs(weeklyRateKg)} كجم/أسبوع) في النطاق الصحي المستدام. خطتك مستمرة كما هي دون الحاجة لأي تعديل.`;
  }

  const newTargetCalories = Math.max(1200, previousTargetCalories + calorieAdjustment);

  return {
    status,
    weightDeltaKg,
    weeklyRateKg,
    newTargetCalories,
    calorieAdjustment,
    suggestedStepDelta,
    summaryEn,
    summaryAr,
    shouldModifyPlan,
    nextCheckInDays: cycleDays,
  };
}
