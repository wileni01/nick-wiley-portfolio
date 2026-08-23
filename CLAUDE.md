# nick-wiley-portfolio

Personal portfolio for Nicholas A. Wiley, live at https://www.nickwiley.ai.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, deployed
on Vercel (project `nick-wiley-portfolio`, team "Nicholas Wiley's projects").
Pushing to `main` deploys to production; other branches get preview URLs.

## Commands

```sh
npm ci                 # install (package-lock.json is the source of truth)
npm run dev            # http://localhost:3000
npm run build          # production build; also type-checks
npm run lint           # eslint (flat config)
npm run typecheck      # tsc --noEmit
npm run images:optimize -- --write   # re-encode oversized images in public/images
npm run images:capture               # re-capture product/case-study images (needs Chrome)
```

Node 24 (`.node-version`). Use `npm`, never pnpm/yarn, to keep the lockfile.

## Where things live

- `content/work/*.mdx` — case studies (frontmatter validated by zod in `lib/types.ts`)
- `content/writing/*.mdx` — posts
- `app/resume/page.tsx`, `app/about/page.tsx`, `app/projects/page.tsx` — hand-written pages
- `lib/site.ts` — canonical URLs, email, LinkedIn; import instead of hardcoding
- `lib/search-index.ts` — global search is generated from `content/` at build time
- `lib/adaptive/` — tailored views for shared links (`/?p=platinion`, `/?for=<company>&persona=<id>`);
  profiles in `lib/adaptive/profiles.ts` name real people, so nothing there is
  exposed in the default UI
- `components/mdx/mdx-content.tsx` — the only MDX renderer; do not reintroduce regex markdown
- `lib/products.ts` — the /projects gallery (shipped products, LLI programs, government engagements, prototypes)
- `scripts/capture-screenshots.mjs` + `scripts/mockups/*.html` — every product/case-study image is either a
  headless-Chrome capture of a live site or a hand-built recreation of an internal tool. Recreations are
  labeled as such on the site (`imageKind` in frontmatter and in `lib/products.ts`); keep that honest.
- `resources/` — canonical facts/resume source material for content edits
- `.cursor/rules/nick-content-writing.mdc` — voice rules for site-facing copy; follow them for any content change

## Positioning (August 2026)

Copy is aligned with Nick's application for Product Manager, Public Sector at Anthropic: discovery inside
agency workflows, AI product judgment (evaluation, human oversight), shipping through teams he does not
control, and shipped end-to-end products. Reframe existing facts; never add new claims.

## Conventions

- Content facts come from `resources/` or the user. Never invent metrics, dates, or employers.
- No em dashes in site-facing copy (house style).
- `app/api/contact` must never report success without delivering. Delivery
  requires `RESEND_API_KEY` (see `.env.example`).
- Keep `public/images` small: run `npm run images:optimize -- --write` after adding images.
- Run `npm run build && npm run lint` before pushing.
