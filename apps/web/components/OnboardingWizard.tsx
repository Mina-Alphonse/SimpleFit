"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
  BiologicalSex,
  ActivityLevel,
  FitnessExperience,
  TrainingEnvironment,
  CaloricTargetTier,
  PlanCadence,
  BudgetTier,
} from "@simplefit/shared";
import {
  User,
  Activity,
  Dumbbell,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function OnboardingWizard() {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";

  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    age: 26,
    biologicalSex: "male" as BiologicalSex,
    heightCm: 178,
    weightKg: 84,
    goalWeightKg: 78,
    activityLevel: "moderate" as ActivityLevel,
    fitnessExperience: "beginner" as FitnessExperience,
    trainingEnvironment: "gym" as TrainingEnvironment,
    daysPerWeek: 4,
    sessionDurationMins: "45",
    caloricTier: "moderate_deficit" as CaloricTargetTier,
    planCadence: "weekly" as PlanCadence,
    budgetTier: "standard" as BudgetTier,
    injuryFlags: [] as string[],
  });

  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute live diagnostic preview
  const bmr = calculateBMR({
    weightKg: formData.weightKg,
    heightCm: formData.heightCm,
    age: formData.age,
    biologicalSex: formData.biologicalSex,
  });

  const tdee = calculateTDEE({
    bmr,
    activityLevel: formData.activityLevel,
  });

  const targetCalc = calculateTargetCalories({
    bmr,
    tdee,
    caloricTier: formData.caloricTier,
    biologicalSex: formData.biologicalSex,
  });

  const macros = calculateMacroSplit({
    targetCalories: targetCalc.targetCalories,
    weightKg: formData.weightKg,
    goalWeightKg: formData.goalWeightKg,
    proteinRatioGPerKg: 2.0,
  });

  const handleGenerateAndSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            age: formData.age,
            biologicalSex: formData.biologicalSex,
            heightCm: formData.heightCm,
            weightKg: formData.weightKg,
            goalWeightKg: formData.goalWeightKg,
            activityLevel: formData.activityLevel,
            fitnessExperience: formData.fitnessExperience,
            trainingEnvironment: formData.trainingEnvironment,
            daysPerWeek: formData.daysPerWeek,
            sessionDurationMins: formData.sessionDurationMins,
            caloricTier: formData.caloricTier,
            planCadence: formData.planCadence,
            budgetTier: formData.budgetTier,
            injuryFlags: formData.injuryFlags,
            allergies: [],
          },
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
      setCompleted(true);
    }
  };

  const toggleInjury = (flag: string) => {
    setFormData((prev) => ({
      ...prev,
      injuryFlags: prev.injuryFlags.includes(flag)
        ? prev.injuryFlags.filter((f) => f !== flag)
        : [...prev.injuryFlags, flag],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Progress Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-muted-foreground">
          <span>{isAr ? `الخطوة ${step} من 4` : `Step ${step} of 4`}</span>
          <span className="text-primary font-semibold">
            {step === 1 && (isAr ? "البيانات الحيوية" : "Biological Profile")}
            {step === 2 && (isAr ? "مستوى النشاط والخطوات" : "Daily Movement & Steps")}
            {step === 3 && (isAr ? "البيئة والجدول التدريبي" : "Training Schedule & Gear")}
            {step === 4 && (isAr ? "هدف السعرات والميزانية" : "Caloric Goal & Cadence")}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Wizard Form Card */}
        <div className="lg:col-span-2 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          {/* STEP 1: Biological Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {isAr ? "البيانات الحيوية الأساسية" : "Biological Profile"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr
                    ? "نستخدم معادلة Mifflin-St Jeor الطبية لحساب احتياج جسمك بدقة علمية."
                    : "Used by Mifflin-St Jeor medical formula to compute metabolic needs."}
                </p>
              </div>

              {/* Sex Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  {isAr ? "النوع البيولوجي" : "Biological Sex"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, biologicalSex: "male" })}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      formData.biologicalSex === "male"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {isAr ? "ذكر 👨" : "Male 👨"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, biologicalSex: "female" })}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      formData.biologicalSex === "female"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {isAr ? "أنثى 👩" : "Female 👩"}
                  </button>
                </div>
              </div>

              {/* Age, Height, Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? "العمر" : "Age"}
                  </label>
                  <input
                    type="number"
                    min={14}
                    max={90}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? "الطول (سم)" : "Height (cm)"}
                  </label>
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? "الوزن الحالي (كجم)" : "Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    min={35}
                    max={250}
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  {isAr ? "الوزن المستهدف (كجم)" : "Goal Weight (kg)"}
                </label>
                <input
                  type="number"
                  min={35}
                  max={250}
                  value={formData.goalWeightKg}
                  onChange={(e) => setFormData({ ...formData, goalWeightKg: Number(e.target.value) })}
                  className="w-full sm:w-1/2 px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Activity Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {isAr ? "مستوى الحركة والنشاط اليومي" : "Daily Activity & Steps"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? "اختر النمط الأقرب ليومك الطبيعي والوظيفة:" : "Select your daily baseline job and movement:"}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "sedentary" as ActivityLevel,
                    titleEn: "Sedentary (Desk Job, <5k steps)",
                    titleAr: "خامل (عمل مكتبي، أقل من 5000 خطوة)",
                    descEn: "Little to no formal exercise, sitting most of day",
                    descAr: "جلوس معظم اليوم بدون مجهود بدني يذكر",
                  },
                  {
                    id: "light" as ActivityLevel,
                    titleEn: "Lightly Active (5k–7.5k steps)",
                    titleAr: "نشاط خفيف (5000 - 7500 خطوة)",
                    descEn: "Some walking, light daily movement",
                    descAr: "حركة خفيفة أثناء اليوم ومشي خفيف",
                  },
                  {
                    id: "moderate" as ActivityLevel,
                    titleEn: "Moderately Active (7.5k–10k steps)",
                    titleAr: "نشاط متوسط (7500 - 10000 خطوة)",
                    descEn: "On your feet often or train 3-4 days a week",
                    descAr: "وقوف أو مشي متكرر، وتمرين ٣-٤ أيام أسبوعياً",
                  },
                  {
                    id: "very_active" as ActivityLevel,
                    titleEn: "Very Active (10k–12.5k steps)",
                    titleAr: "نشاط عالي جداً (أكثر من 10000 خطوة)",
                    descEn: "Heavy physical job or intense daily training",
                    descAr: "عمل شاق حركياً أو تمرين يومي مكثف",
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: tier.id })}
                    className={`w-full text-start p-4 rounded-2xl border transition-all ${
                      formData.activityLevel === tier.id
                        ? "bg-primary/10 border-primary shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-bold text-sm text-foreground">
                      {isAr ? tier.titleAr : tier.titleEn}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? tier.descAr : tier.descEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Training Environment & Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  {isAr ? "البيئة والجدول التدريبي" : "Training Schedule & Gear"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? "نصمم لك الجدول المناسب لمعداتك ووقتك بدون تعقيد:" : "Tailored without jargon to your gear and time:"}
                </p>
              </div>

              {/* Training Environment */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  {isAr ? "مكان التمرين والمعدات" : "Training Environment"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "gym" as TrainingEnvironment, labelEn: "Gym (Full Gear)", labelAr: "الجيم (أجهزة وأوزان)" },
                    { id: "home_dumbbells" as TrainingEnvironment, labelEn: "Home Dumbbells", labelAr: "المنزل (دمبلز وحبال)" },
                    { id: "bodyweight" as TrainingEnvironment, labelEn: "Bodyweight Only", labelAr: "وزن الجسم فقط" },
                  ].map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingEnvironment: env.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.trainingEnvironment === env.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {isAr ? env.labelAr : env.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Per Week & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-2">
                    {isAr ? "أيام التمرين أسبوعياً" : "Weekly Training Days"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 4, 5].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFormData({ ...formData, daysPerWeek: days })}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          formData.daysPerWeek === days
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {isAr ? `${days} أيام` : `${days} Days`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-2">
                    {isAr ? "مدة الحصة التدريبية" : "Session Duration"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["30", "45", "60"].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormData({ ...formData, sessionDurationMins: mins as "30" | "45" | "60" })}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          formData.sessionDurationMins === mins
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {isAr ? `${mins} دقيقة` : `${mins} mins`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Injury Flags */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  {isAr ? "ملاحظات الإصابات أو الحساسية (فلترة تلقائية للتمارين الخطرة)" : "Injury Flags (Auto-filters high-risk exercises)"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "knee_pain", labelEn: "Knee Sensitivity", labelAr: "خشونة أو حساسية الركبة" },
                    { id: "lower_back", labelEn: "Lower Back Pain", labelAr: "آلام أسفل الظهر" },
                    { id: "shoulder_impingement", labelEn: "Shoulder Impingement", labelAr: "التهاب أوتار الكتف" },
                  ].map((injury) => {
                    const isSelected = formData.injuryFlags.includes(injury.id);
                    return (
                      <button
                        key={injury.id}
                        type="button"
                        onClick={() => toggleInjury(injury.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {isAr ? injury.labelAr : injury.labelEn} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Caloric Deficit & Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  {isAr ? "هدف السعرات ودورة الخطة والميزانية" : "Caloric Goal & Cadence"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? "اختر نسق النزول أو الصعود الآمن:" : "Select your safe surplus/deficit tier:"}
                </p>
              </div>

              {/* Target Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "gentle_deficit" as CaloricTargetTier, titleEn: "Gentle (-200 kcal)", titleAr: "نزول هادئ (-200)" },
                  { id: "moderate_deficit" as CaloricTargetTier, titleEn: "Moderate (-300 kcal)", titleAr: "نزول متوازن (-300)" },
                  { id: "standard_deficit" as CaloricTargetTier, titleEn: "Standard (-500 kcal)", titleAr: "نزول كلاسيكي (-500)" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, caloricTier: tier.id })}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      formData.caloricTier === tier.id
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "border-border hover:bg-muted/50 text-xs font-semibold"
                    }`}
                  >
                    {isAr ? tier.titleAr : tier.titleEn}
                  </button>
                ))}
              </div>

              {/* Plan Cadence */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  {isAr ? "دورة الخطة وقائمة المشتريات التلقائية" : "Plan Cadence & Grocery Frequency"}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "weekly" as PlanCadence, labelEn: "Weekly (7-day)", labelAr: "أسبوعي (٧ أيام)" },
                    { id: "biweekly" as PlanCadence, labelEn: "Bi-Weekly (14-day)", labelAr: "أسبوعين (١٤ يوم)" },
                    { id: "monthly" as PlanCadence, labelEn: "Monthly (28-day)", labelAr: "شهري (٢٨ يوم)" },
                  ].map((cad) => (
                    <button
                      key={cad.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, planCadence: cad.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.planCadence === cad.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {isAr ? cad.labelAr : cad.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  {isAr ? "فئة الميزانية والخيارات الغذائية" : "Budget Tier"}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "economy" as BudgetTier, labelEn: "Economy (Ful, Eggs, Quraish)", labelAr: "اقتصادي (فول، بيض، قريش)" },
                    { id: "standard" as BudgetTier, labelEn: "Standard (Chicken, Fish)", labelAr: "متوسط (فراخ، سمك بلطي)" },
                    { id: "flexible" as BudgetTier, labelEn: "Flexible (Meat, Seafood)", labelAr: "مرن (لحوم ومأكولات بحرية)" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, budgetTier: b.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.budgetTier === b.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {isAr ? b.labelAr : b.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold"
              >
                {dir === "rtl" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? "السابق" : "Previous"}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-xs"
              >
                <span>{isAr ? "التالي" : "Next"}</span>
                {dir === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleGenerateAndSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-md shadow-primary/20 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSaving
                    ? isAr
                      ? "جاري الحفظ والاعتماد..."
                      : "Saving Plan..."
                    : isAr
                    ? "اعتماد وحفظ الخطة الآن"
                    : "Generate & Save Plan"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="bg-gradient-to-b from-card to-card/60 border border-border p-6 rounded-3xl shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "حسابات المحرك الكمي الفورية" : "Live Engine Preview"}</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {isAr ? "معدل الحرق الأساسي (BMR)" : "Basal Metabolic Rate"}
                </span>
                <div className="text-2xl font-black mt-1 text-foreground">
                  {bmr} <span className="text-xs font-normal text-muted-foreground">{isAr ? "سعرة" : "kcal"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {isAr ? "احتياج المحافظة (TDEE)" : "Maintenance (TDEE)"}
                </span>
                <div className="text-2xl font-black mt-1 text-foreground">
                  {tdee} <span className="text-xs font-normal text-muted-foreground">{isAr ? "سعرة" : "kcal"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
                <span className="text-[11px] font-bold text-primary uppercase">
                  {isAr ? "السعرات المستهدفة المحسوبة" : "Target Prescribed Calories"}
                </span>
                <div className="text-3xl font-black mt-1 text-primary">
                  {targetCalc.targetCalories} <span className="text-xs font-normal text-muted-foreground">{isAr ? "سعرة/يوم" : "kcal/day"}</span>
                </div>
              </div>

              {/* Guardrail Alert */}
              {targetCalc.guardrailApplied && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{targetCalc.note}</span>
                </div>
              )}

              {/* Macro Split */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
                <div className="font-bold mb-2 text-foreground">
                  {isAr ? "توزيع المغذيات الدقيقة (Macros):" : "Macronutrient Distribution:"}
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{isAr ? "بروتين (2 جم/كجم):" : "Protein (2g/kg):"}</span>
                  <span className="font-bold text-primary">{macros.proteinGrams}g</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{isAr ? "كربوهيدرات:" : "Carbs:"}</span>
                  <span className="font-bold text-foreground">{macros.carbsGrams}g</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">{isAr ? "دهون صحية:" : "Fats (25%):"}</span>
                  <span className="font-bold text-foreground">{macros.fatsGrams}g</span>
                </div>
              </div>
            </div>
          </div>

          {completed && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                {savedSuccess
                  ? isAr
                    ? "تم حفظ واعتماد خطتك بنجاح في قاعدة البيانات وتفعيلها بالجدول!"
                    : "Plan successfully saved to database & activated in your meal planner!"
                  : isAr
                  ? "تم اعتماد خطتك وتفعيلها بنجاح في جدول الوجبات والتمارين!"
                  : "Plan successfully initialized! Access meals and workout logger in the tabs above."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
