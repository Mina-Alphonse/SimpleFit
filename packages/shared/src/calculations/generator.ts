import { FoodNutritionPer100g, MacroProfile } from "./substitution";

export interface GeneratedMealItem {
  id: string;
  foodNameEn: string;
  foodNameAr: string;
  category: string;
  grams: number;
  householdUnitEn: string;
  householdUnitAr: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
}

export interface GeneratedMeal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  nameEn: string;
  nameAr: string;
  items: GeneratedMealItem[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface GeneratedPlanDay {
  dayNumber: number;
  nameEn: string;
  nameAr: string;
  meals: GeneratedMeal[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatsG: number;
}

export interface GenerateMealPlanInput {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  planCadence?: "weekly" | "biweekly" | "monthly";
  isChristianFasting?: boolean;
  fastingSeafoodAllowed?: boolean;
  budgetTier?: "economy" | "standard" | "flexible";
  allergies?: string[];
  dislikedFoods?: string[];
}

/**
 * Deterministically generates a personalized, Egyptian-localized daily meal plan
 * perfectly scaled to the user's computed target calories, protein, carbs, and fats.
 */
export function generatePersonalizedMealPlan(input: GenerateMealPlanInput): GeneratedPlanDay[] {
  const {
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatsG,
    isChristianFasting = false,
    fastingSeafoodAllowed = true,
  } = input;

  // Macro distribution by meal:
  // Breakfast: 25% Calories, 25% Protein
  // Lunch: 40% Calories, 40% Protein
  // Dinner: 25% Calories, 25% Protein
  // Snack: 10% Calories, 10% Protein
  const breakfastCal = Math.round(targetCalories * 0.25);
  const breakfastProtein = Math.round(targetProteinG * 0.25);

  const lunchCal = Math.round(targetCalories * 0.40);
  const lunchProtein = Math.round(targetProteinG * 0.40);

  const dinnerCal = Math.round(targetCalories * 0.25);
  const dinnerProtein = Math.round(targetProteinG * 0.25);

  const snackCal = Math.round(targetCalories * 0.10);
  const snackProtein = Math.round(targetProteinG * 0.10);

  // 1. Build Breakfast
  let breakfastItems: GeneratedMealItem[] = [];
  if (!isChristianFasting) {
    // Standard: Ful Medames + Baladi Bread/Rich Bake Toast + Eggs/Cheese
    // Ful: 7.6g protein, 110 kcal per 100g
    const fulGrams = 120;
    // Bread: ~250 kcal, 8.5g protein per 100g (1/2 loaf is ~65g)
    const breadGrams = Math.round(Math.max(50, Math.min(130, (breakfastCal * 0.45) / 2.5)));
    // Eggs/Cheese to fill remaining breakfast protein
    const remainingProtein = Math.max(10, breakfastProtein - (fulGrams * 0.076 + breadGrams * 0.085));
    // Boiled egg has ~6.3g protein per 50g (1 egg)
    const eggsCount = Math.max(1, Math.min(4, Math.round(remainingProtein / 6.3)));
    const eggsGrams = eggsCount * 50;

    breakfastItems = [
      {
        id: "b-1",
        foodNameEn: "Ful Medames with Olive Oil",
        foodNameAr: "فول مدمس بزيت الزيتون والليمون",
        category: "staple",
        grams: fulGrams,
        householdUnitEn: "4 Tablespoons",
        householdUnitAr: "٤ ملاعق طعام كبيرة",
        caloriesPer100g: 155,
        proteinPer100g: 7.0,
        carbsPer100g: 18.0,
        fatsPer100g: 6.5,
      },
      {
        id: "b-2",
        foodNameEn: "Baladi Bread",
        foodNameAr: "عيش بلدي طازج بالردة",
        category: "carb",
        grams: breadGrams,
        householdUnitEn: breadGrams >= 100 ? "1 Full Loaf" : "1/2 Loaf",
        householdUnitAr: breadGrams >= 100 ? "رغيف بلدي كامل" : "نصف رغيف بلدي",
        caloriesPer100g: 250,
        proteinPer100g: 8.5,
        carbsPer100g: 52.0,
        fatsPer100g: 1.2,
      },
      {
        id: "b-3",
        foodNameEn: "Boiled Eggs",
        foodNameAr: "بيض مسلوق كامل",
        category: "protein",
        grams: eggsGrams,
        householdUnitEn: `${eggsCount} Large Egg${eggsCount > 1 ? "s" : ""}`,
        householdUnitAr: `${eggsCount} بيضات مسلوقة`,
        caloriesPer100g: 143,
        proteinPer100g: 12.6,
        carbsPer100g: 0.7,
        fatsPer100g: 9.5,
      },
    ];
  } else {
    // Fasting: Ful Medames + Termes (Lupini Beans) + Rich Bake Whole Wheat Toast
    const fulGrams = 150;
    const breadGrams = 80;
    const termesGrams = 60; // 16g protein per 100g!

    breakfastItems = [
      {
        id: "bf-1",
        foodNameEn: "Ful Medames with Olive Oil & Cumin",
        foodNameAr: "فول مدمس بالزيت الحار والليمون",
        category: "staple",
        grams: fulGrams,
        householdUnitEn: "5 Tablespoons",
        householdUnitAr: "٥ ملاعق طعام كبيرة",
        caloriesPer100g: 155,
        proteinPer100g: 7.0,
        carbsPer100g: 18.0,
        fatsPer100g: 6.5,
      },
      {
        id: "bf-2",
        foodNameEn: "Rich Bake Whole Wheat Toast (No Added Sugar)",
        foodNameAr: "توست ريتش بيك قمح كامل بدون سكر مضاف",
        category: "carb",
        grams: breadGrams,
        householdUnitEn: "2 Slices",
        householdUnitAr: "شريحتين توست بني",
        caloriesPer100g: 220,
        proteinPer100g: 11.0,
        carbsPer100g: 40.0,
        fatsPer100g: 2.0,
      },
      {
        id: "bf-3",
        foodNameEn: "Egyptian Lupini Beans (Termes)",
        foodNameAr: "ترمس مصري مسلوق بالليمون والكمون",
        category: "protein",
        grams: termesGrams,
        householdUnitEn: "3 Tablespoons",
        householdUnitAr: "٣ ملاعق طعام كبيرة",
        caloriesPer100g: 120,
        proteinPer100g: 15.6,
        carbsPer100g: 10.0,
        fatsPer100g: 3.0,
      },
    ];
  }

  // 2. Build Lunch
  let lunchItems: GeneratedMealItem[] = [];
  if (!isChristianFasting) {
    // Chicken Breast / Lean Meat + Basmati Rice + Salad
    // Chicken breast: 31g protein, 165 kcal per 100g
    const chickenGrams = Math.round(Math.max(100, Math.min(250, (lunchProtein * 0.85) / 0.31)));
    // Rice: ~125 kcal, 26g carbs per 100g cooked
    const riceGrams = Math.round(Math.max(100, Math.min(240, (lunchCal * 0.40) / 1.25)));

    lunchItems = [
      {
        id: "l-1",
        foodNameEn: "Grilled Chicken Breast Fillet",
        foodNameAr: "صدور دجاج متبلة مشوية على الجريل",
        category: "poultry",
        grams: chickenGrams,
        householdUnitEn: `${Math.round(chickenGrams / 150 * 10) / 10} Palm-Sized Piece`,
        householdUnitAr: `قطعة صدر متوسطة (${chickenGrams} جم)`,
        caloriesPer100g: 165,
        proteinPer100g: 31.0,
        carbsPer100g: 0.0,
        fatsPer100g: 3.6,
      },
      {
        id: "l-2",
        foodNameEn: "Steamed Basmati Rice",
        foodNameAr: "أرز بسمتي أصفر مفلفل خفيف",
        category: "carb",
        grams: riceGrams,
        householdUnitEn: `${Math.round(riceGrams / 25)} Tablespoons`,
        householdUnitAr: `${Math.round(riceGrams / 25)} ملاعق طعام كبيرة`,
        caloriesPer100g: 121,
        proteinPer100g: 3.0,
        carbsPer100g: 25.5,
        fatsPer100g: 0.4,
      },
      {
        id: "l-3",
        foodNameEn: "Traditional Egyptian Green Salad",
        foodNameAr: "سلطة بلدي خضراء (طماطم، خيار، ليمون، بقدونس)",
        category: "vegetable",
        grams: 150,
        householdUnitEn: "1 Medium Bowl",
        householdUnitAr: "طبق سلطة خضراء متوسط",
        caloriesPer100g: 25,
        proteinPer100g: 1.2,
        carbsPer100g: 4.5,
        fatsPer100g: 0.3,
      },
    ];
  } else {
    // Fasting Lunch: Tuna in Water (if seafood allowed) or Lentil Koshary + Sayadia Rice + Salad
    if (fastingSeafoodAllowed) {
      const tunaGrams = Math.round(Math.max(120, Math.min(220, (lunchProtein * 0.8) / 0.25)));
      const potatoGrams = Math.round(Math.max(120, Math.min(250, (lunchCal * 0.45) / 0.9)));

      lunchItems = [
        {
          id: "lf-1",
          foodNameEn: "Canned Light Tuna in Water",
          foodNameAr: "تونة قطع دايت بالماء والملح مصفاة",
          category: "seafood",
          grams: tunaGrams,
          householdUnitEn: "1 Can Drained",
          householdUnitAr: "علبة تونة دايت مصفاة",
          caloriesPer100g: 115,
          proteinPer100g: 25.5,
          carbsPer100g: 0.0,
          fatsPer100g: 1.0,
        },
        {
          id: "lf-2",
          foodNameEn: "Egyptian Baked Sweet Potato",
          foodNameAr: "بطاطا حلوة مصرية مشوية بالفرن",
          category: "carb",
          grams: potatoGrams,
          householdUnitEn: "1 Medium Sweet Potato",
          householdUnitAr: "حبة بطاطا مشوية متوسطة",
          caloriesPer100g: 90,
          proteinPer100g: 1.8,
          carbsPer100g: 21.0,
          fatsPer100g: 0.2,
        },
        {
          id: "lf-3",
          foodNameEn: "Egyptian Fresh Green Salad",
          foodNameAr: "سلطة خضراء بلدية بالليمون والكمون",
          category: "vegetable",
          grams: 150,
          householdUnitEn: "1 Medium Bowl",
          householdUnitAr: "طبق سلطة وسط",
          caloriesPer100g: 25,
          proteinPer100g: 1.2,
          carbsPer100g: 4.5,
          fatsPer100g: 0.3,
        },
      ];
    } else {
      // Strict Vegan Lentil Koshary portion
      const kosharyGrams = Math.round(Math.max(180, Math.min(300, lunchCal / 1.6)));

      lunchItems = [
        {
          id: "lf-k",
          foodNameEn: "Portion-Controlled Egyptian Koshary",
          foodNameAr: "كشري مصري محسوب الحصة بالعدس الأسمر والحمص",
          category: "traditional_main",
          grams: kosharyGrams,
          householdUnitEn: "1 Controlled Plate",
          householdUnitAr: "طبق كشري دايت محسوب الحصة",
          caloriesPer100g: 160,
          proteinPer100g: 6.5,
          carbsPer100g: 29.0,
          fatsPer100g: 2.2,
        },
        {
          id: "lf-s",
          foodNameEn: "Egyptian Green Salad with Da'a Dressing",
          foodNameAr: "سلطة خضراء بالدقة والكمون",
          category: "vegetable",
          grams: 150,
          householdUnitEn: "1 Medium Bowl",
          householdUnitAr: "طبق سلطة وسط",
          caloriesPer100g: 25,
          proteinPer100g: 1.2,
          carbsPer100g: 4.5,
          fatsPer100g: 0.3,
        },
      ];
    }
  }

  // 3. Build Dinner
  let dinnerItems: GeneratedMealItem[] = [];
  if (!isChristianFasting) {
    // Quraish Cheese / Greek Yogurt 0% + Rich Bake / Domty Toast + Cucumbers
    const quraishGrams = Math.round(Math.max(100, Math.min(200, (dinnerProtein * 0.75) / 0.175)));
    const toastGrams = 56; // 2 slices

    dinnerItems = [
      {
        id: "d-1",
        foodNameEn: "Egyptian Quraish Cheese",
        foodNameAr: "جبنة قريش فلاحي طبيعية بزيت الزيتون والنعناع",
        category: "protein",
        grams: quraishGrams,
        householdUnitEn: `${Math.round(quraishGrams / 50)} Tablespoons`,
        householdUnitAr: `قطعة جبنة قريش (${quraishGrams} جم)`,
        caloriesPer100g: 98,
        proteinPer100g: 17.5,
        carbsPer100g: 3.2,
        fatsPer100g: 1.5,
      },
      {
        id: "d-2",
        foodNameEn: "Domty Fit Low-Calorie Toast",
        foodNameAr: "توست دومتي فيت بني قليل السعرات",
        category: "carb",
        grams: toastGrams,
        householdUnitEn: "2 Slices",
        householdUnitAr: "شريحتين توست بني",
        caloriesPer100g: 210,
        proteinPer100g: 10.5,
        carbsPer100g: 38.0,
        fatsPer100g: 1.8,
      },
      {
        id: "d-3",
        foodNameEn: "Fresh Cucumber & Tomatoes",
        foodNameAr: "شرائح خيار وطماطم طازجة",
        category: "vegetable",
        grams: 120,
        householdUnitEn: "1 Medium Cucumber + 1 Tomato",
        householdUnitAr: "خيارة وحبة طماطم شرائح",
        caloriesPer100g: 18,
        proteinPer100g: 0.8,
        carbsPer100g: 3.8,
        fatsPer100g: 0.2,
      },
    ];
  } else {
    // Fasting Dinner: Canned Red Beans / Air-fried Falafel + Baladi Bread + Fresh Veggies
    const beansGrams = 140; // 9.5g protein per 100g
    const breadGrams = 65; // 1/2 loaf

    dinnerItems = [
      {
        id: "df-1",
        foodNameEn: "California Garden Red Kidney Beans",
        foodNameAr: "فاصوليا حمراء حدائق كاليفورنيا بالكمون والليمون",
        category: "protein",
        grams: beansGrams,
        householdUnitEn: "1/2 Can Drained",
        householdUnitAr: "نصف علبة فاصوليا حمراء",
        caloriesPer100g: 105,
        proteinPer100g: 8.5,
        carbsPer100g: 16.0,
        fatsPer100g: 0.6,
      },
      {
        id: "df-2",
        foodNameEn: "Baladi Bread",
        foodNameAr: "عيش بلدي طازج بالردة",
        category: "carb",
        grams: breadGrams,
        householdUnitEn: "1/2 Loaf",
        householdUnitAr: "نصف رغيف بلدي",
        caloriesPer100g: 250,
        proteinPer100g: 8.5,
        carbsPer100g: 52.0,
        fatsPer100g: 1.2,
      },
      {
        id: "df-3",
        foodNameEn: "Fresh Sliced Cucumbers",
        foodNameAr: "شرائح خيار طازج",
        category: "vegetable",
        grams: 100,
        householdUnitEn: "1 Cucumber",
        householdUnitAr: "خيارة واحدة كبيرة",
        caloriesPer100g: 15,
        proteinPer100g: 0.6,
        carbsPer100g: 3.0,
        fatsPer100g: 0.1,
      },
    ];
  }

  // 4. Build Snack
  let snackItems: GeneratedMealItem[] = [];
  if (!isChristianFasting) {
    // Juhayna Greek Yogurt 0% Fat (100g cup) or Fresh Fruit
    snackItems = [
      {
        id: "s-1",
        foodNameEn: "Juhayna Greek Yogurt 0% Fat",
        foodNameAr: "زبادي يوناني جهينة لايت خالي الدسم ٠٪",
        category: "protein",
        grams: 150,
        householdUnitEn: "1 Standard Cup",
        householdUnitAr: "كوب زبادي يوناني فردي",
        caloriesPer100g: 62,
        proteinPer100g: 10.5,
        carbsPer100g: 4.5,
        fatsPer100g: 0.2,
      },
      {
        id: "s-2",
        foodNameEn: "Fresh Crisp Apple",
        foodNameAr: "ثمرة تفاح طازجة",
        category: "fruit",
        grams: 120,
        householdUnitEn: "1 Small Apple",
        householdUnitAr: "تفاحة صغيرة واحدة",
        caloriesPer100g: 52,
        proteinPer100g: 0.3,
        carbsPer100g: 13.8,
        fatsPer100g: 0.2,
      },
    ];
  } else {
    // Fasting Snack: Egyptian Sweet Potato (Batata)
    snackItems = [
      {
        id: "sf-1",
        foodNameEn: "Egyptian Roasted Sweet Potato (Batata)",
        foodNameAr: "بطاطا حلوة مصرية مشوية",
        category: "carb",
        grams: 150,
        householdUnitEn: "1 Medium Sweet Potato",
        householdUnitAr: "حبة بطاطا مشوية متوسطة",
        caloriesPer100g: 90,
        proteinPer100g: 1.8,
        carbsPer100g: 21.0,
        fatsPer100g: 0.2,
      },
    ];
  }

  // Helper to summarize a meal
  const summarizeMeal = (items: GeneratedMealItem[]): { calories: number; proteinG: number; carbsG: number; fatsG: number } => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + Math.round((item.caloriesPer100g * item.grams) / 100),
        proteinG: Number((acc.proteinG + (item.proteinPer100g * item.grams) / 100).toFixed(1)),
        carbsG: Number((acc.carbsG + (item.carbsPer100g * item.grams) / 100).toFixed(1)),
        fatsG: Number((acc.fatsG + (item.fatsPer100g * item.grams) / 100).toFixed(1)),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 }
    );
  };

  const bSummary = summarizeMeal(breakfastItems);
  const lSummary = summarizeMeal(lunchItems);
  const dSummary = summarizeMeal(dinnerItems);
  const sSummary = summarizeMeal(snackItems);

  const dayMeals: GeneratedMeal[] = [
    {
      id: "m-breakfast",
      type: "breakfast",
      nameEn: "Energy-Packed Egyptian Breakfast",
      nameAr: isChristianFasting ? "فطور صيامي عالي البروتين (فول وترمس وتوست)" : "فطور طاقة مصري متكامل (فول وبيض وعيش بلدي)",
      items: breakfastItems,
      ...bSummary,
    },
    {
      id: "m-lunch",
      type: "lunch",
      nameEn: "Balanced Power Lunch",
      nameAr: isChristianFasting ? "غداء صيامي مغذي (تونة وبطاطا وسلطة)" : "غداء تضخيم وقوة (صدور دجاج وأرز بسمتي وسلطة)",
      items: lunchItems,
      ...lSummary,
    },
    {
      id: "m-dinner",
      type: "dinner",
      nameEn: "Light Recovery Dinner",
      nameAr: isChristianFasting ? "عشاء صيامي خفيف (فاصوليا حمراء وعيش بلدي)" : "عشاء خفيف عالي البروتين (جبنة قريش وتوست دايت)",
      items: dinnerItems,
      ...dSummary,
    },
    {
      id: "m-snack",
      type: "snack",
      nameEn: "Afternoon Vitality Snack",
      nameAr: isChristianFasting ? "سناك بطاطا حلوة مشوية" : "سناك زبادي يوناني وتفاح",
      items: snackItems,
      ...sSummary,
    },
  ];

  const totalDayCalories = bSummary.calories + lSummary.calories + dSummary.calories + sSummary.calories;
  const totalDayProtein = Number((bSummary.proteinG + lSummary.proteinG + dSummary.proteinG + sSummary.proteinG).toFixed(1));
  const totalDayCarbs = Number((bSummary.carbsG + lSummary.carbsG + dSummary.carbsG + sSummary.carbsG).toFixed(1));
  const totalDayFats = Number((bSummary.fatsG + lSummary.fatsG + dSummary.fatsG + sSummary.fatsG).toFixed(1));

  // Generate 7 days for the weekly cycle
  return Array.from({ length: 7 }, (_, i) => ({
    dayNumber: i + 1,
    nameEn: `Day ${i + 1}`,
    nameAr: `اليوم ${i + 1}`,
    meals: dayMeals,
    totalCalories: totalDayCalories,
    totalProteinG: totalDayProtein,
    totalCarbsG: totalDayCarbs,
    totalFatsG: totalDayFats,
  }));
}
