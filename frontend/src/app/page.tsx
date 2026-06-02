import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "Industrial Sales Intelligence & Lead Generation",
  description: "Identify companies visiting your website. AuraWorks turns anonymous industrial traffic into high-intent sales leads for B2B firms in South Africa.",
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

