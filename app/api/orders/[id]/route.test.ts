import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, orderFindUnique } = vi.hoisted(() => ({
  authMock: vi.fn(),
  orderFindUnique: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findUnique: orderFindUnique } },
}));

import { GET } from "./route";

beforeEach(() => {
  authMock.mockReset();
  orderFindUnique.mockReset();
});

const baseOrder = {
  id: "o1",
  customerId: null,
  guestEmail: "owner@example.com",
  items: [],
  payments: [],
};

describe("GET /api/orders/[id]", () => {
  it("returns 404 when order does not exist", async () => {
    orderFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/o1");
    const res = await GET(req, { params: Promise.resolve({ id: "o1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 403 when guest email does not match", async () => {
    orderFindUnique.mockResolvedValue(baseOrder);
    authMock.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/o1?email=other@example.com");
    const res = await GET(req, { params: Promise.resolve({ id: "o1" }) });
    expect(res.status).toBe(403);
  });

  it("returns order when guest email matches", async () => {
    orderFindUnique.mockResolvedValue(baseOrder);
    authMock.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/o1?email=owner@example.com");
    const res = await GET(req, { params: Promise.resolve({ id: "o1" }) });
    expect(res.status).toBe(200);
  });

  it("returns order when authenticated customer matches", async () => {
    orderFindUnique.mockResolvedValue({ ...baseOrder, customerId: "cus_1", guestEmail: null });
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    const req = new NextRequest("http://localhost/api/orders/o1");
    const res = await GET(req, { params: Promise.resolve({ id: "o1" }) });
    expect(res.status).toBe(200);
  });
});
