import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { SearchDialog } from "@/components/search/search-dialog";
import { getSearchIndex } from "@/lib/search-index";
import { siteConfig } from "@/lib/site";
import { AdaptiveProvider } from "@/components/adaptive/adaptive-provider";
import { AdaptiveTheme } from "@/components/adaptive/adaptive-theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default:
      "Nick Wiley | AI Product and Delivery Leadership for Government",
    template: "%s | Nick Wiley",
  },
  description:
    "Product and delivery leader for AI in federal agencies. 12+ years shipping decision-support systems at NSF, USDA, USPS, and Census, plus a startup founder. Discovery inside the workflow, human oversight by design.",
  keywords: [
    "Nick Wiley",
    "Product manager",
    "Public sector AI",
    "Government AI",
    "AI Solution Architect",
    "AI Platforms",
    "Delivery leadership",
    "Governance",
    "Responsible AI",
    "Federal analytics",
    "NLP",
    "Python",
    "Decision support",
    "Regulated environments",
  ],
  authors: [{ name: "Nicholas A. Wiley" }],
  creator: "Nicholas A. Wiley",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Nick Wiley",
    title: "Nick Wiley | AI Product and Delivery Leadership for Government",
    description:
      "Product and delivery leader for AI in federal agencies. 12+ years shipping decision-support systems at NSF, USDA, USPS, and Census.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nick Wiley, AI product and delivery leadership for government",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Wiley | AI Product and Delivery Leadership for Government",
    description:
      "Product and delivery leader for AI in federal agencies. 12+ years inside NSF, USDA, USPS, and Census.",
    images: ["/og-image.png"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchIndex = getSearchIndex();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PersonJsonLd />
        <WebsiteJsonLd />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <Suspense>
            <AdaptiveProvider>
              <AdaptiveTheme />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
              >
                Skip to main content
              </a>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main id="main-content" className="flex-1 pt-16">
                  {children}
                </main>
                <Footer />
              </div>
              <SearchDialog items={searchIndex} />
            </AdaptiveProvider>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
