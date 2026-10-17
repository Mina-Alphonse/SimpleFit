"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

interface LogoProps {
  className?: string;
  variant?: "icon" | "full" | "hero";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  locale?: "ar" | "en";
}

export function Logo({
  className = "",
  variant = "full",
  size = "md",
  showTagline = false,
  locale: propLocale,
}: LogoProps) {
  let ctxLocale: "ar" | "en" = "ar";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lang = useLanguage();
    if (lang?.locale) ctxLocale = lang.locale;
  } catch {
    ctxLocale = "ar";
  }

  const activeLocale = propLocale || ctxLocale;
  const isAr = activeLocale === "ar";

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Innovative Vector Icon */}
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Primary Gradient */}
            <linearGradient id="sf-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            {/* Accent Cyan Gradient */}
            <linearGradient id="sf-grad-accent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="sf-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Rounded Hexagonal / Squircle Backdrop */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="26"
            className="fill-card stroke-border/80"
            strokeWidth="3"
          />

          {/* Background Subtle Wave Accent */}
          <path
            d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50"
            stroke="url(#sf-grad-primary)"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.4"
          />

          {/* Interlocking Dynamic 'S' + Infinity Fitness Ribbon */}
          {/* Top Loop: Represents Nutrition & Vitality (Leaf Form) */}
          <path
            d="M68 34C68 25.1634 60.8366 18 52 18C41 18 32 26 32 37C32 46 39 51 50 55L54 56.5C65 60.5 70 66 70 74C70 82.8366 62.8366 90 54 90C43 90 34 83 32 72"
            stroke="url(#sf-grad-primary)"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#sf-glow)"
          />

          {/* Intersecting Energy Core: Modern Dumbbell Bar & Heartbeat Pulse */}
          <path
            d="M34 50H46L52 38L58 62L64 50H74"
            stroke="url(#sf-grad-accent)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vitality Leaf Accent Knot at Center Top */}
          <circle cx="52" cy="18" r="4.5" fill="#34d399" />
          <circle cx="54" cy="90" r="4.5" fill="#0d9488" />
        </svg>
      </div>

      {/* Brand Typography Wordmark: Clean, Single Name Matching Active Language */}
      {variant !== "icon" && (
        <div className="flex flex-col">
          <div className="flex items-center">
            {isAr ? (
              <span className={`font-black tracking-tight text-foreground ${textSizes[size]}`}>
                سيمبل <span className="text-primary">فيت</span>
              </span>
            ) : (
              <span className={`font-black tracking-tight text-foreground ${textSizes[size]}`}>
                Simple<span className="text-primary">Fit</span>
              </span>
            )}
          </div>

          {showTagline && (
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5 hidden sm:block">
              {isAr ? "التغذية والتمارين الذكية لواقع مصر" : "Smart Nutrition & Workouts for Egypt"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
