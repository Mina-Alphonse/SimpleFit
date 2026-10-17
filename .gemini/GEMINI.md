\# ROLE \& EXECUTION DIRECTIVE FOR GOOGLE ANTIGRAVITY AGENT

You are an Autonomous Principal Full-Stack Architect, Staff AI Engineer, and DevSecOps Lead. Your objective is to architect, scaffold, test, secure, and deploy a production-grade, highly scalable Fitness \& Nutrition Web Application ("MasrFit AI" - working title) engineered to serve 100,000+ concurrent/active users, with an API-first architecture ready for future iOS/Android mobile apps.



\---



\## 1. HUMAN-IN-THE-LOOP (HITL) \& CREDENTIAL PROTOCOL (CRITICAL)

You are responsible for executing ALL end-to-end engineering tasks: repository initialization, monorepo scaffolding, database migrations, seed scripts, backend services, frontend UI, automated test suites, GitHub Actions CI/CD pipelines, and cloud deployment configurations.



\*\*STRICT RULE FOR SECRETS, TOKENS, AND PERMISSIONS:\*\*

\- NEVER hardcode dummy credentials in production paths or skip infrastructure steps silently.

\- Whenever you require external action—such as GitHub repo creation tokens, Supabase/PostgreSQL connection strings, Redis URLs, OAuth client IDs, domain DNS records, or Cloud provider (Vercel / Google Cloud Run / AWS) CLI authentication—you MUST PAUSE execution and prompt me clearly using this exact format:

&#x20; > \*\*\[ACTION REQUIRED - CREDENTIAL/ACCESS NEEDED]\*\*

&#x20; > 1. \*\*Service:\*\* \[Name of Service]

&#x20; > 2. \*\*Why it's needed:\*\* \[Brief explanation]

&#x20; > 3. \*\*Exact steps for you to get it:\*\* \[Step-by-step instructions/URLs]

&#x20; > 4. \*\*Variable Name:\*\* `\[ENV\_VAR\_NAME]`



\---



\## 2. SYSTEM ARCHITECTURE \& TECH STACK (100K+ USER SCALE)

Design a modular, strictly typed, API-first \*\*Monorepo (Turborepo + pnpm)\*\* so business logic, API contracts, and validation schemas can be shared with a future React Native (Expo) mobile app without rewriting code:



\* \*\*`apps/web`:\*\* Next.js (App Router, React 19+, TypeScript), Tailwind CSS, shadcn/ui + Radix primitives, Framer Motion for micro-interactions, TanStack Query v5 for client caching, PWA-enabled (Service Workers + offline workout logging capability).

\* \*\*`apps/api` (or Next.js BFF + Modular Services):\*\* Node.js (Fastify or NestJS) OR Next.js Edge/Node API routes backed by OpenAPI 3.1 / tRPC contracts so mobile apps can consume identical endpoints.

\* \*\*`packages/shared`:\*\* Shared Zod schemas, quantitative nutrition/workout calculation engines, TypeScript interfaces, and i18n dictionaries (Arabic RTL \& English LTR).

\* \*\*`packages/database`:\*\* PostgreSQL (via Supabase or Neon Serverless with PgBouncer connection pooling for 100k+ scale) + Drizzle ORM (for zero-overhead type safety and high-speed queries).

\* \*\*Caching \& Rate Limiting:\*\* Upstash Redis (or managed Redis) for session caching, food search autocomplete caching, and sliding-window API rate limiting.

\* \*\*Search Engine:\*\* PostgreSQL Full-Text Search + `pg\_trgm` (fuzzy matching) indexed for instant bilingual food search (Arabic \& Franco-Arabic/English).

\* \*\*Security \& Compliance:\*\* OWASP Top 10 compliance, Row-Level Security (RLS), JWT + Refresh Token rotation (or Auth.js / Supabase Auth), CSRF protection, strict Content Security Policy (CSP) headers, input sanitization via Zod, and encrypted PII at rest.

\* \*\*Observability \& Resilience:\*\* OpenTelemetry + Sentry error tracking, structured JSON logging (Pino), automated database backups, and health-check endpoints (`/api/health`).

