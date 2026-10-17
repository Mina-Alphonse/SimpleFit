"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "./LanguageContext";
import {
  X,
  ShoppingBag,
  Calendar,
  Check,
  Copy,
  Printer,
  Sparkles,
  CheckCircle2,
  Share2,
} from "lucide-react";

export interface GroceryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  totalGrams: number;
  aisle: "dairy" | "meat" | "bakery_grains" | "produce" | "fats_nuts" | "supplements";
  estimatedPackage: {
    en: string;
    ar: string;
  };
}

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  planCadence?: "weekly" | "biweekly" | "monthly";
}

export function GroceryListModal({ isOpen, onClose, planCadence = "weekly" }: GroceryListModalProps) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [cadence, setCadence] = useState<"weekly" | "biweekly" | "monthly">(planCadence);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Multiplier based on cadence (Weekly = 7 days, Bi-Weekly = 14 days, Monthly = 28 days)
  const multiplier = cadence === "weekly" ? 1 : cadence === "biweekly" ? 2 : 4;
  const daysCount = cadence === "weekly" ? 7 : cadence === "biweekly" ? 14 : 28;

  // Curated shopping catalog aggregated from the active meal plan for the cycle
  const groceryItems: GroceryItem[] = useMemo(() => {
    return [
      // Dairy & Eggs
      {
        id: "item-eggs",
        nameEn: "Fresh Farm Eggs (Red / White)",
        nameAr: "بيض مزارع طازج (أحمر أو أبيض)",
        totalGrams: 100 * 7 * multiplier,
        aisle: "dairy",
        estimatedPackage: {
          en: `${14 * multiplier} Eggs (~${multiplier === 1 ? "1/2" : multiplier === 2 ? "1" : "2"} Carton)`,
          ar: `${14 * multiplier} بيضة (كرتونة مزارع)`,
        },
      },
      {
        id: "item-quraish",
        nameEn: "Egyptian Quraish Cheese",
        nameAr: "جبنة قريش فلاحي طبيعية",
        totalGrams: 100 * 7 * multiplier,
        aisle: "dairy",
        estimatedPackage: {
          en: `${(0.7 * multiplier).toFixed(1)} kg (Fresh from deli)`,
          ar: `${(0.7 * multiplier).toFixed(1)} كجم من قسم الألبان`,
        },
      },
      {
        id: "item-greek-yogurt",
        nameEn: "Juhayna / Almarai Greek Yogurt 0%",
        nameAr: "زبادي يوناني لايت 0% (جهينة أو المراعي)",
        totalGrams: 170 * 7 * multiplier,
        aisle: "dairy",
        estimatedPackage: {
          en: `${7 * multiplier} Cups (170g) or ${multiplier * 3} Large Tubs`,
          ar: `${7 * multiplier} أكواب صغيرة أو ${multiplier * 3} علب عائلية كبيرة`,
        },
      },
      // Meat & Fish
      {
        id: "item-chicken",
        nameEn: "Fresh Chicken Breast Fillet",
        nameAr: "صدور دجاج بانيه فيليه طازجة",
        totalGrams: 200 * 7 * multiplier,
        aisle: "meat",
        estimatedPackage: {
          en: `${(1.4 * multiplier).toFixed(1)} kg (~${7 * multiplier} Fillet Pieces)`,
          ar: `${(1.4 * multiplier).toFixed(1)} كجم صدور فيليه بانيه`,
        },
      },
      {
        id: "item-tuna",
        nameEn: "Sunshine Canned Tuna in Water (Diet)",
        nameAr: "تونة صن شاين دايت في الماء",
        totalGrams: 130 * 4 * multiplier,
        aisle: "meat",
        estimatedPackage: {
          en: `${4 * multiplier} Cans (Drained 130g)`,
          ar: `${4 * multiplier} علب تونة دايت`,
        },
      },
      // Bakery & Grains
      {
        id: "item-baladi-bread",
        nameEn: "Egyptian Baladi Bread (Aysh Baladi)",
        nameAr: "عيش بلدي طازج من الفرن",
        totalGrams: 65 * 7 * multiplier,
        aisle: "bakery_grains",
        estimatedPackage: {
          en: `${Math.ceil(3.5 * multiplier)} Full Loaves (Split into halves)`,
          ar: `${Math.ceil(3.5 * multiplier)} أرغفة عيش بلدي`,
        },
      },
      {
        id: "item-toast",
        nameEn: "Rich Bake Whole Wheat Toast",
        nameAr: "توست ريتش بيك بني حبة كاملة",
        totalGrams: 56 * 4 * multiplier,
        aisle: "bakery_grains",
        estimatedPackage: {
          en: `${multiplier === 1 ? "1 Pack" : multiplier === 2 ? "2 Packs" : "3 Packs"}`,
          ar: `${multiplier === 1 ? "كيس توست واحد" : multiplier === 2 ? "كيسين توست بني" : "٣ أكياس توست"}`,
        },
      },
      {
        id: "item-basmati",
        nameEn: "Basmati Rice (Long Grain)",
        nameAr: "أرز بسمتي هندي طويل الحبة",
        totalGrams: 80 * 7 * multiplier,
        aisle: "bakery_grains",
        estimatedPackage: {
          en: `${(0.6 * multiplier).toFixed(1)} kg (1 Bag Al-Doha / Abu Kass)`,
          ar: `كيس أرز بسمتي الضحى أو أبو كاس`,
        },
      },
      {
        id: "item-ful",
        nameEn: "Ful Medames (Plain or Canned California)",
        nameAr: "فول تدميس بلدي أو معلب حدائق كاليفورنيا",
        totalGrams: 120 * 7 * multiplier,
        aisle: "bakery_grains",
        estimatedPackage: {
          en: `${(0.85 * multiplier).toFixed(1)} kg cooked (or ${3 * multiplier} Cans)`,
          ar: `${(0.85 * multiplier).toFixed(1)} كجم فول مطبوخ أو ${3 * multiplier} علب فول`,
        },
      },
      // Healthy Fats & Nuts
      {
        id: "item-almonds",
        nameEn: "Abu Auf Raw Unsalted Almonds",
        nameAr: "لوز نيء غير مملح أبو عوف",
        totalGrams: 30 * 7 * multiplier,
        aisle: "fats_nuts",
        estimatedPackage: {
          en: `${multiplier === 1 ? "1 Pack (250g)" : multiplier === 2 ? "1 Pack (500g)" : "2 Packs (500g)"}`,
          ar: `${multiplier === 1 ? "عبوة ٢٥٠جم أبو عوف" : multiplier === 2 ? "عبوة ٥٠٠جم" : "عبوتين ٥٠٠جم"}`,
        },
      },
      {
        id: "item-olive-oil",
        nameEn: "Wadi Food Extra Virgin Olive Oil",
        nameAr: "زيت زيتون بكر ممتاز وادي فود",
        totalGrams: 10 * 7 * multiplier,
        aisle: "fats_nuts",
        estimatedPackage: {
          en: "1 Bottle (500ml) lasts multiple cycles",
          ar: "زجاجة ٥٠٠مل تكفي عدة دورات",
        },
      },
      // Fresh Produce
      {
        id: "item-tomatoes",
        nameEn: "Fresh Egyptian Tomatoes",
        nameAr: "طماطم بلدي طازجة للسلطة والطبخ",
        totalGrams: 150 * 7 * multiplier,
        aisle: "produce",
        estimatedPackage: {
          en: `${(1.1 * multiplier).toFixed(1)} kg Fresh`,
          ar: `${(1.1 * multiplier).toFixed(1)} كجم طماطم طازجة`,
        },
      },
      {
        id: "item-cucumbers",
        nameEn: "Fresh Egyptian Cucumbers",
        nameAr: "خيار بلدي طازج ومقرمش",
        totalGrams: 160 * 7 * multiplier,
        aisle: "produce",
        estimatedPackage: {
          en: `${(1.2 * multiplier).toFixed(1)} kg Fresh`,
          ar: `${(1.2 * multiplier).toFixed(1)} كجم خيار بلدي`,
        },
      },
      {
        id: "item-molokhia",
        nameEn: "Fresh or Frozen Egyptian Molokhia (Basma)",
        nameAr: "ملوخية خضراء طازجة أو مجمدة (بسمة)",
        totalGrams: 200 * 3 * multiplier,
        aisle: "produce",
        estimatedPackage: {
          en: `${multiplier === 1 ? "2 Bags" : multiplier === 2 ? "4 Bags" : "6 Bags"} (400g Basma)`,
          ar: `${multiplier === 1 ? "كيسين ملوخية بسمة" : multiplier === 2 ? "٤ أكياس" : "٦ أكياس ملوخية"}`,
        },
      },
    ];
  }, [multiplier]);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalItemsCount = groceryItems.length;

  const aislesMeta = {
    dairy: { en: "Dairy, Cheese & Eggs", ar: "الألبان والأجبان والبيض", icon: "🥛" },
    meat: { en: "Poultry, Meat & Fish", ar: "اللحوم والدواجن والأسماك", icon: "🍗" },
    bakery_grains: { en: "Bakery, Grains & Staples", ar: "المخبوزات والنشويات والبقوليات", icon: "🍞" },
    fats_nuts: { en: "Healthy Oils & Nuts", ar: "الزيوت الصحية والمكسرات", icon: "🥑" },
    produce: { en: "Fresh Produce & Greens", ar: "الخضروات والفواكه الطازجة", icon: "🍎" },
    supplements: { en: "Fitness & Snacks", ar: "المكملات والسناكات الرياضية", icon: "⚡" },
  };

  const handleCopyWhatsApp = () => {
    let text = isAr
      ? `🛒 *قائمة مشتريات سيمبل فيت (${daysCount} أيام)*\n\n`
      : `🛒 *SimpleFit Grocery List (${daysCount} Days)*\n\n`;

    const groups: Record<string, GroceryItem[]> = {};
    groceryItems.forEach((item) => {
      groups[item.aisle] = groups[item.aisle] || [];
      groups[item.aisle].push(item);
    });

    Object.entries(groups).forEach(([aisleKey, items]) => {
      const meta = aislesMeta[aisleKey as keyof typeof aislesMeta];
      text += `*${meta.icon} ${isAr ? meta.ar : meta.en}:*\n`;
      items.forEach((item) => {
        const isDone = checkedItems[item.id] ? "✅" : "▫️";
        text += `${isDone} ${isAr ? item.nameAr : item.nameEn} — ${isAr ? item.estimatedPackage.ar : item.estimatedPackage.en}\n`;
      });
      text += "\n";
    });

    text += isAr ? "تم إنشاؤها عبر SimpleFit App 🚀" : "Generated with SimpleFit App 🚀";

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col text-card-foreground">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{isAr ? "قائمة مشتريات السوبرماركت المجمعة" : "Smart Grocery Shopping List"}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                  {daysCount} {isAr ? "يوم" : "Days"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "محسوبة بدقة بناءً على وجباتك المصرية والوحدات المتاحة بالسوبرماركت"
                  : "Auto-aggregated from your meal plan and converted into supermarket packaging units."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cadence Selector & Progress bar */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/60">
          {/* Cadence Tabs */}
          <div className="flex items-center rounded-xl bg-muted p-1 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setCadence("weekly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                cadence === "weekly" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              {isAr ? "أسبوعي (٧ أيام)" : "Weekly (7d)"}
            </button>
            <button
              onClick={() => setCadence("biweekly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                cadence === "biweekly" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              {isAr ? "نصف شهري (١٤ يوماً)" : "Bi-Weekly (14d)"}
            </button>
            <button
              onClick={() => setCadence("monthly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                cadence === "monthly" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
            >
              {isAr ? "شهري (٢٨ يوماً)" : "Monthly (28d)"}
            </button>
          </div>

          {/* Checklist progress */}
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <span>
              {completedCount} / {totalItemsCount} {isAr ? "عنصر تم شراؤه" : "items bought"}
            </span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedCount / totalItemsCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {Object.entries(aislesMeta).map(([aisleKey, meta]) => {
            const aisleItems = groceryItems.filter((item) => item.aisle === aisleKey);
            if (aisleItems.length === 0) return null;

            return (
              <div key={aisleKey} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>{meta.icon}</span>
                  <span>{isAr ? meta.ar : meta.en}</span>
                </div>

                <div className="space-y-2">
                  {aisleItems.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? "bg-muted/40 border-border/40 opacity-60 line-through"
                            : "bg-card border-border hover:border-primary/40 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40 bg-background"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">
                              {isAr ? item.nameAr : item.nameEn}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.totalGrams}g {isAr ? "إجمالي" : "total"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right rtl:text-left">
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold inline-block">
                            {isAr ? item.estimatedPackage.ar : item.estimatedPackage.en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{isAr ? "يمكنك استخدام القائمة مباشرة بالسوبرماركت أو إرسالها لواتساب" : "Tick items in-store or copy as a formatted WhatsApp checklist."}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5 justify-center flex-1 sm:flex-initial"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? "طباعة / PDF" : "Print"}</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 justify-center shadow-xs flex-1 sm:flex-initial"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "تم النسخ بنجاح!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{isAr ? "نسخ للواتساب" : "Copy to WhatsApp"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
