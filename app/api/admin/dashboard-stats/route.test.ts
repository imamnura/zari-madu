import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { authMock, aggregateMock, orderCountMock, articleFindFirstMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  aggregateMock: vi.fn(),
  orderCountMock: vi.fn(),
  articleFindFirstMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    articleContent: { findFirst: articleFindFirstMock },
    premiumHoneyCollection: { count: vi.fn().mockResolvedValue(3) },
    testimonialContent: { findFirst: vi.fn().mockResolvedValue(null) },
    partnershipContent: { findFirst: vi.fn().mockResolvedValue({ partnerships: [{}] }) },
    order: { count: orderCountMock, aggregate: aggregateMock },
  },
}));

import { GET } from "./route";

beforeEach(() => {
  authMock.mockReset();
  aggregateMock.mockReset().mockResolvedValue({ _sum: { total: 250000 } });
  orderCountMock.mockReset().mockResolvedValue(4);
  articleFindFirstMock.mockReset().mockResolvedValue({ articles: [{}, {}] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/admin/dashboard-stats", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue({ user: { role: "customer" } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("sums monthly revenue over the WIB month, not the server-timezone month", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    // 2026-12-01 01:00 WIB; di server UTC masih 30 November.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-30T18:00:00.000Z"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.monthlyRevenue).toBe(250000);
    expect(body.data.pendingOrderCount).toBe(4);
    const { paidAt } = aggregateMock.mock.calls[0][0].where;
    expect(paidAt.gte.toISOString()).toBe("2026-11-30T17:00:00.000Z");
    expect(paidAt.lt.toISOString()).toBe("2026-12-31T17:00:00.000Z");
  });

  it("runs the stats queries in parallel instead of one after another", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    let releaseArticles: (value: unknown) => void = () => {};
    articleFindFirstMock.mockReturnValue(
      new Promise((resolve) => {
        releaseArticles = resolve;
      }),
    );

    const pending = GET();
    await vi.waitFor(() => expect(articleFindFirstMock).toHaveBeenCalled());

    // Query terakhir sudah jalan walau query pertama belum selesai.
    expect(orderCountMock).toHaveBeenCalled();
    expect(aggregateMock).toHaveBeenCalled();

    releaseArticles({ articles: [{}] });
    const body = await (await pending).json();
    expect(body.data.articleCount).toBe(1);
  });
});
