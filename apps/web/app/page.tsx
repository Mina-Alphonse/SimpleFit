"use client";

import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";
import { ThemeProvider } from "../components/ThemeContext";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { AuthModal } from "../components/AuthModal";
import { GroceryListModal } from "../components/GroceryListModal";
import { Header, NavTab } from "../components/Header";
import { LandingPage } from "../components/LandingPage";
import { OnboardingWizard } from "../components/OnboardingWizard";
import { MealPlanner } from "../components/MealPlanner";
import { WorkoutPlan } from "../components/WorkoutPlan";
import { AdherenceTools } from "../components/AdherenceTools";
import { Dashboard } from "../components/Dashboard";
import {
  Utensils,
  Dumbbell,
  Compass,
  BarChart3,
  Home as HomeIcon,
  ShieldCheck,
} from "lucide-react";

function MainApp() {
  const { user } = useAuth();
  // Default to landing page for logged-out visitors, or meal planner for logged-in athletes
  const [activeTab, setActiveTab] = useState<NavTab>(() => (user ? "planner" : "home"));
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const mobileNavItems = [
    { id: "home" as NavTab, labelEn: "Home", labelAr: "الرئيسية", icon: HomeIcon },
    { id: "planner" as NavTab, labelEn: "Meals", labelAr: "الوجبات", icon: Utensils },
    { id: "workout" as NavTab, labelEn: "Workout", labelAr: "التمارين", icon: Dumbbell },
    { id: "adherence" as NavTab, labelEn: "Buffer", labelAr: "الخروجات", icon: Compass },
    { id: "dashboard" as NavTab, labelEn: "Progress", labelAr: "التقدم", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20 md:pb-10">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGroceryList={() => setIsGroceryModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === "home" && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === "planner" && (
          <MealPlanner onOpenGroceryList={() => setIsGroceryModalOpen(true)} />
        )}
        {activeTab === "workout" && <WorkoutPlan />}
        {activeTab === "adherence" && <AdherenceTools />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "wizard" && <OnboardingWizard />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <GroceryListModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
      />

      {/* Mobile Bottom Floating Navigation Bar */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-card/95 backdrop-blur-lg border border-border/80 shadow-lg rounded-2xl p-1.5 flex justify-around items-center">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-semibold">{isAr ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
