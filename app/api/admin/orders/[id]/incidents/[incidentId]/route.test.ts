import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, resolveMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  resolveMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/payment-incidents", () => ({ resolvePaymentIncident: resolveMock }));

import { PATCH } from "./route";

beforeEach(() => {
  authMock.mockReset();
  resolveMock.mockReset();
});

function patch(body: unknown) {
  return PATCH(
    new NextRequest("http://localhost/api/admin/orders/o1/incidents/inc1", {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ id: "o1", incidentId: "inc1" }) },
  );
}

describe("PATCH /api/admin/orders/[id]/incidents/[incidentId]", () => {
  it("rejects non-admin users", async () => {
    authMock.mockResolvedValue({ user: { role: "customer" } });
    const res = await patch({ note: "Refund penuh" });
    expect(res.status).toBe(401);
    expect(resolveMock).not.toHaveBeenCalled();
  });

  it("requires a meaningful follow-up note", async () => {
    authMock.mockResolvedValue({ user: { role: "admin", email: "admin@zarilife.com" } });
    const res = await patch({ note: "ok" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/minimal 5 karakter/);
    expect(resolveMock).not.toHaveBeenCalled();
  });

  it("resolves the incident and records which admin did it", async () => {
    authMock.mockResolvedValue({ user: { role: "admin", email: "admin@zarilife.com" } });
    resolveMock.mockResolvedValue(true);
    const res = await patch({ note: "  Refund penuh via dashboard Midtrans  " });
    expect(res.status).toBe(200);
    expect(resolveMock).toHaveBeenCalledWith("o1", "inc1", {
      note: "Refund penuh via dashboard Midtrans",
      resolvedBy: "admin@zarilife.com",
    });
  });

  it("returns 409 when the incident was already resolved", async () => {
    authMock.mockResolvedValue({ user: { role: "admin", email: "admin@zarilife.com" } });
    resolveMock.mockResolvedValue(false);
    const res = await patch({ note: "Refund penuh via Midtrans" });
    expect(res.status).toBe(409);
  });
});
