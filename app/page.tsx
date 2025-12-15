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

export default function Home() {
  return (
    <div className="min-h-screen">
      <LoadingProgress />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductLinesSection />
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
