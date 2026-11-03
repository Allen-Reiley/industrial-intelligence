import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: {
    absolute: "Operational Tooling, Cashflow Engines & Discovery Systems | AuraWorks",
  },
  description: "We engineer operational tools that lower the cost of operations and custom storefronts that drive immediate cashflow—anchored by SEO, GEO, and visitor intelligence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Operational Tooling, Cashflow Engines & Discovery Systems | AuraWorks",
    description: "We engineer operational tools that lower the cost of operations and custom storefronts that drive immediate cashflow—anchored by SEO, GEO, and visitor intelligence.",
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
