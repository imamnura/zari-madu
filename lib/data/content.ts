import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ABOUT_CONTENT,
  ARTICLES,
  CONTACT_INFO,
  HERO_CONTENT,
  PARTNERSHIPS,
  TESTIMONIALS,
  WHY_CHOOSE_ZARI,
} from "@/lib/constants";
import type {
  IAboutContent,
  IArticle,
  IArticleSummary,
  IArticlesSectionContent,
  ICollectionContent,
  IHeroContent,
  IPartnershipContent,
  ISiteSettings,
  ITestimonialContent,
  ITestimonialItem,
  IWhyChooseContent,
} from "@/types/content";

/**
 * Data layer konten publik. Dibaca di Server Component, di-cache di Data Cache Next.js
 * per tag, dan di-invalidate oleh route admin lewat `revalidateContent()` setelah update.
 */
export const CONTENT_TAGS = {
  settings: "content:settings",
  hero: "content:hero",
  about: "content:about",
  whyChoose: "content:why-choose",
  collection: "content:collection",
  partnership: "content:partnership",
  testimonial: "content:testimonial",
  articles: "content:articles",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];

/** Dipanggil route admin setelah menulis konten; `expire: 0` agar perubahan langsung tampil. */
export function revalidateContent(...tags: ContentTag[]): void {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

const HOME_ARTICLE_LIMIT = 4;

export const DEFAULT_SITE_SETTINGS: ISiteSettings = {
  siteName: "Zari Honey",
  whatsapp: CONTACT_INFO.whatsapp,
  instagram: CONTACT_INFO.instagram,
  email: CONTACT_INFO.email,
  shopeeLink: CONTACT_INFO.shopee,
  mapsLocation: CONTACT_INFO.maps,
  mapsEmbed: CONTACT_INFO.mapsEmbed,
  whatsappOrderMessage: null,
  whatsappResellerMessage: null,
};

const DEFAULT_HERO: IHeroContent = {
  badges: HERO_CONTENT.badges,
  typewriterTexts: [HERO_CONTENT.headline, "Kualitas Terpercaya - Tanpa Aditif"],
  description: HERO_CONTENT.subheadline,
  productImage: null,
};

const DEFAULT_ABOUT: IAboutContent = {
  tagline: "Terpercaya & Berkualitas",
  heading: ABOUT_CONTENT.heading,
  body: ABOUT_CONTENT.body,
  stats: ABOUT_CONTENT.stats,
};

const DEFAULT_WHY_CHOOSE: IWhyChooseContent = {
  heading: "Mengapa Memilih Zari Honey?",
  title: "Komitmen kami pada kualitas dan kepuasan Anda",
  criteria: WHY_CHOOSE_ZARI,
};

const DEFAULT_COLLECTION: ICollectionContent = {
  title: "Koleksi Madu Premium",
  description: "Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia",
  products: [],
};

const DEFAULT_PARTNERSHIP: IPartnershipContent = {
  heading: "Partner & Sertifikasi",
  title: "Dipercaya dan bersertifikat resmi dari berbagai lembaga terkemuka",
  partnerships: PARTNERSHIPS,
};

const DEFAULT_TESTIMONIAL: ITestimonialContent = {
  heading: "Apa Kata Mereka?",
  title: "Ribuan pelanggan puas telah merasakan kualitas Zari Honey",
  testimonials: TESTIMONIALS as ITestimonialItem[],
};

const DEFAULT_ARTICLES: IArticlesSectionContent = {
  heading: "Artikel & Tips",
  title: "Edukasi Sehat dengan Madu",
  description: "Tips, resep, dan informasi bermanfaat seputar madu dan kesehatan",
  articles: ARTICLES.slice(0, HOME_ARTICLE_LIMIT).map(toArticleSummary),
};

/** Kolom `Json` lama kadang tersimpan sebagai string JSON; null jika bukan array. */
function jsonArray<T>(value: unknown): T[] | null {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return Array.isArray(parsed) ? (parsed as T[]) : null;
}

function toArticleSummary(article: IArticleSummary): IArticleSummary {
  const { id, slug, title, excerpt, image, category, date, readTime } = article;
  return { id, slug, title, excerpt, image, category, date, readTime };
}

/**
 * Bungkus loader dengan Data Cache (lintas request, invalidasi per tag) dan React `cache`
 * (dedupe dalam satu render). Error DB tidak di-cache: pengunjung mendapat konten fallback.
 * `key` membedakan beberapa loader yang berbagi tag yang sama.
 */
function cachedContent<T>(tag: ContentTag, load: () => Promise<T>, fallback: T, key: string = tag) {
  const cached = unstable_cache(load, [key], { tags: [tag] });
  return cache(async (): Promise<T> => {
    try {
      return await cached();
    } catch (error) {
      console.error(`[lib/data/content ${tag}]`, error);
      return fallback;
    }
  });
}

export const getSiteSettings = cachedContent(
  CONTENT_TAGS.settings,
  async () => {
    const row = await prisma.settings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: {
        siteName: true,
        whatsapp: true,
        instagram: true,
        email: true,
        shopeeLink: true,
        mapsLocation: true,
        mapsEmbed: true,
        whatsappOrderMessage: true,
        whatsappResellerMessage: true,
      },
    });
    return row ?? DEFAULT_SITE_SETTINGS;
  },
  DEFAULT_SITE_SETTINGS,
);

