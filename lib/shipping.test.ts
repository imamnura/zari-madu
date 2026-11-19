import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    shippingRate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { resolveShippingFee, listActiveProvinces } from "./shipping";

const mocked = prisma as unknown as {
  shippingRate: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  mocked.shippingRate.findFirst.mockReset();
  mocked.shippingRate.findMany.mockReset();
});

describe("resolveShippingFee", () => {
  it("returns null for empty province", async () => {
    expect(await resolveShippingFee("")).toBeNull();
    expect(await resolveShippingFee("   ")).toBeNull();
    expect(mocked.shippingRate.findFirst).not.toHaveBeenCalled();
  });

  it("returns null when no rate row exists", async () => {
    mocked.shippingRate.findFirst.mockResolvedValue(null);
    expect(await resolveShippingFee("Bali")).toBeNull();
  });

  it("returns fee + days when rate exists", async () => {
    mocked.shippingRate.findFirst.mockResolvedValue({
      province: "DKI Jakarta",
      fee: 15000,
      estimatedDays: "1-2 hari",
    });
    expect(await resolveShippingFee("DKI Jakarta")).toEqual({
      province: "DKI Jakarta",
      fee: 15000,
      estimatedDays: "1-2 hari",
    });
  });
});

describe("listActiveProvinces", () => {
  it("returns sorted active province names", async () => {
    mocked.shippingRate.findMany.mockResolvedValue([
      { province: "Banten" },
      { province: "DKI Jakarta" },
    ]);
    expect(await listActiveProvinces()).toEqual(["Banten", "DKI Jakarta"]);
  });
});
