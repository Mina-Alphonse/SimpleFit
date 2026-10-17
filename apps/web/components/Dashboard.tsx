"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import {
  TrendingDown,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Info,
  Footprints,
  Dumbbell,
} from "lucide-react";

export function Dashboard() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  // 7-day rolling weight data (demonstrating calm handling of water retention spikes)
  const weightLogs = [
    { day: "Sat", weight: 85.0, waterSpike: false },
    { day: "Sun", weight: 84.8, waterSpike: false },
    { day: "Mon", weight: 85.3, waterSpike: true, reason: "High sodium Egyptian feast / water retention" },
    { day: "Tue", weight: 84.6, waterSpike: false },
    { day: "Wed", weight: 84.4, waterSpike: false },
    { day: "Thu", weight: 84.2, waterSpike: false },
    { day: "Fri", weight: 84.1, waterSpike: false },
  ];

  const rollingAverage = (
    weightLogs.reduce((acc, curr) => acc + curr.weight, 0) / weightLogs.length
  ).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "متوسط الوزن الأسبوعي (7 أيام)" : "7-Day Rolling Weight"}</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {rollingAverage} <span className="text-xs font-normal text-muted-foreground">{isAr ? "كجم" : "kg"}</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <span>-0.9 kg {isAr ? "مقارنة بالأسبوع الماضي" : "vs last week"}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "سلسلة الالتزام الرياضي" : "Workout Streak"}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-foreground">
            4 <span className="text-xs font-normal text-muted-foreground">{isAr ? "أسابيع متتالية" : "weeks streak"}</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-semibold">
            100% {isAr ? "حضور التمارين المقررة" : "adherence on split"}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{isAr ? "متوسط الخطوات اليومية" : "Daily Step Average"}</span>
            <Footprints className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            8,650 <span className="text-xs font-normal text-muted-foreground">{isAr ? "خطوة" : "steps"}</span>
          </div>
          <div className="text-[11px] text-primary font-semibold">
            +1,200 {isAr ? "فوق الهدف الأساسي" : "above baseline"}
          </div>
        </div>
      </div>

      {/* 7-Day Rolling Morning Weight Chart Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <span>{isAr ? "منحنى الوزن الصباحي وتفسير احتباس الماء" : "7-Day Morning Weight Trend & Water Spikes"}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "لا تقلق من التذبذب اليومي! ارتفاع الوزن في يوم ما يعكس احتباس ماء وصوديوم طبيعي، ونعتمد دائماً على متوسط الـ 7 أيام."
              : "Daily spikes reflect water & glycogen retention. The 7-day rolling average reveals true fat loss."}
          </p>
        </div>

        {/* Visual Chart Bars */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-border/80">
          {weightLogs.map((log) => {
            const minW = 83.5;
            const maxW = 85.5;
            const percent = ((log.weight - minW) / (maxW - minW)) * 100;

            return (
              <div key={log.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold font-mono text-muted-foreground">
                  {log.weight}
                </span>

                <div
                  className={`w-full max-w-[40px] rounded-t-xl transition-all ${
                    log.waterSpike
                      ? "bg-amber-500/80 hover:bg-amber-500"
                      : "bg-primary/80 hover:bg-primary"
                  }`}
                  style={{ height: `${percent}%` }}
                />

                <span className="text-[11px] font-bold text-foreground">
                  {log.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanatory Callout */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block mb-0.5">
              {isAr ? "تفسير ذكي ليوم الإثنين (الارتفاع المؤقت):" : "Monday Spike Explained:"}
            </span>
            <span>
              {isAr
                ? "ارتفاع 0.5 كجم في يوم الإثنين نتج عن وجبة محشي غنية بالكربوهيدرات والصوديوم مساء الأحد. كل 1 جم كربوهيدرات يخزن معه 3-4 جم ماء في العضلات. بحلول يوم الأربعاء تخلص الجسم من الماء الزائد واستمر النزول الفعلي."
                : "The +0.5 kg bump on Monday was temporary glycogen/water retention following Sunday's dinner. By Wednesday, fluid cleared and true fat loss resumed."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