export const getHeroContent = cachedContent(
  CONTENT_TAGS.hero,
  async (): Promise<IHeroContent> => {
    const row = await prisma.heroContent.findFirst({ where: { id: "default" } });
    if (!row) return DEFAULT_HERO;
    return {
      badges: jsonArray<string>(row.badges) ?? DEFAULT_HERO.badges,
      typewriterTexts: jsonArray<string>(row.typewriterTexts) ?? DEFAULT_HERO.typewriterTexts,
      description: row.description || DEFAULT_HERO.description,
      productImage: row.productImage,
    };
  },
  DEFAULT_HERO,
);

export const getAboutContent = cachedContent(
  CONTENT_TAGS.about,
  async (): Promise<IAboutContent> => {
    const row = await prisma.aboutContent.findFirst({ where: { id: "default" } });
    if (!row) return DEFAULT_ABOUT;
    return {
      tagline: row.tagline || DEFAULT_ABOUT.tagline,
      heading: row.heading || DEFAULT_ABOUT.heading,
      body: row.body || DEFAULT_ABOUT.body,
      stats: jsonArray<IAboutContent["stats"][number]>(row.stats) ?? DEFAULT_ABOUT.stats,
    };
  },
  DEFAULT_ABOUT,
);

export const getWhyChooseContent = cachedContent(
  CONTENT_TAGS.whyChoose,
  async (): Promise<IWhyChooseContent> => {
    const row = await prisma.whyChooseContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!row) return DEFAULT_WHY_CHOOSE;
    return {
      heading: row.heading,
      title: row.title,
      criteria:
        jsonArray<IWhyChooseContent["criteria"][number]>(row.criteria) ??
        DEFAULT_WHY_CHOOSE.criteria,
    };
  },
  DEFAULT_WHY_CHOOSE,
);

export const getCollectionContent = cachedContent(
  CONTENT_TAGS.collection,
  async (): Promise<ICollectionContent> => {
    const [section, products] = await Promise.all([
      prisma.honeyCollectionContent.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { title: true, description: true },
      }),
      prisma.premiumHoneyCollection.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          label: true,
        },
      }),
    ]);
    return {
      title: section?.title ?? DEFAULT_COLLECTION.title,
      description: section?.description ?? DEFAULT_COLLECTION.description,
      products,
    };
  },
  DEFAULT_COLLECTION,
);

export const getPartnershipContent = cachedContent(
  CONTENT_TAGS.partnership,
  async (): Promise<IPartnershipContent> => {
    const row = await prisma.partnershipContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!row) return DEFAULT_PARTNERSHIP;
    return {
      heading: row.heading,
      title: row.title,
      partnerships:
        jsonArray<IPartnershipContent["partnerships"][number]>(row.partnerships) ??
        DEFAULT_PARTNERSHIP.partnerships,
    };
  },
  DEFAULT_PARTNERSHIP,
);

export const getTestimonialContent = cachedContent(
  CONTENT_TAGS.testimonial,
  async (): Promise<ITestimonialContent> => {
    const row = await prisma.testimonialContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!row) return DEFAULT_TESTIMONIAL;
    return {
      heading: row.heading,
      title: row.title,
      testimonials:
        jsonArray<ITestimonialItem>(row.testimonials) ?? DEFAULT_TESTIMONIAL.testimonials,
    };
  },
  DEFAULT_TESTIMONIAL,
);

export const getArticlesSectionContent = cachedContent(
  CONTENT_TAGS.articles,
  async (): Promise<IArticlesSectionContent> => {
    const row = await prisma.articleContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!row) return DEFAULT_ARTICLES;
    const articles = jsonArray<IArticleSummary>(row.articles) ?? [];
    return {
      heading: row.heading || DEFAULT_ARTICLES.heading,
      title: row.title,
      description: row.description,
      articles: articles.slice(0, HOME_ARTICLE_LIMIT).map(toArticleSummary),
    };
  },
  DEFAULT_ARTICLES,
);

/** Daftar artikel lengkap untuk /articles dan /articles/[slug]; kosong di DB → artikel statis. */
export const getArticles = cachedContent(
  CONTENT_TAGS.articles,
  async (): Promise<IArticle[]> => {
    const row = await prisma.articleContent.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { articles: true },
    });
    const articles = jsonArray<IArticle>(row?.articles) ?? [];
    return articles.length > 0 ? articles : ARTICLES;
  },
  ARTICLES,
  "content:articles:all",
);
