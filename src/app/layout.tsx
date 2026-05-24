import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Tracker from "@/components/Tracker";
import FloatMenu from "@/components/FloatMenu";
import BfcacheReset from "@/components/BfcacheReset";
import { readSeo } from "@/lib/seo-store";
import { readFloatMenu } from "@/lib/float-menu-store";
import { getMetadataBase } from "@/lib/seo-metadata";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

// Root metadata pulls defaults from the admin-managed SEO store. Per-page
// metadata (in each page's generateMetadata) overrides title/description.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await readSeo()
  const base = await getMetadataBase()
  return {
    metadataBase: base,
    title: {
      default: seo.global.defaultTitle,
      template: seo.global.titleTemplate || "%s",
    },
    description: seo.global.defaultDescription,
    ...(seo.global.defaultKeywords.length > 0
      ? { keywords: seo.global.defaultKeywords }
      : {}),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const floatMenu = await readFloatMenu()
  return (
    <html lang="tr" className="bg-[#fafafa]">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Tracker />
        <FloatMenu config={floatMenu} />
        <BfcacheReset />
      </body>
    </html>
  );
}
