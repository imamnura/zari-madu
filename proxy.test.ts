import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: (handler: (req: unknown) => unknown) => handler,
}));

import proxy, { config } from "./proxy";

function makeReq({
  pathname,
  auth: authData,
}: {
  pathname: string;
  auth: { user?: { role?: string } } | null;
}) {
  const url = new URL(`http://localhost${pathname}`);
  return {
    url: url.href,
    nextUrl: {
      pathname,
      clone() {
        return new URL(url.href);
      },
      searchParams: new URLSearchParams(),
    },
    auth: authData,
  } as unknown as Parameters<typeof proxy>[0];
}

describe("proxy matcher config", () => {
  it("matches admin / account / checkout paths", () => {
    expect(config.matcher).toEqual([
      "/admin/:path*",
      "/account/:path*",
      "/checkout",
    ]);
  });
});

describe("proxy behaviour", () => {
  it("redirects unauthenticated user from /admin/dashboard to /admin/login with returnTo", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/admin/dashboard", auth: null }),
    );
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toContain("/admin/login");
    expect(location).toContain("returnTo=%2Fadmin%2Fdashboard");
  });

  it("redirects customer-role user away from /admin/*", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/admin/dashboard", auth: { user: { role: "customer" } } }),
    );
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toContain("/");
    expect(location).not.toContain("/admin/login");
  });

  it("redirects unauthenticated user from /account/* to /login", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/account/orders", auth: null }),
    );
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("returnTo=%2Faccount%2Forders");
  });

  it("redirects admin user away from /account/*", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/account/orders", auth: { user: { role: "admin" } } }),
    );
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toContain("/admin/dashboard");
  });

  it("redirects admin user away from /checkout", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/checkout", auth: { user: { role: "admin" } } }),
    );
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toContain("/admin/dashboard");
  });

  it("allows guest user on /checkout (no redirect)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (proxy as any)(
      makeReq({ pathname: "/checkout", auth: null }),
    );
    // NextResponse.next() returns a 200 with no Location header
    const location = res?.headers?.get?.("location") ?? "";
    expect(location).toBe("");
  });
});
