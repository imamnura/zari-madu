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

/** Sitemap untuk SEO — hanya URL kanonik (tanpa hash). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { slugs, lastModified } = await getArticleSlugs();

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

  return [...staticEntries, ...articleEntries];
}
