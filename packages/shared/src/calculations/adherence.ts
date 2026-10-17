import { CLINICAL_MIN_CALORIES } from "./nutrition";
import type { BiologicalSex } from "../types";

export type DiningOutEventType =
  | "egyptian_grill"        // Mashweyat (Kofta, Kebab, Shish Tawook)
  | "seafood"               // Asmak (Bolti, Bouri, Sayadia)
  | "fast_food"             // Burgers, Fried Chicken, Shawarma
  | "italian_pizza_pasta"   // Pizza, Pasta
  | "oriental_cafe_dessert";// Ahwa, Konafa, Om Ali, Fresh juices

export interface DiningOutBufferInput {
  targetCalories: number;
  dailyProteinG: number;
  bufferKcal?: number; // 600 - 1000 kcal, default 800
  eventType: DiningOutEventType;
  biologicalSex: BiologicalSex;
}

export interface DiningOutBufferPlan {
  eveningBufferKcal: number;
  daytimeAllowanceKcal: number;
  daytimeProteinTargetG: number;
  daytimeCarbsAllowanceG: number;
  daytimeFatsAllowanceG: number;
  orderingTipsEn: string[];
  orderingTipsAr: string[];
}

const DINING_TIPS: Record<DiningOutEventType, { en: string[]; ar: string[] }> = {
  egyptian_grill: {
    en: [
      "Prioritize lean grilled skewers: Shish Tawook (chicken breast) or lean Kofta.",
      "Load up on fresh Baladi Salad (Salata Baladi) with lemon and cumin to fill your stomach first.",
      "Limit Tahini dip to 1–2 tablespoons (~100–150 kcal); dip with fork tines rather than scooping.",
      "Stick to 1/2 loaf of fresh Baladi bread or 4 spoons of rice.",
    ],
    ar: [
      "ركز على المشويات الصحية: شيش طاووق صدور فراخ أو كفتة حاتي مشوية على الفحم.",
      "ابدأ بطبق سلطة بلدي كبير بالليمون والكمون والشطة لتملأ معدتك بالألياف أولاً.",
      "اكتفِ بملعقة أو ملعقتين طحينة كحد أقصى واغمس بالشوكة لتجنب السعرات العالية.",
      "تناول نصف رغيف بلدي فقط أو ٤ ملاعق أرز أبيض.",
    ],
  },
  seafood: {
    en: [
      "Choose charcoal-grilled fish with Singary or Redda preparation (Bolti or Mullet).",
      "Avoid fried seafood (calamari, breaded shrimp) which can double calorie count.",
      "Enjoy Sayadia rice portion-controlled (1/2 cup / 100g max).",
      "Sip clear seafood soup broth; avoid heavy creamy seafood soups.",
    ],
    ar: [
      "اختر السمك المشوي بالردة أو السنجاري (بلطي أو بوري مشوي).",
      "ابتعد تماماً عن المقليات (الجمبري المقلي، الكاليماري بانيه) لتفادي الزيوت المهدرجة.",
      "تناول أرز الصيادية بكمية محسوبة (كوب صغير أو ٤-٥ ملاعق كبيرة).",
      "استمتع بشوربة السي فود المخلية بدون كريمة لباني.",
    ],
  },
  fast_food: {
    en: [
      "Choose grilled chicken burgers or authentic beef shawarma in flat Shami bread.",
      "Skip regular fries; swap with a side salad or share fries with friends.",
      "Switch soda to Diet Cola, Zero Sugar Sprite, or unsweetened iced Karkadeh.",
      "Ask for sauces (mayo, ranch) on the side or swap for mustard / hot sauce.",
    ],
    ar: [
      "اختر ساندوتش برجر فراخ مشوي أو شاورما لحمة في عيش صاج/شامي بدون مايونيز إضافي.",
      "استغنِ عن البطاطس المقلية الفردية أو شاركها مع أصدقائك.",
      "استبدل المشروبات الغازية بكانز دايت أو كركديه مثلج بدون سكر.",
      "اطلب الصوصات الجانبية على جنب أو استبدلها بالمستردة والصلصة الحارة.",
    ],
  },
  italian_pizza_pasta: {
    en: [
      "Choose thin-crust pizza with lean proteins (grilled chicken, bresaola, vegetables).",
      "Stick to tomato-based red sauces (Marinara, Arrabbiata) over heavy cream Alfredo.",
      "Eat 2-3 slices slowly alongside a large leafy greens salad.",
    ],
    ar: [
      "اختر البيتزا ذات العجينة الرفيعة (Thin Crust) مع البروتينات والخضار.",
      "فضل المكرونة بالصلصة الحمراء (طماطم وريحان) وتجنب صلصات الكريمة الثقيلة (ألفريدو).",
      "تناول قطعتين إلى ثلاث قطع ببطء مع طبق سلطة خضراء كبير.",
    ],
  },
  oriental_cafe_dessert: {
    en: [
      "If having Egyptian sweets (Konafa, Basbousa), limit to a 2-finger portion (75g).",
      "Order Turkish coffee (Ahwa Sada / Mazboot) or green tea with mint without refined sugar.",
      "Opt for fresh Sugarcane juice (small cup) or Hibiscus tea as a refreshing street drink.",
    ],
    ar: [
      "في حالة رغبتك في الحلويات الشرقية (كنافة، بسبوسة)، التزم بقطعة صغيرة بحجم إصبعين (٧٥ جرام).",
      "اطلب قهوة مظبوط أو سادة، أو شاي بنعناع مع محلي خالي السعرات.",
      "عصير القصب الطازج (كوباية صغيرة) أو الكركديه الأسواني يعتبر خياراً ممتازاً في الخروجات.",
    ],
  },
};

