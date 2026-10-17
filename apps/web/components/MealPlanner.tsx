"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { calculateIngredientSwap, FoodNutritionPer100g } from "@simplefit/shared";
import {
  Utensils,
  ArrowRightLeft,
  Check,
  Calendar,
  Sparkles,
  ShoppingBag,
  Flame,
  Scale,
  X,
} from "lucide-react";

interface MealItem {
  id: string;
  foodNameEn: string;
  foodNameAr: string;
  category: FoodNutritionPer100g["category"];
  grams: number;
  householdUnitEn: string;
  householdUnitAr: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
}

interface PlannedMeal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  nameEn: string;
  nameAr: string;
  items: MealItem[];
}

export function MealPlanner() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [cadence, setCadence] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [selectedDay, setSelectedDay] = useState(1);

  // Active swap state
  const [swappingItem, setSwappingItem] = useState<{
    mealId: string;
    item: MealItem;
  } | null>(null);

  // Sample Egyptian Meals State
  const [meals, setMeals] = useState<PlannedMeal[]>([
    {
      id: "m-breakfast",
      type: "breakfast",
      nameEn: "Traditional Egyptian Power Breakfast",
      nameAr: "فطور مصري متوازن عالي البروتين",
      items: [
        {
          id: "item-ful",
          foodNameEn: "Ful Medames with Olive Oil",
          foodNameAr: "فول بالزيت الزيتون والليمون",
          category: "staple",
          grams: 125,
          householdUnitEn: "4 Tablespoons",
          householdUnitAr: "٤ ملاعق طعام كبيرة",
          caloriesPer100g: 155,
          proteinPer100g: 7.0,
          carbsPer100g: 18.0,
          fatsPer100g: 6.5,
        },
        {
          id: "item-bread",
          foodNameEn: "Baladi Bread",
          foodNameAr: "عيش بلدي طازج بالردة",
          category: "carb",
          grams: 65,
          householdUnitEn: "1/2 Baladi Loaf",
          householdUnitAr: "نصف رغيف بلدي",
          caloriesPer100g: 250,
          proteinPer100g: 8.5,
          carbsPer100g: 52.0,
          fatsPer100g: 1.2,
        },
        {
          id: "item-egg",
          foodNameEn: "Boiled Eggs",
          foodNameAr: "بيض مسلوق بلدي",
          category: "protein",
          grams: 100,
          householdUnitEn: "2 Large Eggs",
          householdUnitAr: "بيضتين كبار",
          caloriesPer100g: 143,
          proteinPer100g: 12.6,
          carbsPer100g: 0.8,
          fatsPer100g: 9.5,
        },
      ],
    },
    {
      id: "m-lunch",
      type: "lunch",
      nameEn: "Egyptian High-Protein Home Lunch",
      nameAr: "غداء مصري متكامل (مشويات وأرز)",
      items: [
        {
          id: "item-kofta",
          foodNameEn: "Grilled Lean Beef Kofta",
          foodNameAr: "كفتة حاتي مشوية على الفحم",
          category: "protein",
          grams: 150,
          householdUnitEn: "3 Medium Fingers",
          householdUnitAr: "٣ صوابع كفتة مشوية",
          caloriesPer100g: 220,
          proteinPer100g: 24.0,
          carbsPer100g: 4.0,
          fatsPer100g: 12.0,
        },
        {
          id: "item-rice",
          foodNameEn: "Egyptian White Rice with Vermicelli",
          foodNameAr: "أرز مصري بالشعرية",
          category: "carb",
          grams: 150,
          householdUnitEn: "6 Tablespoons",
          householdUnitAr: "٦ ملاعق طعام كبيرة",
          caloriesPer100g: 148,
          proteinPer100g: 2.8,
          carbsPer100g: 28.5,
          fatsPer100g: 2.6,
        },
        {
          id: "item-molokhia",
          foodNameEn: "Molokhia Green Soup",
          foodNameAr: "ملوخية خضراء بالتقلية الخفيفة",
          category: "traditional_main",
          grams: 150,
          householdUnitEn: "1 Deep Bowl",
          householdUnitAr: "طبق ملوخية عميق",
          caloriesPer100g: 55,
          proteinPer100g: 3.1,
          carbsPer100g: 4.5,
          fatsPer100g: 2.8,
        },
      ],
    },
    {
      id: "m-dinner",
      type: "dinner",
      nameEn: "Light Egyptian Dinner",
      nameAr: "عشاء خفيف بجبنة قريش",
      items: [
        {
          id: "item-quraish",
          foodNameEn: "Quraish Cheese with Tomato & Cumin",
          foodNameAr: "جبنة قريش فلاحي بالطماطم والكمون",
          category: "protein",
          grams: 150,
          householdUnitEn: "1 Full Plate",
          householdUnitAr: "طبق جبنة قريش كبير",
          caloriesPer100g: 98,
          proteinPer100g: 17.5,
          carbsPer100g: 2.6,
          fatsPer100g: 1.5,
        },
        {
          id: "item-toast",
          foodNameEn: "Crispy Sinn Bread",
          foodNameAr: "عيش سن محمص بالردة",
          category: "carb",
          grams: 50,
          householdUnitEn: "1 Crispy Loaf",
          householdUnitAr: "رغيف سن واحد",
          caloriesPer100g: 220,
          proteinPer100g: 11.0,
          carbsPer100g: 44.0,
          fatsPer100g: 1.5,
        },
      ],
    },
    {
      id: "m-snack",
      type: "snack",
      nameEn: "Egyptian Street Afternoon Snack",
      nameAr: "سناك بطاطا مشوية",
      items: [
        {
          id: "item-batata",
          foodNameEn: "Roasted Egyptian Sweet Potato",
          foodNameAr: "بطاطا حلوة مصرية مشوية",
          category: "carb",
          grams: 180,
          householdUnitEn: "1 Medium Potato",
          householdUnitAr: "حبة بطاطا متوسطة",
          caloriesPer100g: 90,
          proteinPer100g: 1.8,
          carbsPer100g: 21.0,
          fatsPer100g: 0.2,
        },
      ],
    },
  ]);

  // Candidate replacement foods for the modal
  const replacementCandidates: FoodNutritionPer100g[] = [
    {
      nameEn: "Baladi Bread",
      nameAr: "عيش بلدي طازج بالردة",
      category: "carb",
      caloriesPer100g: 250,
      proteinPer100g: 8.5,
      carbsPer100g: 52.0,
      fatsPer100g: 1.2,
      householdPortions: [
        { unitEn: "1/4 Loaf", unitAr: "ربع رغيف", grams: 32 },
        { unitEn: "1/2 Loaf", unitAr: "نصف رغيف", grams: 65 },
        { unitEn: "1 Loaf", unitAr: "رغيف كامل", grams: 130 },
      ],
    },
    {
      nameEn: "Egyptian Sweet Potato (Batata)",
      nameAr: "بطاطا حلوة مصرية مشوية",
      category: "carb",
      caloriesPer100g: 90,
      proteinPer100g: 1.8,
      carbsPer100g: 21.0,
      fatsPer100g: 0.2,
      householdPortions: [
        { unitEn: "1 Small Potato", unitAr: "حبة بطاطا صغيرة", grams: 120 },
        { unitEn: "1 Medium Potato", unitAr: "حبة بطاطا متوسطة", grams: 200 },
      ],
    },
    {
      nameEn: "Sayadia Fish Rice",
      nameAr: "أرز صيادية بني بالبصل",
      category: "carb",
      caloriesPer100g: 165,
      proteinPer100g: 3.2,
      carbsPer100g: 29.0,
      fatsPer100g: 4.1,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق طعام كبيرة", grams: 100 },
        { unitEn: "6 Tablespoons", unitAr: "٦ ملاعق طعام كبيرة", grams: 150 },
      ],
    },
    {
      nameEn: "Shish Tawook (Grilled Chicken Skewers)",
      nameAr: "شيش طاووق صدور فراخ مشوي",
      category: "protein",
      caloriesPer100g: 145,
      proteinPer100g: 26.5,
      carbsPer100g: 2.0,
      fatsPer100g: 3.5,
      householdPortions: [
        { unitEn: "1 Skewer", unitAr: "سيخ شيش طاووق", grams: 100 },
        { unitEn: "2 Skewers", unitAr: "سيخين شيش طاووق", grams: 200 },
      ],
    },
    {
      nameEn: "Grilled Tilapia Fish (Samak Bolti)",
      nameAr: "سمك بلطي مشوي بالردة والليمون",
      category: "protein",
      caloriesPer100g: 118,
      proteinPer100g: 23.0,
      carbsPer100g: 1.0,
      fatsPer100g: 2.4,
      householdPortions: [
        { unitEn: "1 Whole Fish", unitAr: "سمكة بلطي كاملة", grams: 220 },
      ],
    },
  ];

  // Calculate day totals
  const totalCalories = meals.reduce((sum, m) => {
    return sum + m.items.reduce((itemSum, item) => itemSum + Math.round((item.caloriesPer100g * item.grams) / 100), 0);
  }, 0);

  const totalProtein = meals.reduce((sum, m) => {
    return sum + m.items.reduce((itemSum, item) => itemSum + (item.proteinPer100g * item.grams) / 100, 0);
  }, 0);

  const totalCarbs = meals.reduce((sum, m) => {
    return sum + m.items.reduce((itemSum, item) => itemSum + (item.carbsPer100g * item.grams) / 100, 0);
  }, 0);

  const totalFats = meals.reduce((sum, m) => {
    return sum + m.items.reduce((itemSum, item) => itemSum + (item.fatsPer100g * item.grams) / 100, 0);
  }, 0);

  // Apply swap to current meal item
  const handleApplySwap = (replacement: FoodNutritionPer100g) => {
    if (!swappingItem) return;

    const sourceFoodNutrition: FoodNutritionPer100g = {
      nameEn: swappingItem.item.foodNameEn,
      nameAr: swappingItem.item.foodNameAr,
      category: swappingItem.item.category,
      caloriesPer100g: swappingItem.item.caloriesPer100g,
      proteinPer100g: swappingItem.item.proteinPer100g,
      carbsPer100g: swappingItem.item.carbsPer100g,
      fatsPer100g: swappingItem.item.fatsPer100g,
    };

    const result = calculateIngredientSwap({
      sourceFood: sourceFoodNutrition,
      sourceGrams: swappingItem.item.grams,
      targetFood: replacement,
    });

    const updatedItem: MealItem = {
      id: `item-${Date.now()}`,
      foodNameEn: replacement.nameEn,
      foodNameAr: replacement.nameAr || replacement.nameEn,
      category: replacement.category,
      grams: result.replacementGrams,
      householdUnitEn: result.nearestHouseholdPortion
        ? `${result.nearestHouseholdPortion.count} ${result.nearestHouseholdPortion.unitEn}`
        : `${result.replacementGrams}g`,
      householdUnitAr: result.nearestHouseholdPortion
        ? `${result.nearestHouseholdPortion.count} ${result.nearestHouseholdPortion.unitAr}`
        : `${result.replacementGrams} جرام`,
      caloriesPer100g: replacement.caloriesPer100g,
      proteinPer100g: replacement.proteinPer100g,
      carbsPer100g: replacement.carbsPer100g,
      fatsPer100g: replacement.fatsPer100g,
    };

    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== swappingItem.mealId) return m;
        return {
          ...m,
          items: m.items.map((i) => (i.id === swappingItem.item.id ? updatedItem : i)),
        };
      })
    );

    setSwappingItem(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Cadence Header & Day Navigation */}
      <div className="bg-card border border-border p-5 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span>{isAr ? "جدول الوجبات والأكلات المصرية" : "Egyptian Meal Plan & 1-Click Swaps"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "محسوب بالجرام وبالوحدات المصرية (نصف رغيف، ملاعق، أصابع) مع تبديل فوري ±5%."
              : "Dual gram & household units with ±5% instant macro matching."}
          </p>
        </div>

        {/* Cadence Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          {[
            { id: "weekly", labelEn: "Weekly (7d)", labelAr: "أسبوعي (٧ أيام)" },
            { id: "biweekly", labelEn: "Bi-Weekly (14d)", labelAr: "أسبوعين (١٤ يوم)" },
            { id: "monthly", labelEn: "Monthly (28d)", labelAr: "شهري (٢٨ يوم)" },
          ].map((cad) => (
            <button
              key={cad.id}
              onClick={() => setCadence(cad.id as typeof cadence)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cadence === cad.id ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? cad.labelAr : cad.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Days Tabs (Saturday to Friday) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { day: 1, nameEn: "Sat", nameAr: "السبت" },
          { day: 2, nameEn: "Sun", nameAr: "الأحد" },
          { day: 3, nameEn: "Mon", nameAr: "الإثنين" },
          { day: 4, nameEn: "Tue", nameAr: "الثلاثاء" },
          { day: 5, nameEn: "Wed", nameAr: "الأربعاء" },
          { day: 6, nameEn: "Thu", nameAr: "الخميس" },
          { day: 7, nameEn: "Fri", nameAr: "الجمعة" },
        ].map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold shrink-0 transition-all ${
              selectedDay === d.day
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>{isAr ? d.nameAr : d.nameEn}</span>
            <span className="block text-[10px] opacity-80 mt-0.5">
              {isAr ? `اليوم ${d.day}` : `Day ${d.day}`}
            </span>
          </button>
        ))}
      </div>

      {/* Daily Macro Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {isAr ? "إجمالي السعرات" : "Total Calories"}
          </span>
          <div className="text-2xl font-black mt-1 text-primary">
            {totalCalories} <span className="text-xs font-normal text-muted-foreground">{isAr ? "سعرة" : "kcal"}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            {isAr ? "البروتين" : "Protein"}
          </span>
          <div className="text-2xl font-black mt-1 text-foreground">
            {Math.round(totalProtein)}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            {isAr ? "الكربوهيدرات" : "Carbohydrates"}
          </span>
          <div className="text-2xl font-black mt-1 text-foreground">
            {Math.round(totalCarbs)}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            {isAr ? "الدهون الصحية" : "Healthy Fats"}
          </span>
          <div className="text-2xl font-black mt-1 text-foreground">
            {Math.round(totalFats)}g
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-6">
        {meals.map((meal) => {
          const mealCalories = meal.items.reduce(
            (sum, item) => sum + Math.round((item.caloriesPer100g * item.grams) / 100),
            0
          );
          const mealProtein = Math.round(
            meal.items.reduce((sum, item) => sum + (item.proteinPer100g * item.grams) / 100, 0)
          );

          return (
            <div key={meal.id} className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase">
                    {meal.type}
                  </span>
                  <h3 className="font-bold text-base text-foreground">
                    {isAr ? meal.nameAr : meal.nameEn}
                  </h3>
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  <span className="font-bold text-foreground">{mealCalories} kcal</span> • {mealProtein}g protein
                </div>
              </div>

              {/* Meal Items */}
              <div className="space-y-3">
                {meal.items.map((item) => {
                  const itemCal = Math.round((item.caloriesPer100g * item.grams) / 100);
                  const itemProtein = ((item.proteinPer100g * item.grams) / 100).toFixed(1);
                  const itemCarbs = ((item.carbsPer100g * item.grams) / 100).toFixed(1);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-background border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">
                          {isAr ? item.foodNameAr : item.foodNameEn}
                        </div>
                        <div className="text-xs font-semibold text-primary flex items-center gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                            {item.grams}g
                          </span>
                          <span className="text-muted-foreground">
                            ({isAr ? item.householdUnitAr : item.householdUnitEn})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-end text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">{itemCal} kcal</span> • {itemProtein}g P • {itemCarbs}g C
                        </div>

                        {/* 1-Click Swap Button */}
                        <button
                          type="button"
                          onClick={() => setSwappingItem({ mealId: meal.id, item })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-primary/10 hover:border-primary text-xs font-bold text-foreground transition-all"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                          <span>{isAr ? "تبديل ذكي" : "1-Click Swap"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click Swap Interactive Modal */}
      {swappingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-lg w-full p-6 rounded-3xl shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSwappingItem(null)}
              className="absolute top-5 end-5 p-1 rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "محرك التبديل الذكي (±5% ماكروز)" : "Smart Macro Swap Engine (±5%)"}</span>
              </div>
              <h3 className="text-lg font-bold">
                {isAr ? "اختر البديل المصري المناسب:" : "Choose Egyptian Food Replacement:"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr ? "تبديل:" : "Swapping:"}{" "}
                <strong className="text-foreground">
                  {swappingItem.item.grams}g {isAr ? swappingItem.item.foodNameAr : swappingItem.item.foodNameEn}
                </strong>
              </p>
            </div>

            {/* Replacements List */}
            <div className="space-y-3">
              {replacementCandidates
                .filter((r) => r.nameEn !== swappingItem.item.foodNameEn)
                .map((candidate) => {
                  const swapCalc = calculateIngredientSwap({
                    sourceFood: {
                      nameEn: swappingItem.item.foodNameEn,
                      category: swappingItem.item.category,
                      caloriesPer100g: swappingItem.item.caloriesPer100g,
                      proteinPer100g: swappingItem.item.proteinPer100g,
                      carbsPer100g: swappingItem.item.carbsPer100g,
                      fatsPer100g: swappingItem.item.fatsPer100g,
                    },
                    sourceGrams: swappingItem.item.grams,
                    targetFood: candidate,
                  });

                  return (
                    <div
                      key={candidate.nameEn}
                      className="p-4 rounded-2xl bg-background border border-border/80 flex items-center justify-between gap-3 hover:border-primary transition-all"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">
                          {isAr ? candidate.nameAr : candidate.nameEn}
                        </div>
                        <div className="text-xs text-primary font-bold">
                          {swapCalc.replacementGrams}g{" "}
                          {swapCalc.nearestHouseholdPortion && (
                            <span className="text-muted-foreground font-normal">
                              ({isAr ? swapCalc.nearestHouseholdPortion.unitAr : swapCalc.nearestHouseholdPortion.unitEn})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {swapCalc.replacementMacros.calories} kcal • {swapCalc.replacementMacros.proteinG}g P • {swapCalc.replacementMacros.carbsG}g C
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplySwap(candidate)}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAr ? "تطبيق" : "Apply"}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
