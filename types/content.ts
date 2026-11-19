// View model konten publik (homepage, header, footer) yang dibaca di server lewat lib/data/content.ts.

export interface ISiteSettings {
  siteName: string;
  whatsapp: string;
  instagram: string;
  email: string;
  shopeeLink: string;
  mapsLocation: string;
  mapsEmbed: string;
  whatsappOrderMessage: string | null;
  whatsappResellerMessage: string | null;
}

export interface IHeroContent {
  badges: string[];
  typewriterTexts: string[];
  description: string;
  productImage: string | null;
}

export interface IAboutContent {
  tagline: string;
  heading: string;
  body: string;
  stats: Array<{ value: string; label: string }>;
}

export interface IWhyChooseContent {
  heading: string;
  title: string;
  criteria: Array<{ icon: string; title: string; description: string }>;
}

export interface IHomeProduct {
  id: string;
  name: string;
  description: string;
  price: string | null;
  image: string | null;
  label: string | null;
}

export interface ICollectionContent {
  title: string;
  description: string;
  products: IHomeProduct[];
}

export interface IPartnershipContent {
  heading: string;
  title: string;
  partnerships: Array<{ id: number; name: string; logo: string; description: string }>;
}

export interface ITestimonialItem {
  id: number;
  name: string;
  city: string;
  text: string;
  rating: number;
  avatarUrl?: string;
}

export interface ITestimonialContent {
  heading: string;
  title: string;
  testimonials: ITestimonialItem[];
}

/** Ringkasan artikel untuk kartu homepage — tanpa `content` HTML agar payload kecil. */
export interface IArticleSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}

export interface IArticlesSectionContent {
  heading: string;
  title: string;
  description: string;
  articles: IArticleSummary[];
}
