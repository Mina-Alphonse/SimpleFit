import { NextResponse } from "next/server";
import { db, users, profiles, mealPlans, sql } from "@simplefit/database";
import { signAccessToken, signRefreshToken } from "../../../../lib/auth";

export async function POST() {
  try {
    const demoEmail = "cairo.athlete@simplefit.ai";

    let demoUser = (
      await db.select().from(users).where(sql`${users.email} = ${demoEmail}`).limit(1)
    )[0];

    if (!demoUser) {
      const [created] = await db
        .insert(users)
        .values({
          email: demoEmail,
          name: "أحمد المصري (Ahmed)",
          role: "user",
        })
        .returning();
      demoUser = created;

      // Seed initial demo profile (Moderate deficit Cairo intermediate)
      await db.insert(profiles).values({
        userId: demoUser.id,
        age: 28,
        biologicalSex: "male",
        heightCm: "178.00",
        currentWeightKg: "82.50",
        goalWeightKg: "76.00",
        activityLevel: "moderate",
        fitnessExperience: "intermediate",
        trainingEnvironment: "gym",
        trainingDaysPerWeek: 4,
        sessionDurationMins: 45,
        caloricTier: "moderate_deficit",
        planCadence: "weekly",
        budgetTier: "standard",
        bmr: 1785,
        tdee: 2450,
        targetCalories: 2150,
        targetProteinG: 165,
        targetCarbsG: 220,
        targetFatsG: 55,
      });

      // Seed initial active meal plan
      await db.insert(mealPlans).values({
        userId: demoUser.id,
        cadence: "weekly",
        totalCalories: 2150,
        proteinG: 165,
        carbsG: 220,
        fatsG: 55,
        planDays: [
          {
            dayNumber: 1,
            dayNameEn: "Day 1 (Chest & Triceps)",
            dayNameAr: "اليوم ١ (صدر وتراي)",
            meals: [
              {
                id: "meal-1",
                nameEn: "Egyptian High-Protein Breakfast",
                nameAr: "فطار مصري عالي البروتين",
                time: "08:30 AM",
                foods: [
                  { foodNameEn: "Ful Medames (Plain)", foodNameAr: "فول مدمس سادة", portion: "4 Tablespoons", grams: 120, calories: 132, protein: 9.1, carbs: 23.4, fats: 1.0 },
                  { foodNameEn: "Baladi Bread (Aysh Baladi)", foodNameAr: "عيش بلدي طازج", portion: "1/2 Loaf", grams: 65, calories: 168, protein: 5.9, carbs: 34.5, fats: 0.8 },
                  { foodNameEn: "Egyptian Quraish Cheese", foodNameAr: "جبنة قريش فلاحي", portion: "1 Medium Slice", grams: 100, calories: 98, protein: 17.5, carbs: 2.6, fats: 1.5 },
                  { foodNameEn: "Fresh Whole Egg (Red / White)", foodNameAr: "بيض مزارع طازج", portion: "2 Large Eggs", grams: 100, calories: 143, protein: 12.6, carbs: 0.8, fats: 9.5 }
                ]
              },
              {
                id: "meal-2",
                nameEn: "Post-Workout Lunch",
                nameAr: "غداء بعد التمرين",
                time: "02:00 PM",
                foods: [
                  { foodNameEn: "Fresh Chicken Breast Fillet", foodNameAr: "صدور دجاج فيليه طازجة", portion: "1 Large Breast", grams: 200, calories: 240, protein: 52.0, carbs: 0.0, fats: 3.0 },
                  { foodNameEn: "Basmati Rice (Boiled / Steamed)", foodNameAr: "أرز بسمتي مسلوق", portion: "1 Cup Cooked", grams: 160, calories: 194, protein: 4.8, carbs: 40.8, fats: 0.6 },
                  { foodNameEn: "Egyptian Molokhia (Plain Soup)", foodNameAr: "ملوخية مصرية خضراء", portion: "1 Medium Soup Bowl", grams: 200, calories: 76, protein: 5.6, carbs: 9.6, fats: 2.0 },
                  { foodNameEn: "Fresh Egyptian Tomatoes", foodNameAr: "طماطم بلدي للسلطة", portion: "1 Medium Tomato", grams: 120, calories: 22, protein: 1.1, carbs: 4.7, fats: 0.2 }
                ]
              },
              {
                id: "meal-3",
                nameEn: "Evening Protein Snack",
                nameAr: "سناك بروتين مسائي",
                time: "06:00 PM",
                foods: [
                  { foodNameEn: "Juhayna / Almarai Greek Yogurt 0% Fat", foodNameAr: "زبادي يوناني لايت 0%", portion: "1 Small Cup", grams: 170, calories: 99, protein: 17.0, carbs: 6.0, fats: 0.0 },
                  { foodNameEn: "Abu Auf Raw Unsalted Almonds", foodNameAr: "لوز نيء غير مملح", portion: "1 Handful", grams: 30, calories: 174, protein: 6.3, carbs: 6.5, fats: 15.0 }
                ]
              },
              {
                id: "meal-4",
                nameEn: "Light Dinner",
                nameAr: "عشاء خفيف متوازن",
                time: "09:30 PM",
                foods: [
                  { foodNameEn: "Sunshine / Americana Canned Tuna in Water (Diet)", foodNameAr: "تونة دايت في الماء", portion: "1 Full Can Drained", grams: 130, calories: 137, protein: 31.9, carbs: 0.0, fats: 1.0 },
                  { foodNameEn: "Rich Bake Whole Wheat Toast", foodNameAr: "توست ريتش بيك بني", portion: "2 Slices", grams: 56, calories: 137, protein: 5.9, carbs: 24.6, fats: 1.4 },
                  { foodNameEn: "Fresh Egyptian Cucumber", foodNameAr: "خيار بلدي طازج", portion: "2 Cucumbers", grams: 160, calories: 24, protein: 1.1, carbs: 5.8, fats: 0.2 }
                ]
              }
            ]
          }
        ],
        groceryList: [],
        isActive: "true",
      });
    }

    const payload = {
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Retrieve active profile
    const userProfile = (
      await db.select().from(profiles).where(sql`${profiles.userId} = ${demoUser.id}`).limit(1)
    )[0];

    const response = NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
      },
      profile: userProfile || null,
      tokens: { accessToken, refreshToken },
    });

    response.cookies.set("simplefit_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours for demo
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Demo Login Error:", err);
    return NextResponse.json(
      { error: "Failed to initiate demo session", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
