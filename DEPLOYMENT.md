# Deployment Checklist

## Pre-Deployment Setup

### 1. Update Personal Information

Replace placeholder data in these files:

- **`lib/projects.ts`** — Fill in `[FILL IN]` markers for government projects
- **`lib/experience.ts`** — Replace demo work history with real experience
- **`content/knowledge-base.ts`** — Update AI chatbot knowledge base
- **`lib/skills.ts`** — Verify skill levels and project links
- **`components/layout/footer.tsx`** — Update social links (GitHub, LinkedIn, email)
- **`app/contact/page.tsx`** — Update email address and status

### 2. Replace Project Screenshots (Optional)

See `public/images/projects/README.md` for details:

- Replace SVG placeholders with real PNG screenshots (1920x1080)
- Update `image` paths in `lib/projects.ts` from `.svg` to `.png`
- NickWChat, MTW2 Installer, Valley of Vines currently use placeholders

### 3. Add API Keys

Create/update `.env.local` with your API keys:

```bash
# AI API Keys (required for /chat page)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
CONTACT_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## GitHub Setup

### 1. Create GitHub Repository

```bash
# On GitHub, create a new repository (public or private)
# Then add it as a remote:
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### 2. Protect Secrets

- `.env.local` is already in `.gitignore` — never commit it
- Add API keys only in Vercel dashboard (see below)

## Vercel Deployment

### 1. Import Project

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings

### 2. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
OPENAI_API_KEY = sk-...
ANTHROPIC_API_KEY = sk-ant-...
CONTACT_EMAIL = your-email@example.com
NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
```

### 3. Deploy

- Click "Deploy"
- Vercel will build and deploy automatically
- Every git push to `main` triggers auto-deploy

### 4. Custom Domain (Optional)

1. Buy domain (Namecheap, Google Domains, etc.)
2. In Vercel → Domains → Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` env var

## Post-Deployment

### 1. Test Everything

- [ ] Home page loads with animations
- [ ] Projects gallery shows all 18 cards with images
- [ ] Project detail pages render correctly
- [ ] AI chat works (requires API keys)
- [ ] Contact form submits successfully
- [ ] Experience timeline expands/collapses
- [ ] Skills matrix displays correctly
- [ ] Dark/light theme toggle works
- [ ] Mobile responsive design

### 2. SEO Verification

- [ ] Open Graph preview works (share on LinkedIn/Twitter)
- [ ] Google Search Console: submit sitemap at `/sitemap.xml`
- [ ] Verify meta tags: https://metatags.io
- [ ] Lighthouse score 90+ (Performance, Accessibility, SEO)

### 3. Analytics (Optional)

Add tracking to `app/layout.tsx`:

- Google Analytics
- Plausible
- Vercel Analytics (built-in)
- PostHog

## Maintenance

### Update Content

```bash
# 1. Make changes locally
# 2. Test with `npm run dev`
# 3. Commit and push
git add .
git commit -m "Update: description of changes"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### Add New Projects

1. Add project data to `lib/projects.ts`
2. Add screenshot to `public/images/projects/`
3. Update knowledge base in `content/knowledge-base.ts` for AI chat
4. Commit and push

## Troubleshooting

### Chat page shows errors
- Verify API keys in Vercel environment variables
- Check API key has sufficient credits
- Check browser console for specific error messages

### Images not loading
- Verify files exist in `public/images/projects/`
- Check `image` paths in `lib/projects.ts` match filenames exactly
- Clear Vercel cache: Settings → Data Cache → Purge

### Build fails
- Run `npm run build` locally to reproduce error
- Check `package.json` dependencies are locked
- Verify Node version (should be 18+)

## Support

- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- OpenAI API: https://platform.openai.com/docs
