import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: {
    absolute: "B2B SEO, GEO & Lead Intelligence | AuraWorks",
  },
  description: "Rank #1 on Google and get cited in AI search. AuraWorks de-anonymizes anonymous B2B website visitors for South African industry. Request a demo.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "B2B SEO, GEO & Lead Intelligence | AuraWorks",
    description: "Rank #1 on Google and get cited in AI search. AuraWorks de-anonymizes anonymous B2B website visitors for South African industry. Request a demo.",
    url: "https://www.auraworks.co.za",
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
