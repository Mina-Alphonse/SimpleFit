"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { Logo } from "./Logo";
import { NavTab } from "./Header";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Dumbbell,
  Utensils,
  ShieldCheck,
  Compass,
  BarChart3,
  Flame,
  Zap,
  RotateCw,
  ShoppingBag,
  Star,
  Users,
  Layers,
  ChevronDown,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { locale } = useLanguage();
  const { loginAsDemo, setIsAuthModalOpen } = useAuth();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleDemoAthlete = async () => {
    await loginAsDemo();
    onNavigate("planner");
  };

  return (
    <div className="space-y-20 py-4 sm:py-8">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-card via-card/90 to-background border border-border p-6 sm:p-10 md:p-14 text-center space-y-8 shadow-sm">
        {/* Background glow decoration */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Egyptian Market Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>
            {isAr
              ? "المنصة الذكية الأولى المصممة 100% لنمط الحياة والسوبرماركت المصري"
              : "The #1 Smart Nutrition & Workout Engine Built for Real Egyptian Life"}
          </span>
        </div>

        {/* Hero Vector Logo */}
        <div className="flex justify-center py-2">
          <Logo size="xl" variant="hero" showTagline={false} locale={locale} />
        </div>

        {/* Main Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
            {isAr ? (
              <>
                حقق فورمتك الرياضية <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                  بدون حرمان من المحشي أو العيش البلدي
                </span>
              </>
            ) : (
              <>
                Build Your Peak Physique <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                  Without Giving Up Baladi Bread or Mahshi
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "نظام تغذية وتمارين علمي ودقيق، محسوب بالجرام ووحدات البيت المصري. بدائل طعام بنقرة واحدة بنفس الماكروز بدقة ±5%، ودعم كامل لصيام الأقباط، وبرامج تدريب من 2 إلى 6 أيام بدون تعقيد."
              : "Science-based nutrition & training calculated in exact grams and Egyptian household units. 1-click macro matching within ±5%, full Coptic Christian fasting support, and 2-to-6 day progressive overload splits."}
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 max-w-xl mx-auto">
          {/* Main CTA: Onboarding Wizard */}
          <button
            onClick={() => onNavigate("wizard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/20 hover:scale-[1.02]"
          >
            <span>{isAr ? "ابدأ التقييم وتصميم خطتك (3 دقائق)" : "Start Smart Diagnostic (3 Mins)"}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>

          {/* Secondary CTA: 1-Click Demo Athlete */}
          <button
            onClick={handleDemoAthlete}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-bold text-sm sm:text-base transition-all shadow-xs"
            title={isAr ? "الدخول كبطل تجريبي فوري" : "Try Demo Athlete Profile"}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{isAr ? "تجربة كبطل تجريبي (أحمد المصري)" : "Try Demo Athlete (Ahmed)"}</span>
          </button>
        </div>

        {/* Quick Trust Pillars */}
        <div className="pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-muted-foreground max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{isAr ? "108+ منتج سوبرماركت محلي" : "108+ Local Food Items"}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{isAr ? "بدائل دقيقة ±5% ماكروز" : "±5% Precision Swaps"}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{isAr ? "دعم صيام الأقباط النباتي" : "Christian Fasting Support"}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{isAr ? "تمارين 2 إلى 6 أيام بزيادة وزن" : "2–6 Day Double Progression"}</span>
          </div>
        </div>
      </section>

      {/* ==================== 6 CORE SUPERPOWERS (BENTO GRID) ==================== */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            {isAr ? "مصمم خصيصاً ليحل تحديات اللياقة في مصر" : "Engineered Specifically for Egyptian Reality"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAr
              ? "وداعاً للبرامج الغربية التي تقترح أفوكادو وسالمون وتتجاهل العيش البلدي، الفول، الجبنة القريش وعزومات العائلة."
              : "Say goodbye to generic plans prescribing unreachable diets while ignoring baladi bread, ful, quraish cheese, and family feasts."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: 108+ Local Food Database */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "108+ طعام وسوبرماركت مصري" : "108+ Local Egyptian Foods"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "قاعدة بيانات دقيقة تشمل الفول والجبنة القريش والمحشي والكشري والتونة والسردين والصدور، مقاسة بالجرام ووحدات البيت المصري (مثل: نصف رغيف بلدي، 4 ملاعق فول)."
                : "Full Egyptian database with gram weights and household units (e.g. 1/2 Baladi Loaf, 4 Tbsp Ful, 5 fingers Mahshi, cans of tuna)."}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">فول بزيت زيتون</span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">عيش بلدي</span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">جبنة قريش</span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">تونة دايت</span>
            </div>
          </div>

          {/* Card 2: 1-Click Macro Swaps (±5%) */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold">
              <RotateCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "تبديل ذكي بنقرة واحدة (±5%)" : "1-Click Macro Swaps (±5%)"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "ابدل أي كربوهيدرات أو بروتين ببديل من نفس النوع يضمن نفس السعرات والماكروز في حدود ±5%، مع إظهار حتى 5 بدائل مع زر لعرض المزيد وبدون تكرار في نفس الوجبة."
                : "Swap any carb or protein with a candidate of the exact same type within ±5% tolerance, paginated in sets of <=5, avoiding duplicates in the same meal."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary">
              <span>أرز مصري 100 جم</span>
              <span>↔</span>
              <span>نصف رغيف بلدي</span>
              <span>↔</span>
              <span>160 جم بطاطا</span>
            </div>
          </div>

          {/* Card 3: 2-6 Day Workout Splits */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "جداول تمارين من 2 إلى 6 أيام" : "2 to 6-Day Workout Splits"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "سواء كنت تتمرن يومين فول بودي أو 6 أيام بوش بول ليجز، البرنامج يحسب الأوزان والزيادة التدريجية (+2.5 كجم أو +1 تكرار) بفحص 3 لمسات بدون جداول RPE معقدة."
                : "From 2-day full body to 6-day PPL, our engine drives double progression (+2.5kg or +1 rep) via a beginner-friendly 3-tap effort check."}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">2 أيام</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">3 أيام</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">4 أيام</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">5 أيام</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">6 أيام</span>
            </div>
          </div>

          {/* Card 4: Christian Fasting Engine */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "محرك صيام الأقباط المتكامل" : "Christian Fasting Engine"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "خطة مخصصة تماماً للصيام الكبير أو الصيام مع السماح بالأسماك، تضمن الوصول لهدف البروتين المطلوب يومياً عبر البقوليات، الشوفان، التوفو، التونة، والسي فود."
                : "Dedicated mode for Coptic Christian fasting (Lent, Nativity, Wed/Fri), automatically filtering non-fasting foods while maintaining optimal protein intake."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? "حماية الكتلة العضلية أثناء الصيام" : "Protect Muscle Mass During Fasting"}</span>
            </div>
          </div>

          {/* Card 5: Dining Out & Buffer */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "بفر الخروجات وتدارك الفائض" : "Dining Out Buffer & Balance"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "خارج تتعشى مشاوي أو حواوشي؟ النظام يوفر لك بفر 600-1000 سعرة أثناء النهار مع حماية البروتين. ولو زدت بالويك إند، يقسّم الفائض على 5 أيام بدون حرمان وقسوة."
                : "Save a 600–1000 kcal buffer before heading out to dinner, or gently amortize any weekend surplus over the next 5 days without starvation."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-rose-500">
              <Flame className="w-3.5 h-3.5" />
              <span>{isAr ? "حياة اجتماعية طبيعية بدون إحساس بالذنب" : "Enjoy Social Life Without Guilt"}</span>
            </div>
          </div>

          {/* Card 6: Rolling Weight & Cadence Check-In */}
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? "متوسط الوزن الأسبوعي والفحص الدوري" : "Rolling Weight & Adaptive Check-In"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "متابعة متوسط 7 أيام هادئ بدون هلع من احتباس الماء بعد وجبة مالحة. فحص دوري حسب دورتك (أسبوع، أسبوعين، أو شهر) يعدل السعرات والخطوات تلقائياً إذا ثبت وزنك."
                : "7-day rolling morning weight averages to eliminate water spike panics. Periodic check-ins automatically recalibrate macros when progress stalls."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-indigo-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "تعديل ذكي تلقائي لكل دورة" : "Dynamic Auto-Recalibration"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WORKOUT PROGRAM PREVIEW TEASER ==================== */}
      <section className="bg-card border border-border p-6 sm:p-10 rounded-3xl space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-wider block mb-1">
              {isAr ? "جدول التمارين الذكي" : "Intelligent Workout Engine"}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              {isAr ? "خطة تمارين متكاملة وليست مجرد مسجل!" : "Complete Multi-Day Split, Not Just a Logger!"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              {isAr
                ? "تصفح خطتك الأسبوعية بالكامل، مع تبديل التمارين بالبدائل الميكانيكية (إذا كان الجهاز مشغولاً أو كنت في البيت)، ثم ابدأ جلسة التسجيل الحي بضغطة زر."
                : "View your entire weekly schedule, swap exercises with biomechanical equivalents (if machines are busy or you train at home), and launch the live workout logger."}
            </p>
          </div>

          <button
            onClick={() => onNavigate("workout")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shrink-0"
          >
            <Dumbbell className="w-4 h-4" />
            <span>{isAr ? "استكشف جدول التمارين الآن" : "Explore Workout Plan Now"}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Visual split pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-background border border-border/70 space-y-1">
            <span className="text-[11px] font-black text-primary uppercase">{isAr ? "يوم ١: دفع علوي" : "Day 1: Upper Push"}</span>
            <p className="text-xs font-bold text-foreground">{isAr ? "بنش بار + كتف جانبي + ترايسبس" : "Bench Press + Lateral Raise + Triceps"}</p>
            <span className="text-[10px] text-muted-foreground block">{isAr ? "٤٥ دقيقة • ٤ تمارين" : "45 mins • 4 exercises"}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-background border border-border/70 space-y-1">
            <span className="text-[11px] font-black text-teal-500 uppercase">{isAr ? "يوم ٢: سحب وظهر" : "Day 2: Upper Pull"}</span>
            <p className="text-xs font-bold text-foreground">{isAr ? "سحب بار + سحب عالي + بايسبس" : "Barbell Row + Lat Pulldown + Biceps"}</p>
            <span className="text-[10px] text-muted-foreground block">{isAr ? "٥٠ دقيقة • ٤ تمارين" : "50 mins • 4 exercises"}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-background border border-border/70 space-y-1">
            <span className="text-[11px] font-black text-cyan-500 uppercase">{isAr ? "يوم ٣: أرجل وبطن" : "Day 3: Legs & Core"}</span>
            <p className="text-xs font-bold text-foreground">{isAr ? "سكوات + هيب ثروست + سمانة" : "Squat + Hip Thrust + Calves"}</p>
            <span className="text-[10px] text-muted-foreground block">{isAr ? "٥٠ دقيقة • ٤ تمارين" : "50 mins • 4 exercises"}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-background border border-border/70 space-y-1">
            <span className="text-[11px] font-black text-amber-500 uppercase">{isAr ? "تبديل فوري" : "1-Click Swap"}</span>
            <p className="text-xs font-bold text-foreground">{isAr ? "من البار إلى الدمبل أو البيت" : "Barbell ↔ Dumbbell ↔ Home"}</p>
            <span className="text-[10px] text-muted-foreground block">{isAr ? "نفس العضلة المستهدفة" : "Exact same target muscle"}</span>
          </div>
        </div>
      </section>

      {/* ==================== EGYPTIAN ATHLETE TESTIMONIALS ==================== */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? "قصص نجاح حقيقية" : "Real Egyptian Success Stories"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            {isAr ? "أبطال غيروا حياتهم بدون تعقيد" : "Athletes Who Transformed With SimpleFit"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
              {isAr
                ? '"كنت فاكر الدايت يعني صدر فرخة مسلوق ورز أبيض من غير ملح. مع سيمبل فيت باكل فول بالزيت الحار وعيش بلدي الصبح، وخسيت 9 كيلو في 8 أسابيع."'
                : '"I thought dieting meant dry chicken breast and plain rice. With SimpleFit I have ful with baladi bread for breakfast and lost 9kg in 8 weeks."'}
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{isAr ? "م/ كريم سامي" : "Karim S."}</span>
              <span className="text-muted-foreground">{isAr ? "القاهرة • مهندس" : "Cairo • Engineer"}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
              {isAr
                ? '"فترة الصيام الكبير دايماً كنت بتخن عشان النشويات بتزيد والبروتين يقل. ميزة الصيام في سيمبل فيت ظبطت بدائل التونة والبقوليات وحافظت على عضلاتي."'
                : '"During Great Lent fasting, I always gained fat from high carbs. SimpleFit\'s fasting engine balanced my legume and tuna macros seamlessly."'}
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{isAr ? "د/ ماريان ناصف" : "Marianne N."}</span>
              <span className="text-muted-foreground">{isAr ? "الإسكندرية • صيدلانية" : "Alexandria • Pharmacist"}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
              {isAr
                ? '"برنامج التمرين بدون تعقيد الـ RPE. الـ 3 لمسات بعد كل مجموعة والزيادة التلقائية +2.5 كجم خلتني أزود قوتي في البنش سكوات بدون مدرب."'
                : '"The 3-tap effort check and automatic +2.5kg double progression helped me add serious strength to my bench press without confusing spreadsheets."'}
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{isAr ? "عمر الشافعي" : "Omar E."}</span>
              <span className="text-muted-foreground">{isAr ? "الجيزة • طالب جامعة" : "Giza • Student"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BOTTOM HIGH-CONVERTING CTA ==================== */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 sm:p-12 text-center text-white space-y-6 shadow-lg">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-xl mx-auto">
          {isAr ? "جاهز تبدأ رحلتك الحقيقية مع اللياقة؟" : "Ready to Start Your Real Fitness Journey?"}
        </h2>
        <p className="text-white/90 text-xs sm:text-base max-w-lg mx-auto">
          {isAr
            ? "تقييم ذكي مدته ٣ دقائق يحسب لك السعرات، الماكروز، ويولد جدول وجبات وتمارين مصمم خصيصاً لجسمك وظروفك."
            : "A 3-minute smart assessment calculates your TDEE, macros, and generates a personalized meal & workout split."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate("wizard")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-700 font-black text-sm sm:text-base hover:bg-white/90 transition-all shadow-md hover:scale-[1.02]"
          >
            {isAr ? "ابدأ التقييم الآن مجاناً" : "Start Free Assessment Now"}
          </button>
          <button
            onClick={handleDemoAthlete}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-700/60 border border-white/20 text-white font-bold text-sm sm:text-base hover:bg-emerald-700/80 transition-all"
          >
            {isAr ? "تجربة كبطل تجريبي" : "Try Demo Athlete"}
          </button>
        </div>
      </section>
    </div>
  );
}
