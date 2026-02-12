import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { SearchDialog } from "@/components/search/search-dialog";
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
      "Nick Wiley | AI Solutions Architect — Human-in-the-Loop Decision Support",
    template: "%s | Nick Wiley",
  },
  description:
    "AI Solutions Architect / Applied AI & Analytics — Human-in-the-loop decision support for high-stakes public sector work.",
  keywords: [
    "Nick Wiley",
    "AI Solutions Architect",
    "Human-in-the-loop",
    "Decision support",
    "Federal analytics",
    "Python",
    "NLP",
    "Tableau",
    "Data engineering",
    "Applied AI",
  ],
  authors: [{ name: "Nicholas A. Wiley" }],
  creator: "Nicholas A. Wiley",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Nick Wiley Portfolio",
    title:
      "Nick Wiley | AI Solutions Architect — Human-in-the-Loop Decision Support",
    description:
      "AI Solutions Architect — human-in-the-loop decision support for high-stakes public sector work.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nick Wiley — AI Solutions Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Wiley | AI Solutions Architect",
    description:
      "Human-in-the-loop decision support for high-stakes public sector work.",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
