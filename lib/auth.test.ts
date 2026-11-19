import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the NextAuth config passed by lib/auth.ts at import time so we can
// invoke its providers' authorize() and callbacks directly. NextAuth itself is
// not exercised — we only test our own configuration.
const captured: { config?: Record<string, unknown> } = {};

vi.mock("next-auth", () => ({
  CredentialsSignin: class CredentialsSignin extends Error {
    code = "credentials";
  },
  default: (config: Record<string, unknown>) => {
    captured.config = config;
    return {
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    };
  },
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: (cfg: { id?: string; authorize?: (c: unknown) => Promise<unknown> }) => ({
    type: "credentials",
    id: cfg.id ?? "credentials",
    options: cfg,
  }),
}));

vi.mock("next-auth/providers/google", () => ({
  default: (cfg: unknown) => ({ type: "google", id: "google", options: cfg }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findUnique: vi.fn(), create: vi.fn() },
    admin: { findUnique: vi.fn() },
  },
}));

const { checkTurnstileMock, consumeRateLimitsMock } = vi.hoisted(() => ({
  checkTurnstileMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
}));

vi.mock("@/lib/turnstile", () => ({ checkTurnstile: checkTurnstileMock }));
vi.mock("@/lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rate-limit")>()),
  consumeRateLimits: consumeRateLimitsMock,
}));

beforeEach(() => {
  checkTurnstileMock.mockReset().mockResolvedValue({ ok: true });
  consumeRateLimitsMock
    .mockReset()
    .mockResolvedValue({ allowed: true, remaining: 4, retryAfterSeconds: 0 });
});

function loginRequest(ip = "203.0.113.7") {
  return new Request("http://localhost/api/auth/callback/x", {
    method: "POST",
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });
}

import { prisma } from "@/lib/prisma";
import { RATE_LIMITS } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const mocked = prisma as unknown as {
  customer: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  admin: { findUnique: ReturnType<typeof vi.fn> };
};

interface IProviderShape {
  type: string;
  id: string;
  options: { authorize?: (c: unknown, request: Request) => Promise<unknown> };
}

interface ICapturedConfig {
  providers: IProviderShape[];
  callbacks: {
    jwt: (args: { token: Record<string, unknown>; user?: { id?: string; role?: string } }) => Promise<Record<string, unknown>>;
    session: (args: { session: { user: Record<string, unknown> }; token: Record<string, unknown> }) => Promise<{ user: Record<string, unknown> }>;
    signIn: (args: { account: { provider: string } | null; profile?: { email?: string; name?: string }; user: { id?: string; role?: string } }) => Promise<boolean>;
  };
}

async function getConfig(): Promise<ICapturedConfig> {
  await import("@/lib/auth");
  return captured.config as unknown as ICapturedConfig;
}

describe("auth module surface", () => {
  it("exports auth/handlers/signIn/signOut", async () => {
    const mod = await import("@/lib/auth");
    expect(mod.auth).toBeDefined();
    expect(mod.handlers).toBeDefined();
    expect(mod.signIn).toBeDefined();
    expect(mod.signOut).toBeDefined();
  });

  it("registers admin-credentials and customer-credentials providers", async () => {
    const cfg = await getConfig();
    const ids = cfg.providers.map((p) => p.id);
    expect(ids).toContain("admin-credentials");
    expect(ids).toContain("customer-credentials");
  });
});

