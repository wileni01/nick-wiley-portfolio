import { siteConfig } from "@/lib/site";

export function PersonJsonLd() {
  const baseUrl = siteConfig.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nicholas A. Wiley",
    alternateName: "Nick Wiley",
    url: baseUrl,
    jobTitle: "Managing Consultant, AI and Analytics (IBM)",
    description:
      "Product and delivery leader for AI in federal agencies, with 12+ years building analytics platforms, ML workflows, and governance inside NSF, USDA, USPS, and Census. Startup founder and U.S. patent holder.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alexandria",
      addressRegion: "VA",
      addressCountry: "US",
    },
    knowsAbout: [
      "AI product management",
      "Public sector AI deployment",
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
      "Product and delivery leadership for AI in government. Shipped products, case studies from NSF, USDA, USPS, and Census, and writing on trustworthy AI.",
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