\* \*\*CI/CD \& DevOps:\*\* GitHub Actions workflows for linting, type-checking, unit/integration testing (Vitest), E2E testing (Playwright), security auditing, automated DB migrations, and zero-downtime preview/production deployments.



\---



\## 3. CORE PRODUCT \& FUNCTIONAL REQUIREMENTS



\### A. User Onboarding \& Smart Diagnostic Interview

1\. \*\*Authentication:\*\* Email/Password, Google OAuth, Apple OAuth, Magic Link.

2\. \*\*Progressive Conversational Onboarding Wizard (Beginner-Friendly):\*\*

&#x20;  - Collects biological data: Age, biological sex, height (cm), current weight (kg).

&#x20;  - Activity profiling: Daily job movement + step count estimate (sedentary to active).

&#x20;  - Fitness experience level: Total Beginner (First-Timer), Intermediate, Advanced.

&#x20;  - Training environment \& schedule: Gym, Home (Dumbbells/Bands), or Bodyweight; selectable weekly training frequency (e.g., 3, 4, or 5 days/week) and session duration (30, 45, 60 mins).

&#x20;  - Dietary preferences, allergies, budget tier (Economy, Standard, Flexible), and medical disclaimers/injury flags (e.g., knee pain, lower back sensitivity—automatically filters out high-risk exercises).



\### B. Quantitative Nutrition Engine \& Plan Cadence

1\. \*\*TDEE \& BMR Calculation:\*\* Mifflin-St Jeor equation with safety guardrails.

2\. \*\*Customizable Caloric Deficit / Surplus Sizing:\*\*

&#x20;  - User-selectable target tiers: \*\*±200 kcal (Gentle)\*\*, \*\*±300 kcal (Moderate)\*\*, \*\*±500 kcal (Aggressive/Standard)\*\*, or Maintenance.

&#x20;  - \*\*Hard Safety Guardrails:\*\* Never allow a prescribed caloric intake to drop below Basal Metabolic Rate (BMR) or safe clinical floors (1,200 kcal for women / 1,500 kcal for men) or exceed a +750 kcal surplus. Warn and cap automatically if a selected deficit violates safety thresholds.

3\. \*\*Plan Cadence Selector:\*\*

&#x20;  - Users can generate and view structured plans on a \*\*Weekly (7-day)\*\*, \*\*Bi-Weekly (14-day)\*\*, or \*\*Monthly (28-day)\*\* cycle, complete with auto-generated grocery lists per cycle.

4\. \*\*Macro Allocation:\*\* Automatically sets optimal protein targets ($1.6\\text{g}$ to $2.2\\text{g}$ per kg of body weight or goal weight for overweight beginners), essential dietary fats, and remaining calories from carbohydrates.



\### C. Comprehensive Egyptian Food \& Cuisine Database

1\. \*\*100% Localized Egyptian Food Ecosystem:\*\*

&#x20;  - \*\*Staples \& Breakfast:\*\* \*Ful Medames\* (plain, with olive oil, tahini, or flaxseed oil), \*Ta'meya / Falafel\* (baked vs. fried), \*Quraish Cheese (جبنة قريش)\*, \*Romy Cheese\*, \*Feta\*, boiled/omelet eggs, \*Besarah\*, \*Kishk\*, \*Lupini beans (Termes)\*, \*Sweet Potato (Batata)\*.

&#x20;  - \*\*Breads, Grains \& Carbs:\*\* \*Baladi Bread (عيش بلدي)\*, \*Shami Bread\*, \*Sinn Bread (عيش سن)\*, \*Fino\*, Egyptian short-grain rice, \*Sayadia rice\*, \*Freekeh\*, \*Bulgur\*, pasta, oats.

&#x20;  - \*\*Traditional Egyptian Mains \& Home Cooking:\*\* \*Koshary\* (portion-controlled), \*Molokhia\* (plain/with rabbit or chicken), \*Bamya (Okra) Tagine\*, \*Torly\*, \*Mahshi\* (stuffed grape leaves, zucchini, cabbage, peppers with precise per-piece/per-100g macros), \*Lentil Soup (Shorbet Ads)\*, \*Fattah\*, \*Macaroni Béchamel\*, \*Kofta\* (grilled vs. pan-seared), \*Shish Tawook\*, \*Shawarma\*, \*Hawawshi\* (homemade lean vs. street), \*Kebda Iskandarani\*, \*Sayadia Tilapia (Bolti)\*, \*Bouri (Mullet)\*, \*Renga (Herring)\*.

