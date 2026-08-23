# Nick Wiley — Human-in-the-Loop AI Portfolio

Portfolio website for Nicholas A. Wiley, built with Next.js 16, TypeScript, and Tailwind CSS 4. Live at https://www.nickwiley.ai.

## Local Development

Requires Node 24 (see `.node-version`).

```bash
npm ci             # install from package-lock.json
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run images:optimize -- --write   # shrink oversized images in public/images
```

## Deployment

Hosted on Vercel. Pushing to `main` deploys to production; every other branch
gets a preview URL. The build works with no environment variables, but the
contact form only delivers email once Resend is configured.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Enables contact form delivery via [Resend](https://resend.com). Without it the form tells visitors to email directly. |
| `CONTACT_EMAIL` | Inbox that receives submissions (defaults to the address in `lib/site.ts`). |
| `RESEND_FROM` | Sender. Resend's onboarding sender works without DNS setup but only delivers to the Resend account owner; verify `nickwiley.ai` to send from the domain. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown on the site. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional Cloudflare Turnstile CAPTCHA on the form. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, `https://www.nickwiley.ai`, no trailing slash or whitespace. |

See `.env.example`.

## Where to Edit Content

### Case Studies
Edit or add MDX files in `content/work/*.mdx`. Each file requires frontmatter:

```yaml
---
title: "..."
slug: "..."
client: "..."
timeframe: "..."
role: "..."
stack: [...]
tags: [...]
featured: true/false
executiveSummary: "..."
builderSummary: "..."
---
```

### Writing / Blog Posts
Edit or add MDX files in `content/writing/*.mdx`. Frontmatter:

```yaml
---
title: "..."
slug: "..."
date: "YYYY-MM-DD"
description: "..."
tags: [...]
---
```

### Resume
The resume content is in `app/resume/page.tsx` as structured HTML. Edit directly.

Place a PDF resume at `public/resume/nick-wiley-resume.pdf` for the download button.

### Projects
Edit the projects list in `app/projects/page.tsx`.

### About Page
Edit `app/about/page.tsx`.

## Site Structure

```
app/
  page.tsx              # Home
  work/page.tsx         # Case study index
  work/[slug]/page.tsx  # Case study detail
  projects/page.tsx     # Projects
  writing/page.tsx      # Writing index
  writing/[slug]/page.tsx # Writing detail
  resume/page.tsx       # Resume (HTML + print styles)
  about/page.tsx        # About
  contact/page.tsx      # Contact form
  api/contact/route.ts  # Contact form API (Resend)

components/
  layout/               # Navbar, footer, theme
  ui/                   # Button, card, badge, input, textarea
  work/                 # Case study cards, mode toggle
  home/                 # Guided tour, home client wrapper
  search/               # Global search dialog (index built from content/)
  mdx/                  # MDX renderer for case studies and posts
  adaptive/             # Tailored views for shared links
  resume/               # Print action button
  seo/                  # JSON-LD structured data

content/
  work/*.mdx            # Case study content
  writing/*.mdx         # Blog post content

lib/
  mdx.ts                # MDX content loader with zod validation
  search-index.ts       # Builds the global search index at build time
  site.ts               # Canonical URLs, contact email, social links
  types.ts              # TypeScript types and zod schemas
  utils.ts              # Shared utilities
```

## Key Features

- **Executive / Builder toggle** — Each case study has two summary modes: one focused on outcomes and governance, the other on architecture and stack.
- **Global search** — Press `/` or `Cmd+K` to search across case studies, writing, and pages. The index is generated from `content/` at build time.
- **Guided tour** — A 60-second tour on the home page highlighting key sections.
- **Dark mode** — System preference + manual toggle.
- **Skip links** — Keyboard-accessible skip-to-content link.
- **Print-ready resume** — The resume page has print styles for PDF export.
- **Accessibility** — Semantic HTML, focus states, ARIA labels, reduced motion support.

## Tailored Views (shareable links)

The default site is the same for everyone. A link can activate a tailored
view for the rest of the browsing session:

- **BCG Platinion view:** `/?p=platinion` (alias `/?p=harsh`, or `/?for=bcg&persona=bcg-harsh`)
- **Other profiles:** `/?for=<companyId>&persona=<personaId>` using ids from `lib/adaptive/profiles.ts`

Recipients can exit the view with the × on the banner. The profiles file names
real people, so no selector for it is exposed in the navigation.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **MDX** content with **zod** frontmatter validation
- **Framer Motion** for subtle animations
- **Radix UI** primitives
- **Vercel** deployment

---

## Content Integrity Notes

The following notes document where content uses sanitized, approximated, or placeholder language. All factual claims are sourced from verified resume materials and the canonical resource files.

### Sanitized language used
- NSF case studies use "sanitized" to indicate that agency-specific details, internal data, and metrics are not disclosed due to the sensitivity of the work.
- Timeframes for recent NSF/USDA work use "Recent (sanitized)" rather than specific years.
- RATB case study keeps tool details at a high level ("ESRI", "Palantir") without disclosing specific datasets or investigation targets.

### Reported / approximate language
- VisiTime's "400% annual growth" is noted as a "reported" figure in one resume version. It is used with the qualifier "reported" in the case study.
- "$200K+" for VisiTime fundraising uses the conservative lower bound across resume versions.
- "5B+ records" for the USDA warehouse is presented as "described as 5+ billion records" to match the original resume language.
- "12+ years" experience is calculated from the 2011 start date at RATB.

### Placeholders requiring Nick to fill
- Projects page items marked "Code available on request" or "Available on request" — Add links if/when repos are shared.
- The testimonial quote on the home page uses a short excerpt. Nick should verify this is the preferred quote from the recommendation letter.
- The contact form needs `RESEND_API_KEY` in Vercel before it delivers email; until then visitors are pointed to the direct address.
