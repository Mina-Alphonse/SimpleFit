"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { WorkoutLogger } from "./WorkoutLogger";
import {
  calculateExerciseSwap,
  ExerciseDefinition,
  ExerciseSwapOptions,
  WorkoutFrequency,
} from "@simplefit/shared";
import {
  Dumbbell,
  Calendar,
  Sparkles,
  RotateCw,
  Flame,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Play,
  Home,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";

// Biomechanical Exercise Catalog for Swapping
const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // Horizontal Push
  {
    id: "barbell_bench_press",
    nameEn: "Barbell Bench Press",
    nameAr: "بنش مستوي بالبار",
    movementPattern: "horizontal_push",
    primaryMuscle: "Chest",
    equipment: "barbell",
    difficulty: "intermediate",
    alternativeIds: ["dumbbell_bench_press", "machine_chest_press", "pushup_bodyweight"],
  },
  {
    id: "dumbbell_bench_press",
    nameEn: "Dumbbell Bench Press",
    nameAr: "بنش مستوي بالدمبل",
    movementPattern: "horizontal_push",
    primaryMuscle: "Chest",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["barbell_bench_press", "machine_chest_press", "pushup_bodyweight"],
  },
  {
    id: "machine_chest_press",
    nameEn: "Machine Chest Press",
    nameAr: "ضغط الصدر بالجهاز",
    movementPattern: "horizontal_push",
    primaryMuscle: "Chest",
    equipment: "machine",
    difficulty: "beginner",
    alternativeIds: ["barbell_bench_press", "dumbbell_bench_press", "pushup_bodyweight"],
  },
  {
    id: "pushup_bodyweight",
    nameEn: "Standard Push-Up (Home/Bodyweight)",
    nameAr: "تمرين الضغط الأرضي (منزلي / وزن الجسم)",
    movementPattern: "horizontal_push",
    primaryMuscle: "Chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["barbell_bench_press", "dumbbell_bench_press", "machine_chest_press"],
  },

  // Horizontal Pull
  {
    id: "barbell_bent_row",
    nameEn: "Barbell Bent-Over Row",
    nameAr: "سحب بار للتجديف (باربل رو)",
    movementPattern: "horizontal_pull",
    primaryMuscle: "Upper Back",
    equipment: "barbell",
    difficulty: "intermediate",
    alternativeIds: ["dumbbell_one_arm_row", "seated_cable_row", "inverted_row"],
  },
  {
    id: "dumbbell_one_arm_row",
    nameEn: "Single-Arm Dumbbell Row",
    nameAr: "سحب دمبل فردي (تجديف فردي)",
    movementPattern: "horizontal_pull",
    primaryMuscle: "Upper Back",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["barbell_bent_row", "seated_cable_row", "inverted_row"],
  },
  {
    id: "seated_cable_row",
    nameEn: "Seated Cable Row",
    nameAr: "سحب كابل أرضي جالس",
    movementPattern: "horizontal_pull",
    primaryMuscle: "Upper Back",
    equipment: "cable",
    difficulty: "beginner",
    alternativeIds: ["barbell_bent_row", "dumbbell_one_arm_row", "inverted_row"],
  },
  {
    id: "inverted_row",
    nameEn: "Inverted Bodyweight Row",
    nameAr: "تجديف عكسي بوزن الجسم (منزلي)",
    movementPattern: "horizontal_pull",
    primaryMuscle: "Upper Back",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["barbell_bent_row", "dumbbell_one_arm_row"],
  },

  // Vertical Push
  {
    id: "overhead_barbell_press",
    nameEn: "Overhead Barbell Press (OHP)",
    nameAr: "دفع أكتاف بالبار واقفاً",
    movementPattern: "vertical_push",
    primaryMuscle: "Front Delts",
    equipment: "barbell",
    difficulty: "intermediate",
    alternativeIds: ["seated_dumbbell_shoulder_press", "machine_shoulder_press", "pike_pushup"],
  },
  {
    id: "seated_dumbbell_shoulder_press",
    nameEn: "Seated Dumbbell Shoulder Press",
    nameAr: "دفع أكتاف بالدمبل جالساً",
    movementPattern: "vertical_push",
    primaryMuscle: "Front Delts",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["overhead_barbell_press", "machine_shoulder_press", "pike_pushup"],
  },
  {
    id: "machine_shoulder_press",
    nameEn: "Machine Shoulder Press",
    nameAr: "دفع أكتاف بالجهاز",
    movementPattern: "vertical_push",
    primaryMuscle: "Front Delts",
    equipment: "machine",
    difficulty: "beginner",
    alternativeIds: ["overhead_barbell_press", "seated_dumbbell_shoulder_press"],
  },
  {
    id: "pike_pushup",
    nameEn: "Pike Push-Up (Home/Bodyweight)",
    nameAr: "ضغط بايك للأكتاف (منزلي)",
    movementPattern: "vertical_push",
    primaryMuscle: "Front Delts",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["overhead_barbell_press", "seated_dumbbell_shoulder_press"],
  },

  // Vertical Pull
  {
    id: "lat_pulldown",
    nameEn: "Lat Pulldown",
    nameAr: "سحب عالي بالجهاز (لات بول داون)",
    movementPattern: "vertical_pull",
    primaryMuscle: "Lats",
    equipment: "cable",
    difficulty: "beginner",
    alternativeIds: ["pullup_bodyweight", "resistance_band_pulldown"],
  },
  {
    id: "pullup_bodyweight",
    nameEn: "Pull-Up / Chin-Up",
    nameAr: "عقلة بوزن الجسم",
    movementPattern: "vertical_pull",
    primaryMuscle: "Lats",
    equipment: "bodyweight",
    difficulty: "intermediate",
    alternativeIds: ["lat_pulldown", "resistance_band_pulldown"],
  },
  {
    id: "resistance_band_pulldown",
    nameEn: "Banded Lat Pulldown (Home)",
    nameAr: "سحب عالي باستك المقاومة (منزلي)",
    movementPattern: "vertical_pull",
    primaryMuscle: "Lats",
    equipment: "bands",
    difficulty: "beginner",
    alternativeIds: ["lat_pulldown", "pullup_bodyweight"],
  },

  // Squat / Quad Dominant
  {
    id: "barbell_back_squat",
    nameEn: "Barbell Back Squat",
    nameAr: "سكوات خلفي بالبار",
    movementPattern: "squat",
    primaryMuscle: "Quads",
    equipment: "barbell",
    difficulty: "intermediate",
    alternativeIds: ["dumbbell_goblet_squat", "leg_press", "bodyweight_squat"],
  },
  {
    id: "dumbbell_goblet_squat",
    nameEn: "Dumbbell Goblet Squat",
    nameAr: "جوبلت سكوات بالدمبل",
    movementPattern: "squat",
    primaryMuscle: "Quads",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["barbell_back_squat", "leg_press", "bodyweight_squat"],
  },
  {
    id: "leg_press",
    nameEn: "Machine Leg Press",
    nameAr: "دفع أرجل بجهاز الليج بريس",
    movementPattern: "squat",
    primaryMuscle: "Quads",
    equipment: "machine",
    difficulty: "beginner",
    alternativeIds: ["barbell_back_squat", "dumbbell_goblet_squat"],
  },
  {
    id: "bodyweight_squat",
    nameEn: "Bodyweight Squat (Home)",
    nameAr: "سكوات بوزن الجسم (منزلي)",
    movementPattern: "squat",
    primaryMuscle: "Quads",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["barbell_back_squat", "dumbbell_goblet_squat"],
  },

  // Hinge / Posterior Chain
  {
    id: "romanian_deadlift",
    nameEn: "Barbell Romanian Deadlift (RDL)",
    nameAr: "رفعة ميتة رومانية بالبار (RDL)",
    movementPattern: "hinge",
    primaryMuscle: "Hamstrings",
    equipment: "barbell",
    difficulty: "intermediate",
    alternativeIds: ["dumbbell_rdl", "glute_bridge", "swiss_ball_leg_curl"],
  },
  {
    id: "dumbbell_rdl",
    nameEn: "Dumbbell Romanian Deadlift",
    nameAr: "ديدلفت روماني بالدمبل",
    movementPattern: "hinge",
    primaryMuscle: "Hamstrings",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["romanian_deadlift", "glute_bridge"],
  },
  {
    id: "glute_bridge",
    nameEn: "Bodyweight Glute Bridge (Home)",
    nameAr: "جسر الألوية بوزن الجسم (منزلي)",
    movementPattern: "hinge",
    primaryMuscle: "Hamstrings",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["romanian_deadlift", "dumbbell_rdl"],
  },

  // Isolation (Arms & Shoulders)
  {
    id: "lateral_raise_db",
    nameEn: "Dumbbell Lateral Raise",
    nameAr: "رفرفة جانبية بالدمبل للأكتاف",
    movementPattern: "isolation",
    primaryMuscle: "Side Delts",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["cable_lateral_raise", "band_lateral_raise"],
  },
  {
    id: "cable_lateral_raise",
    nameEn: "Cable Lateral Raise",
    nameAr: "رفرفة جانبية بالكابل",
    movementPattern: "isolation",
    primaryMuscle: "Side Delts",
    equipment: "cable",
    difficulty: "beginner",
    alternativeIds: ["lateral_raise_db", "band_lateral_raise"],
  },
  {
    id: "band_lateral_raise",
    nameEn: "Banded Lateral Raise (Home)",
    nameAr: "رفرفة جانبية باستك المقاومة (منزلي)",
    movementPattern: "isolation",
    primaryMuscle: "Side Delts",
    equipment: "bands",
    difficulty: "beginner",
    alternativeIds: ["lateral_raise_db"],
  },
  {
    id: "tricep_rope_pushdown",
    nameEn: "Tricep Rope Pushdown",
    nameAr: "سحب حبل ترايسبس بالكابل",
    movementPattern: "isolation",
    primaryMuscle: "Triceps",
    equipment: "cable",
    difficulty: "beginner",
    alternativeIds: ["overhead_dumbbell_extension", "bench_dips"],
  },
  {
    id: "overhead_dumbbell_extension",
    nameEn: "Overhead Dumbbell Tricep Extension",
    nameAr: "ترايسبس فرنساوي بالدمبل فوق الرأس",
    movementPattern: "isolation",
    primaryMuscle: "Triceps",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["tricep_rope_pushdown", "bench_dips"],
  },
  {
    id: "bench_dips",
    nameEn: "Bench Dips (Bodyweight)",
    nameAr: "غطس ترايسبس على المقعد (منزلي)",
    movementPattern: "isolation",
    primaryMuscle: "Triceps",
    equipment: "bodyweight",
    difficulty: "beginner",
    alternativeIds: ["tricep_rope_pushdown", "overhead_dumbbell_extension"],
  },
  {
    id: "dumbbell_bicep_curl",
    nameEn: "Dumbbell Bicep Curl",
    nameAr: "مرجحة بايسبس بالدمبل",
    movementPattern: "isolation",
    primaryMuscle: "Biceps",
    equipment: "dumbbell",
    difficulty: "beginner",
    alternativeIds: ["barbell_curl", "cable_curl"],
  },
  {
    id: "barbell_curl",
    nameEn: "Barbell Bicep Curl",
    nameAr: "مرجحة بايسبس بالبار",
    movementPattern: "isolation",
    primaryMuscle: "Biceps",
    equipment: "barbell",
    difficulty: "beginner",
    alternativeIds: ["dumbbell_bicep_curl", "cable_curl"],
  },
  {
    id: "cable_curl",
    nameEn: "Cable Bicep Curl",
    nameAr: "مرجحة بايسبس بالكابل",
    movementPattern: "isolation",
    primaryMuscle: "Biceps",
    equipment: "cable",
    difficulty: "beginner",
    alternativeIds: ["dumbbell_bicep_curl", "barbell_curl"],
  },
];

