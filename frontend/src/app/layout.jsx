import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "@/components/cookies/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL("https://www.auraworks.co.za"),
  title: {
    default: "AuraWorks | Operational Tooling, Custom Commerce & Search Intelligence",
    template: "%s | AuraWorks",
  },
  description: "AuraWorks engineers custom operational tooling to slash the cost of operations, client-facing storefronts to capture immediate cashflow, and upstream SEO, GEO, and visitor intelligence.",
  category: 'technology',
  classification: 'Operational Tooling, B2B Commerce & Search Intelligence',
  keywords: [
    "Operational tooling South Africa",
    "Custom ecommerce platforms",
    "Workshop and manufacturing software",
    "B2B workflow automation",
    "SEO company South Africa",
    "GEO agency South Africa",
    "Generative Engine Optimization South Africa",
    "B2B SEO for industrial companies",
    "Industrial SEO South Africa",
    "Lead generation website South Africa",
    "AI search optimization South Africa",
    "B2B lead capture South Africa",
    "Visitor Identity Resolution"
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", sizes: "any" }, 
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.json",
  authors: [{ name: "Reitumetse Sethabela", url: "https://www.auraworks.co.za" }],
  creator: "Reitumetse Sethabela",
  publisher: "AuraWorks (Pty) Ltd",
  openGraph: {
    title: "AuraWorks | B2B SEO, Generative Engine Optimization & Lead Capture",
    description: "Be found. Be cited. Be chosen. Dominate Google search, get cited in AI search engines (ChatGPT, Perplexity, Gemini), and convert anonymous industrial traffic into pipeline.",
    url: "https://www.auraworks.co.za",
    siteName: "AuraWorks",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AuraWorks | B2B Organic Discoverability & Lead Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraWorks | B2B SEO, GEO & Lead Intelligence",
    description: "Be found. Be cited. Be chosen. Organic discoverability and pipeline conversion for South African and SADC industrial leaders.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.auraworks.co.za/#organization",
      "name": "AuraWorks (Pty) Ltd",
      "alternateName": "AuraWorks",
      "url": "https://www.auraworks.co.za",
      "logo": "https://www.auraworks.co.za/images/logo.png",
      "description": "Modern organic discoverability and lead-capture partner for industrial and B2B companies across South Africa and SADC, providing technical SEO, Generative Engine Optimization (GEO), and proprietary visitor identity intelligence.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Johannesburg",
        "addressRegion": "Gauteng",
        "addressCountry": "ZA"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "South Africa"
        },
        {
          "@type": "AdministrativeArea",
          "name": "SADC Region"
        }
      ],
      "knowsAbout": [
        "B2B SEO",
        "Generative Engine Optimization (GEO)",
        "Visitor De-anonymization",
        "POPIA Compliance",
        "Industrial Sales Intelligence",
        "Next.js Web Architecture"
      ],
      "founder": {
        "@type": "Person",
        "@id": "https://www.auraworks.co.za/#founder",
        "name": "Reitumetse Sethabela",
        "jobTitle": "Founder & Managing Director"
      },
      "sameAs": [
        "https://www.linkedin.com/company/auraworks",
        "https://github.com/auraworks"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://www.auraworks.co.za/#service",
      "name": "AuraWorks Organic Discoverability & Lead Capture Services",
      "provider": {
        "@id": "https://www.auraworks.co.za/#organization"
      },
      "areaServed": [
        "South Africa",
        "SADC"
      ],
      "description": "Comprehensive B2B organic search engine optimization (SEO), Generative Engine Optimization (GEO) for AI search engines, high-performance website engineering, and proprietary visitor identity resolution for industrial enterprises.",
      "serviceType": [
        "Search Engine Optimization (SEO)",
        "Generative Engine Optimization (GEO)",
        "B2B Website Engineering",
        "Visitor Identity Resolution & Lead Capture"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.auraworks.co.za/#software",
      "name": "AuraWorks Intelligence Engine",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "creator": {
        "@id": "https://www.auraworks.co.za/#organization"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "ZAR",
        "description": "Custom industrial solutions and retainers quoted upon technical discovery"
      },
      "description": "Proprietary B2B visitor de-anonymization and conversion technology that turns anonymous industrial website traffic into verified pipeline for South African and SADC enterprises."
    },
    {
      "@type": "WebSite",
      "@id": "https://www.auraworks.co.za/#website",
      "url": "https://www.auraworks.co.za",
      "name": "AuraWorks",
      "description": "B2B Organic Discoverability, Generative Engine Optimization (GEO) & Lead Capture in South Africa and SADC",
      "publisher": {
        "@id": "https://www.auraworks.co.za/#organization"
      },
      "inLanguage": "en-ZA"
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans">
        {/* AuraWorks Industrial Intelligence Edge Tracker */}
        <Script
          src="https://cdn.auraworks.co.za/aura.js"
          data-client-id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0"
          strategy="afterInteractive"
        />

        {children}
        
        {/* Cookie Consent Banner */}
        <CookieBanner />

        {/* Third-party Analytics */}
        <SpeedInsights />
        <GoogleAnalytics gaId="G-2LE9FLFM12" />
        <Analytics />
      </body>
    </html>
  );
}
