import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ARTICLES } from "@/lib/constants";

const baseUrl = "https://zarihoney.com";

type ArticleRow = { slug: string };

async function getArticleSlugs(): Promise<{
  slugs: ArticleRow[];
  lastModified: Date;
}> {
  try {
    const content = await prisma.articleContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    if (!content?.articles) {
      return {
        slugs: ARTICLES.map((a) => ({ slug: a.slug })),
        lastModified: new Date(),
      };
    }
    const articles =
      typeof content.articles === "string"
        ? JSON.parse(content.articles)
        : content.articles;
    if (!Array.isArray(articles) || articles.length === 0) {
      return {
        slugs: ARTICLES.map((a) => ({ slug: a.slug })),
        lastModified: content.updatedAt,
      };
    }
    return {
      slugs: articles.map((a: { slug: string }) => ({ slug: a.slug })),
      lastModified: content.updatedAt,
    };
  } catch {
    return {
      slugs: ARTICLES.map((a) => ({ slug: a.slug })),
      lastModified: new Date(),
    };
  }
}

async function getShopEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.premiumHoneyCollection.findMany({
        where: { slug: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      {
        url: `${baseUrl}/shop`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      ...categories.map((c) => ({
        url: `${baseUrl}/shop/category/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...products
        .filter((p): p is { slug: string; updatedAt: Date } => Boolean(p.slug))
        .map((p) => ({
          url: `${baseUrl}/shop/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
    ];
  } catch {
    return [];
  }
}

/** Sitemap untuk SEO — hanya URL kanonik (tanpa hash). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { slugs, lastModified } = await getArticleSlugs();
  const shopEntries = await getShopEntries(now);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const articleEntries: MetadataRoute.Sitemap = slugs.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...shopEntries, ...articleEntries];
}