describe("customer credentials authorize", () => {
  it("rejects when customer not found", async () => {
    mocked.customer.findUnique.mockResolvedValue(null);
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "customer-credentials")!;
    await expect(
      provider.options.authorize!(
        { email: "no@one.com", password: "secret123" },
        loginRequest(),
      ),
    ).rejects.toMatchObject({ code: "invalid_credentials" });
  });

  it("returns user with role=customer when password matches", async () => {
    const passwordHash = await bcrypt.hash("secret123", 4);
    mocked.customer.findUnique.mockResolvedValue({
      id: "cus_1",
      email: "sari@example.com",
      name: "Sari",
      passwordHash,
    });
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "customer-credentials")!;
    const result = await provider.options.authorize!(
      { email: "sari@example.com", password: "secret123", turnstileToken: "tok" },
      loginRequest(),
    );
    expect(result).toMatchObject({ id: "cus_1", role: "customer" });
    expect(checkTurnstileMock).toHaveBeenCalledWith("tok");
  });

  it("rate limits per IP and per IP+email, then rejects without checking the password", async () => {
    consumeRateLimitsMock.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 600 });
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "customer-credentials")!;

    await expect(
      provider.options.authorize!(
        { email: "Sari@Example.com", password: "tebak-tebakan" },
        loginRequest("203.0.113.7"),
      ),
    ).rejects.toMatchObject({ code: "rate_limited" });

    expect(consumeRateLimitsMock).toHaveBeenCalledWith([
      [RATE_LIMITS.customerLoginIp, "203.0.113.7"],
      [RATE_LIMITS.customerLoginAccount, "203.0.113.7:Sari@Example.com"],
    ]);
    expect(checkTurnstileMock).not.toHaveBeenCalled();
    expect(mocked.customer.findUnique).not.toHaveBeenCalled();
  });

  it("requires the captcha for customer login and reports why it failed", async () => {
    checkTurnstileMock.mockResolvedValue({ ok: false, reason: "unavailable", error: "x" });
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "customer-credentials")!;
    await expect(
      provider.options.authorize!(
        { email: "sari@example.com", password: "secret123" },
        loginRequest(),
      ),
    ).rejects.toMatchObject({ code: "captcha_unavailable" });
    expect(mocked.customer.findUnique).not.toHaveBeenCalled();
  });
});

describe("admin credentials authorize", () => {
  it("uses the admin rate limit rules and rejects a bad captcha", async () => {
    checkTurnstileMock.mockResolvedValue({ ok: false, reason: "invalid", error: "x" });
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "admin-credentials")!;

    await expect(
      provider.options.authorize!(
        { email: "admin@zarilife.com", password: "x", turnstileToken: "bad" },
        loginRequest("198.51.100.2"),
      ),
    ).rejects.toMatchObject({ code: "captcha_failed" });

    expect(consumeRateLimitsMock).toHaveBeenCalledWith([
      [RATE_LIMITS.adminLoginIp, "198.51.100.2"],
      [RATE_LIMITS.adminLoginAccount, "198.51.100.2:admin@zarilife.com"],
    ]);
    expect(mocked.admin.findUnique).not.toHaveBeenCalled();
  });

  it("returns role=admin for a valid password", async () => {
    const password = await bcrypt.hash("admin-secret", 4);
    mocked.admin.findUnique.mockResolvedValue({
      id: "adm_1",
      email: "admin@zarilife.com",
      name: "Admin",
      password,
    });
    const cfg = await getConfig();
    const provider = cfg.providers.find((p) => p.id === "admin-credentials")!;
    const result = await provider.options.authorize!(
      { email: "admin@zarilife.com", password: "admin-secret", turnstileToken: "tok" },
      loginRequest(),
    );
    expect(result).toMatchObject({ id: "adm_1", role: "admin" });
  });
});

describe("jwt + session callbacks", () => {
  it("jwt copies role from user to token", async () => {
    const cfg = await getConfig();
    const token = await cfg.callbacks.jwt({
      token: {},
      user: { id: "cus_1", role: "customer" },
    });
    expect(token.role).toBe("customer");
    expect(token.id).toBe("cus_1");
  });

  it("session copies role from token", async () => {
    const cfg = await getConfig();
    const session = await cfg.callbacks.session({
      session: { user: { name: "Sari" } },
      token: { id: "cus_1", role: "customer" },
    });
    expect(session.user.role).toBe("customer");
    expect(session.user.id).toBe("cus_1");
  });
});
