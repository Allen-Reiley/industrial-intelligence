import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "AuraWorks | Industrial Sales Intelligence & Identity Resolution",
  description: "Identify the anonymous corporate entities visiting your website. AuraWorks unmasks high-value industrial traffic and delivers the direct contact data your sales team needs to close enterprise deals.",
};

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

