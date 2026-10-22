import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { findUniqueMock, createMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { customer: { findUnique: findUniqueMock, create: createMock } },
}));

vi.mock("@/lib/turnstile", () => ({
  isTurnstileConfigured: () => false,
  verifyTurnstileToken: vi.fn(),
}));

import { POST } from "./route";

beforeEach(() => {
  findUniqueMock.mockReset();
  createMock.mockReset();
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
});
