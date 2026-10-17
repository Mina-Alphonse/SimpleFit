"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import {
  calculateIngredientSwap,
  findPaginatedIngredientSwaps,
  getFoodNutritionGroup,
  FoodNutritionPer100g,
} from "@simplefit/shared";
import { CheckInModal } from "./CheckInModal";
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
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Lightbulb,
  Droplets,
  ChefHat,
} from "lucide-react";

export interface DietSauceTip {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "zero_cal" | "low_fat_sauce" | "flavor_hack";
  caloriesDescAr: string;
  caloriesDescEn: string;
  bestWithAr: string;
  bestWithEn: string;
  recipeTipAr: string;
  recipeTipEn: string;
  tagAr: string;
  tagEn: string;
}

export const DIET_SAUCES_AND_FLAVOR_TRICKS: DietSauceTip[] = [
  {
    id: "yellow_mustard",
    nameAr: "المستردة الصفراء (خردل هاينز / فرينشز)",
    nameEn: "Yellow Mustard (Heinz / French's)",
    category: "zero_cal",
    caloriesDescAr: "٥ سعرات للملعقة الكبيرة (صفر دهون وسكر)",
    caloriesDescEn: "5 kcal per tbsp (0g fat, 0g sugar)",
    bestWithAr: "صدور الفراخ، البيض المسلوق، ساندوتشات التوست والتونة",
    bestWithEn: "Chicken breast, boiled eggs, toast sandwiches, tuna",
    recipeTipAr: "بديل عبقري للمايونيز، تمنح الساندوتش حموضة ونكهة قوية دون إضافة أي دهون.",
    recipeTipEn: "Perfect zero-fat substitute for mayo, adding tangy punch without calories.",
    tagAr: "شبه معدوم السعرات",
    tagEn: "Zero Fat",
  },
  {
    id: "hot_sauce_shatta",
    nameAr: "الهوت صوص / الشطة الحارة (تباسكو / شطة مصرية)",
    nameEn: "Hot Sauce / Egyptian Shatta (Tabasco)",
    category: "zero_cal",
    caloriesDescAr: "صفر سعرات تقريباً (١–٢ سعرة للرشة)",
    caloriesDescEn: "Virtually 0 kcal (1–2 kcal per dash)",
    bestWithAr: "الفول المدمس، التونة، البيض، والصدور المشوية",
    bestWithEn: "Ful medames, canned tuna, eggs, grilled chicken",
    recipeTipAr: "الكابسيسين الحار يرفع معدل الحرق ويعطي إحساساً كبيراً بالشبع والنكهة.",
    recipeTipEn: "Capsaicin boosts thermogenesis and gives rich kick to plain foods.",
    tagAr: "حارق دهون طبيعي",
    tagEn: "Metabolic Boost",
  },
  {
    id: "greek_yogurt_garlic",
    nameAr: "صوص الثومية بالزبادي اليوناني ٠٪ (بديل التومية)",
    nameEn: "High-Protein Greek Yogurt Garlic Dip",
    category: "low_fat_sauce",
    caloriesDescAr: "٣٥ سعرة + ٥ جم بروتين لكل ملعقتين كبيرتين",
    caloriesDescEn: "35 kcal + 5g Protein per 2 tbsp (0g fat)",
    bestWithAr: "الشيش طاووق، الشاورما، الفراخ المشوية، والبطاطس المسلوقة",
    bestWithEn: "Shish tawook, chicken breast, shawarma, baked potato",
    recipeTipAr: "اخلط ملعقتين زبادي يوناني 0% مع فص ثوم مفروم، عصرة ليمون، رشة ملح وزعتر. طعم التومية السورية بدون نقطة زيت!",
    recipeTipEn: "Mix 2 tbsp 0% Greek yogurt with minced garlic, lemon juice, salt, and oregano. Authentic garlic dip with 0 fat!",
    tagAr: "عالي البروتين",
    tagEn: "High Protein",
  },
  {
    id: "egyptian_lemon_cumin_daa",
    nameAr: "دقة الليمون والكمون والخل المصرية",
    nameEn: "Egyptian Lemon-Cumin Garlic Dressing (Da'a)",
    category: "zero_cal",
    caloriesDescAr: "أقل من ١٠ سعرات (خالية من الزيوت)",
    caloriesDescEn: "<10 kcal (oil-free dressing)",
    bestWithAr: "السلطة الخضراء، الفول، السمك المشوي، والبتنجان المشوي",
    bestWithEn: "Green salad, ful medames, grilled fish, grilled eggplant",
    recipeTipAr: "عصير ليمونة كاملة + ملعقة خل تفاح + كمون مطحون + توم بودرة ورشة ملح هيمالايا. سر نكهة المطاعم الشعبية للدايت.",
    recipeTipEn: "Fresh lemon juice + apple cider vinegar + cumin + garlic powder. The street secret for delicious diet salads and ful.",
    tagAr: "سر النكهة الشعبية",
    tagEn: "Egyptian Secret",
  },
  {
    id: "light_tahini_hack",
    nameAr: "خدعة الطحينة الخفيفة (Light Tahini Hack)",
    nameEn: "Light Diluted Tahini Trick",
    category: "flavor_hack",
    caloriesDescAr: "٣٥ سعرة للكمية الكبيرة (بدل ١٢٠ سعرة)",
    caloriesDescEn: "~35 kcal for 3 full tbsp (vs 120 kcal raw)",
    bestWithAr: "المشاوي، الكفتة، الفول، والأسماك",
    bestWithEn: "Grilled meats, kofta, ful, grilled tilapia",
    recipeTipAr: "ذوّب ملعقة صغيرة فقط من الطحينة الخام في ملعقتين ماء دافئ مع ليمون وكمون وثوم؛ ستحصل على ٣ ملاعق صوص كريمي كثيف بأقل من ثلث السعرات!",
    recipeTipEn: "Dissolve just 1 tsp raw tahini in 2 tbsp warm water with lemon and cumin; yields 3 full tbsp of rich sauce for 1/3 the calories!",
    tagAr: "توفير سعرات ٧٠٪",
    tagEn: "70% Calorie Cut",
  },
  {
    id: "soy_sauce_light",
    nameAr: "صويا صوص خفيف (Light Soy Sauce / Kikkoman)",
    nameEn: "Light Soy Sauce (Low Sodium)",
    category: "zero_cal",
    caloriesDescAr: "١٠ سعرات للملعقة الكبيرة",
    caloriesDescEn: "10 kcal per tbsp",
    bestWithAr: "الأرز البسمتي، الخضار السوتيه، صدور الدجاج الصيني",
    bestWithEn: "Basmati rice, sautéed vegetables, stir-fried chicken",
    recipeTipAr: "نكهة أومامي غنية جداً تجعل الأرز والخضار المسلوق كأنه وجبة مطاعم فاخرة.",
    recipeTipEn: "Rich umami depth that transforms plain boiled rice and steamed veggies into restaurant quality.",
    tagAr: "أومامي ونكهة غنية",
    tagEn: "Savory Umami",
  },
  {
    id: "diet_mayo_bbq",
    nameAr: "مايونيز لايت / صوص باربيكيو زيرو سكر (Heinz Light / Walden)",
    nameEn: "Light Mayo / Zero Sugar BBQ Sauce",
    category: "low_fat_sauce",
    caloriesDescAr: "٣٥ سعرة للمايونيز اللايت / ١٥ سعرة للباربيكيو زيرو",
    caloriesDescEn: "35 kcal light mayo / 15 kcal zero BBQ",
    bestWithAr: "ساندوتشات التوست، التونة، والبرجر المنزلي المشوي",
    bestWithEn: "Toast sandwiches, tuna, lean grilled burger",
    recipeTipAr: "استخدم هاينز لايت (أقل دسم بنسبة 60%) أو صوصات زيرو سكر المتاحة في كارفور وسعودي.",
    recipeTipEn: "Use Heinz Light (60% less fat) or zero sugar BBQ sauces available at Carrefour & Seoudi.",
    tagAr: "منتجات سوبرماركت",
    tagEn: "Supermarket Finds",
  },
];

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

