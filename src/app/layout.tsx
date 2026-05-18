import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Tracker from "@/components/Tracker";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Webreta | İzmir Web Tasarım ve Geliştirme Ajansı",
  description:
    "Markanıza özel, hızlı ve modern web siteleri. İzmir merkezli web geliştirme ajansı. 2018'den beri 120+ proje.",
  keywords: [
    "web tasarım",
    "web geliştirme",
    "İzmir",
    "web ajansı",
    "kurumsal web sitesi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-[#fafafa]">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Tracker />
      </body>
    </html>
  );
}
