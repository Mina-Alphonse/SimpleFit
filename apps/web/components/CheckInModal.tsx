"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import {
  evaluateCheckIn,
  CheckInEvaluationResult,
  PlanCadence,
} from "@simplefit/shared";
import {
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: (newCalories: number) => void;
}

export function CheckInModal({ isOpen, onClose, onPlanUpdated }: CheckInModalProps) {
  const { locale, dir } = useLanguage();
  const { profile, setProfile } = useAuth();
  const isAr = locale === "ar";

  // Check-in Form State - automatically bound to user's profile
  const [cadence, setCadence] = useState<PlanCadence>(
    (profile?.planCadence as PlanCadence) || "weekly"
  );
  const [currentWeight, setCurrentWeight] = useState(
    Number(profile?.currentWeightKg) || 83.5
  );
  const [previousWeight, setPreviousWeight] = useState(
    Number(profile?.currentWeightKg) || 84.5
  );
  const [targetCalories, setTargetCalories] = useState(
    profile?.targetCalories || 2050
  );
  const [adherenceScore, setAdherenceScore] = useState(85);
  const [energyRating, setEnergyRating] = useState<"low" | "normal" | "high">("normal");
  const [hungerRating, setHungerRating] = useState<"low" | "manageable" | "high">("manageable");
  const [notes, setNotes] = useState("");

  const [evaluation, setEvaluation] = useState<CheckInEvaluationResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.planCadence) setCadence(profile.planCadence as PlanCadence);
      if (profile.targetCalories) setTargetCalories(profile.targetCalories);
      if (profile.currentWeightKg) {
        setCurrentWeight(Number(profile.currentWeightKg));
        setPreviousWeight(Number(profile.currentWeightKg));
      }
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simplefit_dietary_pref");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.planCadence) setCadence(parsed.planCadence);
          if (parsed.targetCalories) setTargetCalories(parsed.targetCalories);
        } catch {}
      }
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const cycleDays = cadence === "monthly" ? 28 : cadence === "biweekly" ? 14 : 7;

  const handleEvaluate = () => {
    const result = evaluateCheckIn({
      currentWeightKg: currentWeight,
      previousWeightKg: previousWeight,
      cycleCadence: cadence,
      adherenceScore,
      energyRating,
      hungerRating,
      previousTargetCalories: targetCalories,
      notes,
    });
    setEvaluation(result);
  };

  const handleApplyAdjustment = () => {
    if (!evaluation) return;
    setTargetCalories(evaluation.newTargetCalories);

    if (profile) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              targetCalories: evaluation.newTargetCalories,
              currentWeightKg: String(currentWeight),
            }
          : null
      );
    }

    // Save updated calories to localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simplefit_dietary_pref");
      let parsed: any = {};
      try {
        if (saved) parsed = JSON.parse(saved);
      } catch {}
      parsed.targetCalories = evaluation.newTargetCalories;
      localStorage.setItem("simplefit_dietary_pref", JSON.stringify(parsed));
    }

    if (onPlanUpdated) {
      onPlanUpdated(evaluation.newTargetCalories);
    }
    setAppliedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border max-w-xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>
              {isAr
                ? `المراجعة الدورية المنتظمة (دورة الـ ${cycleDays} يوماً)`
                : `Periodic Progress Check-In (${cycleDays}-Day Cycle)`}
            </span>
          </div>
          <h2 className="text-xl font-black text-foreground">
            {isAr ? "تسجيل المراجعة الدورية وتعديل الخطة" : "Progress Check-In & Plan Calibration"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {isAr
              ? "يتم تقييم تغير الوزن ومعدل الالتزام تلقائياً، وتعديل السعرات والنشاط الحركي إذا لزم الأمر، أو تثبيت الخطة إذا كان النزول مثالياً."
              : "We evaluate weight change and adherence against your cycle to either calibrate calories or keep your plan on track."}
          </p>
        </div>

        {/* Cadence Indicator */}
        <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">
            {isAr ? "دورة المراجعة الحالية:" : "Active Cycle Cadence:"}
          </span>
          <span className="font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10">
            {cadence === "weekly" && (isAr ? "أسبوعي (كل ٧ أيام)" : "Weekly (Every 7 days)")}
            {cadence === "biweekly" && (isAr ? "أسبوعين (كل ١٤ يوماً)" : "Bi-Weekly (Every 14 days)")}
            {cadence === "monthly" && (isAr ? "شهري (كل ٢٨ يوماً)" : "Monthly (Every 28 days)")}
          </span>
        </div>

        {!evaluation ? (
          /* Check-in Input Form */
          <div className="space-y-5">
            {/* Weights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  {isAr ? "الوزن في بداية الدورة (كجم)" : "Starting Cycle Weight (kg)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={previousWeight}
                  onChange={(e) => setPreviousWeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  {isAr ? "الوزن الحالي اليوم (كجم)" : "Current Morning Weight (kg)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Adherence Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">
                  {isAr ? "نسبة الالتزام بالوجبات خلال الدورة" : "Meal Plan Adherence Rate"}
                </span>
                <span className="font-black text-primary font-mono">{adherenceScore}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={adherenceScore}
                onChange={(e) => setAdherenceScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Energy Level */}
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-2">
                {isAr ? "مستوى الطاقة والنشاط العام" : "Energy & Fatigue Level"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "low", labelEn: "Low / Fatigued", labelAr: "منخفض / مجهد" },
                  { id: "normal", labelEn: "Good / Balanced", labelAr: "جيد ومتوازن" },
                  { id: "high", labelEn: "High / Energized", labelAr: "طاقة عالية جداً" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEnergyRating(item.id as any)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center ${
                      energyRating === item.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Hunger Level */}
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-2">
                {isAr ? "مستوى الجوع والرغبة في الطعام" : "Hunger & Satiety"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "low", labelEn: "Low / Full", labelAr: "شبعان / لا أشعر بالجوع" },
                  { id: "manageable", labelEn: "Manageable", labelAr: "طبيعي ومحتمل" },
                  { id: "high", labelEn: "High / Craving", labelAr: "جوع شديد ومستمر" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHungerRating(item.id as any)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center ${
                      hungerRating === item.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleEvaluate}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "تحليل التقدم وتحديد تعديلات الخطة" : "Evaluate & Check Plan Calibration"}</span>
            </button>
          </div>
        ) : (
          /* Evaluation Results View */
          <div className="space-y-6">
            {/* Result Badge Card */}
            <div
              className={`p-5 rounded-2xl border ${
                evaluation.shouldModifyPlan
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              } space-y-3`}
            >
              <div className="flex items-center gap-2">
                {evaluation.shouldModifyPlan ? (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                <span className="font-bold text-sm text-foreground">
                  {evaluation.shouldModifyPlan
                    ? isAr
                      ? "تم التعديل: الخطة تتطلب معايرة محسوبة"
                      : "Plan Calibration Required"
                    : isAr
                    ? "الخطة مثالية: استمرار على نفس المسار بدون تعديل"
                    : "Plan Maintained: On Track!"}
                </span>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed">
                {isAr ? evaluation.summaryAr : evaluation.summaryEn}
              </p>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block">{isAr ? "تغير الوزن" : "Weight Delta"}</span>
                  <span className="font-bold text-foreground">
                    {evaluation.weightDeltaKg > 0 ? "+" : ""}
                    {evaluation.weightDeltaKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isAr ? "المعدل الأسبوعي" : "Weekly Rate"}</span>
                  <span className="font-bold text-foreground">{evaluation.weeklyRateKg} kg/wk</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isAr ? "السعرات الجديدة" : "New Target"}</span>
                  <span className="font-bold text-primary">{evaluation.newTargetCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {evaluation.shouldModifyPlan && !appliedSuccess && (
                <button
                  type="button"
                  onClick={handleApplyAdjustment}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isAr
                      ? `اعتماد وتطبيق الخطة المعدلة (${evaluation.newTargetCalories} سعرة)`
                      : `Apply Calibration (${evaluation.newTargetCalories} kcal)`}
                  </span>
                </button>
              )}

              {appliedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold text-center">
                  {isAr
                    ? "✓ تم حفظ وتحديث الخطة بنجاح في قاعدة البيانات وتحديث وجباتك!"
                    : "✓ Calibrated plan successfully applied & updated in database!"}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setEvaluation(null);
                  setAppliedSuccess(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
