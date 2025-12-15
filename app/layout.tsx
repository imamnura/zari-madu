import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SEO_CONTENT } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zarilife.com"),
  title: SEO_CONTENT.title,
  description: SEO_CONTENT.description,
  openGraph: {
    title: SEO_CONTENT.title,
    description: SEO_CONTENT.description,
    images: [SEO_CONTENT.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONTENT.title,
    description: SEO_CONTENT.description,
    images: [SEO_CONTENT.ogImage],
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
        {children}
      </body>
    </html>
  );
}
