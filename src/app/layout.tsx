import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/format";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle, template: `%s | ${s.businessName}` },
    description: s.seoDescription,
    applicationName: s.businessName,
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: s.businessName,
      title: s.seoTitle,
      description: s.seoDescription,
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
