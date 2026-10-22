import { describe, it, expect, vi } from "vitest";

// Capture the NextAuth config passed by lib/auth.ts at import time so we can
// invoke its providers' authorize() and callbacks directly. NextAuth itself is
// not exercised — we only test our own configuration.
const captured: { config?: Record<string, unknown> } = {};

vi.mock("next-auth", () => ({
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

vi.mock("@/lib/turnstile", () => ({
  isTurnstileConfigured: () => false,
  verifyTurnstileToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const mocked = prisma as unknown as {
  customer: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

interface IProviderShape {
  type: string;
  id: string;
  options: { authorize?: (c: unknown) => Promise<unknown> };
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
      provider.options.authorize!({
        email: "no@one.com",
        password: "secret123",
      }),
    ).rejects.toThrow(/Email atau password salah/);
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
    const result = await provider.options.authorize!({
      email: "sari@example.com",
      password: "secret123",
    });
    expect(result).toMatchObject({ id: "cus_1", role: "customer" });
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
