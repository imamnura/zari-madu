import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, findFirstMock, updateMock, revalidateTagMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findFirstMock: vi.fn(),
  updateMock: vi.fn(),
  revalidateTagMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { settings: { findFirst: findFirstMock, update: updateMock, create: vi.fn() } },
}));
vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  unstable_cache: (fn: unknown) => fn,
}));

import { PUT } from "./route";

const validBody = {
  siteName: "Zari Honey",
  whatsapp: "+6285777578827",
  instagram: "https://www.instagram.com/zarihoney",
  email: "info@zarilife.com",
  shopeeLink: "https://id.shp.ee/GgH8AKs",
  mapsLocation: "https://maps.app.goo.gl/x",
  mapsEmbed: "https://www.google.com/maps/embed?pb=x",
};

function put(body: unknown) {
  return new Request("http://localhost/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  authMock.mockReset();
  findFirstMock.mockReset();
  updateMock.mockReset();
  revalidateTagMock.mockReset();
});

describe("PUT /api/admin/settings", () => {
  it("invalidates the cached site settings so header/footer/homepage update", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findFirstMock.mockResolvedValue({ id: "s1" });
    updateMock.mockResolvedValue({ id: "s1", ...validBody });

    const res = await PUT(put(validBody));

    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("content:settings", { expire: 0 });
  });

  it("does not invalidate the cache when validation fails", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });

    const res = await PUT(put({ ...validBody, email: "bukan-email" }));

    expect(res.status).toBe(400);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
