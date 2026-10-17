"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { Globe, Dumbbell, Utensils, Compass, BarChart3, ShieldCheck } from "lucide-react";

export type NavTab = "wizard" | "planner" | "workout" | "adherence" | "dashboard";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { locale, toggleLocale, t } = useLanguage();

  const navItems = [
    { id: "planner" as NavTab, labelEn: "Meal Plan & Swaps", labelAr: "الوجبات والتبديل", icon: Utensils },
    { id: "workout" as NavTab, labelEn: "Workout Logger", labelAr: "تسجيل التمرين", icon: Dumbbell },
    { id: "adherence" as NavTab, labelEn: "Dining Out & Balance", labelAr: "الخروجات وتدارك الفائض", icon: Compass },
    { id: "dashboard" as NavTab, labelEn: "Progress & Streaks", labelAr: "التقدم والوزن الأسبوعي", icon: BarChart3 },
    { id: "wizard" as NavTab, labelEn: "Diagnostic Wizard", labelAr: "التقييم الذكي", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
            SF
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg tracking-tight flex items-center gap-2">
              <span>{locale === "ar" ? t.appName : "SimpleFit"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hidden sm:inline-block">
                سيمبل فيت
              </span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : ""}`} />
                <span>{locale === "ar" ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Language & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{locale === "ar" ? "English (LTR)" : "العربية (RTL)"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
