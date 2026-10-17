"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import {
  Globe,
  Dumbbell,
  Utensils,
  Compass,
  BarChart3,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeContext";

import { Logo } from "./Logo";

export type NavTab = "home" | "wizard" | "planner" | "workout" | "adherence" | "dashboard";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenGroceryList?: () => void;
}

export function Header({ activeTab, setActiveTab, onOpenGroceryList }: HeaderProps) {
  const { locale, toggleLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout, openAuthModal } = useAuth();
  const isAr = locale === "ar";

  const navItems = [
    { id: "planner" as NavTab, labelEn: "Meal Plan & Swaps", labelAr: "الوجبات والتبديل", icon: Utensils },
    { id: "workout" as NavTab, labelEn: "Workout Plan & Logger", labelAr: "الخطة والتمارين", icon: Dumbbell },
    { id: "adherence" as NavTab, labelEn: "Dining Out & Balance", labelAr: "الخروجات وتدارك الفائض", icon: Compass },
    { id: "dashboard" as NavTab, labelEn: "Progress & Streaks", labelAr: "التقدم والوزن الأسبوعي", icon: BarChart3 },
    { id: "wizard" as NavTab, labelEn: "Diagnostic Wizard", labelAr: "التقييم الذكي", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-6">
        {/* Brand with clickable Logo to Home */}
        <button
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-3 shrink-0 mr-3 lg:mr-8 rtl:mr-0 rtl:ml-3 rtl:lg:ml-8 hover:opacity-90 transition-opacity text-left rtl:text-right"
          title={isAr ? "الصفحة الرئيسية" : "Home Landing Page"}
        >
          <Logo size="sm" variant="full" locale={locale} />
        </button>

        {/* Desktop Navigation - Only visible to authenticated users with completed diagnostic profile */}
        {user && profile && (
          <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 shrink-0">
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
        )}

        {/* If user logged in but hasn't completed diagnostic profile */}
        {user && !profile && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{isAr ? "خطوة أخيرة: أكمل التقييم الذكي لتفعيل خطتك" : "Action Required: Complete Diagnostic Assessment"}</span>
          </div>
        )}

        {/* Language & Auth Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Grocery list quick trigger - Only if logged in with profile */}
          {user && profile && onOpenGroceryList && (
            <button
              onClick={onOpenGroceryList}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
              title={isAr ? "قائمة مشتريات السوبرماركت" : "Grocery Shopping List"}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span>{isAr ? "المشتريات" : "Groceries"}</span>
            </button>
          )}

          {/* Theme Switcher (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            title={theme === "dark" ? (isAr ? "الوضع المضيء" : "Light Mode") : (isAr ? "الوضع الليلي" : "Dark Mode")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">{locale === "ar" ? "English" : "العربية"}</span>
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 rtl:pl-0 rtl:pr-1">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                title={isAr ? "تسجيل خروج" : "Sign Out"}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("signin")}
                className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
              >
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{isAr ? "إنشاء حساب" : "Sign Up"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
