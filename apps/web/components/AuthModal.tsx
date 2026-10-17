"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { X, Lock, Mail, User as UserIcon, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginAsDemo } = useAuth();
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === "signin") {
        const res = await login(email, password);
        if (!res.success) setError(res.error || "Authentication failed");
      } else {
        const res = await register(email, password, name);
        if (!res.success) setError(res.error || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAsDemo();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-card-foreground">
        {/* Background gradient blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md mb-3">
            SF
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {tab === "signin"
              ? isAr
                ? "تسجيل الدخول إلى سيمبل فيت"
                : "Sign In to SimpleFit"
              : isAr
              ? "إنشاء حساب جديد"
              : "Create Your Account"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAr
              ? "احفظ خطتك المحسوبة وتابع أوزانك وتمارينك بدقة"
              : "Save your personalized plan and track your lifts & nutrition seamlessly."}
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-foreground">
                {isAr ? "تجربة فورية بنقرة واحدة:" : "Instant 1-Click Demo:"}
              </span>
              <span className="text-muted-foreground">
                {isAr ? "دخول فوري بحساب كابتن أحمد (رياضي مصري)" : "Login with Ahmed's Cairo Athlete profile"}
              </span>
            </div>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 shadow-xs"
          >
            {isAr ? "دخول تجريبي" : "Demo Login"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-muted p-1 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === "signin" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
            }`}
          >
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === "signup" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
            }`}
          >
            {isAr ? "حساب جديد" : "Sign Up"}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                {isAr ? "الاسم" : "Full Name"}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted-foreground absolute top-3 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? "مثال: مروان الشريف" : "e.g. John Doe"}
                  className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute top-3 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute top-3 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm mt-4 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>{isAr ? "جاري المعالجة..." : "Processing..."}</span>
            ) : (
              <>
                <span>{tab === "signin" ? (isAr ? "دخول" : "Sign In") : (isAr ? "إنشاء حساب" : "Create Account")}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{isAr ? "حماية وتشفير عالي الأمان JWT / OWASP" : "OWASP Top 10 Compliant & Encrypted"}</span>
        </div>
      </div>
    </div>
  );
}
