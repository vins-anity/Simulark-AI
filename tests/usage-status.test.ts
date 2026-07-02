import { describe, expect, it } from "vitest";
import { buildUsageSnapshot, snapshotFromRateLimitResult } from "../lib/usage-status";

describe("usage-status", () => {
  it("resets used count when the stored date is not today (UTC)", () => {
    const snapshot = buildUsageSnapshot({
      tier: "flash",
      generationCount: 42,
      recordDate: "2020-01-01",
      now: new Date("2026-07-03T12:00:00.000Z"),
    });

    expect(snapshot.used).toBe(0);
    expect(snapshot.remaining).toBe(80);
  });

  it("computes remaining from rate-limit headers snapshot", () => {
    const snapshot = snapshotFromRateLimitResult({
      tier: "pro",
      limit: 25,
      remaining: 10,
      reset: "2026-07-04T00:00:00.000Z",
    });

    expect(snapshot.used).toBe(15);
    expect(snapshot.percentUsed).toBe(60);
  });
});
