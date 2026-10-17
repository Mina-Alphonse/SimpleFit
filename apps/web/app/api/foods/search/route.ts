import { NextRequest, NextResponse } from "next/server";
import { db, foods, redis, rateLimiters, sql } from "@masrfit/database";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SearchQuerySchema = z.object({
  q: z.string().min(1, "Search query must not be empty").max(100),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  // 1. Sliding-Window Rate Limiting (60 req/min per IP)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimitResult = await rateLimiters.foodSearch.limit(clientIp);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: "You have exceeded the rate limit for food search. Please wait before making more queries.",
        reset: rateLimitResult.reset,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        },
      }
    );
  }

  // 2. Validate Query Parameters
  const { searchParams } = new URL(req.url);
  const parsed = SearchQuerySchema.safeParse({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || undefined,
    limit: searchParams.get("limit") || 20,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation Error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { q, category, limit } = parsed.data;
  const normalizedQuery = q.trim().toLowerCase();

  // 3. Upstash Redis Edge Caching: Check cache first
  const cacheKey = `masrfit:food:search:${normalizedQuery}:${category || "all"}:${limit}`;
  try {
    const cachedResults = await redis.get(cacheKey);
    if (cachedResults) {
      return NextResponse.json({
        source: "redis_cache",
        query: q,
        count: Array.isArray(cachedResults) ? cachedResults.length : 0,
        data: cachedResults,
      });
    }
  } catch (error) {
    console.warn("[Redis Cache Miss/Error]", error);
  }

  // 4. PostgreSQL Trigram Word-Similarity Fuzzy Search
  try {
    const isArabic = /[\u0600-\u06FF]/.test(q);

    let queryCondition;
    if (isArabic) {
      // Arabic fuzzy matching using word_similarity
      queryCondition = sql`(
        word_similarity(${q}, ${foods.nameAr}) > 0.25 
        OR ${foods.nameAr} ILIKE ${`%${q}%`}
      )`;
    } else {
      // English fuzzy matching using word_similarity and ILIKE
      queryCondition = sql`(
        word_similarity(${q}, ${foods.nameEn}) > 0.25 
        OR ${foods.nameEn} ILIKE ${`%${q}%`}
      )`;
    }

    if (category) {
      queryCondition = sql`${queryCondition} AND ${foods.category} = ${category}`;
    }

    const orderExpr = isArabic
      ? sql`word_similarity(${q}, ${foods.nameAr}) DESC, ${foods.nameAr} ASC`
      : sql`word_similarity(${q}, ${foods.nameEn}) DESC, ${foods.nameEn} ASC`;

    const results = await db
      .select({
        id: foods.id,
        nameEn: foods.nameEn,
        nameAr: foods.nameAr,
        category: foods.category,
        subCategory: foods.subCategory,
        caloriesPer100g: foods.caloriesPer100g,
        proteinPer100g: foods.proteinPer100g,
        carbsPer100g: foods.carbsPer100g,
        fatsPer100g: foods.fatsPer100g,
        fiberPer100g: foods.fiberPer100g,
        householdPortions: foods.householdPortions,
      })
      .from(foods)
      .where(queryCondition)
      .orderBy(orderExpr)
      .limit(limit);

    // 5. Cache result in Redis for 1 hour (3600 seconds)
    try {
      await redis.set(cacheKey, results, { ex: 3600 });
    } catch (cacheErr) {
      console.warn("[Redis Set Error]", cacheErr);
    }

    return NextResponse.json({
      source: "postgres_db",
      query: q,
      count: results.length,
      data: results,
    });
  } catch (dbError) {
    console.error("[Food Search Error]", dbError);
    return NextResponse.json(
      { error: "Internal Server Error", message: (dbError as Error).message },
      { status: 500 }
    );
  }
}
