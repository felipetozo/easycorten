import HeroBanner from "@/components/site/HeroBanner/HeroBanner";
import ManifestoSection from "@/components/site/ManifestoSection/ManifestoSection";
import ServicesSection from "@/components/site/ServicesSection/ServicesSection";

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <ManifestoSection />
      <ServicesSection />
    </main>
  );
}
