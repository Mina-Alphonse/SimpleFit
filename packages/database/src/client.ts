import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as path from "path";
import * as dotenv from "dotenv";

// Ensure .env is loaded in development and script executions
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/simplefit";

// Connection pool configuration for high concurrency & transaction-mode pooler compatibility
export const pgClient = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 20 : 5,
  idle_timeout: 20,
  connect_timeout: 15,
  prepare: false, // Required for Supabase transaction-mode pooler (port 6543)
});

export const db = drizzle(pgClient, { schema });
export type Database = typeof db;
