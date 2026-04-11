import {
  AboutSection,
  ContactSection,
  HeroSection,
  PortfolioSection,
  ServicesSection,
} from "@/components/sections";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <TopNav />
      <main className="bg-background text-on-surface antialiased">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
