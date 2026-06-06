import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Tracker from "@/components/Tracker";
import FloatMenu from "@/components/FloatMenu";
import BfcacheReset from "@/components/BfcacheReset";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import CookieConsent from "@/components/CookieConsent";
import { readSeo } from "@/lib/seo-store";
import { readFloatMenu } from "@/lib/float-menu-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { readCookieConsent } from "@/lib/cookie-consent-store";
import { getMetadataBase } from "@/lib/seo-metadata";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

// Root metadata pulls defaults from the admin-managed SEO store. Per-page
// metadata (in each page's generateMetadata) overrides title/description.
export async function generateMetadata(): Promise<Metadata> {
  const [seo, base, settings] = await Promise.all([
    readSeo(),
    getMetadataBase(),
    readSiteSettings(),
  ])
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
    // Admin-uploaded favicon wins over the static src/app/favicon.ico;
    // when unset the static file keeps serving.
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [floatMenu, siteSettings, cookieConsent] = await Promise.all([
    readFloatMenu(),
    readSiteSettings(),
    readCookieConsent(),
  ])
  return (
    <html lang="tr" className="bg-[#fafafa]">
      <body className={`${inter.variable} font-sans antialiased`}>
        <MaintenanceBanner
          enabled={siteSettings.maintenance.enabled}
          message={siteSettings.maintenance.message}
        />
        {children}
        <Tracker />
        <FloatMenu config={floatMenu} />
        <CookieConsent settings={cookieConsent} />
        <BfcacheReset />
      </body>
    </html>
  );
}
