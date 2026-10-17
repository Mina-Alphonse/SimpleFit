"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { evaluateDoubleProgression, ExercisePrescription, LoggedSet, EffortRating } from "@simplefit/shared";
import {
  Dumbbell,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";

export function WorkoutLogger() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  // Dynamic Warm-up Sequence State
  const [warmupOpen, setWarmupOpen] = useState(false);
  const warmupSteps = [
    { nameEn: "Arm Circles & Chest Openers", nameAr: "دوائر الذراعين وفتح الصدر", duration: "60s" },
    { nameEn: "Band Pull-Aparts or Scapular Retractions", nameAr: "سحب استك المقاومة للكتف الخلفي", duration: "60s" },
    { nameEn: "Bodyweight Push-up hold & Hip Openers", nameAr: "إطالات ديناميكية وثبات ضغط خفيف", duration: "60s" },
    { nameEn: "Ramp-up Set 1: Empty Bar (or light DB) × 10 reps", nameAr: "مجموعة تسخين ١: بالبار الفاضي × ١٠ تكرارات", duration: "Reps" },
    { nameEn: "Ramp-up Set 2: 50% Working Weight × 5 reps", nameAr: "مجموعة تسخين ٢: ٥٠٪ من وزن التمرين × ٥ تكرارات", duration: "Reps" },
  ];

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(90);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  const startTimer = (secs: number) => {
    setTimerInitial(secs);
    setRestSeconds(secs);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setRestSeconds(timerInitial);
  };

  // Workout Exercise Prescription
  const prescription: ExercisePrescription = {
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    currentWeightKg: 40,
    equipmentType: "barbell",
  };

  // Logged sets state
  const [sets, setSets] = useState<LoggedSet[]>([
    { setNumber: 1, weightKg: 40, reps: 10, effort: "good_form" },
    { setNumber: 2, weightKg: 40, reps: 10, effort: "good_form" },
    { setNumber: 3, weightKg: 40, reps: 10, effort: "good_form" },
  ]);

  const [evaluation, setEvaluation] = useState(() =>
    evaluateDoubleProgression({ prescription, completedSets: sets })
  );

  const updateSet = (index: number, field: keyof LoggedSet, value: unknown) => {
    const updated = sets.map((s, idx) => (idx === index ? { ...s, [field]: value } : s));
    setSets(updated);
    setEvaluation(evaluateDoubleProgression({ prescription, completedSets: updated }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Warm-up Banner */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4" />
              <span>{isAr ? "اليوم الأول: دفع علوي (Upper Push)" : "Day 1: Upper Push Workout"}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isAr ? "بنش مستوي بالبار (Barbell Bench Press)" : "Barbell Bench Press"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr ? "الهدف المقرر: ٣ مجموعات × ٨-١٠ تكرارات @ ٤٠ كجم" : "Prescribed: 3 sets × 8–10 reps @ 40 kg"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWarmupOpen(!warmupOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>{isAr ? "بروتوكول الإحماء الإلزامي (5 دقائق)" : "5-Min Dynamic Warm-up"}</span>
          </button>
        </div>

        {/* Dynamic Warm-up Accordion */}
        {warmupOpen && (
          <div className="p-4 rounded-2xl bg-background border border-border/80 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? "تسلسل الإحماء الحركي وتفعيل المفاصل:" : "Dynamic Joint Mobility Sequence:"}</span>
            </h4>
            <div className="space-y-2">
              {warmupSteps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-none">
                  <span className="text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{isAr ? step.nameAr : step.nameEn}</span>
                  </span>
                  <span className="font-mono text-muted-foreground font-semibold">{step.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Sets Logger Table */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{isAr ? "تسجيل المجموعات وفحص الجهد (3-Tap Effort)" : "Set Logging & 3-Tap Effort Check"}</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {isAr ? "بدون جداول RPE معقدة للمبتدئين" : "No complex RPE tables"}
          </span>
        </div>

        {/* Sets List */}
        <div className="space-y-4">
          {sets.map((set, idx) => (
            <div
              key={set.setNumber}
              className="p-4 rounded-2xl bg-background border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center font-bold text-xs text-foreground">
                  S{set.setNumber}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={set.weightKg}
                      onChange={(e) => updateSet(idx, "weightKg", Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-border bg-card text-center font-bold text-xs"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">kg</span>
                  </div>
                  <span className="text-muted-foreground">×</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(idx, "reps", Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-border bg-card text-center font-bold text-xs"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">{isAr ? "تكرار" : "reps"}</span>
                  </div>
                </div>
              </div>

              {/* 3-Tap Effort Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {[
                  { id: "easy" as EffortRating, labelEn: "Easy", labelAr: "سهل" },
                  { id: "good_form" as EffortRating, labelEn: "Good Form ✓", labelAr: "أداء سليم ✓" },
                  { id: "hard_max" as EffortRating, labelEn: "Hard/Max", labelAr: "صعب / أقصى جهد" },
                ].map((eff) => {
                  const isSelected = set.effort === eff.id;
                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => {
                        updateSet(idx, "effort", eff.id);
                        startTimer(90); // Auto trigger rest timer on tap
                      }}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? eff.id === "good_form"
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : eff.id === "easy"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAr ? eff.labelAr : eff.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Double Progression Evaluation Card */}
        {evaluation.shouldProgress && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-black uppercase text-emerald-500 tracking-wider">
                {evaluation.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-foreground font-semibold leading-relaxed">
              {isAr ? evaluation.reasonAr : evaluation.reasonEn}
            </p>
            <div className="text-xs text-emerald-500 font-bold">
              {isAr ? `الوزن المستهدف للتمرين القادم: ${evaluation.nextWeightKg} كجم` : `Next Target Weight: ${evaluation.nextWeightKg} kg`}
            </div>
          </div>
        )}

        {!evaluation.shouldProgress && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed">
            {isAr ? evaluation.reasonAr : evaluation.reasonEn}
          </div>
        )}
      </div>

      {/* Floating Rest Countdown Timer */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${timerRunning ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase block">
              {isAr ? "مؤقت الراحة بين المجموعات" : "Inter-Set Rest Timer"}
            </span>
            <span className="text-2xl font-black font-mono text-foreground">
              {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startTimer(60)}
            className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted"
          >
            60s
          </button>
          <button
            type="button"
            onClick={() => startTimer(90)}
            className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted"
          >
            90s
          </button>
          <button
            type="button"
            onClick={() => startTimer(120)}
            className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted"
          >
            120s
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
