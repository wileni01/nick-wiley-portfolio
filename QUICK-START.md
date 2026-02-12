# Quick Start — Next Steps

## You Are Here ✓

- [x] Project built and tested locally
- [x] Git repository initialized with 3 commits
- [x] 7 real project screenshots captured
- [x] All pages working at http://localhost:3000
- [ ] **→ YOU ARE HERE: Need to push to GitHub**
- [ ] Deploy to Vercel
- [ ] Add custom domain

---

## Step 1: Push to GitHub (5 minutes)

If you haven't updated the remote URL yet:

```bash
# Update the remote with your actual GitHub username
git remote set-url origin https://github.com/YOUR_ACTUAL_USERNAME/nick-wiley-portfolio.git

# Or if you haven't created the GitHub repo yet:
# 1. Go to https://github.com/new
# 2. Create repository "nick-wiley-portfolio" (public or private)
# 3. Run:
git remote set-url origin https://github.com/YOUR_USERNAME/nick-wiley-portfolio.git
```

Then push:

```bash
cd c:\dev\projects\nick-wiley-portfolio
git push -u origin main
```

**Verify:** Visit your GitHub repo URL — you should see all files.

---

## Step 2: Deploy to Vercel (5 minutes)

### 2a. Import Project
1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub (free account)
3. **Find** `nick-wiley-portfolio` in the list
4. **Click** "Import"

### 2b. Configure Project
Vercel will show import settings:
- **Framework Preset:** Next.js ✓ (auto-detected)
- **Root Directory:** `./` ✓
- **Build Command:** `npm run build` ✓
- **Output Directory:** `.next` ✓

### 2c. Add Environment Variables
**Click "Environment Variables"** dropdown and add:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com/settings/keys |
| `CONTACT_EMAIL` | `your-email@example.com` | Your real email |
| `NEXT_PUBLIC_SITE_URL` | `https://nick-wiley-portfolio.vercel.app` | Leave as Vercel URL for now |

> **Don't have API keys yet?** You can deploy without them — the chat page will show a configuration message, but all other pages work fine.

### 2d. Deploy
1. **Click** "Deploy"
2. **Wait** ~2-3 minutes while Vercel builds
3. **Success!** You'll get a live URL

---

## Step 3: Test Your Live Site (2 minutes)

Vercel will give you a URL like: `https://nick-wiley-portfolio-abc123.vercel.app`

**Test these pages:**
1. **Home** (`/`) — Check animations, stats counters, tech orbit
2. **Projects** (`/projects`) — Verify all 18 cards show with images
3. **Project Detail** — Click on NickAntir or Gettysburg — verify screenshot displays full-size
4. **AI Chat** (`/chat`) — **Most important!** Send a message: "What's Nick's experience with AI?"
   - Should stream a response about OpenAI, Azure AI, GPT-4o work
   - If it errors, check API keys in Vercel settings
5. **Experience** (`/experience`) — Click to expand timeline entries
6. **Skills** (`/skills`) — Verify skill bars animate
7. **Contact** (`/contact`) — Submit a test message

---

## Step 4: Custom Domain (Optional, 15 minutes)

### Buy a Domain
- **Namecheap:** https://www.namecheap.com — $10-15/year for `.dev`
- **Cloudflare:** https://www.cloudflare.com/products/registrar — $9-12/year
- **Recommendations:** `nickwiley.dev`, `nickwiley.com`, `nickwiley.io`

### Add to Vercel
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `nickwiley.dev`
4. Vercel shows DNS records to add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Add these records in your domain registrar's DNS settings
6. Click "Verify" in Vercel
7. Wait 10-60 minutes for DNS propagation
8. Vercel auto-provisions SSL certificate (Let's Encrypt)

### Update Environment Variable
After domain is live:
1. Vercel → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_SITE_URL` → `https://nickwiley.dev`
3. Redeploy (or push a new commit)

---

## Step 5: Share on LinkedIn (1 minute)

Once live, share it:

1. **LinkedIn Post:**
   ```
   Excited to launch my new portfolio with AI-powered features! 🚀

   Built with Next.js 15, featuring a RAG-powered chatbot trained on my 
   professional experience — ask it anything about my work.

   Check it out: [your-domain.com]

   #AI #FullStack #WebDev #OpenAI #NextJS
   ```

2. **LinkedIn Profile:**
   - Add under "Featured" section
   - Shows rich Open Graph preview with your hero image

---

## After Deployment Checklist

- [ ] Site is live and accessible
- [ ] AI chat works with both GPT-4o and Claude
- [ ] All project images display correctly
- [ ] Contact form submissions work
- [ ] Mobile responsive on phone/tablet
- [ ] Dark/light theme toggle works
- [ ] LinkedIn Open Graph preview looks good
- [ ] Run Lighthouse audit: 90+ score target

---

## Future Updates

Every time you push to GitHub:
```bash
git add .
git commit -m "Update: added new project"
git push origin main
```

Vercel auto-deploys in ~2 minutes. No manual steps needed.

---

## Questions?

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **OpenAI API:** https://platform.openai.com/docs
- **Anthropic API:** https://docs.anthropic.com