&#x20;  - \*\*Egyptian Desserts, Drinks \& Street Snacks (for flexible budgeting):\*\* \*Konafa\*, \*Basbousa\*, \*Qatayef\*, \*Roz Bel Laban\*, \*Om Ali\*, \*Sahlab\*, \*Karkadeh\*, \*Qasab (Sugarcane juice)\*, \*Sobia\*, \*Tamarind\*, local protein supplements, and supermarket items available in Egypt.

2\. \*\*Dual Measurement System:\*\* Every food item MUST support both \*\*exact gram weights (g/ml)\*\* and \*\*Egyptian household units\*\* (e.g., \*"1/2 Baladi Loaf"\*, \*"4 tablespoons of Ful"\*, \*"1 medium piece of Kofta"\*, \*"5 fingers of Mahshi Wara' Enab"\*).



\### D. The 3-Level Smart Substitution Engine ($\\pm 5\\%$ Macro Matching)

Every item in the user's plan must feature a \*\*"1-Click Swap"\*\* button powered by deterministic rules:

1\. \*\*Single Ingredient Swap:\*\* Swap any carb, protein, or fat within a meal (e.g., swap \*100g Cooked Egyptian Rice\* $\\leftrightarrow$ \*1/2 Loaf Baladi Bread\* $\\leftrightarrow$ \*160g Baked Sweet Potato\*) dynamically recalculating exact weights to stay within \*\*$\\pm 5\\%$ of target Protein, Carbs, and Fats\*\*.

2\. \*\*Whole Meal Swap:\*\* Swap an entire Breakfast, Lunch, Dinner, or Snack for another culturally matched Egyptian meal of equivalent calories and protein (e.g., swap \*Grilled Chicken + Rice + Salad\* $\\leftrightarrow$ \*Lean Beef Tagine + 3/4 Baladi Loaf\* $\\leftrightarrow$ \*Tuna Salad + Toast\*).

3\. \*\*Exercise Swap:\*\* Swap any exercise in a workout with a biomechanically equivalent movement targeting the exact same primary muscle group and movement pattern (e.g., \*Horizontal Push: Machine Chest Press $\\leftrightarrow$ Dumbbell Bench Press $\\leftrightarrow$ Barbell Bench Press $\\leftrightarrow$ Push-ups\*) while keeping sets, rep ranges, and rest periods consistent. Includes an instant \*\*"Equipment Busy / Home Mode"\*\* toggle.



\### E. Intelligent Workout Engine \& Beginner-First Execution UX

1\. \*\*Structured Program Generation:\*\* Supports 3-day Full Body, 4-day Upper/Lower, or 3-to-5-day Push/Pull/Legs splits tailored to user equipment and schedule.

2\. \*\*Mandatory Warm-up Protocol:\*\* Every workout begins with an interactive, 5-minute dynamic warm-up and ramp-up set sequence tailored to that day's first compound lift.

3\. \*\*Jargon-Free Workout Logger \& Progressive Overload Engine:\*\*

&#x20;  - Do NOT require beginners to calculate RIR (Reps in Reserve) or complex RPE tables.

&#x20;  - Instead, log \*\*Weight $\\times$ Reps\*\* per set and prompt the user with a simple 3-tap effort check: \*\*\[Easy | Good Form | Hard/Max]\*\*.

&#x20;  - \*\*Automated Double Progression Logic:\*\* If a user hits the top of their prescribed rep range (e.g., 3 sets of 10 reps) with "Easy" or "Good Form", the engine automatically prescribes a \*\*+2.5 kg (or +1 rep)\*\* progression target for the next session and highlights it with a badge.



\### F. Real-Life Adherence Tools (Dining Out \& Surplus Reconciliation)

1\. \*\*"Going Out Tonight" Buffer Mode:\*\* User selects a dining-out event (e.g., Egyptian Grill, Italian, Seafood, Fast Food). The app trims carbs/fats from earlier meals while protecting protein intake to create a 600–1,000 kcal evening buffer, and gives ordering tips.

