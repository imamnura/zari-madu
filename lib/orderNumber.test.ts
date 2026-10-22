import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { generateOrderNumber, __testing } from "./orderNumber";

const mockedPrisma = prisma as unknown as {
  order: { count: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  mockedPrisma.order.count.mockReset();
  mockedPrisma.order.findUnique.mockReset();
});

describe("todayPrefix", () => {
  it("formats date as ZH-YYYYMMDD", () => {
    expect(__testing.todayPrefix(new Date("2026-05-12T08:00:00.000Z"))).toBe(
      "ZH-" +
        new Date("2026-05-12T08:00:00.000Z").getFullYear().toString() +
        String(new Date("2026-05-12T08:00:00.000Z").getMonth() + 1).padStart(2, "0") +
        String(new Date("2026-05-12T08:00:00.000Z").getDate()).padStart(2, "0"),
    );
  });
});

describe("formatNumber", () => {
  it("pads sequence to 4 digits", () => {
    expect(__testing.formatNumber("ZH-20260512", 1)).toBe("ZH-20260512-0001");
    expect(__testing.formatNumber("ZH-20260512", 42)).toBe("ZH-20260512-0042");
  });
});

describe("generateOrderNumber", () => {
  it("returns first sequence when no collision", async () => {
    mockedPrisma.order.count.mockResolvedValue(0);
    mockedPrisma.order.findUnique.mockResolvedValue(null);
    const num = await generateOrderNumber(new Date("2026-05-12T08:00:00.000Z"));
    expect(num).toMatch(/^ZH-\d{8}-0001$/);
  });

  it("retries on collision then succeeds", async () => {
    mockedPrisma.order.count.mockResolvedValue(0);
    mockedPrisma.order.findUnique
      .mockResolvedValueOnce({ id: "exists" })
      .mockResolvedValueOnce(null);
    const num = await generateOrderNumber(new Date("2026-05-12T08:00:00.000Z"));
    expect(num).toMatch(/^ZH-\d{8}-0002$/);
  });

  it("throws after MAX_RETRIES collisions", async () => {
    mockedPrisma.order.count.mockResolvedValue(0);
    mockedPrisma.order.findUnique.mockResolvedValue({ id: "always-collide" });
    await expect(generateOrderNumber()).rejects.toThrow(/nomor pesanan unik/);
  });
});