interface MealPlannerProps {
  onOpenGroceryList?: () => void;
}

export function MealPlanner({ onOpenGroceryList }: MealPlannerProps = {}) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [cadence, setCadence] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [selectedDay, setSelectedDay] = useState(1);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showSauceHints, setShowSauceHints] = useState(false);
  const [selectedSauceFilter, setSelectedSauceFilter] = useState<"all" | "zero_cal" | "low_fat_sauce" | "flavor_hack">("all");

  // Active swap state
  const [swappingItem, setSwappingItem] = useState<{
    mealId: string;
    item: MealItem;
  } | null>(null);

  // Swap pagination state: starts at 5, increments by 5
  const [swapDisplayLimit, setSwapDisplayLimit] = useState(5);

  // User dietary preferences state (Christian fasting, allergies, dislikes)
  const [userDietary, setUserDietary] = useState<{
    isChristianFasting: boolean;
    fastingSeafoodAllowed: boolean;
    allergies: string[];
    dislikedFoods: string[];
  }>({
    isChristianFasting: false,
    fastingSeafoodAllowed: true,
    allergies: [],
    dislikedFoods: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simplefit_dietary_pref");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserDietary({
            isChristianFasting: Boolean(parsed.isChristianFasting),
            fastingSeafoodAllowed: parsed.fastingSeafoodAllowed !== false,
            allergies: parsed.allergies || [],
            dislikedFoods: parsed.dislikedFoods || [],
          });
          if (parsed.planCadence) setCadence(parsed.planCadence);
        } catch {}
      }
    }
  }, []);

  // When opening a swap modal, reset display limit to 5
  const handleOpenSwap = (mealId: string, item: MealItem) => {
    setSwapDisplayLimit(5);
    setSwappingItem({ mealId, item });
  };

  // Sample Egyptian & Supermarket Meals State
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
          foodNameEn: "Grilled Beef Kofta",
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
          grams: 140,
          householdUnitEn: "5 Tablespoons",
          householdUnitAr: "٥ ملاعق طعام كبيرة",
          caloriesPer100g: 148,
          proteinPer100g: 2.8,
          carbsPer100g: 28.5,
          fatsPer100g: 2.6,
        },
        {
          id: "item-salad",
          foodNameEn: "Traditional Egyptian Green Salad",
          foodNameAr: "سلطة بلدي خضراء بالخيار والليمون",
          category: "vegetable",
          grams: 150,
          householdUnitEn: "1 Medium Bowl",
          householdUnitAr: "طبق سلطة متوسط",
          caloriesPer100g: 25,
          proteinPer100g: 1.2,
          carbsPer100g: 4.5,
          fatsPer100g: 0.3,
        },
      ],
    },
    {
      id: "m-dinner",
      type: "dinner",
      nameEn: "Light High-Protein Dinner",
      nameAr: "عشاء خفيف عالي البروتين (جبنة قريش وتوست سن)",
      items: [
        {
          id: "item-quraish",
          foodNameEn: "Egyptian Quraish Cheese",
          foodNameAr: "جبنة قريش فلاحي بالنعناع",
          category: "protein",
          grams: 150,
          householdUnitEn: "1 Big Piece",
          householdUnitAr: "قطعة كبيرة",
          caloriesPer100g: 98,
          proteinPer100g: 17.5,
          carbsPer100g: 3.2,
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
      nameEn: "Egyptian Afternoon Snack",
      nameAr: "سناك بطاطا حلوة وفاكهة",
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

  // Comprehensive candidate food library across all required categories:
  // Carbs, Fats, Proteins, Poultry, Healthy Cold Cuts, Seafood, Canned Foods, Vegetables, Fruits, Fasting Staples
  const allCandidates: FoodNutritionPer100g[] = [
    // --- CARBS ---
    {
      nameEn: "Baladi Bread",
      nameAr: "عيش بلدي طازج بالردة",
      category: "carb",
      caloriesPer100g: 250,
      proteinPer100g: 8.5,
      carbsPer100g: 52.0,
      fatsPer100g: 1.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1/4 Loaf", unitAr: "ربع رغيف", grams: 32 },
        { unitEn: "1/2 Loaf", unitAr: "نصف رغيف", grams: 65 },
        { unitEn: "1 Loaf", unitAr: "رغيف كامل", grams: 130 },
      ],
    },
    {
      nameEn: "Rich Bake Whole Wheat Toast (No Added Sugar)",
      nameAr: "توست ريتش بيك قمح كامل بدون سكر مضاف (دايت)",
      category: "carb",
      caloriesPer100g: 220,
      proteinPer100g: 11.0,
      carbsPer100g: 40.0,
      fatsPer100g: 2.0,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Slice", unitAr: "شريحة توست دايت", grams: 28 },
        { unitEn: "2 Slices", unitAr: "شريحتين توست بدون سكر", grams: 56 },
      ],
    },
    {
      nameEn: "Rich Bake Multi-Cereal & High Fiber Toast",
      nameAr: "توست ريتش بيك عالي الألياف والحبوب المتعددة",
      category: "carb",
      caloriesPer100g: 235,
      proteinPer100g: 11.5,
      carbsPer100g: 42.0,
      fatsPer100g: 2.5,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Slice", unitAr: "شريحة توست عالي الألياف", grams: 28 },
        { unitEn: "2 Slices", unitAr: "شريحتين توست حبوب كاملة", grams: 56 },
      ],
    },
    {
      nameEn: "Domty Fit Low-Calorie Toast",
      nameAr: "توست دومتي فيت دايت قليل السعرات والدهون",
      category: "carb",
      caloriesPer100g: 210,
      proteinPer100g: 10.5,
      carbsPer100g: 38.0,
      fatsPer100g: 1.8,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Slice", unitAr: "شريحة توست دومتي فيت", grams: 28 },
        { unitEn: "2 Slices", unitAr: "شريحتين توست دومتي فيت", grams: 56 },
      ],
    },
    {
      nameEn: "Domty Whole Wheat Toast",
      nameAr: "توست دومتي بني حبة كاملة",
      category: "carb",
      caloriesPer100g: 235,
      proteinPer100g: 10.0,
      carbsPer100g: 43.0,
      fatsPer100g: 2.4,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Slice", unitAr: "شريحة توست دومتي بني", grams: 28 },
        { unitEn: "2 Slices", unitAr: "شريحتين توست دومتي بني", grams: 56 },
      ],
    },
    {
      nameEn: "Rich Bake Whole Wheat Tortilla Wrap",
      nameAr: "خبز تورتيلا ريتش بيك قمح كامل (لفائف دايت)",
      category: "carb",
      caloriesPer100g: 280,
      proteinPer100g: 9.0,
      carbsPer100g: 48.0,
      fatsPer100g: 5.5,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Small Wrap", unitAr: "رغيف تورتيلا قمح كامل صغير", grams: 40 },
        { unitEn: "1 Large Wrap", unitAr: "رغيف تورتيلا كبير", grams: 62 },
      ],
    },
    {
      nameEn: "Diet Low-Fat Multi-Grain Tortilla Wrap",
      nameAr: "خبز تورتيلا لايت قليل الدسم والنشويات (دايت راب)",
      category: "carb",
      caloriesPer100g: 228,
      proteinPer100g: 11.0,
      carbsPer100g: 36.0,
      fatsPer100g: 4.0,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Light Wrap", unitAr: "رغيف تورتيلا لايت", grams: 35 },
        { unitEn: "2 Light Wraps", unitAr: "رغيفين تورتيلا لايت", grams: 70 },
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
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Small Potato", unitAr: "حبة بطاطا صغيرة", grams: 120 },
        { unitEn: "1 Medium Potato", unitAr: "حبة بطاطا متوسطة", grams: 200 },
      ],
    },
    {
      nameEn: "Abu Auf Rolled Oats",
      nameAr: "شوفان أبو عوف كامل الحبة",
      category: "carb",
      caloriesPer100g: 375,
      proteinPer100g: 13.5,
      carbsPer100g: 68.0,
      fatsPer100g: 6.5,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق طعام كبيرة", grams: 40 },
        { unitEn: "1 Cup", unitAr: "كوب كامل", grams: 80 },
      ],
    },
    {
      nameEn: "Boiled Potatoes with Cumin",
      nameAr: "بطاطس بلدي مسلوقة ومهروسة بالكمون",
      category: "carb",
      caloriesPer100g: 87,
      proteinPer100g: 1.9,
      carbsPer100g: 20.1,
      fatsPer100g: 0.1,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Potato", unitAr: "حبة بطاطس متوسطة", grams: 150 },
      ],
    },
    {
      nameEn: "Egyptian Brown Bulgur (Burgul)",
      nameAr: "برغل خشن بلدي مطبوخ",
      category: "carb",
      caloriesPer100g: 83,
      proteinPer100g: 3.1,
      carbsPer100g: 18.6,
      fatsPer100g: 0.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق طعام كبيرة", grams: 100 },
      ],
    },
    {
      nameEn: "Egyptian Green Freekeh",
      nameAr: "فريك بلدي مطبوخ بالبصل",
      category: "carb",
      caloriesPer100g: 145,
      proteinPer100g: 5.5,
      carbsPer100g: 27.0,
      fatsPer100g: 1.8,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق كبيرة", grams: 100 },
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
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق طعام كبيرة", grams: 100 },
      ],
    },
    {
      nameEn: "Egyptian White Rice with Vermicelli",
      nameAr: "أرز مصري بالشعرية",
      category: "carb",
      caloriesPer100g: 148,
      proteinPer100g: 2.8,
      carbsPer100g: 28.5,
      fatsPer100g: 2.6,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق كبيرة", grams: 100 },
      ],
    },

    // --- PROTEIN & POULTRY ---
    {
      nameEn: "Grilled Chicken Breast",
      nameAr: "صدور دجاج متبلة مشوية",
      category: "poultry",
      caloriesPer100g: 165,
      proteinPer100g: 31.0,
      carbsPer100g: 0.0,
      fatsPer100g: 3.6,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "1 Medium Palm Breast", unitAr: "قطعة صدر متوسطة بحجم كف اليد", grams: 150 },
      ],
    },
    {
      nameEn: "Shish Tawook (Grilled Chicken Skewers)",
      nameAr: "شيش طاووق صدور فراخ مشوي",
      category: "poultry",
      caloriesPer100g: 145,
      proteinPer100g: 26.5,
      carbsPer100g: 2.0,
      fatsPer100g: 3.5,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "1 Skewer", unitAr: "سيخ شيش طاووق", grams: 100 },
        { unitEn: "2 Skewers", unitAr: "سيخين شيش طاووق", grams: 200 },
      ],
    },
    {
      nameEn: "Grilled Beef Kofta",
      nameAr: "كفتة حاتي مشوية على الفحم",
      category: "protein",
      caloriesPer100g: 220,
      proteinPer100g: 24.0,
      carbsPer100g: 4.0,
      fatsPer100g: 12.0,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "3 Medium Fingers", unitAr: "٣ صوابع كفتة مشوية", grams: 150 },
      ],
    },

    // --- HEALTHY COLD CUTS ---
    {
      nameEn: "Americana Smoked Turkey Breast Deli Slices",
      nameAr: "صدور ديك رومي مدخن أمريكانا (لانشون رومي صحي)",
      category: "cold_cut",
      caloriesPer100g: 105,
      proteinPer100g: 21.5,
      carbsPer100g: 1.5,
      fatsPer100g: 1.2,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "2 Slices", unitAr: "شريحتين رومي مدخن", grams: 50 },
        { unitEn: "4 Slices", unitAr: "٤ شرائح رومي مدخن", grams: 100 },
      ],
    },
    {
      nameEn: "Americana Roast Beef Lean Deli Slices",
      nameAr: "روست بيف بقري أمريكانا شرائح رفيعة",
      category: "cold_cut",
      caloriesPer100g: 125,
      proteinPer100g: 22.0,
      carbsPer100g: 1.0,
      fatsPer100g: 3.5,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "2 Slices", unitAr: "شريحتين روست بيف", grams: 50 },
      ],
    },
    {
      nameEn: "Halwani Smoked Chicken Breast Slices",
      nameAr: "صدور دجاج مدخنة حلواني إخوان شرائح",
      category: "cold_cut",
      caloriesPer100g: 110,
      proteinPer100g: 21.0,
      carbsPer100g: 1.8,
      fatsPer100g: 1.8,
      isFastingFriendly: false,
      householdPortions: [
        { unitEn: "2 Slices", unitAr: "شريحتين صدور دجاج مدخن", grams: 50 },
      ],
    },

    // --- SEAFOOD ---
    {
      nameEn: "Grilled Tilapia Fish (Samak Bolti)",
      nameAr: "سمك بلطي مشوي بالردة والليمون",
      category: "seafood",
      caloriesPer100g: 118,
      proteinPer100g: 23.0,
      carbsPer100g: 1.0,
      fatsPer100g: 2.4,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Whole Fish", unitAr: "سمكة بلطي كاملة", grams: 220 },
      ],
    },
    {
      nameEn: "Grilled Mullet Fish (Bouri)",
      nameAr: "سمك بوري مشوي بالزيت والليمون",
      category: "seafood",
      caloriesPer100g: 145,
      proteinPer100g: 20.0,
      carbsPer100g: 0.0,
      fatsPer100g: 7.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Fish", unitAr: "سمكة بوري متوسطة", grams: 250 },
      ],
    },
    {
      nameEn: "Grilled Fresh Shrimp",
      nameAr: "جمبري بلدي مشوي مقشر",
      category: "seafood",
      caloriesPer100g: 99,
      proteinPer100g: 24.0,
      carbsPer100g: 0.2,
      fatsPer100g: 0.3,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "6 Large Shrimp", unitAr: "٦ حبات جمبري كبير", grams: 120 },
      ],
    },

    // --- HEALTHY CANNED FOODS ---
    {
      nameEn: "Sunshine Canned Tuna in Water",
      nameAr: "تونة صن شاين قطع لايت بالماء والملح",
      category: "canned",
      caloriesPer100g: 116,
      proteinPer100g: 26.0,
      carbsPer100g: 0.0,
      fatsPer100g: 1.0,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Drained Can", unitAr: "علبة مصفاة واحدة", grams: 140 },
        { unitEn: "1/2 Can", unitAr: "نصف علبة", grams: 70 },
      ],
    },
    {
      nameEn: "Canned Red Kidney Beans (Drained)",
      nameAr: "فاصوليا حمراء معلبة مغسولة ومصفاة",
      category: "canned",
      caloriesPer100g: 127,
      proteinPer100g: 8.7,
      carbsPer100g: 22.8,
      fatsPer100g: 0.5,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1/2 Cup (4 Tbsp)", unitAr: "نصف كوب (٤ ملاعق كبيرة)", grams: 130 },
      ],
    },
    {
      nameEn: "Canned Chickpeas / Hommos (Drained)",
      nameAr: "حمص حب معلب مغسول ومصفى",
      category: "canned",
      caloriesPer100g: 139,
      proteinPer100g: 7.0,
      carbsPer100g: 23.0,
      fatsPer100g: 2.1,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1/2 Cup", unitAr: "نصف كوب", grams: 120 },
      ],
    },

    // --- COPTIC CHRISTIAN FASTING STAPLES ---
    {
      nameEn: "Ful Medames with Olive Oil",
      nameAr: "فول بالزيت الزيتون والليمون",
      category: "staple",
      caloriesPer100g: 155,
      proteinPer100g: 7.0,
      carbsPer100g: 18.0,
      fatsPer100g: 6.5,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "4 Tablespoons", unitAr: "٤ ملاعق طعام كبيرة", grams: 125 },
      ],
    },
    {
      nameEn: "Egyptian Besarah (Fava Beans & Herbs)",
      nameAr: "بصارة مصرية بالفول المدشوش والملوخية والنعناع (صيامي)",
      category: "protein",
      caloriesPer100g: 105,
      proteinPer100g: 6.8,
      carbsPer100g: 16.2,
      fatsPer100g: 1.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Bowl", unitAr: "طبق بصارة متوسط", grams: 220 },
      ],
    },
    {
      nameEn: "Egyptian Termes / Lupini Beans (Boiled)",
      nameAr: "ترمس بلدي مسلوق بالليمون والكمون (سناك بروتين صيامي)",
      category: "protein",
      caloriesPer100g: 119,
      proteinPer100g: 15.6,
      carbsPer100g: 9.9,
      fatsPer100g: 2.9,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Small Cup", unitAr: "كوب ترمس مسلوق صغير", grams: 100 },
      ],
    },

    // --- VEGETABLES & FIBERS ---
    {
      nameEn: "Traditional Egyptian Green Salad",
      nameAr: "سلطة بلدي خضراء بالخيار والليمون",
      category: "vegetable",
      caloriesPer100g: 25,
      proteinPer100g: 1.2,
      carbsPer100g: 4.5,
      fatsPer100g: 0.3,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Bowl", unitAr: "طبق سلطة متوسط", grams: 150 },
      ],
    },
    {
      nameEn: "Egyptian Molokhia (Cooked)",
      nameAr: "ملوخية خضراء مصرية مطبوخة",
      category: "vegetable",
      caloriesPer100g: 45,
      proteinPer100g: 3.1,
      carbsPer100g: 6.5,
      fatsPer100g: 1.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Ladle", unitAr: "مغرفة متوسطة", grams: 150 },
      ],
    },
    {
      nameEn: "Steamed Fresh Broccoli",
      nameAr: "بروكلي طازج على البخار",
      category: "vegetable",
      caloriesPer100g: 35,
      proteinPer100g: 2.8,
      carbsPer100g: 7.0,
      fatsPer100g: 0.4,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Cup Florets", unitAr: "كوب زهرات بروكلي", grams: 100 },
      ],
    },
    {
      nameEn: "Sautéed Zucchini (Kousa)",
      nameAr: "كوسة سوتيه خفيفة بالثوم والكمون",
      category: "vegetable",
      caloriesPer100g: 30,
      proteinPer100g: 1.5,
      carbsPer100g: 4.8,
      fatsPer100g: 0.8,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Cup Slices", unitAr: "كوب شرائح كوسة", grams: 150 },
      ],
    },

    // --- FRESH FRUITS ---
    {
      nameEn: "Egyptian Banana",
      nameAr: "موز بلدي طازج",
      category: "fruit",
      caloriesPer100g: 89,
      proteinPer100g: 1.1,
      carbsPer100g: 22.8,
      fatsPer100g: 0.3,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Banana", unitAr: "ثمرة موزة متوسطة", grams: 120 },
      ],
    },
    {
      nameEn: "Fresh Apple",
      nameAr: "تفاح طازج",
      category: "fruit",
      caloriesPer100g: 52,
      proteinPer100g: 0.3,
      carbsPer100g: 13.8,
      fatsPer100g: 0.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Medium Apple", unitAr: "تفاحة متوسطة واحدة", grams: 160 },
      ],
    },
    {
      nameEn: "Egyptian Summer Watermelon",
      nameAr: "بطيخ أحمر صيفي بلدي",
      category: "fruit",
      caloriesPer100g: 30,
      proteinPer100g: 0.6,
      carbsPer100g: 7.6,
      fatsPer100g: 0.2,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Triangular Wedge", unitAr: "شريحة بطيخ مثلثة", grams: 250 },
      ],
    },
    {
      nameEn: "Fresh Strawberries",
      nameAr: "فراولة طازجة بلدي",
      category: "fruit",
      caloriesPer100g: 32,
      proteinPer100g: 0.7,
      carbsPer100g: 7.7,
      fatsPer100g: 0.3,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "1 Cup Whole Berries", unitAr: "كوب فراولة كاملة", grams: 150 },
      ],
    },
    {
      nameEn: "Egyptian Fresh Dates (Balah)",
      nameAr: "بلح رطب أمهات طازج",
      category: "fruit",
      caloriesPer100g: 142,
      proteinPer100g: 1.5,
      carbsPer100g: 37.0,
      fatsPer100g: 0.3,
      isFastingFriendly: true,
      householdPortions: [
        { unitEn: "3 Fresh Dates", unitAr: "٣ تمرات / بلحات طازجة", grams: 60 },
      ],
    },
  ];

  // Day macro totals
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
  const handleApplySwap = (swapItemResult: any) => {
    if (!swappingItem) return;
    const replacement = swapItemResult.targetFood;

    const updatedGrams = swapItemResult.replacementGrams;
    const updatedHouseholdEn = swapItemResult.nearestHouseholdPortion
      ? `${swapItemResult.nearestHouseholdPortion.count}x ${swapItemResult.nearestHouseholdPortion.unitEn}`
      : `${updatedGrams}g`;
    const updatedHouseholdAr = swapItemResult.nearestHouseholdPortion
      ? `${swapItemResult.nearestHouseholdPortion.count} ${swapItemResult.nearestHouseholdPortion.unitAr}`
      : `${updatedGrams} جم`;

    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== swappingItem.mealId) return m;
        return {
          ...m,
          items: m.items.map((i) => {
            if (i.id !== swappingItem.item.id) return i;
            return {
              ...i,
              foodNameEn: replacement.nameEn,
              foodNameAr: replacement.nameAr || replacement.nameEn,
              category: replacement.category,
              grams: updatedGrams,
              householdUnitEn: updatedHouseholdEn,
              householdUnitAr: updatedHouseholdAr,
              caloriesPer100g: replacement.caloriesPer100g,
              proteinPer100g: replacement.proteinPer100g,
              carbsPer100g: replacement.carbsPer100g,
              fatsPer100g: replacement.fatsPer100g,
            };
          }),
        };
      })
    );

    setSwappingItem(null);
  };

  // Determine current meal item names to enforce no duplicate rule
  const currentMealObj = swappingItem ? meals.find((m) => m.id === swappingItem.mealId) : null;
  const currentMealFoodNames = currentMealObj ? currentMealObj.items.map((i) => i.foodNameEn) : [];

  // Compute paginated alternatives
  const paginatedSwaps = swappingItem
    ? findPaginatedIngredientSwaps({
        sourceFood: {
          nameEn: swappingItem.item.foodNameEn,
          category: swappingItem.item.category,
          caloriesPer100g: swappingItem.item.caloriesPer100g,
          proteinPer100g: swappingItem.item.proteinPer100g,
          carbsPer100g: swappingItem.item.carbsPer100g,
          fatsPer100g: swappingItem.item.fatsPer100g,
        },
        sourceGrams: swappingItem.item.grams,
        candidates: allCandidates,
        currentMealFoodNames,
        isChristianFasting: userDietary.isChristianFasting,
        fastingSeafoodAllowed: userDietary.fastingSeafoodAllowed,
        userAllergies: userDietary.allergies,
        dislikedFoods: userDietary.dislikedFoods,
        offset: 0,
        limit: swapDisplayLimit,
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Cadence & Check-In Action Banner */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>{isAr ? "دورة الخطة الغذائية وجدول الأيام" : "Active Cadence & Schedule"}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isAr ? "خطة الوجبات اليومية والتبديل الذكي" : "Daily Meal Plan & 1-Click Swaps"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "تبديل المكونات يضمن نفس الماكروز بنسبة ±5% من نفس نوع الطعام بدون تكرار."
                : "1-Click Swaps guarantee strict ±5% macro matching of the same food type without repeats."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Check-In Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isAr ? "المراجعة الدورية (Check-In)" : "Periodic Check-In"}</span>
            </button>

            {/* Grocery List Quick Open */}
            {onOpenGroceryList && (
              <button
                type="button"
                onClick={onOpenGroceryList}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "قائمة المشتريات" : "Grocery List"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Cadence Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl border border-border">
            {[
              { id: "weekly", labelEn: "Weekly (7d)", labelAr: "أسبوعي (٧ أيام)" },
              { id: "biweekly", labelEn: "Bi-Weekly (14d)", labelAr: "أسبوعين (١٤ يوم)" },
              { id: "monthly", labelEn: "Monthly (28d)", labelAr: "شهري (٢٨ يوم)" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCadence(c.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cadence === c.id
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? c.labelAr : c.labelEn}
              </button>
            ))}
          </div>

          {/* Active Fasting Flag indicator */}
          {userDietary.isChristianFasting && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAr ? "نظام الصيام المسيحي مفعّل" : "Christian Fasting Active"} (
                {userDietary.fastingSeafoodAllowed ? (isAr ? "أسماك مسموحة" : "Fish Allowed") : (isAr ? "نباتي فقط" : "Strict Vegan")}
                )
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Macro Progress Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-muted-foreground block">{isAr ? "السعرات اليومية" : "Total Calories"}</span>
          <span className="text-xl font-black text-foreground">{totalCalories}</span>
          <span className="text-[10px] text-muted-foreground block">kcal</span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-muted-foreground block">{isAr ? "البروتين" : "Protein"}</span>
          <span className="text-xl font-black text-primary">{Math.round(totalProtein)}g</span>
          <span className="text-[10px] text-muted-foreground block">{isAr ? "هدف البناء" : "Target"}</span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-muted-foreground block">{isAr ? "الكربوهيدرات" : "Carbohydrates"}</span>
          <span className="text-xl font-black text-foreground">{Math.round(totalCarbs)}g</span>
          <span className="text-[10px] text-muted-foreground block">{isAr ? "طاقة متوازنة" : "Energy"}</span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs text-center">
          <span className="text-[11px] font-bold text-muted-foreground block">{isAr ? "الدهون الصحية" : "Healthy Fats"}</span>
          <span className="text-xl font-black text-foreground">{Math.round(totalFats)}g</span>
          <span className="text-[10px] text-muted-foreground block">{isAr ? "هرمونات وصحة" : "Hormones"}</span>
        </div>
      </div>

      {/* Diet-Friendly Sauces & Flavor Tricks (Hints / Not strictly calculated by grams) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {isAr ? "نكهات وصوصات الدايت الذكية (بدون حساب بالجرام)" : "Smart Diet Sauces & Flavor Tricks (Free Add-Ons)"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {isAr ? "إضافات مسموحة" : "Zero Guilt"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "أسرار تتبيل وصوصات قليلة أو معدومة السعرات تمنح وجبات الدايت طعماً شهياً بدون أن تكسر نظامك."
                  : "Low/zero-calorie flavor tricks & sauces to keep diet meals delicious without breaking your targets."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSauceHints(!showSauceHints)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground transition-all shadow-xs shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{showSauceHints ? (isAr ? "إخفاء النكهات" : "Hide Tricks") : (isAr ? "عرض أسرار النكهات (٧ أسرار)" : "Explore Flavor Tricks (7)")}</span>
            {showSauceHints ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>

        {/* Expandable Flavor Hacks Grid */}
        {showSauceHints && (
          <div className="space-y-4 pt-3 border-t border-border/60 animate-fade-in">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "all", labelAr: "كل النكهات", labelEn: "All Flavors" },
                { id: "zero_cal", labelAr: "معدومة السعرات / دهون صفر", labelEn: "Zero Fat / Low Cal" },
                { id: "low_fat_sauce", labelAr: "صوصات دايت وبروتين", labelEn: "High-Protein Dips" },
                { id: "flavor_hack", labelAr: "خدع التتبيل المصرية", labelEn: "Egyptian Flavor Hacks" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedSauceFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    selectedSauceFilter === f.id
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DIET_SAUCES_AND_FLAVOR_TRICKS.filter((s) => selectedSauceFilter === "all" || s.category === selectedSauceFilter).map((sauce) => (
                <div
                  key={sauce.id}
                  className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-2 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? sauce.nameAr : sauce.nameEn}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {isAr ? sauce.tagAr : sauce.tagEn}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {isAr ? sauce.caloriesDescAr : sauce.caloriesDescEn}
                  </p>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{isAr ? "طريقة الاستخدام: " : "How to use: "}</strong>
                    {isAr ? sauce.recipeTipAr : sauce.recipeTipEn}
                  </p>

                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="font-semibold text-foreground">{isAr ? "ممتاز مع: " : "Best with: "}</span>
                    {isAr ? sauce.bestWithAr : sauce.bestWithEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meals List */}
      <div className="space-y-6">
        {meals.map((meal) => {
          const mealCalories = meal.items.reduce((s, i) => s + Math.round((i.caloriesPer100g * i.grams) / 100), 0);
          const mealProtein = Math.round(meal.items.reduce((s, i) => s + (i.proteinPer100g * i.grams) / 100, 0));

          return (
            <div key={meal.id} className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-base text-foreground">
                    {isAr ? meal.nameAr : meal.nameEn}
                  </h3>
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground">
                  {mealCalories} kcal • {mealProtein}g P
                </div>
              </div>

              {/* Meal Items */}
              <div className="space-y-2.5">
                {meal.items.map((item) => {
                  const itemCal = Math.round((item.caloriesPer100g * item.grams) / 100);
                  const itemProtein = Math.round((item.proteinPer100g * item.grams) / 100);
                  const itemCarbs = Math.round((item.carbsPer100g * item.grams) / 100);

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
                          onClick={() => handleOpenSwap(meal.id, item)}
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

      {/* 1-Click Swap Interactive Modal with Strict Same-Type, No-Duplicates & Pagination */}
      {swappingItem && paginatedSwaps && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-lg w-full p-6 sm:p-7 rounded-3xl shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSwappingItem(null)}
              className="absolute top-5 end-5 p-1 rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "محرك التبديل الذكي (±5% من نفس النوع)" : "Smart Same-Type Swap Engine (±5%)"}</span>
              </div>
              <h3 className="text-lg font-bold">
                {isAr ? "اختر البديل الغذائي المماثل:" : "Choose Same-Type Food Replacement:"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr ? "تبديل:" : "Swapping:"}{" "}
                <strong className="text-foreground">
                  {swappingItem.item.grams}g {isAr ? swappingItem.item.foodNameAr : swappingItem.item.foodNameEn}
                </strong>{" "}
                <span className="text-primary font-bold">
                  ({isAr ? "لا يكرر أطعمة الوجبة" : "No duplicates in current meal"})
                </span>
              </p>
            </div>

            {/* Replacements List */}
            <div className="space-y-3">
              {paginatedSwaps.items.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                  {isAr
                    ? "لا توجد بدائل إضافية مطابقة تماماً لنفس النوع والماكروز في هذه الوجبة."
                    : "No further same-type alternatives match this meal's exact macros."}
                </div>
              ) : (
                paginatedSwaps.items.map((swapResult, idx) => {
                  const candidate = swapResult.targetFood!;
                  return (
                    <div
                      key={candidate.nameEn + idx}
                      className="p-4 rounded-2xl bg-background border border-border/80 flex items-center justify-between gap-3 hover:border-primary transition-all"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">
                          {isAr ? candidate.nameAr || candidate.nameEn : candidate.nameEn}
                        </div>
                        <div className="text-xs text-primary font-bold">
                          {swapResult.replacementGrams}g{" "}
                          {swapResult.nearestHouseholdPortion && (
                            <span className="text-muted-foreground font-normal">
                              ({isAr ? `${swapResult.nearestHouseholdPortion.count} ${swapResult.nearestHouseholdPortion.unitAr}` : `${swapResult.nearestHouseholdPortion.count}x ${swapResult.nearestHouseholdPortion.unitEn}`})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {swapResult.replacementMacros.calories} kcal • {swapResult.replacementMacros.proteinG}g P • {swapResult.replacementMacros.carbsG}g C
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplySwap(swapResult)}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAr ? "تطبيق" : "Apply"}</span>
                      </button>
                    </div>
                  );
                })
              )}

              {/* Load More Button (Loads next 5 until finished) */}
              {paginatedSwaps.hasMore && (
                <button
                  type="button"
                  onClick={() => setSwapDisplayLimit((prev) => prev + 5)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>
                    {isAr
                      ? `عرض 5 بدائل إضافية (متبقي ${paginatedSwaps.totalAvailable - swapDisplayLimit} بدائل)`
                      : `Show 5 More Alternatives (${paginatedSwaps.totalAvailable - swapDisplayLimit} remaining)`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Periodic Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onPlanUpdated={(newCals) => {
          // Proportionally scale meal grams if plan is calibrated
          const factor = newCals / totalCalories;
          setMeals((prev) =>
            prev.map((m) => ({
              ...m,
              items: m.items.map((i) => ({
                ...i,
                grams: Math.round(i.grams * factor),
              })),
            }))
          );
        }}
      />
    </div>
  );
}