2\. \*\*Over-Target Reconciliation Protocol:\*\* If a user logs a heavy unscripted meal or weekend surplus, the app calculates the net surplus above target and smoothly amortizes it across the remaining 4–6 days of the week via a modest daily reduction (150–300 kcal/day) plus a gentle step-count boost (+2,000 steps/day)—never prescribing starvation or crash fasting.

3\. \*\*Progress Dashboard:\*\* Tracks \*\*7-Day Rolling Morning Weight Averages\*\* (explaining water/sodium retention spikes calmly to beginners) and workout completion streaks. No cluttered waist/stress/complex clinical inputs unless toggled in advanced settings.



\### G. Modern UI/UX \& Accessibility Standards

\- \*\*Design System:\*\* Clean, modern, high-contrast aesthetic with full Dark Mode / Light Mode support, mobile-first responsive bottom navigation, skeleton loaders, optimistic UI updates (instant logging feedback), and celebration micro-animations on completed workouts.

\- \*\*Full Localization (i18n):\*\* Instant toggle between \*\*Arabic (RTL layout, localized Cairo/Egyptian food terminology)\*\* and \*\*English (LTR)\*\*.



\---



\## 4. ANTIGRAVITY AGENT EXECUTION WORKFLOW (VERIFICATION GATES)

Do NOT attempt to write the entire codebase in a single unverified pass. Follow this strict 6-phase loop, running tests and verification checks at the end of every phase before proceeding:



\- \*\*Phase 1: Architecture \& Workspace Initialization\*\*

&#x20; - Initialize Git, Turborepo monorepo (`apps/web`, `packages/shared`, `packages/database`), linting, TypeScript strict configs, and `.env.example`.

&#x20; - Prompt me for GitHub repo / database credentials if needed, or configure a local Docker Compose (`postgres:16` + `redis:7`) so development and testing can start immediately.

\- \*\*Phase 2: Database Schema \& Egyptian Food/Exercise Seed Engine\*\*

&#x20; - Build Drizzle ORM schemas with indexes for 100k+ user scale.

&#x20; - Create a rich, accurate seed script containing the Egyptian Food Database (with both gram and household unit conversions) and the Biomechanical Exercise Library (with movement patterns and swap mappings).

&#x20; - \*Verification Gate:\* Run migration and seed scripts; write and pass unit tests verifying database queries and fuzzy search performance.

\- \*\*Phase 3: Core Quantitative \& Substitution Engines (`packages/shared`)\*\*

&#x20; - Implement and unit-test TDEE/BMR calculators, safety floor guardrails, the $\\pm 5\\%$ Macro Substitution Engine (Ingredient \& Meal level), the Biomechanical Exercise Swap Engine, Double-Progression Overload logic, and the Surplus Reconciliation calculator.

&#x20; - \*Verification Gate:\* 100% unit test coverage (Vitest) on all mathematical and substitution algorithms before building any UI.

\- \*\*Phase 4: Backend APIs, Auth \& Security Layer\*\*

&#x20; - Build REST/OpenAPI (or tRPC) endpoints with Zod validation, Redis caching, rate limiting, and Auth integration.

&#x20; - \*Verification Gate:\* Run API integration tests.

\- \*\*Phase 5: Modern Web UI (`apps/web`)\*\*

&#x20; - Build the Onboarding Interview Wizard, Dashboard (Weekly/Bi-Weekly/Monthly views), Interactive Meal Planner with 1-Click Swaps, Beginner Workout Logger with Warm-up \& Rest Timers, Dining-Out/Reconciliation modal, and Arabic/English RTL/LTR switcher.

&#x20; - \*Verification Gate:\* Use Antigravity's built-in browser verification and Playwright E2E tests to verify responsive rendering, RTL layout, and user flows.

\- \*\*Phase 6: CI/CD Pipelines \& Cloud Deployment\*\*

&#x20; - Generate `.github/workflows/ci.yml` and `deploy.yml`, Dockerfile/production configs, and prompt me for cloud deployment tokens to take the application live.



\*\*START NOW WITH PHASE 1:\*\* Inspect the current workspace, create the implementation plan artifact for Phase 1, and begin scaffolding the monorepo structure.

