import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
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
    default: "Nick Wiley | Full-Stack Engineer & AI Solutions Architect",
    template: "%s | Nick Wiley",
  },
  description:
    "Full-Stack Software Engineer and AI Solutions Architect. Building production-grade web applications with AI integration, data engineering, and cybersecurity expertise.",
  keywords: [
    "Nick Wiley",
    "Full-Stack Engineer",
    "AI Solutions Architect",
    "Next.js",
    "React",
    "Python",
    "OpenAI",
    "Cybersecurity",
    "Portfolio",
  ],
  authors: [{ name: "Nick Wiley" }],
  creator: "Nick Wiley",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Nick Wiley Portfolio",
    title: "Nick Wiley | Full-Stack Engineer & AI Solutions Architect",
    description:
      "Full-Stack Software Engineer and AI Solutions Architect. Building production-grade web applications with AI integration.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nick Wiley - Full-Stack Engineer & AI Solutions Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Wiley | Full-Stack Engineer & AI Solutions Architect",
    description:
      "Full-Stack Software Engineer and AI Solutions Architect.",
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
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
