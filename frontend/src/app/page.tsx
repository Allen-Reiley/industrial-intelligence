import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: {
    absolute: "AuraWorks | B2B SEO, Generative Engine Optimization & Lead Intelligence",
  },
  description: "Be found. Be cited. Be chosen. AuraWorks is the organic discoverability and lead-capture partner for industrial and B2B enterprises across South Africa and SADC.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AuraWorks | B2B SEO, Generative Engine Optimization & Lead Intelligence",
    description: "Dominate Google search, get cited in AI search engines (ChatGPT, Perplexity, Gemini), and convert anonymous industrial traffic into qualified sales pipeline.",
    url: "https://auraworks.co.za",
    type: "website",
  },
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
