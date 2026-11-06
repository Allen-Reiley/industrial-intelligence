import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operational and visitor intelligence dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
