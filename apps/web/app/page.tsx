import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroSplit, dictionaries } from "@masrfit/shared";
import { Activity, Dumbbell, Utensils, ShieldCheck, Flame, Scale, Globe } from "lucide-react";

export default function Home() {
  // Demonstration of shared quantitative engine logic
  const sampleBmr = calculateBMR({
    weightKg: 85,
    heightCm: 178,
    age: 28,
    biologicalSex: "male",
  });

  const sampleTdee = calculateTDEE({
    bmr: sampleBmr,
    activityLevel: "moderate",
  });

  const { targetCalories, guardrailApplied, note } = calculateTargetCalories({
    bmr: sampleBmr,
    tdee: sampleTdee,
    caloricTier: "moderate_deficit",
    biologicalSex: "male",
  });

  const macros = calculateMacroSplit({
    targetCalories,
    weightKg: 85,
    proteinRatioGPerKg: 2.0,
  });

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/20 text-primary font-bold text-xl">
              MF
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {dictionaries.en.appName} <span className="text-muted-foreground text-xl">({dictionaries.ar.appName})</span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {dictionaries.en.tagline}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium">
          <Globe className="w-4 h-4 text-primary" />
          <span>Bilingual Ready (EN / AR RTL)</span>
        </div>
      </header>

      {/* Hero / Status Banner */}
      <section className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Phase 1 Verification: Monorepo & Core Engine Initialized</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">
          High-Scale Architecture (100k+ Users)
        </h2>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Turborepo monorepo scaffolded with strictly typed contracts across <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">apps/web</code>, <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">packages/shared</code>, and <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">packages/database</code>. Zero duplicate code for upcoming mobile apps.
        </p>
      </section>

      {/* Quantitative Engine Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Quantitative Calculation Engine Demo
          </h3>
          <span className="text-xs text-muted-foreground">Computed live via @masrfit/shared</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Basal Metabolic Rate</span>
            <div className="text-2xl font-black mt-2 text-foreground">{sampleBmr} <span className="text-xs font-normal text-muted-foreground">kcal</span></div>
            <p className="text-xs text-muted-foreground mt-1">Mifflin-St Jeor (85kg, 178cm, 28y)</p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TDEE (Moderate Activity)</span>
            <div className="text-2xl font-black mt-2 text-foreground">{sampleTdee} <span className="text-xs font-normal text-muted-foreground">kcal</span></div>
            <p className="text-xs text-muted-foreground mt-1">1.55x Multiplier</p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Target (Moderate Deficit)</span>
            <div className="text-2xl font-black mt-2 text-primary">{targetCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span></div>
            <p className="text-xs text-muted-foreground mt-1">-300 kcal deficit tier</p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Macro Allocation</span>
            <div className="text-sm font-semibold mt-2 space-y-1">
              <div className="flex justify-between"><span>Protein (2g/kg):</span> <span className="font-bold text-primary">{macros.proteinGrams}g</span></div>
              <div className="flex justify-between"><span>Carbs:</span> <span className="font-bold text-foreground">{macros.carbsGrams}g</span></div>
              <div className="flex justify-between"><span>Fats:</span> <span className="font-bold text-foreground">{macros.fatsGrams}g</span></div>
            </div>
          </div>
        </div>

        {guardrailApplied && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-500 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span>Guardrail Active: {note}</span>
          </div>
        )}
      </section>

      {/* Egyptian Food & Workout Engine Preview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold">100% Egyptian Food Database</h4>
              <p className="text-xs text-muted-foreground">Dual grams + Egyptian household measurement units</p>
            </div>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Ful Medames + Olive Oil (فول بالزيت الحار/الزيتون)</span>
              <span className="text-foreground font-mono">4 Tbsp / 120g</span>
            </li>
            <li className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Baladi Bread (عيش بلدي طازج)</span>
              <span className="text-foreground font-mono">1/2 Loaf / 65g</span>
            </li>
            <li className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Quraish Cheese with Tomato (جبنة قريش بالطماطم)</span>
              <span className="text-foreground font-mono">150g</span>
            </li>
            <li className="flex justify-between pb-1">
              <span>Mahshi Wara' Enab (محشي ورق عنب)</span>
              <span className="text-foreground font-mono">5 Fingers / 110g</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold">Intelligent Workout Engine</h4>
              <p className="text-xs text-muted-foreground">Beginner-friendly Double Progression & 3-tap effort check</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background border border-border text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">Dumbbell Bench Press</p>
                <p className="text-muted-foreground">3 sets × 10 reps @ 20 kg</p>
              </div>
              <div className="flex gap-1.5">
                <span className="px-2 py-1 rounded bg-muted text-[10px] font-medium">Easy</span>
                <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">Good Form ✓</span>
                <span className="px-2 py-1 rounded bg-muted text-[10px] font-medium">Hard</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Auto-progression rule: 3×10 with "Good Form" ➔ +2.5 kg prescribed next session!</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
