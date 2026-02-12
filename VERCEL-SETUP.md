# Vercel Deployment Guide

## Step 1: Verify GitHub Push

Check that your code is on GitHub:
- Visit your GitHub repository in browser
- Verify all files are there (66 files, ~14k lines)
- You should see: `app/`, `components/`, `lib/`, `public/`, etc.

## Step 2: Import to Vercel

### 2a. Go to Vercel
1. Open https://vercel.com
2. Sign in (or create account) with GitHub
3. Click **"Add New..."** → **"Project"**

### 2b. Import Your Repository
1. Find `nick-wiley-portfolio` in the list
2. Click **"Import"**
3. Vercel auto-detects:
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2c. Configure Environment Variables

**CRITICAL:** Click **"Environment Variables"** and add these:

```
OPENAI_API_KEY
Value: sk-proj-... (your OpenAI API key)
```

```
ANTHROPIC_API_KEY
Value: sk-ant-... (your Anthropic API key)
```

```
CONTACT_EMAIL
Value: your-email@example.com
```

```
NEXT_PUBLIC_SITE_URL
Value: https://nick-wiley-portfolio.vercel.app (or your custom domain)
```

> **Note:** Environment variables in Vercel are:
> - Encrypted at rest
> - Only accessible to your deployments
> - Never exposed to the browser (unless prefixed with `NEXT_PUBLIC_`)

### 2d. Deploy
1. Click **"Deploy"**
2. Wait ~2 minutes while Vercel:
   - Installs dependencies
   - Runs `next build`
   - Deploys to edge network (40+ global regions)
3. You'll get a URL: `https://nick-wiley-portfolio-abc123.vercel.app`

## Step 3: Test Your Live Site

Visit your Vercel URL and test:

- ✓ Home page animations work
- ✓ Projects gallery shows images
- ✓ Click into a project detail page
- ✓ `/chat` — **Test the AI chat!** (this proves API keys work)
- ✓ `/experience` — Timeline expands/collapses
- ✓ `/skills` — Skills grid displays
- ✓ `/contact` — Submit the form
- ✓ Dark/light theme toggle

## Step 4: Add Custom Domain (Optional)

### If You Have a Domain:
1. In Vercel → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `nickwiley.dev`)
4. Vercel gives you DNS instructions
5. Update DNS at your registrar:
   - **A Record:** `76.76.21.21`
   - **CNAME (www):** `cname.vercel-dns.com`
6. Wait 10-60 minutes for DNS propagation
7. Vercel auto-provisions SSL certificate

### If Buying a Domain:
**Recommended registrars:**
- **Namecheap** — $10-15/year for `.dev`, `.com`
- **Cloudflare** — $9-12/year (at-cost pricing)
- **Google Domains** (now Squarespace)

**Domain suggestions:**
- `nickwiley.dev` (developer-focused)
- `nickwiley.com` (professional)
- `nickwiley.io` (tech-focused)
- `nickwileytech.com`

## Step 5: Update Environment Variable

After custom domain is set:
1. Vercel → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_SITE_URL`
3. Change to `https://your-domain.com`
4. Redeploy (or wait for next git push)

## What Happens After First Deploy?

### Auto-Deploy on Every Push
```bash
# Make changes locally
git add .
git commit -m "Update: describe your changes"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your site
# 3. Deploys to production (2-3 minutes)
# 4. Sends you a notification
```

### Vercel Dashboard Features
- **Deployments** — See all builds, rollback if needed
- **Analytics** — Page views, visitor stats (built-in, free)
- **Logs** — Real-time function logs for debugging
- **Speed Insights** — Core Web Vitals monitoring

## Troubleshooting

### Chat page shows "API Error"
- Go to Vercel → Settings → Environment Variables
- Verify `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are set
- Redeploy to apply changes

### "Build Failed"
- Check build logs in Vercel dashboard
- Common issue: missing environment variables
- Run `npm run build` locally to reproduce

### Images not showing
- Check Vercel deployment logs
- Verify images exist in your GitHub repo under `public/images/projects/`
- May need to redeploy (Settings → Deployments → Redeploy)

## Quick Reference

| Task | Command |
|------|---------|
| **Local dev** | `npm run dev` → http://localhost:3000 |
| **Build test** | `npm run build` |
| **Deploy to Vercel** | Push to GitHub (auto-deploys) |
| **Add env var** | Vercel Dashboard → Settings → Environment Variables |
| **Custom domain** | Vercel Dashboard → Settings → Domains |

## Expected Timeline

- Import to Vercel: **30 seconds**
- First deployment: **2-3 minutes**
- Custom domain DNS propagation: **10-60 minutes**
- SSL certificate provisioning: **Automatic** (5 minutes)

Your portfolio will be live worldwide on Vercel's edge network with automatic HTTPS and global CDN.
