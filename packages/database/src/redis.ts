import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Live Upstash Redis Client configured for edge & serverless runtime
 */
export const redis = new Redis({
  url: url || "https://placeholder-url.upstash.io",
  token: token || "placeholder-token",
});

/**
 * Pre-configured Sliding Window Rate Limiters for 100k+ scale:
 * Prevents API abuse, protects database connections, and mitigates brute-force attacks.
 */
export const rateLimiters = {
  // General API endpoints: 30 requests per 10 seconds per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "10 s"),
    analytics: true,
    prefix: "@masrfit/rl/api",
  }),

  // Auth endpoints (Sign-in/Sign-up/Magic-links): 5 requests per 60 seconds
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "@masrfit/rl/auth",
  }),

  // Food Search Autocomplete: 60 requests per 60 seconds
  foodSearch: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: true,
    prefix: "@masrfit/rl/food-search",
  }),
};

/**
 * Cache Helper Utilities
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.warn(`[Redis Cache Warning] Failed to get key ${key}:`, error);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.warn(`[Redis Cache Warning] Failed to set key ${key}:`, error);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Redis Cache Warning] Failed to delete key ${key}:`, error);
  }
}
