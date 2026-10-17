import { describe, it, expect } from "vitest";
import { redis, cacheSet, cacheGet, cacheDel, rateLimiters } from "../redis";

describe("Upstash Redis Integration & Sliding-Window Rate Limiting", () => {
  it("should successfully ping Upstash Redis and receive PONG", async () => {
    const response = await redis.ping();
    expect(response).toBe("PONG");
  });

  it("should write, read, and delete cache keys accurately with TTL", async () => {
    const testKey = "test:food:koshary";
    const sampleData = {
      id: "test-koshary-123",
      name: "Egyptian Koshary",
      caloriesPer100g: 168,
    };

    // Set with 60 second TTL
    await cacheSet(testKey, sampleData, 60);

    // Read back
    const cached = await cacheGet<typeof sampleData>(testKey);
    expect(cached).not.toBeNull();
    expect(cached?.name).toBe("Egyptian Koshary");
    expect(cached?.caloriesPer100g).toBe(168);

    // Delete
    await cacheDel(testKey);
    const deleted = await cacheGet(testKey);
    expect(deleted).toBeNull();
  });

  it("should successfully apply sliding-window rate limiting", async () => {
    const testIdentifier = `test-client-${Date.now()}`;
    const result = await rateLimiters.foodSearch.limit(testIdentifier);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(60);
    expect(result.remaining).toBeLessThanOrEqual(60);
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});
