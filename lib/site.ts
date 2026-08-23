/**
 * Site-wide constants. Import from here instead of repeating URLs and
 * addresses across pages.
 */
/**
 * Canonical origin, e.g. "https://www.nickwiley.ai". Whitespace and trailing
 * slashes are stripped so a sloppy env var can't corrupt generated URLs
 * (the production sitemap once shipped a tab character in every <loc>).
 */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const fallback = "https://www.nickwiley.ai";
  if (!raw) return fallback;
  try {
    return new URL(raw).origin;
  } catch {
    return fallback;
  }
}

export const siteConfig = {
  name: "Nick Wiley",
  fullName: "Nicholas A. Wiley",
  url: resolveSiteUrl(),
  /** Public contact address shown on the site and used for mailto: links. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "wileni01@gmail.com",
  linkedin: "https://linkedin.com/in/nicholas-a-wiley-975b3136",
  github: "https://github.com/wileni01",
  sourceRepo: "https://github.com/wileni01/nick-wiley-portfolio",
  location: "Alexandria, VA",
  resumePdf: "/resume/nick-wiley-resume.pdf",
} as const;

/** Builds a mailto: URL with optional prefilled subject and body. */
export function mailtoUrl(opts: { subject?: string; body?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.subject) params.set("subject", opts.subject);
  if (opts.body) params.set("body", opts.body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${siteConfig.email}${query ? `?${query}` : ""}`;
}
