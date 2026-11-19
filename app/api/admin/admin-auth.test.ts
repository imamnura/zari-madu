import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, prismaCalls } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaCalls: [] as string[],
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
// Setiap akses model Prisma dicatat: handler yang ditolak tidak boleh menyentuh DB.
vi.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: (_t, model: string) =>
        new Proxy(
          {},
          {
            get: (_m, method: string) => () => {
              prismaCalls.push(`${model}.${method}`);
              return Promise.resolve(null);
            },
          },
        ),
    },
  ),
}));
vi.mock("@/lib/cloudinary", () => ({ uploadToCloudinary: vi.fn() }));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

import * as about from "./about-content/route";
import * as articles from "./articles-content/route";
import * as changeEmail from "./change-email/route";
import * as changePassword from "./change-password/route";
import * as cloudinaryUpload from "./cloudinary-upload/route";
import * as dashboardStats from "./dashboard-stats/route";
import * as orderIncident from "./orders/[id]/incidents/[incidentId]/route";
import * as getEmail from "./get-email/route";
import * as hero from "./hero-content/route";
import * as honeyCollection from "./honey-collection/route";
import * as honeyCollectionContent from "./honey-collection-content/route";
import * as partnership from "./partnership-content/route";
import * as settings from "./settings/route";
import * as testimonial from "./testimonial-content/route";
import * as whyChoose from "./why-choose-content/route";

type Handler = (req: NextRequest) => Promise<Response>;

const protectedHandlers: Array<[string, string, Handler]> = [
  ["about-content", "PUT", about.PUT],
  ["articles-content", "PUT", articles.PUT],
  ["change-email", "PUT", changeEmail.PUT],
  ["change-password", "PUT", changePassword.PUT],
  ["cloudinary-upload", "POST", cloudinaryUpload.POST],
  ["dashboard-stats", "GET", dashboardStats.GET as unknown as Handler],
  ["orders/o1/incidents/inc1", "PATCH", orderIncident.PATCH as unknown as Handler],
  ["get-email", "GET", getEmail.GET as unknown as Handler],
  ["hero-content", "PUT", hero.PUT],
  ["honey-collection", "POST", honeyCollection.POST],
  ["honey-collection", "PUT", honeyCollection.PUT],
  ["honey-collection", "DELETE", honeyCollection.DELETE],
  ["honey-collection-content", "PUT", honeyCollectionContent.PUT],
  ["partnership-content", "PUT", partnership.PUT],
  ["settings", "PUT", settings.PUT as unknown as Handler],
  ["testimonial-content", "PUT", testimonial.PUT],
  ["why-choose-content", "PUT", whyChoose.PUT],
];

function req(path: string, method: string) {
  return new NextRequest(`http://localhost/api/admin/${path}?id=p1`, {
    method,
    ...(method === "GET" || method === "DELETE"
      ? {}
      : { body: "{}", headers: { "content-type": "application/json" } }),
  });
}

beforeEach(() => {
  authMock.mockReset();
  prismaCalls.length = 0;
});

describe("admin API authorization", () => {
  describe.each(protectedHandlers)("%s %s", (path, method, handler) => {
    it("rejects a logged-in customer without touching the DB", async () => {
      authMock.mockResolvedValue({
        user: { id: "cus_1", email: "c@example.com", role: "customer" },
      });
      const res = await handler(req(path, method));
      expect(res.status).toBe(401);
      expect(prismaCalls).toEqual([]);
    });

    it("rejects an anonymous request", async () => {
      authMock.mockResolvedValue(null);
      const res = await handler(req(path, method));
      expect(res.status).toBe(401);
    });
  });
});
