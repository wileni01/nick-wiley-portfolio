# Nick Wiley’s portfolio

Personal portfolio at [nickwiley.ai](https://www.nickwiley.ai), built with Next.js, TypeScript, and Tailwind CSS.

## Local development

Use Node 24 and npm.

```sh
npm ci
npm run dev
npm run lint
npm run build
```

Vercel deploys `main` to production and other branches to previews. See `.env.example` for contact form configuration. The form requires Resend credentials to deliver mail and offers a direct-email fallback.

## Content

- `content/work/` holds case studies. See an existing file for the frontmatter format. `order` controls display order and `featured` controls placement on the homepage and work index.
- `content/writing/` holds articles. Preserve slugs when editing published pieces.
- `lib/products.ts` holds the additional project list.
- `lib/resume.json` holds résumé content. With the updated site running, use `node scripts/generate-resume-pdf.mjs` to regenerate the download from the web résumé. The script uses Google Chrome and accepts the server origin as its first argument.
- `public/images/projects/` holds project images. `npm run images:capture` refreshes configured screenshots and internal-tool recreations. Case study captions distinguish interface recreations and generated illustrations from project evidence.
