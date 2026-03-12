import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // Imported from Snippet 1
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
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
  publisher: "AuraWorks Pty (Ltd)",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* AuraWorks Tracking Script */}
        <Script
          src="http://localhost:8000/static/tracker.js" // Source from Snippet 2
          data-id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0" // ID from Snippet 2
          strategy="afterInteractive" // Strategy from Snippet 1
        />
      </body>
    </html>
  );
}