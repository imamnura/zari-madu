import { describe, it, expect } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

function directives(csp: string): Map<string, string> {
  return new Map(
    csp.split(";").map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values.join(" ")] as const;
    }),
  );
}

function header(headers: Array<{ key: string; value: string }>, key: string) {
  return headers.find((h) => h.key === key)?.value;
}

describe("buildContentSecurityPolicy (production)", () => {
  const csp = directives(buildContentSecurityPolicy({ isDev: false }));

  it("forbids framing the site and plugin content", () => {
    expect(csp.get("frame-ancestors")).toBe("'none'");
    expect(csp.get("object-src")).toBe("'none'");
    expect(csp.get("base-uri")).toBe("'self'");
    expect(csp.get("form-action")).toBe("'self'");
  });

  it("allows the third-party scripts the app loads", () => {
    const scriptSrc = csp.get("script-src")!;
    expect(scriptSrc).toContain("https://*.midtrans.com");
    expect(scriptSrc).toContain("https://challenges.cloudflare.com");
    expect(scriptSrc).toContain("https://www.googletagmanager.com");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("allows Midtrans, Turnstile and Google Maps iframes only", () => {
    expect(csp.get("frame-src")).toBe(
      "https://*.midtrans.com https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
    );
  });

  it("upgrades insecure requests and does not open websockets", () => {
    expect(csp.has("upgrade-insecure-requests")).toBe(true);
    expect(csp.get("connect-src")).not.toContain("ws:");
  });
});

describe("buildContentSecurityPolicy (development)", () => {
  const csp = directives(buildContentSecurityPolicy({ isDev: true }));

  it("relaxes only what React Refresh / HMR needs", () => {
    expect(csp.get("script-src")).toContain("'unsafe-eval'");
    expect(csp.get("connect-src")).toContain("ws:");
    expect(csp.has("upgrade-insecure-requests")).toBe(false);
    expect(csp.get("frame-ancestors")).toBe("'none'");
  });
});

describe("buildSecurityHeaders", () => {
  it("sends the full header set in production, including HSTS", () => {
    const headers = buildSecurityHeaders({ isDev: false });
    expect(header(headers, "Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(header(headers, "Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains",
    );
    expect(header(headers, "X-Frame-Options")).toBe("DENY");
    expect(header(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(headers, "Permissions-Policy")).toContain("camera=()");
  });

  it("omits HSTS in development (plain http on localhost)", () => {
    expect(header(buildSecurityHeaders({ isDev: true }), "Strict-Transport-Security")).toBeUndefined();
  });

  it("can switch the CSP to report-only as an emergency escape hatch", () => {
    const headers = buildSecurityHeaders({ isDev: false, reportOnly: true });
    expect(header(headers, "Content-Security-Policy")).toBeUndefined();
    expect(header(headers, "Content-Security-Policy-Report-Only")).toContain("default-src 'self'");
  });
});
