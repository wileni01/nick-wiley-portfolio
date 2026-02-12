export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nick Wiley",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://nickwiley.dev",
    jobTitle: "Full-Stack Engineer & AI Solutions Architect",
    description:
      "Full-Stack Software Engineer and AI Solutions Architect specializing in production-grade web applications with AI integration, data engineering, and cybersecurity.",
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "OpenAI",
      "Machine Learning",
      "Cybersecurity",
      "Data Engineering",
      "DevOps",
    ],
    sameAs: [
      "https://github.com/nickwiley",
      "https://linkedin.com/in/nickwiley",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nickwiley.dev";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nick Wiley Portfolio",
    url: baseUrl,
    description:
      "Professional portfolio of Nick Wiley — Full-Stack Engineer & AI Solutions Architect.",
    author: {
      "@type": "Person",
      name: "Nick Wiley",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
