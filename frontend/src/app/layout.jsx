import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from "@vercel/analytics/next";

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
  metadataBase: new URL("https://auraworks.co.za"),
  title: {
    default: "AuraWorks | Industrial Sales Intelligence & Lead Generation",
    template: "%s | AuraWorks",
  },
  description: "Identify companies visiting your website. AuraWorks turns anonymous industrial traffic into high-intent sales leads for B2B firms in South Africa.",
  
  // Added for browser category indexing
  category: 'technology',
  classification: 'Industrial Sales Intelligence',
  
  keywords: [
    "B2B Lead Generation South Africa",
    "Industrial Sales Intelligence",
    "Intent-Based Lead Generation",
    "Identity Resolution",
    "POPIA Compliant Lead Generation",
    "Anonymous Visitor Identification",
    "Sales Automation for Manufacturing",
    "Mining Sector Leads",
    "Engineering Sales Intelligence",
    "Revenue Systems Architecture",
    "Gauteng B2B Sales Tools",
    "East Rand Industrial Marketing" // Added local specificity
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
  authors: [{ name: "Reitumetse Sethabela", url: "https://auraworks.co.za" }],
  creator: "Reitumetse Sethabela",
  publisher: "AuraWorks (Pty) Ltd",
  
  openGraph: {
    title: "AuraWorks | Industrial Sales Intelligence",
    description: "Turn anonymous industrial traffic into high-intent sales leads. POPIA-compliant B2B identification.",
    url: "https://auraworks.co.za",
    siteName: "AuraWorks",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AuraWorks | Industrial Sales Intelligence Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraWorks | B2B Intelligence",
    description: "Industrial Lead Generation & Identity Resolution.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://auraworks.co.za",
  },
  
  // Security and Browser Instructions
  robots: {
    index: true,
    follow: true,
    nocache: false, // Ensures Google checks for updates more frequently
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  // Pull the base URL (e.g., https://your-app.up.railway.app)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Clean the URL to ensure it points to the static asset correctly
  const trackerSrc = `${API_BASE_URL.replace(/\/$/, '')}/static/tracker.js`;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* 1. Inject Config: This tells the tracker where the backend is */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.AURA_CONFIG = { apiUrl: "${API_BASE_URL}" };`,
          }}
        />

        {/* 2. Load Tracker: Pulling it from your Railway static folder */}
        <Script
          src={`${API_BASE_URL.replace(/\/$/, '')}/static/tracker.js`}
          data-id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0"
          strategy="afterInteractive"
        />

        <SpeedInsights />
        <GoogleAnalytics gaId="G-2LE9FLFM12" />
        <Analytics />
      </body>
    </html>
  );
}