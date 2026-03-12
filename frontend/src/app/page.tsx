import Image from "next/image";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ContentSection1 />
      <ContentSection2 />
      <CallToAction />
      <Footer />
    </main>
  );
}

