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
    default: "AuraWorks | Industrial Sales Intelligence",
    template: "%s | AuraWorks",
  },
  description: "Identify the companies visiting your website. AuraWorks turns anonymous industrial traffic into high-intent sales leads for B2B firms.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  authors: [{ name: "Reitumetse Sethabela", url: "https://auraworks.co.za" }],
  creator: "Reitumetse Sethabela",
  publisher: "AuraWorks (Pty) Ltd", // Updated to standard SA business format
  openGraph: {
    title: "AuraWorks | Industrial Sales Intelligence",
    description: "Identify companies visiting your site. Turn traffic into sales.",
    url: "https://auraworks.co.za",
    siteName: "AuraWorks",
    locale: "en_ZA",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraWorks | B2B Intelligence",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://auraworks.co.za",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* AuraWorks Tracking Script - Remember to update localhost before Prod deploy */}
        <Script
          src="http://localhost:8000/static/tracker.js"
          data-id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0"
          strategy="afterInteractive"
        />

        <SpeedInsights />
        {/* Using your primary Measurement ID */}
        <GoogleAnalytics gaId="G-2LE9FLFM12" />
        <Analytics />
      </body>
    </html>
  );
}