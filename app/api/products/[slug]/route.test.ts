import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { findUniqueMock } = vi.hoisted(() => ({ findUniqueMock: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    premiumHoneyCollection: { findUnique: findUniqueMock },
  },
}));

import { GET } from "./route";

beforeEach(() => {
  findUniqueMock.mockReset();
});

const req = new NextRequest("http://localhost/api/products/madu-hutan");

describe("GET /api/products/[slug]", () => {
  it("returns 404 when product not found", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await GET(req, {
      params: Promise.resolve({ slug: "madu-hutan" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns product when found", async () => {
    findUniqueMock.mockResolvedValue({ id: "p1", slug: "madu-hutan", name: "Madu Hutan" });
    const res = await GET(req, {
      params: Promise.resolve({ slug: "madu-hutan" }),
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe("madu-hutan");
  });
});
