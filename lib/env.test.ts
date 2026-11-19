import { describe, it, expect, vi, afterEach } from "vitest";
import {
  assertProductionEnv,
  findMissingProductionEnv,
  getServerEnv,
  isProductionRuntime,
} from "./env";

afterEach(() => {
  vi.restoreAllMocks();
});

const productionEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://u:p@db:5432/zari",
  AUTH_SECRET: "secret",
  TURNSTILE_SECRET_KEY: "ts-secret",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "ts-site",
  CRON_SECRET: "cron",
  MIDTRANS_SERVER_KEY: "mid",
  RESEND_API_KEY: "re",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "cloud",
  CLOUDINARY_API_KEY: "ck",
  CLOUDINARY_API_SECRET: "cs",
} as unknown as NodeJS.ProcessEnv;

describe("getServerEnv", () => {
  it("trims values and treats blank values as unset", () => {
    const env = getServerEnv({
      NODE_ENV: "test",
      RESEND_API_KEY: "  re_123  ",
      TURNSTILE_SECRET_KEY: "   ",
      EMAIL_FROM: "",
    } as unknown as NodeJS.ProcessEnv);
    expect(env.RESEND_API_KEY).toBe("re_123");
    expect(env.TURNSTILE_SECRET_KEY).toBeUndefined();
    expect(env.EMAIL_FROM).toBeUndefined();
  });

  it("parses boolean flags", () => {
    const on = getServerEnv({ MIDTRANS_IS_PRODUCTION: "TRUE" } as unknown as NodeJS.ProcessEnv);
    const off = getServerEnv({} as NodeJS.ProcessEnv);
    expect(on.MIDTRANS_IS_PRODUCTION).toBe(true);
    expect(off.MIDTRANS_IS_PRODUCTION).toBe(false);
  });

  it("throws a descriptive error for an invalid NODE_ENV", () => {
    expect(() =>
      getServerEnv({ NODE_ENV: "staging" } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/NODE_ENV/);
  });
});

describe("isProductionRuntime", () => {
  it("is false during next build even though NODE_ENV is production", () => {
    const env = getServerEnv({
      ...productionEnv,
      NEXT_PHASE: "phase-production-build",
    } as NodeJS.ProcessEnv);
    expect(isProductionRuntime(env)).toBe(false);
  });
});

describe("findMissingProductionEnv", () => {
  it("reports nothing when everything is set", () => {
    expect(findMissingProductionEnv(getServerEnv(productionEnv))).toEqual({
      fatal: [],
      warnings: [],
    });
  });

  it("accepts the legacy NEXTAUTH_SECRET instead of AUTH_SECRET", () => {
    const env = getServerEnv({
      ...productionEnv,
      AUTH_SECRET: undefined,
      NEXTAUTH_SECRET: "legacy",
    } as NodeJS.ProcessEnv);
    expect(findMissingProductionEnv(env).fatal).toEqual([]);
  });

  it("separates fatal core vars from feature warnings", () => {
    const env = getServerEnv({
      NODE_ENV: "production",
      TURNSTILE_SECRET_KEY: "x",
    } as unknown as NodeJS.ProcessEnv);
    const { fatal, warnings } = findMissingProductionEnv(env);
    expect(fatal).toEqual(["DATABASE_URL", "AUTH_SECRET"]);
    expect(warnings).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(warnings).toContain("MIDTRANS_SERVER_KEY");
    expect(warnings).not.toContain("TURNSTILE_SECRET_KEY");
  });
});

describe("assertProductionEnv", () => {
  it("throws at production start when a core var is missing", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const env = getServerEnv({ ...productionEnv, DATABASE_URL: "" } as NodeJS.ProcessEnv);
    expect(() => assertProductionEnv(env)).toThrow(/DATABASE_URL/);
  });

  it("only logs when feature vars are missing", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const env = getServerEnv({ ...productionEnv, RESEND_API_KEY: "" } as NodeJS.ProcessEnv);
    expect(() => assertProductionEnv(env)).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY"));
  });

  it("does nothing outside production runtime", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      assertProductionEnv(getServerEnv({ NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv)),
    ).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
