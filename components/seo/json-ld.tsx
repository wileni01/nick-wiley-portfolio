export function PersonJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nickwiley.dev";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nicholas A. Wiley",
    alternateName: "Nick Wiley",
    url: baseUrl,
    jobTitle: "AI Solutions Architect / Managing Consultant",
    description:
      "Managing Consultant and applied data scientist with 12+ years delivering analytics and ML solutions across federal civilian agencies, startups, and SaaS environments.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alexandria",
      addressRegion: "VA",
      addressCountry: "US",
    },
    knowsAbout: [
      "Human-in-the-loop AI",
      "Decision support systems",
      "Python",
      "SQL",
      "NLP embeddings",
      "SciBERT",
      "Clustering (HDBSCAN, k-means)",
      "Tableau",
      "Google BigQuery",
      "Data pipelines",
      "Federal analytics",
      "Agile delivery",
      "Section 508 accessibility",
    ],
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of Maryland",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Gettysburg College",
      },
    ],
    sameAs: [
      "https://linkedin.com/in/nicholas-a-wiley-975b3136",
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
    name: "Nick Wiley — Human-in-the-Loop AI Portfolio",
    url: baseUrl,
    description:
      "AI Solutions Architect — human-in-the-loop decision support for high-stakes public sector work.",
    author: {
      "@type": "Person",
      name: "Nicholas A. Wiley",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
