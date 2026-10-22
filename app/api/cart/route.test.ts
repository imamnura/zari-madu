import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, resolveCartMock, getOrCreateGuestSessionTokenMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  resolveCartMock: vi.fn(),
  getOrCreateGuestSessionTokenMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/cart", () => ({
  resolveCart: resolveCartMock,
  getOrCreateGuestSessionToken: getOrCreateGuestSessionTokenMock,
}));

import { GET } from "./route";

beforeEach(() => {
  authMock.mockReset();
  resolveCartMock.mockReset();
  getOrCreateGuestSessionTokenMock.mockReset();
});

describe("GET /api/cart", () => {
  it("uses customerId when session has customer role", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    resolveCartMock.mockResolvedValue({ id: "cart_1", items: [], subtotal: 0, itemCount: 0 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(resolveCartMock).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cus_1", sessionToken: null }),
    );
    expect(getOrCreateGuestSessionTokenMock).not.toHaveBeenCalled();
  });

  it("creates guest session when no customer session", async () => {
    authMock.mockResolvedValue(null);
    getOrCreateGuestSessionTokenMock.mockResolvedValue("guest_tok");
    resolveCartMock.mockResolvedValue({ id: "cart_2", items: [], subtotal: 0, itemCount: 0 });
    await GET();
    expect(getOrCreateGuestSessionTokenMock).toHaveBeenCalled();
    expect(resolveCartMock).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: null, sessionToken: "guest_tok" }),
    );
  });
});
