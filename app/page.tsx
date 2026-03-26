import { LoadingProgress } from "@/components/LoadingProgress";
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
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema";

export default function Home() {
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

      <LoadingProgress />
      <HomeHashScroll />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        {/* <ProductLinesSection /> */}
        <WhyChooseSection />
        <CollectionSection />
        <PartnershipSection />
        <TestimonialsSection />
        <ArticlesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
