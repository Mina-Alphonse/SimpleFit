import { pgClient } from "./client";

async function runMigrate() {
  console.log("🛠️ Running SimpleFit Database Schema Updates...");
  try {
    await pgClient.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        name text,
        role text NOT NULL DEFAULT 'user',
        password_hash text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        age integer NOT NULL,
        biological_sex text NOT NULL,
        height_cm numeric(5,2) NOT NULL,
        current_weight_kg numeric(5,2) NOT NULL,
        goal_weight_kg numeric(5,2),
        activity_level text NOT NULL,
        fitness_experience text NOT NULL,
        training_environment text NOT NULL,
        training_days_per_week integer NOT NULL DEFAULT 3,
        session_duration_mins integer NOT NULL DEFAULT 45,
        caloric_tier text NOT NULL,
        plan_cadence text NOT NULL DEFAULT 'weekly',
        budget_tier text NOT NULL DEFAULT 'standard',
        bmr integer NOT NULL,
        tdee integer NOT NULL,
        target_calories integer NOT NULL,
        target_protein_g integer NOT NULL,
        target_carbs_g integer NOT NULL,
        target_fats_g integer NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS meal_plans (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cadence text NOT NULL,
        total_calories integer NOT NULL,
        protein_g integer NOT NULL,
        carbs_g integer NOT NULL,
        fats_g integer NOT NULL,
        plan_days jsonb NOT NULL,
        grocery_list jsonb DEFAULT '[]'::jsonb,
        is_active text NOT NULL DEFAULT 'true',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS workout_programs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        split_type text NOT NULL,
        frequency_days_per_week integer NOT NULL,
        program_days jsonb NOT NULL,
        is_active text NOT NULL DEFAULT 'true',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        logged_date date NOT NULL,
        workout_name text NOT NULL,
        duration_minutes integer,
        exercises_completed jsonb NOT NULL,
        progression_applied jsonb DEFAULT '[]'::jsonb,
        notes text,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS daily_nutrition_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        logged_date date NOT NULL,
        consumed_calories integer NOT NULL,
        consumed_protein_g integer NOT NULL,
        consumed_carbs_g integer NOT NULL,
        consumed_fats_g integer NOT NULL,
        step_count integer DEFAULT 0,
        morning_weight_kg numeric(5,2),
        surplus_reconciled jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON meal_plans(user_id);
      CREATE INDEX IF NOT EXISTS workout_programs_user_id_idx ON workout_programs(user_id);
      CREATE INDEX IF NOT EXISTS workout_logs_user_date_idx ON workout_logs(user_id, logged_date);
      CREATE INDEX IF NOT EXISTS daily_nutrition_logs_user_date_idx ON daily_nutrition_logs(user_id, logged_date);
    `);
    console.log("✅ All user, profile, meal plan, and logging tables verified & updated in database.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

runMigrate();
