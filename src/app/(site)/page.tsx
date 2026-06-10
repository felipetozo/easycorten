import HeroBanner from "@/components/site/HeroBanner/HeroBanner";
import ManifestoSection from "@/components/site/ManifestoSection/ManifestoSection";
import ServicesSection from "@/components/site/ServicesSection/ServicesSection";
import CortenReveal from "@/components/site/CortenReveal/CortenReveal";
import BlogSection from "@/components/site/BlogSection/BlogSection";

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <ManifestoSection />
      <ServicesSection />
      <BlogSection />
      <CortenReveal />
    </main>
  );
}
