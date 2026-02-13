# Nick Wiley — Human-in-the-Loop AI Portfolio

Production-grade portfolio website for Nicholas A. Wiley, built with Next.js 15, TypeScript, and Tailwind CSS.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Deployment

This project is **Vercel-ready**. Push to your repository and connect it to Vercel — the build will work out of the box.

Environment variables (optional):
- `NEXT_PUBLIC_SITE_URL` — Your production URL (defaults to `https://nickwiley.dev`)
- `OPENAI_API_KEY` — Enables the AI chat API route
- `ANTHROPIC_API_KEY` — Alternative AI provider for the chat route

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
  api/chat/route.ts     # AI chat API
  api/interview-mode/route.ts # Adaptive interviewer briefing API
  api/contact/route.ts  # Contact form API

components/
  layout/               # Navbar, footer, theme
  ui/                   # Button, card, badge, input, textarea
  work/                 # Case study cards, mode toggle
  home/                 # Guided tour, home client wrapper
  search/               # Global search dialog
  resume/               # Print action button
  seo/                  # JSON-LD structured data

content/
  work/*.mdx            # Case study content
  writing/*.mdx         # Blog post content

lib/
  mdx.ts                # MDX content loader with zod validation
  types.ts              # TypeScript types and zod schemas
  adaptive/             # Company/persona profiles + recommendation engine
  utils.ts              # Shared utilities
```

## Key Features

- **Executive / Builder toggle** — Each case study has two summary modes: one focused on outcomes and governance, the other on architecture and stack.
- **Global search** — Press `/` or `Cmd+K` to search across case studies, writing, and pages.
- **Guided tour** — A 60-second tour on the home page highlighting key sections.
- **Dark mode** — System preference + manual toggle.
- **Adaptive Interview Mode** — Company/persona-tailored recommendations and talking points (KUNGFU.AI + Anthropic CEO comparison), with adaptive theming and optional AI-enhanced interviewer briefings.
- **Shareable prep links** — Copy mode links that preserve company, persona, provider, focus note, and interview date context, with live URL sync as mode/date changes.
- **Focus-note tuning** — Add an optional session focus note to steer recommendations, AI narrative, and exported prep packets.
- **Focus presets** — One-click persona-specific focus-note presets to quickly retarget the narrative for each interviewer type.
- **Focus-note memory** — Save and reuse recent focus notes per company/persona for faster iterative prep sessions.
- **Mode health indicator** — Navbar status pill shows current readiness completion and latest mock score for selected mode.
- **Interview countdown pill** — Navbar displays D-day countdown (or passed state) for the active company/persona interview date.
- **Navbar date quick-fix** — When date context is missing/stale, Interview Mode surfaces a one-click “Set/Reset date +7d” action.
- **Shared timeline quick-fix controls** — Consistent Set/Reset +7d/+14d actions (plus a direct “Open tracker” shortcut) appear across cockpit, insights, reminders, and next-actions panels when date context is missing/stale.
- **Timeline status banner** — Adaptive briefing surfaces a prominent timeline risk banner for missing/stale/imminent interview windows, with quick remediation and jump-to-section actions.
- **Mode health status** — Indicator is risk-coded ("On track", "Building", "Needs reps", "Urgent", "Set date", "Date passed") based on readiness, performance, and interview-date timeline context.
- **Preflight readiness score** — Weighted 0–100 score combining checklist progress, mock results, launchpad coverage, prep context, session recency, and interview-date urgency (with stale/missing-date timeline flags and quick date reset actions).
- **Practice reminders** — Auto-generated next-step reminders (with due-by guidance) based on readiness, score, launchpad coverage, and interview-date proximity (including one-click prompts to set/reset date context).
- **Readiness gap panel** — Surfaces outstanding checklist and unopened resource gaps with direct remediation actions.
- **Mock interviewer script** — Role-specific practice questions with answer strategies and direct links to recommended portfolio artifacts.
- **Mock script export** — Copy/download persona-specific interviewer scripts as Markdown for offline rehearsal.
- **5-question mock session** — Interactive persona-specific practice flow with live local feedback on metrics, ownership, impact framing, governance language, and interview-date timeline guidance.
- **Live answer timer + pressure mode** — Built-in 60/90/120-second timer with optional pressure mode that locks 60-second responses and randomizes non-warmup prompt order.
- **Exportable prep report** — Copy or download a plain-text mock-session report with scores, strengths, gaps, and coaching prompts.
- **Session autosave** — Mock interview drafts persist locally per company/persona, so you can continue prep later.
- **Pacing + coaching themes** — Mock mode estimates speaking time per answer and surfaces recurring improvement themes at session completion.
- **Readiness checklist** — Persona-aware prep checklist with local progress tracking and completion percentage.
- **Prep insights dashboard** — Tracks session history, latest/best scores, trend, recurring coaching themes, interview pacing status, and one-click timeline quick-fix actions per company/persona.
- **Confidence calibration** — Mock sessions capture self-rated confidence and compare it with performance trends.
- **Prep cockpit summary** — One-click snapshot of persona goal, readiness progress, latest mock score, top resources, and inline timeline quick-fix actions when date context is missing/stale.
- **Prep brief export** — Generate a reusable Markdown prep brief (copy or download) for the exact company/persona mode, including pacing guidance and calendar shortcuts.
- **Mode comparison panel** — Side-by-side view of current vs alternate company mode with top resources and one-click switching.
- **Resource launchpad** — Track and open top recommended artifacts with per-mode completion progress and bulk open/mark actions.
- **Next best actions** — Dynamic, priority-ranked guidance based on readiness, latest mock outcomes, and confidence calibration.
- **Timeline-aware action guidance** — Next-best-actions escalates countdown priorities when the interview date is within 48 hours and includes one-click date setup/reset actions when timeline context is missing or stale.
- **Targeted drills** — Theme-driven micro-exercises generated from your latest coaching gaps, with local completion tracking.
- **Prep cadence tracking** — Weekly session target + streak tracking to keep interview practice consistent.
- **Prep data tools** — Export/import/paste/reset local prep state (JSON), including notes, focus history, and interview date, per company/persona mode, with two-step reset confirmation, payload size guards, and import sanitization caps for safer restores.
- **Prep notes pad** — Persist mode-specific interviewer notes and include them in exported briefs/packets.
- **Interview day plan** — Time-phased execution plan (prep window + T-45 to close) tuned to selected company/persona priorities and interview-date timeline.
- **Interview date tracker** — Set a per-mode interview date (with quick-set controls and strict date validation) to anchor urgency, include date context in exported briefs, launch upcoming Google Calendar interview/prep checkpoint events, and download an `.ics` prep plan.
- **Full prep packet export** — Download a consolidated Markdown packet with brief, preflight status, pacing guidance, reminders, next actions, drills, and day plan.
- **Skip links** — Keyboard-accessible skip-to-content link.
- **Print-ready resume** — The resume page has print styles for PDF export.
- **Accessibility** — Semantic HTML, focus states, ARIA labels, reduced motion support.

## Adaptive Interview Mode

Use the Interview Mode controls in the navbar to set:
- target company
- interviewer persona/role
- preferred AI provider for optional briefing generation

Behavior:
- deterministic recommendations are always available
- AI-enhanced narrative is used when API keys are present
- secure fallback returns deterministic narrative when keys are missing or provider calls fail

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
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
- `public/resume/nick-wiley-resume.pdf` — Place an actual PDF resume here for the download button.
- `public/og-image.png` — Open Graph image for social sharing (1200x630 recommended).
- Projects page items marked "Code available on request" or "Available on request" — Add links if/when repos are shared.
- The testimonial quote on the home page uses a short excerpt. Nick should verify this is the preferred quote from the recommendation letter.
- The chat API route (`/api/chat`) requires `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variables to function.
