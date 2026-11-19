import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkTurnstile, verifyTurnstileToken } from "./turnstile";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function configure() {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "ts-secret");
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "ts-site");
}

function unconfigure() {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
}

describe("checkTurnstile when Turnstile is not configured", () => {
  it("rejects in production instead of silently skipping the captcha (fail-closed)", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    unconfigure();
    vi.stubEnv("NODE_ENV", "production");

    const result = await checkTurnstile(undefined);

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("belum diset di production"));
  });

  it("skips the captcha in development", async () => {
    unconfigure();
    vi.stubEnv("NODE_ENV", "development");
    await expect(checkTurnstile(undefined)).resolves.toEqual({ ok: true });
  });

  it("skips the captcha during next build", async () => {
    unconfigure();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    await expect(checkTurnstile(undefined)).resolves.toEqual({ ok: true });
  });
});

describe("checkTurnstile when Turnstile is configured", () => {
  it("requires a token", async () => {
    configure();
    const result = await checkTurnstile("  ");
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/Selesaikan verifikasi/) });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a token Cloudflare confirms", async () => {
    configure();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true })));
    await expect(checkTurnstile("tok", "1.2.3.4")).resolves.toEqual({ ok: true });
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("secret")).toBe("ts-secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("rejects a token Cloudflare refuses", async () => {
    configure();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false })));
    const result = await checkTurnstile("tok");
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/captcha gagal/) });
  });
});

describe("verifyTurnstileToken", () => {
  it("treats a network error as not verified instead of throwing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    configure();
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(verifyTurnstileToken("tok")).resolves.toBe(false);
    expect(consoleError).toHaveBeenCalled();
  });
});
