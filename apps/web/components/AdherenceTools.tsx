"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import {
  calculateDiningOutBuffer,
  calculateSurplusReconciliation,
  DiningOutEventType,
} from "@masrfit/shared";
import {
  Compass,
  Utensils,
  Footprints,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Sliders,
} from "lucide-react";

export function AdherenceTools() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [activeSubTab, setActiveSubTab] = useState<"buffer" | "reconciliation">("buffer");

  // Buffer Mode State
  const [eventType, setEventType] = useState<DiningOutEventType>("egyptian_grill");
  const [bufferKcal, setBufferKcal] = useState(800);
  const targetCalories = 2200;
  const dailyProteinG = 160;

  const bufferPlan = calculateDiningOutBuffer({
    targetCalories,
    dailyProteinG,
    bufferKcal,
    eventType,
    biologicalSex: "male",
  });

  // Reconciliation State
  const [consumedToday, setConsumedToday] = useState(3000);
  const [remainingDays, setRemainingDays] = useState(4);

  const reconciliationPlan = calculateSurplusReconciliation({
    targetCalories,
    consumedCalories: consumedToday,
    remainingDaysInWeek: remainingDays,
    bmr: 1750,
    biologicalSex: "male",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Sub Tabs Switcher */}
      <div className="bg-card border border-border p-2 rounded-2xl shadow-xs flex gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("buffer")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "buffer"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{isAr ? "وضع الخروجات (Going Out Buffer)" : "Going Out Tonight Buffer"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("reconciliation")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "reconciliation"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>{isAr ? "تدارك الفائض واللخبطة (Reconciliation)" : "Over-Target Reconciliation"}</span>
        </button>
      </div>

      {/* 1. GOING OUT TONIGHT BUFFER MODE */}
      {activeSubTab === "buffer" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" />
                <span>{isAr ? "نظام العشاء المرن بدون حرمان" : "Flexible Evening Buffer Mode"}</span>
              </div>
              <h3 className="text-xl font-bold">
                {isAr ? "خارج الليلة؟ نوفر لك رصيداً كافياً لوجبة العشاء" : "Going out tonight? We buffer your calories."}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "نقوم بخصم الكارب والدهون من وجبات النهار مع حماية احتياج البروتين كاملاً لتستمتع بالخروجة براحة ضمير."
                  : "We trim daytime carbs/fats while strictly protecting your protein, creating a worry-free evening cushion."}
              </p>
            </div>

            {/* Event Type Selector */}
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-2">
                {isAr ? "نوع الخروجة أو المطعم:" : "Select Dining Out Event:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "egyptian_grill" as DiningOutEventType, labelEn: "Egyptian Grill (مشويات)", labelAr: "مشويات وكفتة حاتي" },
                  { id: "seafood" as DiningOutEventType, labelEn: "Seafood (أسماك)", labelAr: "أسماك وبحريات سنجاري" },
                  { id: "fast_food" as DiningOutEventType, labelEn: "Fast Food (شاورما وبرجر)", labelAr: "برجر وشاورما سريعة" },
                  { id: "italian_pizza_pasta" as DiningOutEventType, labelEn: "Italian (بيتزا وباستا)", labelAr: "بيتزا وباستا إيطالي" },
                  { id: "oriental_cafe_dessert" as DiningOutEventType, labelEn: "Oriental Cafe (حلويات وقهاوي)", labelAr: "حلويات شرقية وقهاوي" },
                ].map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setEventType(ev.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                      eventType === ev.id
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {isAr ? ev.labelAr : ev.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Buffer Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-muted-foreground">
                  {isAr ? "حجم رصيد العشاء المستقطع:" : "Evening Buffer Size:"}
                </label>
                <span className="text-sm font-black text-primary font-mono">{bufferKcal} kcal</span>
              </div>
              <input
                type="range"
                min={500}
                max={1000}
                step={50}
                value={bufferKcal}
                onChange={(e) => setBufferKcal(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Calculated Daytime Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {isAr ? "المسموح نهاراً قبل العشاء:" : "Daytime Calories Allowed:"}
                </span>
                <span className="text-2xl font-black text-foreground mt-1 block">
                  {bufferPlan.daytimeAllowanceKcal} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[11px] font-semibold text-primary block">
                  {isAr ? "بروتين النهار المحمي (٧٥٪):" : "Daytime Protected Protein:"}
                </span>
                <span className="text-2xl font-black text-primary mt-1 block">
                  {bufferPlan.daytimeProteinTargetG}g
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {isAr ? "رصيد وجبة العشاء:" : "Evening Dinner Buffer:"}
                </span>
                <span className="text-2xl font-black text-emerald-500 mt-1 block">
                  {bufferPlan.eveningBufferKcal} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </span>
              </div>
            </div>

            {/* Cultural Ordering Tips */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{isAr ? "نصائح ذكية للطلب من المنيو المصري:" : "Egyptian Menu Ordering Hacks:"}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {(isAr ? bufferPlan.orderingTipsAr : bufferPlan.orderingTipsEn).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. OVER-TARGET RECONCILIATION PROTOCOL */}
      {activeSubTab === "reconciliation" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
                <Footprints className="w-4 h-4" />
                <span>{isAr ? "بروتوكول تدارك الفائض بدون تجويع" : "Surplus Reconciliation Protocol"}</span>
              </div>
              <h3 className="text-xl font-bold">
                {isAr ? "أكلت زيادة اليوم؟ لا داعي للقلق أو جلد الذات!" : "Logged a surplus? Never crash fast."}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "نقوم بتوزيع السعرات الزائدة بسلاسة على باقي أيام الأسبوع مع زيادة هادئة في الخطوات لحرقها بدون أي حرمان."
                  : "We smoothly amortize the excess over your remaining days with a +2,000 steps boost. No starvation."}
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  {isAr ? "إجمالي السعرات التي أكلتها اليوم:" : "Consumed Calories Today:"}
                </label>
                <input
                  type="number"
                  value={consumedToday}
                  onChange={(e) => setConsumedToday(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  {isAr ? `هدفك الطبيعي: ${targetCalories} سعرة` : `Baseline target: ${targetCalories} kcal`}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  {isAr ? "الأيام المتبقية في أسبوعك:" : "Remaining Days in Week:"}
                </label>
                <select
                  value={remainingDays}
                  onChange={(e) => setRemainingDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold"
                >
                  <option value={3}>{isAr ? "٣ أيام" : "3 Days"}</option>
                  <option value={4}>{isAr ? "٤ أيام" : "4 Days"}</option>
                  <option value={5}>{isAr ? "٥ أيام" : "5 Days"}</option>
                  <option value={6}>{isAr ? "٦ أيام" : "6 Days"}</option>
                </select>
              </div>
            </div>

            {/* Reconciliation Plan Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    {isAr ? "صافي الفائض المحسوب" : "Net Surplus"}
                  </span>
                  <div className="text-2xl font-black text-amber-500 mt-0.5">
                    +{reconciliationPlan.netSurplusKcal} kcal
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    {isAr ? "الخصم اليومي الآمن" : "Daily Safe Adjustment"}
                  </span>
                  <div className="text-2xl font-black text-foreground mt-0.5">
                    -{reconciliationPlan.dailyDeficitAdjustmentKcal} kcal/day
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground">
                <Footprints className="w-5 h-5 text-primary shrink-0" />
                <span>
                  {isAr
                    ? `إضافة +${reconciliationPlan.extraDailyStepsTarget.toLocaleString()} خطوة يومياً (تحرق ~١٠٠ سعرة دون زيادة الجوع).`
                    : `Target +${reconciliationPlan.extraDailyStepsTarget.toLocaleString()} extra daily steps to burn ~100 kcal gently.`}
                </span>
              </div>

              {/* Reassurance Note */}
              <p className="text-xs text-foreground/90 leading-relaxed italic bg-card/60 p-4 rounded-xl border border-border/80">
                "{isAr ? reconciliationPlan.reassuranceMessageAr : reconciliationPlan.reassuranceMessageEn}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
