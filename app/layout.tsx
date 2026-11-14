import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { SearchDialog } from "@/components/search/search-dialog";
import { getSearchIndex } from "@/lib/search-index";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--body-font", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--display-font", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Nick Wiley | Portfolio", template: "%s | Nick Wiley" },
  description: siteConfig.description,
  authors: [{ name: siteConfig.fullName }],
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png" }], apple: "/icon.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: "Nick Wiley | Portfolio",
    description: siteConfig.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nick Wiley, portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Wiley | Portfolio",
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><PersonJsonLd /><WebsiteJsonLd /></head>
      <body className={`${sans.variable} ${serif.variable}`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <SearchDialog items={getSearchIndex()} />
        <Analytics />
      </body>
    </html>
  );
}
