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

# Run automated recommendation tests
npm test
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Deployment

This project is **Vercel-ready**. Push to your repository and connect it to Vercel — the build will work out of the box.

Environment variables (optional):
- `NEXT_PUBLIC_SITE_URL` — Your production URL (defaults to `https://nickwiley.dev`)
- `OPENAI_API_KEY` — Enables the AI chat API route
- `ANTHROPIC_API_KEY` — Alternative AI provider for the chat route
- `RESEND_API_KEY` — Enables contact-form email delivery via Resend
- `CONTACT_EMAIL` — Destination inbox for contact-form submissions
- `CONTACT_FROM_EMAIL` — Optional sender identity for Resend (defaults to onboarding sender)

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
- **Shareable prep links** — Copy mode links that preserve company, persona, provider, focus note, and interview date context, with live URL sync as mode/date changes, loop-safe mode-state persistence, and inline copy-failure feedback.
- **Clipboard copy resilience** — Copy actions for prep links, mock scripts/reports, and prep briefs use primary clipboard APIs with a legacy fallback path for wider browser compatibility, plus inline failure feedback states.
- **Export download resilience** — Download actions use shared blob export handling with sanitized filenames, deferred object-URL cleanup for browser compatibility, and inline failure feedback.
- **External-link safety** — Adaptive popup-launch actions now use a shared opener that validates HTTP(S) URLs and a shared outcome classifier for blocked/partial/full-open results.
- **Focus-note tuning** — Add an optional session focus note to steer recommendations, AI narrative, and exported prep packets.
- **Focus presets** — One-click persona-specific focus-note presets to quickly retarget the narrative for each interviewer type.
- **Focus-note memory** — Save and reuse up to 6 recent focus notes (length-capped) per company/persona for faster iterative prep sessions, with loop-safe sync for saved-focus updates.
- **Mode health indicator** — Navbar status pill shows current readiness completion and latest mock score for selected mode.
- **Interview countdown pill** — Navbar displays D-day countdown (or passed state) for the active company/persona interview date.
- **Navbar date quick-fix** — When date context is missing/stale, Interview Mode surfaces a one-click “Set/Reset date +7d” action.
- **Shared timeline quick-fix controls** — Consistent Set/Reset +7d/+14d actions (plus a direct “Open tracker” shortcut) appear across cockpit, insights, reminders, and next-actions panels when date context is missing/stale, with no-op-safe interview-date event dispatch.
- **Timeline status banner** — Adaptive briefing surfaces a prominent timeline risk banner for missing/stale/imminent interview windows, with quick remediation and jump-to-section actions.
- **Mode health status** — Indicator is risk-coded ("On track", "Building", "Needs reps", "Urgent", "Set date", "Date passed") based on readiness, performance, and interview-date timeline context.
- **Preflight readiness score** — Weighted 0–100 score combining checklist progress, mock results, recommendation-scoped launchpad coverage, prep context, session recency, and interview-date urgency (with stale/missing-date timeline flags, resilient launchpad-state parsing, and quick date reset actions).
- **Practice reminders** — Auto-generated next-step reminders (with due-by guidance) based on readiness, score, launchpad coverage, and interview-date proximity (including one-click prompts to set/reset date context), with loop-safe metric refresh updates.
- **Readiness gap panel** — Surfaces outstanding checklist and unopened resource gaps with direct remediation actions.
- **Mock interviewer script** — Role-specific practice questions with answer strategies and direct links to recommended portfolio artifacts.
- **Mock script export** — Copy/download persona-specific interviewer scripts as Markdown for offline rehearsal.
- **5-question mock session** — Interactive persona-specific practice flow with live local feedback on metrics, ownership, impact framing, governance language, and interview-date timeline guidance.
- **Live answer timer + pressure mode** — Built-in 60/90/120-second timer with optional pressure mode that locks 60-second responses and randomizes non-warmup prompt order.
- **Exportable prep report** — Copy or download a plain-text mock-session report with scores, strengths, gaps, and coaching prompts, with inline feedback when downloads fail.
- **Session autosave** — Mock interview drafts persist locally per company/persona with sanitized restore handling, so you can continue prep later.
- **Pacing + coaching themes** — Mock mode estimates speaking time per answer and surfaces recurring improvement themes at session completion.
- **Readiness checklist** — Persona-aware prep checklist with local progress tracking, completion percentage, and loop-safe cross-panel synchronization.
- **Prep insights dashboard** — Tracks the latest 20 session results, latest/best scores, trend, recurring coaching themes, interview pacing status, and one-click timeline quick-fix actions per company/persona, with loop-safe history/readiness refresh updates.
- **Confidence calibration** — Mock sessions capture self-rated confidence and compare it with performance trends.
- **Prep cockpit summary** — One-click snapshot of persona goal, readiness progress, latest mock score, top resources, and inline timeline quick-fix actions when date context is missing/stale, with loop-safe metric refresh updates.
- **Prep brief export** — Generate a reusable Markdown prep brief (copy or download) for the exact company/persona mode, including pacing guidance and calendar shortcuts.
- **Mode comparison panel** — Side-by-side view of current vs alternate company mode with top resources and one-click switching.
- **Resource launchpad** — Track and open top recommended artifacts with per-mode completion progress, validated single/bulk open actions, pop-up blocker feedback, resilient key-sanitized local-state parsing, truthy-only normalized state persistence, accurate progress updates after bulk opens, and loop-safe cross-panel sync events.
- **Next best actions** — Dynamic, priority-ranked guidance based on readiness, latest mock outcomes, and confidence calibration.
- **Timeline-aware action guidance** — Next-best-actions escalates countdown priorities when the interview date is within 48 hours and includes one-click date setup/reset actions when timeline context is missing or stale.
- **Targeted drills** — Theme-driven micro-exercises generated from your latest coaching gaps, with loop-safe local completion tracking and cross-panel drill-state sync.
- **Prep cadence tracking** — Weekly session target + streak tracking to keep interview practice consistent, with normalized loop-safe goal synchronization.
- **Prep data tools** — Export/import/paste/reset local prep state (JSON), including notes, focus history, and interview date, per company/persona mode, with two-step reset confirmation, payload size guards, sanitization caps, clipboard + in-panel manual paste import fallback, explicit time-bound confirmation before cross-mode imports, and no-op detection to avoid redundant writes/events.
- **Prep notes pad** — Persist mode-specific interviewer notes with loop-safe sync semantics and include them in exported briefs/packets.
- **Interview day plan** — Time-phased execution plan (prep window + T-45 to close) tuned to selected company/persona priorities and interview-date timeline.
- **Interview date tracker** — Set a per-mode interview date (with quick-set controls and strict date validation) to anchor urgency, include date context in exported briefs, launch upcoming Google Calendar interview/prep checkpoint events (with pop-up blocker feedback), and download an `.ics` prep plan.
- **Full prep packet export** — Download a consolidated Markdown packet with brief, preflight status, pacing guidance, reminders, next actions, drills, and day plan.
- **Skip links** — Keyboard-accessible skip-to-content link.
- **Print-ready resume** — The resume page has print styles for PDF export.
- **Accessibility** — Semantic HTML, focus states, ARIA labels, reduced motion support, and live status announcements for adaptive copy/download actions.
- **Contact API hardening** — Contact submissions use schema validation, honeypot filtering, rate limiting, input sanitization (including control-char/bidi override stripping), minimal metadata-only logging through shared structured log helpers (redacted sender + field lengths, no raw subject/body previews), optional Resend delivery with bounded/redacted provider-error handling (including explicit timeout classification) plus validated/sanitized sender-recipient config parsing and single-line normalized outbound subject/reply headers, and explicit always-present delivery observability headers: `X-Contact-Delivery` (`skipped|delivered|error`) + `X-Contact-Delivery-Reason` (`invalid_payload|none|rate_limited|honeypot|provider_unconfigured|provider_error|internal_error`), with info diagnostics when delivery is skipped due to configuration or honeypot trigger.
- **Chat API hardening** — Chat requests use schema validation, provider allowlisting, bounded message windows, sanitized inputs/context, explicit user-turn requirement for query grounding, bounded retrieval-query length for embedding lookup, normalized top-K retrieval windows, resilient retrieval fallback (timeout-backed model-only response with structured warning/info diagnostics and explicit no-context guardrail note when embedding lookup fails or yields empty context), vector-index initialization retry cooldown protection under embedding failures, always-present context-source/fallback observability headers (using explicit fallback states like `invalid_payload`, `none`, `no_provider`, `rate_limited`, and `internal_error`, including post-sanitization payload rejections), rate limiting, and shared automatic provider fallback when only one valid API key is configured (trimmed + minimum-length checked, with structured info diagnostics when no provider is configured), plus always-present provider request/selection/fallback headers (`X-AI-Provider-Requested`, `X-AI-Provider`, `X-AI-Provider-Fallback` with explicit `none|1`) for observability.
- **Interview-mode API hardening** — Interview briefing requests/responses use schema validation, allowlisted IDs/providers, bounded/sanitized narrative fields, relative-path (no protocol-relative) or HTTPS-only recommendation URLs (credential-bearing URLs rejected), shared provider fallback routing when available, deterministic fallback behavior (including bounded AI narrative timeout handling, structured warning/info diagnostics on AI-provider unavailability or generation fallback, always-present `X-AI-Narrative-Source` + `X-AI-Narrative-Fallback` state headers—e.g. `none`, `invalid_payload`, `invalid_mode`, `no_provider`, `rate_limited` with `fallback` source, and generation/response/internal fallback reasons—even on early exits), and always-present provider request/selection/fallback headers (`X-AI-Provider-Requested`, `X-AI-Provider`, `X-AI-Provider-Fallback` with explicit `none|1`).
- **API IP normalization** — Server routes normalize `x-forwarded-for` (first valid token in chain), standardized `forwarded`, and common direct proxy/CDN IP headers (`cf-connecting-ip`, `fly-client-ip`, `true-client-ip`, `x-client-ip`, `x-real-ip`) including port/zone-id stripping; normalized literals are validated as real IPs before rate-limit keying, and identifiers are bounded/sanitized with lazy + capacity-bounded in-memory limiter cleanup (inclusive expiry at reset boundary, earliest-expiry eviction under pressure).
- **Shared API JSON utilities** — Server routes reuse shared JSON request parsing/response helpers for consistent invalid-payload handling, including empty-body checks, UTF-8 BOM-tolerant JSON parsing, strict JSON media-type validation (supporting `application/json` and `application/*+json` while rejecting multi-valued content-type headers), strictly numeric/safe-integer content-length parsing (validated even without explicit size caps) + declared-vs-actual size consistency checks + payload-size guard responses (with UTF-8 post-read size validation), sanitized request-id header backfill/normalization from body IDs plus response-payload request-id normalization, enforced non-overridable JSON security response headers (`Content-Type`, `Cache-Control`, `X-Content-Type-Options`), normalized HTTP status bounds, and resilient response serialization fallback for unexpected payload shapes (with non-error responses safely promoted to 500 on serialization failure).
- **Shared API request context** — API routes reuse shared request context helpers for consistent request IDs (UUID with robust full-length random-token + monotonic-counter fallback plus shared normalization), sanitized namespace + IP-based rate-limit keying, normalized rate-limit config usage, and response header construction.
- **Rate-limit response metadata** — API routes include standard rate-limit headers (`X-RateLimit-*`, `Retry-After` on 429) plus `X-Request-Id` across success, validation-error, and fallback 5xx responses; limiter snapshots are normalized to non-negative reset windows, response header values are normalized/clamped (including finite-value guards) from effective limiter config, and request-id header values are bounded/sanitized for safer observability correlation.
- **Structured API logs** — Server routes log request-correlated, normalized warning/error (and selected metadata-info) payloads with bounded/redacted/cycle-safe detail serialization and control-char-safe + allowlisted route/request-id/message normalization to simplify debugging without raw-object or secret leakage noise.
- **Deterministic recommendation/API utility tests** — `npm test` runs Node-based TypeScript tests that verify adaptive recommendation determinism, ranking bounds/sorting/diversity guarantees, safe internal URL outputs, deterministic narrative fallbacks for invalid mode selections, cross-persona recommendation boundedness/uniqueness/safe-link guarantees, adaptive profile/index dataset integrity (unique company/persona/asset IDs, HTTPS source metadata, safe URL patterns, and valid theme token formats), adaptive planning guidance logic (preflight scoring, mode health classification, next actions, practice reminders, and interview-day plans), mock-interviewer/drill/export workflows (script generation, answer/session scoring, coaching themes, targeted drill mapping, prep brief/packet/script markdown generation, and prep cadence states), adaptive state/history sanitization guards (boolean/focus/prep history + prep bundle/mock-session parsing, prep-goal normalization, readiness checklist completion math, and deterministic storage-key builders), interview-date/calendar helper behavior (strict date validation, day-offset math, localStorage write/no-op/clear event semantics, ICS/Google link generation, and past-checkpoint filtering), browser utility behavior (external-link URL protocol guardrails/classification, download filename sanitization/object URL lifecycle, clipboard API + fallback copy path), shared utility behavior (`sanitizeInput` hardening against control/bidi/scriptable tokens + bounded truncation, deterministic `slugify` normalization, month/year date formatting, and Tailwind class conflict merges), embedding-context fallback behavior (deterministic bounded slices + top-K normalization when retrieval is unavailable), hardened JSON request/response behavior (BOM tolerance, JSON-compatible `application/*+json` media-type acceptance, required-content-type rejection + default missing-content-type acceptance, configurable invalid-JSON messaging, empty-body guards, unreadable-body parse fallbacks, strict UTF-8 decode failure handling, streamed raw-byte size enforcement with early max-byte aborts + stream-read failure fallback + declared-size precheck + post-read max-byte/max-char enforcement + content-length mismatch handling, strict numeric/safe-integer content-length validation, BOM declared-length edge handling, parse-error response header passthrough with request-id normalization + invalid request-id header dropping, immutable security headers on parser failures, normalized request-id precedence/cleanup + invalid-header fallback to body IDs on responses, BigInt-safe serialization, and serialization-failure fallback semantics that preserve explicit error statuses while promoting success responses to 500), request-IP normalization across proxy header formats (including invalid forwarded-segment skipping, bracketed IPv6 zone/port normalization in `x-forwarded-for`, and direct-header candidate fallthrough to the first valid literal), rate-limit/request-id normalization guarantees used by shared API response/context helpers (including inclusive rate-limit window reset boundary behavior, anonymous-IP context fallback handling, empty-namespace fallback bucket normalization, overlong-namespace truncation consistency, invalid request-id omission on rate-limit headers, non-finite/invalid max-length request-id normalization bounds, plus deterministic request-id fallback token/counter generation when `crypto.randomUUID` is unavailable), structured server-log sanitization/redaction behavior (including error name/message control-char stripping + bounds, bounded key/depth/array serialization, fallback route/request labels, and BigInt/Date normalization), AI-provider resolution/fallback header semantics, contact-delivery payload/error redaction (provider responses including oversized-body truncation + contiguous-token email redaction, thrown request errors, and empty-provider-body fallbacks) + timeout (AbortError/TimeoutError) + fallback-sender safeguards, and route-level telemetry headers for `application/*+json` and `application/json; charset=utf-8` acceptance paths plus malformed-JSON/empty-body/missing/content-type/multi-valued-content-type/non-numeric-content-length/unsafe-integer-content-length/content-length/oversized-declared-payload/invalid-UTF-8 rejections, invalid/rate-limited paths, no-provider fallback paths, provider-unconfigured contact-success/provider-error paths, deterministic interview-mode payloads, per-request `X-Request-Id` uniqueness across repeated calls, and shared `X-RateLimit-*` + `X-Request-Id`/`Retry-After` response metadata (including repeated-request decrement semantics for `X-RateLimit-Remaining`) plus immutable JSON security headers (`Content-Type`, `Cache-Control`, `X-Content-Type-Options`) on parser failures, deterministic success/fallback responses, and 429 fallbacks (including explicit default provider headers on early invalid-payload exits and no-provider deterministic source semantics).

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
- Contact-form email delivery from `/api/contact` requires `RESEND_API_KEY` + `CONTACT_EMAIL` (and optionally `CONTACT_FROM_EMAIL`).
