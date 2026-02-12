# Nick Wiley Portfolio

AI-powered professional portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features a RAG-powered chatbot trained on professional experience, 18 project showcases, interactive resume timeline, and recruiter-ready features.

## Features

- **Chat with Nick's AI** — RAG-powered chatbot (GPT-4o + Claude 3.5) that answers questions about professional experience
- **18 Project Showcases** — 9 real projects with demo data + 9 government project templates with fill-in placeholders
- **Interactive Resume** — Animated timeline with expandable entries, PDF download, print-friendly styles
- **Skills Matrix** — Visual proficiency grid across 6 technical domains, linked to relevant projects
- **Dark/Light Mode** — Automatic theme detection with manual toggle
- **SEO Optimized** — Open Graph, Twitter cards, JSON-LD structured data, sitemap, robots.txt
- **Security** — Rate limiting, input sanitization, CSP headers, honeypot spam prevention, server-only API keys

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| AI | OpenAI GPT-4o, Anthropic Claude 3.5, Vercel AI SDK |
| AI Pipeline | text-embedding-3-small, in-memory vector store, cosine similarity |
| Deployment | Vercel (serverless, edge runtime) |

## Quick Start

```bash
# Clone and install
cd nick-wiley-portfolio
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For AI chat | OpenAI API key (GPT-4o + embeddings) |
| `ANTHROPIC_API_KEY` | For AI chat | Anthropic API key (Claude 3.5) |
| `CONTACT_EMAIL` | Optional | Email address for contact form delivery |
| `NEXT_PUBLIC_SITE_URL` | Optional | Production domain (defaults to localhost) |

> **Note:** The site works without API keys — the chat feature will show an error message prompting configuration, but all other pages function normally.

## Customizing Your Data

### Projects
Edit `lib/projects.ts` — all 18 projects are defined here. Government templates have `[FILL IN]` markers.

### Experience / Resume
Edit `lib/experience.ts` — work history, education, certifications with `[FILL IN]` placeholders.

### Skills
Edit `lib/skills.ts` — skill categories, proficiency levels, and project links.

### AI Knowledge Base
Edit `content/knowledge-base.ts` — the RAG chatbot uses this as its knowledge source.

### Social Links
Edit `components/layout/footer.tsx` and `app/contact/page.tsx` with your real URLs.

## Deployment on Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy — that's it

### Custom Domain
1. Buy a domain
2. In Vercel → Settings → Domains → Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

## Project Structure

```
nick-wiley-portfolio/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout + nav + footer
│   ├── projects/               # Projects gallery + detail
│   ├── chat/                   # AI chatbot page
│   ├── experience/             # Interactive resume
│   ├── skills/                 # Skills matrix
│   ├── contact/                # Contact form
│   └── api/                    # API routes (chat, contact)
├── components/                 # React components
│   ├── ui/                     # Base UI (button, card, badge, input)
│   ├── layout/                 # Navbar, Footer, ThemeToggle
│   ├── home/                   # Hero, Stats, TechOrbit, FeaturedProjects
│   ├── projects/               # ProjectCard, FilterBar
│   ├── chat/                   # ChatInterface, ModelToggle
│   ├── experience/             # Timeline
│   └── seo/                    # JSON-LD structured data
├── content/                    # Knowledge base for AI
├── lib/                        # Utilities + data
│   ├── ai.ts                   # AI model configuration
│   ├── embeddings.ts           # RAG vector store
│   ├── projects.ts             # All 18 project definitions
│   ├── experience.ts           # Work history data
│   ├── skills.ts               # Skills matrix data
│   ├── rate-limit.ts           # Rate limiting
│   └── utils.ts                # Shared utilities
└── public/                     # Static assets
```

## License

MIT
