import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SEO_CONTENT } from "@/lib/constants";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zarihoney.com"),
  title: {
    default: SEO_CONTENT.title,
    template: "%s | Zari Honey",
  },
  description: SEO_CONTENT.description,
  keywords: SEO_CONTENT.keywords,
  authors: [{ name: "Zari Honey", url: "https://zarihoney.com" }],
  creator: "Zari Honey",
  publisher: "Zari Honey",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SEO_CONTENT.url,
    siteName: SEO_CONTENT.siteName,
    title: SEO_CONTENT.title,
    description: SEO_CONTENT.description,
    images: [
      {
        url: SEO_CONTENT.ogImage,
        width: 1200,
        height: 630,
        alt: "Zari Honey - Madu Premium Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONTENT.title,
    description: SEO_CONTENT.description,
    images: [SEO_CONTENT.ogImage],
    creator: "@zarihoney",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add after Google Search Console setup
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