/**
 * Creates a "Going Out Tonight" buffer plan:
 * Trims daytime carbs & fats while strictly protecting daily protein.
 */
export function calculateDiningOutBuffer(params: DiningOutBufferInput): DiningOutBufferPlan {
  const bufferKcal = Math.min(1000, Math.max(500, params.bufferKcal ?? 800));
  const minFloor = CLINICAL_MIN_CALORIES[params.biologicalSex];

  // Ensure daytime allowance does not breach clinical minimum
  const daytimeAllowanceKcal = Math.max(minFloor - bufferKcal, params.targetCalories - bufferKcal);

  // Protein must be strictly protected during the day (at least 75% of daily target eaten pre-dinner)
  const daytimeProteinTargetG = Math.round(params.dailyProteinG * 0.75);
  const daytimeProteinKcal = daytimeProteinTargetG * 4;

  // Remaining daytime calories split between low-glycemic carbs and essential fats
  const remainingDaytimeKcal = Math.max(100, daytimeAllowanceKcal - daytimeProteinKcal);
  const daytimeFatsAllowanceG = Math.max(15, Math.round((remainingDaytimeKcal * 0.35) / 9));
  const daytimeCarbsAllowanceG = Math.max(20, Math.round((remainingDaytimeKcal * 0.65) / 4));

  const tips = DINING_TIPS[params.eventType] || DINING_TIPS.egyptian_grill;

  return {
    eveningBufferKcal: bufferKcal,
    daytimeAllowanceKcal,
    daytimeProteinTargetG,
    daytimeCarbsAllowanceG,
    daytimeFatsAllowanceG,
    orderingTipsEn: tips.en,
    orderingTipsAr: tips.ar,
  };
}

export interface SurplusReconciliationInput {
  targetCalories: number;
  consumedCalories: number;
  remainingDaysInWeek: number; // 3 to 6 days
  bmr: number;
  biologicalSex: BiologicalSex;
}

export interface SurplusReconciliationPlan {
  netSurplusKcal: number;
  reconciliationDays: number;
  dailyDeficitAdjustmentKcal: number;
  adjustedDailyTargetKcal: number;
  extraDailyStepsTarget: number;
  reassuranceMessageEn: string;
  reassuranceMessageAr: string;
}

/**
 * Calculates smooth, guilt-free surplus reconciliation across remaining days in week.
 * Never prescribes starvation or crash fasting: max daily reduction is capped at 300 kcal/day,
 * complemented with a gentle +2,000 daily steps boost.
 */
export function calculateSurplusReconciliation(params: SurplusReconciliationInput): SurplusReconciliationPlan {
  const netSurplusKcal = Math.max(0, params.consumedCalories - params.targetCalories);
  const days = Math.min(6, Math.max(3, params.remainingDaysInWeek));

  if (netSurplusKcal <= 100) {
    // Negligible surplus, no adjustments needed
    return {
      netSurplusKcal,
      reconciliationDays: days,
      dailyDeficitAdjustmentKcal: 0,
      adjustedDailyTargetKcal: params.targetCalories,
      extraDailyStepsTarget: 0,
      reassuranceMessageEn: "You are right on track. Daily minor fluctuations are completely normal.",
      reassuranceMessageAr: "أنت في المسار الصحيح تماماً. التذبذبات اليومية البسيطة طبيعية ولا تحتاج أي تعديل.",
    };
  }

  // Cap daily reduction between 150 kcal and 300 kcal per day to avoid hunger rebound
  const rawDailyAdjustment = Math.round(netSurplusKcal / days);
  let dailyDeficitAdjustmentKcal = Math.min(300, Math.max(150, rawDailyAdjustment));

  // Hard Floor Guardrail: never allow adjusted target to dip below BMR or clinical minimum
  const floor = Math.max(params.bmr, CLINICAL_MIN_CALORIES[params.biologicalSex]);
  if (params.targetCalories - dailyDeficitAdjustmentKcal < floor) {
    dailyDeficitAdjustmentKcal = Math.max(0, params.targetCalories - floor);
  }

  const adjustedDailyTargetKcal = params.targetCalories - dailyDeficitAdjustmentKcal;
  const extraDailyStepsTarget = 2000; // Adds ~80-120 kcal gentle burn without hunger spikes

  return {
    netSurplusKcal,
    reconciliationDays: days,
    dailyDeficitAdjustmentKcal,
    adjustedDailyTargetKcal,
    extraDailyStepsTarget,
    reassuranceMessageEn:
      `Don't panic about the scale tomorrow morning! A high-carb Egyptian meal binds water (1g carb holds 3g water) and sodium. We've smoothed the ${netSurplusKcal} kcal excess gently over the next ${days} days with a slight -${dailyDeficitAdjustmentKcal} kcal/day adjustment and +${extraDailyStepsTarget.toLocaleString()} steps. No starvation needed.`,
    reassuranceMessageAr:
      `لا تقلق إطلاقاً إذا زاد الميزان غداً صباحاً! الوجبات المصرية الغنية بالكارب والصوديوم تحبس ماء مؤقتاً (كل جرام كارب يحبس ٣ جرام ماء). قمنا بتوزيع فائض الـ ${netSurplusKcal} سعرة بهدوء على مدار الـ ${days} أيام القادمة بخصم بسيط (${dailyDeficitAdjustmentKcal} سعرة/يوم) مع زيادة ${extraDailyStepsTarget.toLocaleString()} خطوة يومياً، دون أي حرمان أو تجويع.`,
  };
}
