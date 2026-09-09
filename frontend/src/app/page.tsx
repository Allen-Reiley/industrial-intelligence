import { Metadata } from "next";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: {
    absolute: "AuraWorks | Industrial Sales Intelligence & Identity Resolution",
  },
  description: "Identify the anonymous corporate entities visiting your website. AuraWorks turns industrial web traffic into high-intent B2B sales leads across South Africa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AuraWorks | Industrial Sales Intelligence & Identity Resolution",
    description: "Identify the anonymous corporate entities visiting your website. AuraWorks turns industrial web traffic into high-intent B2B sales leads across South Africa.",
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
