import { LoadingProgress } from "@/components/LoadingProgress";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProductLinesSection } from "@/components/ProductLinesSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { ProductShowcaseSection } from "@/components/ProductShowcaseSection";
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
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        {/* <ProductLinesSection /> */}
        <WhyChooseSection />
        <ProductShowcaseSection />
        <PartnershipSection />
        <TestimonialsSection />
        <ArticlesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
