import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, mergeMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  mergeMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/cart", () => ({ mergeGuestCartIntoCustomer: mergeMock }));

import { POST } from "./route";

beforeEach(() => {
  authMock.mockReset();
  mergeMock.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/cart/merge", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/cart/merge", () => {
  it("returns 401 for unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(jsonReq({ items: [] }));
    expect(res.status).toBe(401);
  });

  it("delegates to mergeGuestCartIntoCustomer", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    mergeMock.mockResolvedValue({ mergedItemCount: 1, droppedItems: [] });
    const res = await POST(
      jsonReq({ items: [{ productId: "cmaaaaaaaaaaaaaaaaaaaaaaa", quantity: 2 }] }),
    );
    expect(res.status).toBe(200);
    expect(mergeMock).toHaveBeenCalledWith({
      guestItems: [{ productId: "cmaaaaaaaaaaaaaaaaaaaaaaa", quantity: 2 }],
      customerId: "cus_1",
    });
  });
});
