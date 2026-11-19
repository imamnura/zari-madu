import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";
import { generateOrderNumber, __testing } from "./orderNumber";

const executeRawMock = vi.fn();
const findFirstMock = vi.fn();
const callOrder: string[] = [];

const tx = {
  $executeRaw: (...args: unknown[]) => {
    callOrder.push("lock");
    return executeRawMock(...args);
  },
  order: {
    findFirst: (...args: unknown[]) => {
      callOrder.push("findFirst");
      return findFirstMock(...args);
    },
  },
} as unknown as Prisma.TransactionClient;

beforeEach(() => {
  executeRawMock.mockReset().mockResolvedValue(1);
  findFirstMock.mockReset();
  callOrder.length = 0;
});

describe("todayPrefix", () => {
  it("formats date as ZH-YYYYMMDD in Asia/Jakarta", () => {
    expect(__testing.todayPrefix(new Date("2026-05-12T08:00:00.000Z"))).toBe("ZH-20260512");
  });

  it("uses the WIB date between 00:00-07:00 WIB (still the previous day in UTC)", () => {
    // 2026-05-12 00:30 WIB = 2026-05-11 17:30 UTC
    expect(__testing.todayPrefix(new Date("2026-05-11T17:30:00.000Z"))).toBe("ZH-20260512");
  });

  it("rolls over exactly at midnight WIB", () => {
    expect(__testing.todayPrefix(new Date("2026-05-12T16:59:59.999Z"))).toBe("ZH-20260512");
    expect(__testing.todayPrefix(new Date("2026-05-12T17:00:00.000Z"))).toBe("ZH-20260513");
  });

  it("rolls over month and year boundaries in WIB", () => {
    expect(__testing.todayPrefix(new Date("2026-12-31T17:00:00.000Z"))).toBe("ZH-20270101");
  });
});

describe("formatNumber", () => {
  it("pads sequence to 4 digits", () => {
    expect(__testing.formatNumber("ZH-20260512", 1)).toBe("ZH-20260512-0001");
    expect(__testing.formatNumber("ZH-20260512", 42)).toBe("ZH-20260512-0042");
  });
});

describe("generateOrderNumber", () => {
  const now = new Date("2026-05-11T17:30:00.000Z"); // 00:30 WIB, 12 Mei

  it("returns first sequence when no order exists today", async () => {
    findFirstMock.mockResolvedValue(null);
    await expect(generateOrderNumber(tx, now)).resolves.toBe("ZH-20260512-0001");
  });

  it("continues from the highest number today, not from a row count", async () => {
    // Bug lama: count() = 1 → kandidat 0002 padahal 0007 sudah ada (order terhapus/bentrok).
    findFirstMock.mockResolvedValue({ orderNumber: "ZH-20260512-0007" });
    await expect(generateOrderNumber(tx, now)).resolves.toBe("ZH-20260512-0008");
  });

  it("looks up today's WIB prefix ordered by orderNumber desc", async () => {
    findFirstMock.mockResolvedValue(null);
    await generateOrderNumber(tx, now);
    expect(findFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderNumber: { startsWith: "ZH-20260512-" } },
        orderBy: { orderNumber: "desc" },
      }),
    );
  });

  it("takes the transaction advisory lock before reading the last number", async () => {
    findFirstMock.mockResolvedValue(null);
    await generateOrderNumber(tx, now);
    expect(callOrder).toEqual(["lock", "findFirst"]);
    const [strings] = executeRawMock.mock.calls[0] as [TemplateStringsArray];
    expect(strings.join("?")).toContain("pg_advisory_xact_lock");
  });

  it("falls back to sequence 1 when the last number is malformed", async () => {
    findFirstMock.mockResolvedValue({ orderNumber: "ZH-20260512-abc" });
    await expect(generateOrderNumber(tx, now)).resolves.toBe("ZH-20260512-0001");
  });
});
