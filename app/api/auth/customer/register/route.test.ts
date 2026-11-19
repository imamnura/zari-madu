import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { findUniqueMock, createMock, checkTurnstileMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  checkTurnstileMock: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { customer: { findUnique: findUniqueMock, create: createMock } },
}));

vi.mock("@/lib/turnstile", () => ({ checkTurnstile: checkTurnstileMock }));

import { POST } from "./route";

beforeEach(() => {
  findUniqueMock.mockReset();
  createMock.mockReset();
  checkTurnstileMock.mockReset().mockResolvedValue({ ok: true });
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/auth/customer/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/customer/register", () => {
  it("rejects weak password with 400", async () => {
    const res = await POST(
      jsonReq({ name: "Sari", email: "sari@example.com", password: "short", turnstileToken: "abc" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already registered", async () => {
    findUniqueMock.mockResolvedValue({ id: "exists" });
    const res = await POST(
      jsonReq({
        name: "Sari",
        email: "sari@example.com",
        password: "password123",
        turnstileToken: "abc",
      }),
    );
    expect(res.status).toBe(409);
  });

  it("creates customer with hashed password on happy path", async () => {
    findUniqueMock.mockResolvedValue(null);
    createMock.mockResolvedValue({
      id: "cus_1",
      email: "sari@example.com",
      name: "Sari",
    });
    const res = await POST(
      jsonReq({
        name: "Sari",
        email: "sari@example.com",
        password: "password123",
        turnstileToken: "abc",
      }),
    );
    expect(res.status).toBe(201);
    const call = createMock.mock.calls[0][0].data;
    expect(call.email).toBe("sari@example.com");
    expect(call.passwordHash).not.toBe("password123");
    expect(call.provider).toBe("CREDENTIALS");
  });

  it("rejects registration when the captcha check fails, without touching the database", async () => {
    checkTurnstileMock.mockResolvedValue({
      ok: false,
      error: "Verifikasi keamanan sedang tidak tersedia. Silakan hubungi admin.",
    });
    const res = await POST(
      jsonReq({
        name: "Sari",
        email: "sari@example.com",
        password: "password-kuat-123",
        turnstileToken: "abc",
      }),
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/tidak tersedia/);
    expect(checkTurnstileMock).toHaveBeenCalledWith("abc");
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