interface PlannedExerciseItem {
  id: string;
  exercise: ExerciseDefinition;
  targetSets: number;
  repsRange: string;
  restSecs: number;
  startingWeightKg: number;
}

interface WorkoutDayPlan {
  dayNumber: number;
  titleEn: string;
  titleAr: string;
  focusEn: string;
  focusAr: string;
  estimatedMinutes: number;
  exercises: PlannedExerciseItem[];
}

export function WorkoutPlan() {
  const { locale } = useLanguage();
  const { profile } = useAuth();
  const isAr = locale === "ar";

  // Mode: "plan" (Overview of Multi-Day Schedule) vs "logger" (Live workout execution)
  const [activeView, setActiveView] = useState<"plan" | "logger">("plan");

  // Selected Frequency (2 to 6 days per week) - defaults to user profile or 4
  const [selectedFreq, setSelectedFreq] = useState<WorkoutFrequency>(
    (profile?.trainingDaysPerWeek as WorkoutFrequency) || 4
  );

  React.useEffect(() => {
    if (profile?.trainingDaysPerWeek) {
      setSelectedFreq(profile.trainingDaysPerWeek as WorkoutFrequency);
    }
  }, [profile?.trainingDaysPerWeek]);

  // Active Day in Schedule
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Swap Modal State
  const [swappingExercise, setSwappingExercise] = useState<{
    dayIndex: number;
    exerciseIndex: number;
    current: ExerciseDefinition;
  } | null>(null);

  const [swapOptions, setSwapOptions] = useState<ExerciseSwapOptions>({
    equipmentBusyMode: false,
    homeMode: false,
  });

  // Dynamic Multi-Day Workout Plans Generator (2 to 6 days)
  const generatePlanForFrequency = (freq: WorkoutFrequency): WorkoutDayPlan[] => {
    switch (freq) {
      case 2:
        return [
          {
            dayNumber: 1,
            titleEn: "Day 1: Full Body A",
            titleAr: "اليوم الأول: جسم كامل (أ)",
            focusEn: "Quads, Chest, Upper Back & Core",
            focusAr: "الأرجل الأمامية، الصدر، الظهر العلوي، البطن",
            estimatedMinutes: 50,
            exercises: [
              {
                id: "e1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_back_squat")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
              {
                id: "e2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bench_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "e3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_cable_row")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 75,
                startingWeightKg: 35,
              },
              {
                id: "e4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lateral_raise_db")!,
                targetSets: 3,
                repsRange: "12–15",
                restSecs: 60,
                startingWeightKg: 6,
              },
            ],
          },
          {
            dayNumber: 2,
            titleEn: "Day 2: Full Body B",
            titleAr: "اليوم الثاني: جسم كامل (ب)",
            focusEn: "Hamstrings, Lats, Shoulders & Arms",
            focusAr: "الخلفيات، المجنص، الأكتاف، الذراعين",
            estimatedMinutes: 50,
            exercises: [
              {
                id: "e5",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 55,
              },
              {
                id: "e6",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lat_pulldown")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 75,
                startingWeightKg: 40,
              },
              {
                id: "e7",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_dumbbell_shoulder_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 75,
                startingWeightKg: 14,
              },
              {
                id: "e8",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "dumbbell_bicep_curl")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 10,
              },
            ],
          },
        ];

      case 3:
        return [
          {
            dayNumber: 1,
            titleEn: "Day 1: Push (Chest, Delts & Triceps)",
            titleAr: "اليوم الأول: دفع (صدر وأكتاف وترايسبس)",
            focusEn: "Horizontal & Vertical Push Patterns",
            focusAr: "دفع أفقي وعمودي",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "p1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bench_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "p2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_dumbbell_shoulder_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 75,
                startingWeightKg: 14,
              },
              {
                id: "p3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lateral_raise_db")!,
                targetSets: 3,
                repsRange: "12–15",
                restSecs: 60,
                startingWeightKg: 6,
              },
              {
                id: "p4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "tricep_rope_pushdown")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 15,
              },
            ],
          },
          {
            dayNumber: 2,
            titleEn: "Day 2: Pull (Back & Biceps)",
            titleAr: "اليوم الثاني: سحب (ظهر وبايسبس)",
            focusEn: "Horizontal & Vertical Pull Patterns",
            focusAr: "سحب أفقي ورأسي",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "p5",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lat_pulldown")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 45,
              },
              {
                id: "p6",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bent_row")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "p7",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "dumbbell_bicep_curl")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 10,
              },
            ],
          },
          {
            dayNumber: 3,
            titleEn: "Day 3: Legs & Core",
            titleAr: "اليوم الثالث: أرجل وبطن",
            focusEn: "Squat, Hinge & Core Stability",
            focusAr: "السكوات والديدلفت والبطن",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "p8",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_back_squat")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
              {
                id: "p9",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
            ],
          },
        ];

      case 4:
      default:
        return [
          {
            dayNumber: 1,
            titleEn: "Day 1: Upper Body A (Strength Focus)",
            titleAr: "اليوم الأول: جسم علوي (أ) — قوة وبنش",
            focusEn: "Heavy Chest Press, Rows & Delts",
            focusAr: "صدر، ظهر علوي، وأكتاف",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "u1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bench_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "u2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bent_row")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "u3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lateral_raise_db")!,
                targetSets: 3,
                repsRange: "12–15",
                restSecs: 60,
                startingWeightKg: 6,
              },
              {
                id: "u4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "tricep_rope_pushdown")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 15,
              },
            ],
          },
          {
            dayNumber: 2,
            titleEn: "Day 2: Lower Body A (Quad Focus)",
            titleAr: "اليوم الثاني: جسم سفلي (أ) — أرجل أمامية",
            focusEn: "Squats, Lunges & Calves",
            focusAr: "سكوات، طعنات، وسمانة",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "l1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_back_squat")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
              {
                id: "l2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 55,
              },
            ],
          },
          {
            dayNumber: 3,
            titleEn: "Day 3: Upper Body B (Hypertrophy)",
            titleAr: "اليوم الثالث: جسم علوي (ب) — ضخامة وتحديد",
            focusEn: "Incline Press, Lat Pulldowns & Arms",
            focusAr: "سحب عالي، دفع دمبل، وبايسبس",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "u5",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lat_pulldown")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 75,
                startingWeightKg: 45,
              },
              {
                id: "u6",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_dumbbell_shoulder_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 75,
                startingWeightKg: 14,
              },
              {
                id: "u7",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "dumbbell_bicep_curl")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 10,
              },
            ],
          },
          {
            dayNumber: 4,
            titleEn: "Day 4: Lower Body B (Hamstring & Glutes)",
            titleAr: "اليوم الرابع: جسم سفلي (ب) — خلفيات وألوية",
            focusEn: "Posterior Chain, Glute bridges & Core",
            focusAr: "الديدلفت، جسر الألوية، والبطن",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "l3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "dumbbell_goblet_squat")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 75,
                startingWeightKg: 20,
              },
              {
                id: "l4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
            ],
          },
        ];

      case 5:
        return [
          {
            dayNumber: 1,
            titleEn: "Day 1: Chest & Triceps",
            titleAr: "اليوم الأول: صدر وترايسبس",
            focusEn: "Heavy Chest Press & Lockouts",
            focusAr: "ضغط الصدر وعضلات الترايسبس",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "f1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bench_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
              {
                id: "f2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "tricep_rope_pushdown")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 15,
              },
            ],
          },
          {
            dayNumber: 2,
            titleEn: "Day 2: Back & Biceps",
            titleAr: "اليوم الثاني: ظهر وبايسبس",
            focusEn: "Lat Width & Mid-Back Thickness",
            focusAr: "عضلات المجنص ومنتصف الظهر",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "f3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lat_pulldown")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 45,
              },
              {
                id: "f4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "dumbbell_bicep_curl")!,
                targetSets: 3,
                repsRange: "10–12",
                restSecs: 60,
                startingWeightKg: 10,
              },
            ],
          },
          {
            dayNumber: 3,
            titleEn: "Day 3: Quads & Calves",
            titleAr: "اليوم الثالث: أرجل أمامية وسمانة",
            focusEn: "Heavy Squats & Quad Hypertrophy",
            focusAr: "السكوات الأمامي والخلفي والسمانة",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "f5",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_back_squat")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
            ],
          },
          {
            dayNumber: 4,
            titleEn: "Day 4: Shoulders & Abs",
            titleAr: "اليوم الرابع: أكتاف وبطن",
            focusEn: "Overhead Press & Lateral Raises",
            focusAr: "أكتاف كاملة وبطن",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "f6",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_dumbbell_shoulder_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 75,
                startingWeightKg: 14,
              },
              {
                id: "f7",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lateral_raise_db")!,
                targetSets: 3,
                repsRange: "12–15",
                restSecs: 60,
                startingWeightKg: 6,
              },
            ],
          },
          {
            dayNumber: 5,
            titleEn: "Day 5: Hamstrings & Posterior Chain",
            titleAr: "اليوم الخامس: خلفيات وألوية",
            focusEn: "Hinges & Posterior Power",
            focusAr: "الديدلفت الروماني والألوية",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "f8",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 55,
              },
            ],
          },
        ];

      case 6:
        return [
          {
            dayNumber: 1,
            titleEn: "Day 1: Push A",
            titleAr: "اليوم الأول: دفع (أ)",
            focusEn: "Chest & Shoulders",
            focusAr: "صدر وأكتاف",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s1",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bench_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
            ],
          },
          {
            dayNumber: 2,
            titleEn: "Day 2: Pull A",
            titleAr: "اليوم الثاني: سحب (أ)",
            focusEn: "Back & Biceps",
            focusAr: "ظهر وبايسبس",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s2",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "lat_pulldown")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 45,
              },
            ],
          },
          {
            dayNumber: 3,
            titleEn: "Day 3: Legs A",
            titleAr: "اليوم الثالث: أرجل (أ)",
            focusEn: "Quads & Calves",
            focusAr: "أرجل أمامية وسمانة",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s3",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_back_squat")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 50,
              },
            ],
          },
          {
            dayNumber: 4,
            titleEn: "Day 4: Push B",
            titleAr: "اليوم الرابع: دفع (ب)",
            focusEn: "Shoulders & Triceps",
            focusAr: "أكتاف وترايسبس",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s4",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "seated_dumbbell_shoulder_press")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 75,
                startingWeightKg: 14,
              },
            ],
          },
          {
            dayNumber: 5,
            titleEn: "Day 5: Pull B",
            titleAr: "اليوم الخامس: سحب (ب)",
            focusEn: "Row & Arm Detail",
            focusAr: "تجديف ظهر وذراعين",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s5",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "barbell_bent_row")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 40,
              },
            ],
          },
          {
            dayNumber: 6,
            titleEn: "Day 6: Legs B",
            titleAr: "اليوم السادس: أرجل (ب)",
            focusEn: "Hamstrings & Glutes",
            focusAr: "خلفيات وألوية",
            estimatedMinutes: 45,
            exercises: [
              {
                id: "s6",
                exercise: EXERCISE_LIBRARY.find((e) => e.id === "romanian_deadlift")!,
                targetSets: 3,
                repsRange: "8–10",
                restSecs: 90,
                startingWeightKg: 55,
              },
            ],
          },
        ];
    }
  };

  // State of custom modified schedule
  const [currentPlan, setCurrentPlan] = useState<WorkoutDayPlan[]>(() =>
    generatePlanForFrequency(selectedFreq)
  );

  const handleFrequencyChange = (newFreq: WorkoutFrequency) => {
    setSelectedFreq(newFreq);
    setCurrentPlan(generatePlanForFrequency(newFreq));
    setActiveDayIndex(0);
  };

  // Execute Biomechanical Exercise Swap
  const handleApplySwap = (newExercise: ExerciseDefinition) => {
    if (!swappingExercise) return;
    const { dayIndex, exerciseIndex } = swappingExercise;

    const updatedPlan = [...currentPlan];
    const targetDay = { ...updatedPlan[dayIndex] };
    const targetExList = [...targetDay.exercises];

    targetExList[exerciseIndex] = {
      ...targetExList[exerciseIndex],
      exercise: newExercise,
    };

    targetDay.exercises = targetExList;
    updatedPlan[dayIndex] = targetDay;

    setCurrentPlan(updatedPlan);
    setSwappingExercise(null);
  };

  const activeDay = currentPlan[activeDayIndex] || currentPlan[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ==================== VIEW TOGGLE: PLAN SCHEDULE vs LIVE LOGGER ==================== */}
      <div className="bg-card border border-border p-2 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView("plan")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === "plan"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? "خطة وجدول التمارين الأسبوعي" : "Weekly Workout Schedule & Plan"}</span>
          </button>

          <button
            onClick={() => setActiveView("logger")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === "logger"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>{isAr ? "جلسة التسجيل المباشر والإحماء" : "Live Logger & Warm-up"}</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground px-3">
          {isAr ? "زيادة تدريجية +2.5 كجم تلقائية" : "Auto +2.5kg Double Progression"}
        </span>
      </div>

      {/* ==================== IF LIVE LOGGER VIEW ==================== */}
      {activeView === "logger" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {isAr
                ? "جلسة التمرين المباشر مع مؤقت الراحة وفحص الجهد"
                : "Live workout session with inter-set timer and effort check"}
            </span>
            <button
              onClick={() => setActiveView("plan")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "العودة للجدول الكامل" : "Back to Full Schedule"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <WorkoutLogger />
        </div>
      )}

      {/* ==================== IF PLAN SCHEDULE VIEW ==================== */}
      {activeView === "plan" && (
        <div className="space-y-6">
          {/* Header Card with Frequency Selector (2 to 6 days) */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? "برنامج تدريبي مخصص" : "Customized Workout Split"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  {isAr ? "جدول التمارين الأسبوعي المتوازن" : "Your Weekly Workout Schedule"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {isAr
                    ? "اختر عدد أيام التدريب في الأسبوع، واستبدل أي تمرين بنقرة واحدة بنفس النمط الحركي."
                    : "Select your weekly frequency, and swap any exercise with biomechanically equivalent alternatives."}
                </p>
              </div>

              {/* Weekly Frequency Selector (2 to 6 days) */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border/80">
                <span className="text-xs font-bold text-muted-foreground px-2">
                  {isAr ? "أيام الأسبوع:" : "Days/Wk:"}
                </span>
                {([2, 3, 4, 5, 6] as WorkoutFrequency[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFrequencyChange(f)}
                    className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${
                      selectedFreq === f
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-card"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Days Horizontal Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
              {currentPlan.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                    activeDayIndex === idx
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isAr ? day.titleAr : day.titleEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Day Exercises Card */}
          {activeDay && (
            <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-6">
              {/* Day Headline & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span>{isAr ? activeDay.titleAr : activeDay.titleEn}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {activeDay.estimatedMinutes} {isAr ? "دقيقة" : "mins"}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? `التركيز العضلي: ${activeDay.focusAr}` : `Muscle Focus: ${activeDay.focusEn}`}
                  </p>
                </div>

                {/* Primary CTA: Launch Logger */}
                <button
                  onClick={() => setActiveView("logger")}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-primary-foreground" />
                  <span>{isAr ? "ابدأ هذا التمرين الآن (تسجيل حي)" : "Start This Workout (Live Log)"}</span>
                </button>
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                {activeDay.exercises.map((item, exIdx) => {
                  const ex = item.exercise;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                          {exIdx + 1}
                        </span>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {isAr ? ex.nameAr : ex.nameEn}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-muted font-semibold text-[11px]">
                              {ex.primaryMuscle}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-muted font-semibold text-[11px] capitalize">
                              {ex.equipment}
                            </span>
                            <span className="font-mono text-foreground font-bold">
                              {item.targetSets} {isAr ? "مجموعات" : "sets"} × {item.repsRange} {isAr ? "تكرار" : "reps"}
                            </span>
                            <span className="text-muted-foreground">
                              • {item.restSecs}s {isAr ? "راحة" : "rest"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Biomechanical Swap Trigger */}
                      <button
                        onClick={() =>
                          setSwappingExercise({
                            dayIndex: activeDayIndex,
                            exerciseIndex: exIdx,
                            current: ex,
                          })
                        }
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold transition-all shadow-xs shrink-0"
                        title={isAr ? "تبديل التمرين ببديل حركي مكافئ" : "Swap exercise biomechanically"}
                      >
                        <RotateCw className="w-3.5 h-3.5 text-primary" />
                        <span>{isAr ? "تبديل التمرين (1-Click Swap)" : "Swap Exercise"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== BIOMECHANICAL SWAP MODAL ==================== */}
      {swappingExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {isAr ? "البدائل الحركية الميكانيكية" : "Biomechanical Exercise Swaps"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr
                      ? `بدائل تستهدف نفس العضلة (${swappingExercise.current.primaryMuscle})`
                      : `Targeting same muscle (${swappingExercise.current.primaryMuscle})`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSwappingExercise(null)}
                className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filters: Equipment Busy Mode & Home Mode */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setSwapOptions((prev) => ({
                    ...prev,
                    equipmentBusyMode: !prev.equipmentBusyMode,
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  swapOptions.equipmentBusyMode
                    ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                    : "bg-muted/50 border-border text-muted-foreground"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isAr ? "الجهاز مشغول في الجيم" : "Equipment Busy Mode"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSwapOptions((prev) => ({
                    ...prev,
                    homeMode: !prev.homeMode,
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  swapOptions.homeMode
                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40"
                    : "bg-muted/50 border-border text-muted-foreground"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isAr ? "تمرين بالمنزل (دمبلز / وزن الجسم)" : "Home Mode (DB / Bodyweight)"}</span>
              </button>
            </div>

            {/* Candidate Alternatives List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {calculateExerciseSwap({
                currentExercise: swappingExercise.current,
                candidateLibrary: EXERCISE_LIBRARY,
                options: swapOptions,
              }).map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-2xl bg-background border border-border/80 flex items-center justify-between gap-3 hover:border-primary transition-all"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-foreground">
                      {isAr ? cand.nameAr : cand.nameEn}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="capitalize">{cand.equipment}</span>
                      <span>•</span>
                      <span>{cand.difficulty}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplySwap(cand)}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0"
                  >
                    {isAr ? "اختيار هذا البديل" : "Select Swap"}
                  </button>
                </div>
              ))}

              {calculateExerciseSwap({
                currentExercise: swappingExercise.current,
                candidateLibrary: EXERCISE_LIBRARY,
                options: swapOptions,
              }).length === 0 && (
                <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "لا توجد بدائل تطابق الفلاتر الحالية. جرب إلغاء تفعيل وضع البيت أو الجهاز المشغول."
                    : "No alternatives match the current filters. Try unchecking Home Mode or Equipment Busy Mode."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
