import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { SearchDialog } from "@/components/search/search-dialog";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default:
      "Nick Wiley | AI Solution Architecture & Delivery Leadership for Regulated Environments",
    template: "%s | Nick Wiley",
  },
  description:
    "AI solution architect and delivery leader. 12+ years designing analytics platforms, ML workflows, and governance frameworks for federal agencies including NSF, USDA, USPS, and Census.",
  keywords: [
    "Nick Wiley",
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
    title:
      "Nick Wiley | AI Solution Architecture & Delivery Leadership for Regulated Environments",
    description:
      "AI solution architect and delivery leader. 12+ years designing analytics platforms, ML workflows, and governance frameworks for federal agencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nick Wiley — AI solution architecture and delivery leadership",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Wiley | AI Solution Architecture & Delivery Leadership",
    description:
      "AI solution architect and delivery leader. 12+ years in regulated federal environments.",
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
              <SearchDialog />
            </AdaptiveProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
