import { HomeHashScroll } from "@/components/HomeHashScroll";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { CollectionSection } from "@/components/CollectionSection";
import { PartnershipSection } from "@/components/PartnershipSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ArticlesSection } from "@/components/ArticlesSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import {
  getAboutContent,
  getArticlesSectionContent,
  getCollectionContent,
  getHeroContent,
  getPartnershipContent,
  getSiteSettings,
  getTestimonialContent,
  getWhyChooseContent,
} from "@/lib/data/content";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema";

// Konten di-cache per tag dan di-invalidate saat admin menyimpan; revalidate berkala
// sebagai jaring pengaman bila render terakhir memakai konten fallback (mis. DB sempat down).
export const revalidate = 3600;

export default async function Home() {
  const [settings, hero, about, whyChoose, collection, partnership, testimonial, articles] =
    await Promise.all([
      getSiteSettings(),
      getHeroContent(),
      getAboutContent(),
      getWhyChooseContent(),
      getCollectionContent(),
      getPartnershipContent(),
      getTestimonialContent(),
      getArticlesSectionContent(),
    ]);

  // Structured data for SEO
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <HomeHashScroll />
      <Header />
      <main>
        <HeroSection content={hero} settings={settings} />
        <AboutSection content={about} />
        {/* <ProductLinesSection /> */}
        <WhyChooseSection content={whyChoose} />
        <CollectionSection content={collection} settings={settings} />
        <PartnershipSection content={partnership} />
        <TestimonialsSection content={testimonial} />
        <ArticlesSection content={articles} />
        <CTASection settings={settings} />
      </main>
      <Footer />
    </div>
  );
}
