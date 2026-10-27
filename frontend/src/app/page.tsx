import { Metadata } from "next";
import IndustrialLanding from "@/components/landing/industrial-landing";

export const metadata: Metadata = {
  title: {
    absolute: "Industrial Web Engineering, B2B SEO, GEO & Lead Intelligence | AuraWorks",
  },
  description: "Custom web development, top-tier Google rankings, Generative Engine Optimization (GEO), and proprietary juristic visitor de-anonymization for South African and SADC industry.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Industrial Web Engineering, B2B SEO, GEO & Lead Intelligence | AuraWorks",
    description: "Custom web development, top-tier Google rankings, Generative Engine Optimization (GEO), and proprietary juristic visitor de-anonymization for South African and SADC industry.",
    url: "https://www.auraworks.co.za",
    type: "website",
  },
};

export default function Home() {
  return <IndustrialLanding />;
}
