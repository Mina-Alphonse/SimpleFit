import { NextResponse } from "next/server";
import { db, redis, sql } from "@simplefit/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let redisStatus = "unknown";
  let redisLatencyMs = 0;

  // 1. PostgreSQL Health Check
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "healthy";
  } catch (error) {
    dbStatus = `unhealthy: ${(error as Error).message}`;
  }

  // 2. Upstash Redis Health Check
  try {
    const redisStart = Date.now();
    const pong = await redis.ping();
    redisLatencyMs = Date.now() - redisStart;
    redisStatus = pong === "PONG" ? "healthy" : "unexpected_response";
  } catch (error) {
    redisStatus = `unhealthy: ${(error as Error).message}`;
  }

  const isHealthy = dbStatus === "healthy" && redisStatus === "healthy";
  const totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      latencyMs: {
        database: dbLatencyMs,
        redis: redisLatencyMs,
        total: totalLatencyMs,
      },
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
