import { describe, it, expect, vi, beforeEach } from "vitest";

const { unstableCacheMock, revalidateTagMock, prismaMock } = vi.hoisted(() => ({
  unstableCacheMock: vi.fn((fn: () => unknown) => fn),
  revalidateTagMock: vi.fn(),
  prismaMock: {
    settings: { findFirst: vi.fn() },
    heroContent: { findFirst: vi.fn() },
    aboutContent: { findFirst: vi.fn() },
    whyChooseContent: { findFirst: vi.fn() },
    honeyCollectionContent: { findFirst: vi.fn() },
    premiumHoneyCollection: { findMany: vi.fn() },
    partnershipContent: { findFirst: vi.fn() },
    testimonialContent: { findFirst: vi.fn() },
    articleContent: { findFirst: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: unstableCacheMock,
  revalidateTag: revalidateTagMock,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  CONTENT_TAGS,
  DEFAULT_SITE_SETTINGS,
  getArticles,
  getArticlesSectionContent,
  getCollectionContent,
  getHeroContent,
  getSiteSettings,
  getWhyChooseContent,
  revalidateContent,
} from "./content";
import { ARTICLES, HERO_CONTENT, WHY_CHOOSE_ZARI } from "@/lib/constants";

// Dicatat saat modul di-load, sebelum hook test apa pun berjalan.
const registrations = unstableCacheMock.mock.calls.map((call) => {
  const [, keyParts, options] = call as unknown as [unknown, string[], { tags: string[] }];
  return { keyParts, tags: options.tags };
});
const registeredTags = registrations.map((r) => r.tags);

beforeEach(() => {
  for (const model of Object.values(prismaMock)) {
    for (const fn of Object.values(model)) fn.mockReset();
  }
  revalidateTagMock.mockReset();
});

describe("cache wiring", () => {
  it("registers every loader in the Data Cache under its own tag", () => {
    expect(registeredTags).toEqual(
      expect.arrayContaining(Object.values(CONTENT_TAGS).map((tag) => [tag])),
    );
  });

  it("revalidateContent expires each tag immediately", () => {
    revalidateContent(CONTENT_TAGS.settings, CONTENT_TAGS.hero);
    expect(revalidateTagMock).toHaveBeenCalledWith("content:settings", { expire: 0 });
    expect(revalidateTagMock).toHaveBeenCalledWith("content:hero", { expire: 0 });
  });
});

describe("getSiteSettings", () => {
  it("returns the stored settings", async () => {
    const row = { ...DEFAULT_SITE_SETTINGS, siteName: "Zari Life", whatsapp: "+621" };
    prismaMock.settings.findFirst.mockResolvedValue(row);
    await expect(getSiteSettings()).resolves.toEqual(row);
  });

  it("falls back to defaults without creating a row when none exists", async () => {
    prismaMock.settings.findFirst.mockResolvedValue(null);
    await expect(getSiteSettings()).resolves.toEqual(DEFAULT_SITE_SETTINGS);
  });

  it("falls back to defaults when the database errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.settings.findFirst.mockRejectedValue(new Error("db down"));
    await expect(getSiteSettings()).resolves.toEqual(DEFAULT_SITE_SETTINGS);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("getHeroContent", () => {
  it("parses JSON columns stored as strings", async () => {
    prismaMock.heroContent.findFirst.mockResolvedValue({
      badges: JSON.stringify(["Raw"]),
      typewriterTexts: ["Satu", "Dua"],
      description: "Deskripsi",
      productImage: "https://res.cloudinary.com/x.webp",
    });
    await expect(getHeroContent()).resolves.toEqual({
      badges: ["Raw"],
      typewriterTexts: ["Satu", "Dua"],
      description: "Deskripsi",
      productImage: "https://res.cloudinary.com/x.webp",
    });
  });

  it("falls back per field when a JSON column is malformed or empty", async () => {
    prismaMock.heroContent.findFirst.mockResolvedValue({
      badges: "{not json",
      typewriterTexts: null,
      description: "",
      productImage: null,
    });
    const hero = await getHeroContent();
    expect(hero.badges).toEqual(HERO_CONTENT.badges);
    expect(hero.typewriterTexts.length).toBeGreaterThan(0);
    expect(hero.description).toBe(HERO_CONTENT.subheadline);
  });
});

describe("getWhyChooseContent", () => {
  it("uses the static criteria when no row exists", async () => {
    prismaMock.whyChooseContent.findFirst.mockResolvedValue(null);
    const content = await getWhyChooseContent();
    expect(content.criteria).toEqual(WHY_CHOOSE_ZARI);
  });
});

describe("getCollectionContent", () => {
  it("combines section text with products newest first", async () => {
    prismaMock.honeyCollectionContent.findFirst.mockResolvedValue({
      title: "Koleksi",
      description: "Desc",
    });
    const products = [
      { id: "p1", name: "Madu", description: "d", price: "100000", image: null, label: null },
    ];
    prismaMock.premiumHoneyCollection.findMany.mockResolvedValue(products);

    await expect(getCollectionContent()).resolves.toEqual({
      title: "Koleksi",
      description: "Desc",
      products,
    });
    expect(prismaMock.premiumHoneyCollection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } }),
    );
  });
});

describe("getArticlesSectionContent", () => {
  it("returns at most 4 summaries without the article HTML body", async () => {
    const articles = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      slug: `artikel-${i + 1}`,
      title: `Artikel ${i + 1}`,
      excerpt: "Ringkasan",
      image: "",
      category: "Tips",
      author: "Zari",
      date: "1 Jan 2026",
      readTime: "3 menit",
      content: "<p>panjang</p>",
      tags: ["madu"],
    }));
    prismaMock.articleContent.findFirst.mockResolvedValue({
      heading: "Artikel & Tips",
      title: "Edukasi",
      description: "Desc",
      articles: JSON.stringify(articles),
    });

    const content = await getArticlesSectionContent();
    expect(content.articles).toHaveLength(4);
    expect(content.articles[0]).toEqual({
      id: 1,
      slug: "artikel-1",
      title: "Artikel 1",
      excerpt: "Ringkasan",
      image: "",
      category: "Tips",
      date: "1 Jan 2026",
      readTime: "3 menit",
    });
    expect(content.articles[0]).not.toHaveProperty("content");
  });
});

describe("getArticles", () => {
  it("returns the full articles stored in the database", async () => {
    const stored = [{ ...ARTICLES[0], slug: "dari-db", content: "<p>isi</p>" }];
    prismaMock.articleContent.findFirst.mockResolvedValue({ articles: stored });
    await expect(getArticles()).resolves.toEqual(stored);
  });

  it("falls back to the static articles when the database list is empty", async () => {
    prismaMock.articleContent.findFirst.mockResolvedValue({ articles: [] });
    await expect(getArticles()).resolves.toEqual(ARTICLES);
  });

  it("uses a cache key distinct from the homepage summary under the same tag", () => {
    const articleEntries = registrations.filter((r) => r.tags.includes(CONTENT_TAGS.articles));
    expect(articleEntries).toHaveLength(2);
    expect(new Set(articleEntries.map((r) => r.keyParts.join("|"))).size).toBe(2);
  });
});
