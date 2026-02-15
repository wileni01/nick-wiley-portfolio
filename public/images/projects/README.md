# Project Screenshots

## Current Inventory

### Personal / Client Projects

| Project | Filename | Status |
|---------|----------|--------|
| GettysburgLeadership.com | `gettysburg-leadership.png` | **Ready** |
| LLI Email Data Miner | `lli-email-miner.png` | **Ready** |
| LLI Golden Record | `lli-golden-record.png` | **Ready** |
| NickAntir | `nickantir.png` | **Ready** |
| AI Resume Generator | `resume-generator.png` | **Ready** |
| G15 Modes Console | `g15-modes.png` | **Ready** |
| VisiTime AR | `visitime.png` | **Ready** |
| Portfolio Home | `portfolio-home.png` | **Ready** |
| NickWChat | — | **Needs screenshot** — using `placeholder-nickwchat.svg` |
| MTW2 QoL Installer | — | **Needs screenshot** — using `placeholder-mtw2.svg` |
| Valley of Vines | — | **Needs screenshot** — using `placeholder-valley-of-vines.svg` |

### Government / Federal Projects

| Project | Filename | Status |
|---------|----------|--------|
| NSF Panel Wizard | `Panel-wized.png` | **Ready** |
| NSF Proposal Classification | `optuna-classification.png` | **Ready** |
| NSF RoboRA | `robo-ra.png` | **Ready** |
| NSF ADCC | `scott-search.png` | **Ready** |
| NSF Telemetry | `telemetry.png` | **Ready** |
| NSF Researcher Lineage | `researchher-lineage.png` | **Ready** |
| USDA Organic Analytics | `usda-organic.png` | **Ready** |
| RATB GIS Oversight | `recovery-oversight.png` | **Ready** |
| USPS International Ops | — | **Needs screenshot** — using `placeholder-gov.svg` |
| Census Data Analytics | — | **Needs screenshot** — using `placeholder-gov.svg` |
| LLI Digital Transformation | — | **Needs screenshot** — using `placeholder-gov.svg` |
| LLI America at 250 | — | **Needs screenshot** — using `placeholder-gov.svg` |
| LLI Email Marketing | — | **Needs screenshot** — using `placeholder-gov.svg` |
| LLI Intern Mentorship | — | **Needs screenshot** — using `placeholder-gov.svg` |
| Enablement Study Halls | — | **Needs screenshot** — using `placeholder-gov.svg` |

### Root Public Assets

| File | Location | Purpose |
|------|----------|---------|
| `favicon.ico` | `public/favicon.ico` | Browser tab icon |
| `icon.png` | `public/icon.png` | PWA / app icon |
| `og-image.png` | `public/og-image.png` | Open Graph social preview image |

## Image Specs

- **Format:** PNG (preferred) or JPG
- **Dimensions:** 1920x1080 recommended (16:9 ratio)
- **File size:** Keep under 500KB for fast loading (compress with TinyPNG)
- **Content:** Full-page screenshot showing the hero/dashboard of the application

## How to Replace Placeholders

1. Take your screenshot (1920x1080 recommended)
2. Drop it in this folder (`public/images/projects/`)
3. Update the `image` path in `lib/projects.ts` and/or the MDX frontmatter in `content/work/`
4. Delete the corresponding `placeholder-*.svg` if you've replaced it with a real PNG

## SVG Placeholders

These are fallback images used when no PNG screenshot exists:
- `placeholder-nickwchat.svg` — Chat app wireframe
- `placeholder-mtw2.svg` — Terminal/PowerShell mockup
- `placeholder-valley-of-vines.svg` — Pixel art vineyard scene
- `placeholder-gov.svg` — Government project shield design
