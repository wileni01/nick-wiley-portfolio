import { siteConfig } from "@/lib/site";

export function PersonJsonLd() {
  const baseUrl = siteConfig.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nicholas A. Wiley",
    alternateName: "Nick Wiley",
    url: baseUrl,
    jobTitle: "Managing Consultant, AI Solution Architecture and Delivery",
    description:
      "AI solution architect and delivery leader with 12+ years designing analytics platforms, ML workflows, and governance frameworks for federal civilian agencies. U.S. patent holder.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alexandria",
      addressRegion: "VA",
      addressCountry: "US",
    },
    knowsAbout: [
      "AI solution architecture",
      "Delivery leadership",
      "Responsible AI governance",
      "NLP embeddings (SciBERT)",
      "Clustering (HDBSCAN, k-means)",
      "Python",
      "SQL",
      "Tableau",
      "AWS (SageMaker, Bedrock)",
      "Data pipelines",
      "Federal analytics",
      "Agile / SAFe delivery",
      "Human-in-the-loop AI",
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
      siteConfig.linkedin,
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
  const baseUrl = siteConfig.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nick Wiley",
    url: baseUrl,
    description:
      "AI solution architecture and delivery leadership for regulated environments. Analytics platforms, ML workflows, and governance frameworks for federal agencies.",
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
