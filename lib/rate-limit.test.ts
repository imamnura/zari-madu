import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryRawMock, deleteManyMock } = vi.hoisted(() => ({
  queryRawMock: vi.fn(),
  deleteManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: queryRawMock, rateLimit: { deleteMany: deleteManyMock } },
}));

import {
  cleanupExpiredRateLimits,
  consumeRateLimit,
  consumeRateLimits,
  getClientIp,
  rateLimitMessage,
  tooManyRequestsResponse,
  type IRateLimitRule,
} from "./rate-limit";

const rule: IRateLimitRule = { name: "test:ip", limit: 3, windowSeconds: 900 };

beforeEach(() => {
  queryRawMock.mockReset();
  deleteManyMock.mockReset();
});

function sqlOf(call: unknown[]): { text: string; values: unknown[] } {
  const [strings, ...values] = call as [TemplateStringsArray, ...unknown[]];
  return { text: strings.join("?"), values };
}

describe("consumeRateLimit", () => {
  it("increments atomically in one upsert statement keyed by rule + identifier", async () => {
    queryRawMock.mockResolvedValue([{ count: 1, retryAfterSeconds: 900 }]);

    const result = await consumeRateLimit(rule, "203.0.113.7");

    expect(result).toEqual({ allowed: true, remaining: 2, retryAfterSeconds: 900 });
    expect(queryRawMock).toHaveBeenCalledTimes(1);
    const { text, values } = sqlOf(queryRawMock.mock.calls[0]);
    expect(text).toContain('INSERT INTO "rate_limits"');
    expect(text).toContain('ON CONFLICT ("key") DO UPDATE');
    expect(text).toContain("RETURNING");
    expect(values).toEqual(["test:ip:203.0.113.7", 900]);
  });

  it("normalises the identifier case so emails cannot dodge the limit", async () => {
    queryRawMock.mockResolvedValue([{ count: 1, retryAfterSeconds: 900 }]);
    await consumeRateLimit(rule, "1.2.3.4:Sari@Example.COM");
    expect(sqlOf(queryRawMock.mock.calls[0]).values[0]).toBe("test:ip:1.2.3.4:sari@example.com");
  });

  it("allows up to the limit and blocks the next attempt", async () => {
    queryRawMock.mockResolvedValueOnce([{ count: 3, retryAfterSeconds: 400 }]);
    queryRawMock.mockResolvedValueOnce([{ count: 4, retryAfterSeconds: 399 }]);

    await expect(consumeRateLimit(rule, "ip")).resolves.toMatchObject({ allowed: true, remaining: 0 });
    await expect(consumeRateLimit(rule, "ip")).resolves.toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 399,
    });
  });

  it("fails open when the counter table is unavailable", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    queryRawMock.mockRejectedValue(new Error('relation "rate_limits" does not exist'));

    await expect(consumeRateLimit(rule, "ip")).resolves.toEqual({
      allowed: true,
      remaining: 3,
      retryAfterSeconds: 0,
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("consumeRateLimits", () => {
  it("counts every rule and blocks if any one is exceeded", async () => {
    queryRawMock
      .mockResolvedValueOnce([{ count: 2, retryAfterSeconds: 100 }])
      .mockResolvedValueOnce([{ count: 6, retryAfterSeconds: 700 }]);

    const result = await consumeRateLimits([
      [{ name: "a", limit: 20, windowSeconds: 900 }, "ip"],
      [{ name: "b", limit: 5, windowSeconds: 900 }, "ip:email"],
    ]);

    expect(queryRawMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 700 });
  });

  it("reports the tightest remaining budget when all rules pass", async () => {
    queryRawMock
      .mockResolvedValueOnce([{ count: 2, retryAfterSeconds: 100 }])
      .mockResolvedValueOnce([{ count: 4, retryAfterSeconds: 100 }]);
    const result = await consumeRateLimits([
      [{ name: "a", limit: 20, windowSeconds: 900 }, "ip"],
      [{ name: "b", limit: 5, windowSeconds: 900 }, "ip:email"],
    ]);
    expect(result).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("tooManyRequestsResponse", () => {
  it("returns 429 with Retry-After and an Indonesian message", async () => {
    const res = tooManyRequestsResponse({ allowed: false, remaining: 0, retryAfterSeconds: 125 });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("125");
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: "Terlalu banyak percobaan. Coba lagi dalam 3 menit.",
    });
  });

  it("never asks to wait less than a minute", () => {
    expect(rateLimitMessage(5)).toBe("Terlalu banyak percobaan. Coba lagi dalam 1 menit.");
  });
});

describe("cleanupExpiredRateLimits", () => {
  it("deletes counters whose window has passed", async () => {
    deleteManyMock.mockResolvedValue({ count: 7 });
    await expect(cleanupExpiredRateLimits()).resolves.toBe(7);
    expect(deleteManyMock).toHaveBeenCalledWith({ where: { resetAt: { lt: expect.any(Date) } } });
  });
});
