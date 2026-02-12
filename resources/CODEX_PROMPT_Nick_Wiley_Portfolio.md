# Codex Build Prompt: “Nick Wiley — Human-in-the-Loop AI Portfolio”

You are **Opus**, acting as a **staff-level product engineer + designer** building a **production-grade portfolio website** for **Nicholas (“Nick”) A. Wiley**.

This is not a generic portfolio. It must feel like a **high-end product**: fast, accessible, calm, credible, and memorable—without gimmicks or cringe.

The goal is simple: when someone finishes the site, they should think:
> “This person builds real systems for high-stakes decisions. I trust him. I want to talk.”

---

## 0) Non‑negotiables

### Truth & integrity (hard requirement)
- **Do not invent** achievements, numbers, clients, dates, or outcomes.
- If a metric is not known, either:
  - omit it, **or**
  - label it clearly as “approx.” / “reported” / “sanitized” (choose the least awkward option).
- Assume some work is under NDA / sensitive. Present it as **sanitized case studies** with clear boundaries:
  - “What I can share” vs “What I can’t share.”
- The tone must be **confident, specific, humble**. No hype. No “10x ninja” language. No grifting.

### Audience
Primary:
- Federal AI / data leaders
- Solutions Architect & Applied AI hiring managers
- Program and product leadership
Secondary:
- Technical reviewers (engineers/data scientists) who will judge code quality and systems thinking

### Brand positioning
Nick is:
- a **builder** (ships tools),
- an **architect** (designs systems & integration),
- and a **governance-minded leader** (human-in-the-loop, auditability, accessibility).

### Must-haves
- **Case studies** that read like real delivery work (context → constraints → approach → outcomes → lessons).
- A **resume** page that is beautiful and printable.
- A **testimonial** section sourced from a real recommendation letter.
- A memorable, tasteful “experience” element that ties to Nick’s unique background (GIS + AR + decision support) without being a gimmick.

---

## 1) Deliverable: a production-grade web app repo

### Required tech stack (use exactly this unless impossible)
- **Next.js (App Router)** + **TypeScript**
- **MDX** for content (case studies + writing)
- **TailwindCSS** for styling (or CSS Modules if you strongly prefer—pick one and be consistent)
- **shadcn/ui** components (optional, but keep design clean)
- **ESLint + Prettier**, strict TypeScript
- **Playwright** for basic e2e smoke tests
- **Vercel-ready deployment** (build must pass)

### Required non-functional requirements
- Lighthouse targets: Performance ≥ 95, Accessibility ≥ 98, Best Practices ≥ 95, SEO ≥ 95 (aim, don’t fake).
- **WCAG 2.2 AA** / **Section 508** friendly:
  - semantic HTML, keyboard navigation, focus states, skip links, reduced motion support, color contrast.
- Mobile-first responsive design.
- Dark mode supported (system preference + toggle).
- No heavy animation. Micro-interactions only.

### Required pages
1. `/` Home
2. `/work` Case study index
3. `/work/[slug]` Case study detail pages (MDX)
4. `/projects` Small projects / demos
5. `/writing` (blog index)
6. `/writing/[slug]` (MDX)
7. `/resume` (HTML resume + print styles + download links)
8. `/about` (short, human, grounded)
9. `/contact` (simple, low-friction)

### Required site features
- Global search (client-side is fine) across case studies + writing + resume highlights.
- “Executive ↔ Builder” toggle that changes how content is summarized:
  - Executive mode: outcomes, risks, governance, stakeholders
  - Builder mode: architecture, tradeoffs, stack, what shipped
  Implement as a UI toggle that switches between two short summaries on each case study card and case study header.
- “Guided Tour” button (tasteful, optional) that walks users through 4–6 key sections on the home page in ~60 seconds.
  - This is the memorable element, inspired by Nick’s AR-tour background—**but keep it subtle and professional**.

### Optional “wow” feature (implement if feasible without bloat)
- An “Ask about my work” Q&A widget.
  - Must work **without API keys** (fallback to curated Q&A + fuzzy search).
  - If `OPENAI_API_KEY` exists, enable real chat with a small RAG index generated at build time from local MDX/resume.
  - Always show a disclosure: “This assistant answers from my public portfolio content only.”

---

## 2) Information you must treat as “source of truth”

Use the facts below to write copy and build structured data. Do not add new claims.

### Identity
- Name: **Nicholas A. Wiley** (goes by **Nick**)
- Location: **Alexandria, VA**
- Email: **wileni01@gmail.com**
- Phone: **(717) 451-7015**
- LinkedIn: **linkedin.com/in/nicholas-a-wiley-975b3136**

### Positioning headline (use this or a close variant)
**AI Solutions Architect / Applied AI & Analytics — Human‑in‑the‑loop decision support for high‑stakes public sector work**

### Experience highlights (verified in resume materials)
- **IBM Global Business Services (AI & Analytics)** — Managing Consultant (2019–Present)
  - Federal clients include **National Science Foundation (NSF)** and **USDA**.
  - Led/managed Agile delivery teams (example: 9-person team).
  - Led proposal writing resulting in a **5-year, $5M contract win**.
  - Built data warehouse + Tableau reporting suite supporting **50,000+ USDA organic operations**.
  - Contributed to/led a large-scale warehouse described as **5+ billion records** and ETL processing **millions of records daily**.
  - At NSF: built ML decision-support tooling using **SciBERT embeddings + clustering (HDBSCAN / k-means)**.
  - Built **Panel Wizard**: human-in-the-loop UI for clustering/grouping proposals into review panels (drag/drop override).
  - Ran/led internal enablement: **Tableau Study Hall**, **Google BigQuery Study Hall**, and a **Data Working Group**.
- **VisiTime, LLC** — Founder (founded 2012; wound down around ~2020 based on resume versions)
  - Augmented reality / geospatial visitor experiences.
  - Raised **at least $200K** (some resumes cite higher; do not overclaim—use “$200K+”).
  - Built a **six-hour interactive iPad tour system** for Gettysburg’s 150th anniversary context.
  - Iterated a scalable rental model; one resume cites **400% annual growth** (present as “reported” if used).
  - **U.S. patent holder**: Patent numbers **9,417,668** and **9,900,042**.
- **Transform, Inc.** — Solution Engineer (2014–2015)
  - Data analytics tools and visualization for health sciences and salesforce optimization; worked with Fortune 500 executives.
- **Recovery Accountability and Transparency Board (RATB)** — Data Analyst (2011–2012)
  - GIS + analytics for Recovery Act oversight; tools include **ESRI** and **Palantir**.
  - Presented to government agencies and international delegations (keep it general, credible).
- Education:
  - **MBA** (Consulting & Management) — University of Maryland (2019)
  - **MS in Information Systems** — University of Maryland (2019)
  - BA Environmental Studies — Gettysburg College (2010)
  - Certificates: Project Management (Penn State, 2017); GIS (Penn State, 2012)
- Certifications / Programs:
  - **SAFe Scrum Master (2022)**
  - **Tableau Certified Associate (2022)**
  - **MIT Professional Education — Applied Data Science: Leveraging AI for Effective Decision-Making (2024)**
  - AWS Cloud Practitioner is referenced in some materials (include only if you add a “certifications” section that allows “reported” items; otherwise omit).

### Testimonial source (use short excerpts only)
A recommendation letter from the NSF ENG DAO supports:
- Nick is “professional and collaborative,” led adoption of PM practices, built dashboards, led study halls, and is “uniquely suited” for DAO work.
Use 1–3 short quotes (<25 words each) and attribute them respectfully.

---

## 3) Site IA & design direction

### Design principles
- **Quiet confidence**: clean typography, generous spacing, high contrast, subtle borders.
- **Product feel**: consistent components, polished empty states, thoughtful microcopy.
- **Decision-support aesthetic**: hint of “mission control / dashboard” without cosplay.
  - Optional: gentle grid background, subtle map-line motif, or “data lineage” lines in dividers.
  - No cheesy sci-fi UI.

### Navigation
- Work
- Projects
- Writing
- Resume
- About
- Contact

Add a small “Download Resume” button in the header.

---

## 4) Content you must create (copy included)

Create MDX content using the copy below. You may tighten wording for clarity, but **do not add new factual claims**.

## 4.1 Home page copy

### Hero
**Human‑in‑the‑loop AI for high‑stakes decisions.**  
I build decision-support tools that help experts move faster **without giving up accountability**—from federal analytics platforms to ML-assisted workflow apps.

Primary CTAs:
- **View Case Studies**
- **Download Resume**
Secondary CTA:
- **Contact**

### “What I do” (3 cards)
1) **Decision Support Apps**  
Human-centered tools that let experts override models, audit decisions, and stay in control.

2) **Data Platforms & Analytics**  
Warehouses, pipelines, and dashboards that turn messy systems into trustworthy reporting.

3) **Adoption & Governance**  
I run the meetings, write the docs, build the training, and sweat the compliance details.

### “Selected Work” (3 featured case studies)
- Panel Wizard (NSF) — ML-assisted grouping with human override
- USDA Organic Analytics Platform — warehouse + Tableau suite for 50k+ operations
- VisiTime AR Tour System — geospatial storytelling + product execution

### “How I work” (short)
I start by clarifying the decision someone is trying to make.  
Then I design a system that makes the decision **easier, safer, and repeatable**—with governance and usability treated as first-class engineering requirements.

### Testimonial (1 short quote + attribution)
Use one quote from the recommendation letter and include the role attribution:
“…” — Data Analytics Officer, NSF Engineering Directorate

### “Guided Tour”
Add a small button: **Take a 60‑second tour**  
This launches an accessible guided overlay that highlights the hero, selected work, the resume link, and contact.

---

## 4.2 Case studies (MDX)

Create these as `/content/work/*.mdx` with frontmatter:
- title
- slug
- client (string, allow “Federal client” if needed)
- timeframe (string)
- role
- stack (array)
- tags (array)
- featured (boolean)
- executiveSummary (string)
- builderSummary (string)

### Case Study 1 — Panel Wizard (NSF)
**Title:** Panel Wizard: Human‑in‑the‑loop ML for proposal panel formation  
**Client:** National Science Foundation (sanitized)  
**Timeframe:** 2023–2025 (if unsure, omit exact years and write “recent”)  
**Role:** Solutions architect / applied data scientist (consulting)  
**Stack:** Python, SciBERT/BERT embeddings, clustering (HDBSCAN / k-means), Jupyter environments, dashboards (Tableau or similar), SQL

**What to write (structure):**
1) Context & why it mattered  
2) Constraints (sensitive data, fairness/accountability, humans must own decisions, limited integration surface)  
3) Approach  
   - embeddings → similarity → clustering suggestions  
   - iterative tuning + evaluation with stakeholders  
   - human-in-loop UI: drag/drop overrides + rationale visibility (fit scores / “why” signals)  
4) What shipped (sanitized)  
   - app UX overview  
   - telemetry/monitoring dashboards (high level)  
5) Outcomes (qualitative, do not invent numbers)  
6) Lessons & what I’d improve next

Add a simple Mermaid diagram showing data flow:
Data sources → embedding pipeline → clustering → UI + dashboards.

Executive summary (example):
“Reduced manual triage burden by generating auditable grouping suggestions while keeping program staff in control.”

Builder summary (example):
“SciBERT embeddings + clustering to propose groups, surfaced with fit signals in a drag‑and‑drop UI.”

### Case Study 2 — USDA Organic Analytics Platform
**Title:** USDA Organic Analytics: Warehouse + Tableau suite for 50,000+ operations  
**Client:** USDA (organic program)  
**Role:** Technical PM / analytics lead  
**Stack:** SQL, Python, Tableau, data warehouse, ETL

Include verified metrics:
- 50,000+ certified organic operations
- warehousing described as 5+ billion records (if you use it, clarify “warehouse contained 5B+ records”)
- ETL processing millions of records daily
- “more than four dozen Tableau reports” (from earlier resume)

Write:
- scope and stakeholders  
- warehouse + reporting architecture  
- governance & accessibility (508)  
- operational adoption (training, comms)  
- outcomes: improved visibility, streamlined reporting, auditable reporting

### Case Study 3 — Researcher Lineage Dashboard (NSF)
**Title:** Researcher Lineage Dashboard: Making funding histories visible  
**Client:** NSF (sanitized)  
**Role:** Analytics lead  
**Stack:** BigQuery, Tableau, SQL, Python (as applicable)

Write:
- the decision it supported (portfolio review, collaboration insight)  
- what “lineage” meant (funding history, networks, impact)  
- how you balanced stakeholder needs + data quality  
- outcomes: better executive reporting, shared understanding

### Case Study 4 — Enablement: Study Halls + Data Working Group
**Title:** Building adoption: Study halls that made analytics usable  
Write:
- why adoption is a delivery problem, not an afterthought  
- how you ran the sessions  
- examples: Tableau Study Hall, GBQ Study Hall, ENG Data Working Group  
- outcomes: increased self-service, reduced “single point of failure”

### Case Study 5 — VisiTime AR Tour System
**Title:** VisiTime: Turning geospatial data into an AR visitor experience  
**Client:** VisiTime (startup)  
**Role:** Founder / product + delivery lead  
**Stack:** Geospatial data, iOS/Android apps (high level), product ops

Use only safe claims:
- raised $200K+  
- built AR apps + interactive iPad tour  
- patent holder (list patent numbers)  
Avoid hard revenue claims unless stated.

Add a “Founder lessons” section that shows maturity (tradeoffs, focus, sales reality, ops).

### Case Study 6 — Federal Oversight GIS (RATB)
**Title:** Recovery oversight with GIS: targeting risk and misrepresentation  
Write:
- how GIS changed the investigation workflow  
- Palantir/ESRI at a high level  
- communication to diverse stakeholders

---

## 4.3 Projects page

Include 4–6 smaller “project cards,” but do NOT fabricate public repos.
If you don’t have links, mark as “code available on request” and keep descriptions tight.

Suggested projects (describe without claiming open-source):
- RAG pipeline prototype (LangChain + FAISS conceptually)  
- Embedding + clustering notebook workflow template  
- Tableau governance checklist / starter kit  
- Browser extension or lightweight automation (only if you truly have it—otherwise omit)

---

## 4.4 Writing page

Create 3 starter posts (short but real):
1) **Human-in-the-loop isn’t a compromise. It’s the point.**  
2) **From dashboards to decisions: what analytics is for**  
3) **What consulting taught me about building AI responsibly**

Keep them grounded, no grandstanding. Mention the idea that governance and adoption are part of engineering.

---

## 4.5 Resume page (must shine)

Build an HTML resume page with:
- A clean one-page layout (screen) + a print stylesheet (PDF-ready via browser print).
- Sections:
  - Summary
  - Core skills
  - Experience
  - Education
  - Certifications
  - Patents
- Add a small “Download PDF” button that points to `/public/resume/nick-wiley-resume.pdf`
  - If the PDF is not present, show a graceful fallback message.

### Canonical resume content (use this)
(Write it nicely in HTML; do not invent.)

**SUMMARY**  
Managing Consultant and applied data scientist with 12+ years delivering analytics and ML solutions across federal civilian agencies, startups, and SaaS environments. Hands-on builder (Python/SQL, NLP embeddings, clustering, dashboards) who translates mission needs into scalable, auditable solutions. Comfortable in regulated settings with a focus on governance, documentation, accessibility, and human-in-the-loop workflows.

**EXPERIENCE**  
IBM — Global Business Services (AI & Analytics) | Managing Consultant | 2019–Present  
- Lead delivery of analytics and ML solutions for federal clients (NSF, USDA), aligning technical approach to mission goals and stakeholder needs.  
- Built NLP embedding + clustering workflows (SciBERT/BERT with HDBSCAN/k-means) to support proposal triage and reviewer decision support.  
- Designed and delivered human-in-the-loop decision support tooling (e.g., Panel Wizard) enabling staff to review, override, and refine model recommendations.  
- Partnered on USDA organic analytics platform: warehouse + Tableau reporting suite supporting 50,000+ operations; contributed to ETL/warehouse work described at 5B+ records and millions processed daily.  
- Led proposal writing supporting a 5-year, $5M contract win.  
- Facilitated adoption through study halls and working groups; mentored analysts and supported executive reporting.

VisiTime, LLC | Founder | 2012–~2020  
- Founded AR-driven tours using geospatial datasets to make historical context accessible and engaging.  
- Raised $200K+ to produce a tour book and multiple mobile applications.  
- Led distributed delivery to create an interactive iPad tour experience; iterated business model and operations.  
- U.S. patent holder (9,417,668; 9,900,042).

Transform, Inc. | Solution Engineer | 2014–2015  
- Integrated analytics tooling into client-facing visualization products; collaborated with executives to translate goals into measurable reporting.

U.S. Government — Recovery Accountability and Transparency Board | Data Analyst | 2011–2012  
- Applied geospatial analytics for Recovery Act oversight using ESRI and Palantir; built datasets and presented findings to diverse stakeholders.

**EDUCATION**  
University of Maryland — MBA (Consulting & Management), MS (Information Systems), 2019  
Gettysburg College — BA Environmental Studies, 2010  
Penn State — Master’s Certificate Project Management (2017); GIS Certificate (2012)

**CERTIFICATIONS / PROGRAMS**  
SAFe Scrum Master (2022)  
Tableau Certified Associate (2022)  
MIT Professional Education — Applied Data Science (2024)

**PATENTS**  
U.S. Patents: 9,417,668; 9,900,042

---

## 5) Engineering plan (you must implement)

### Repo structure (suggestion)
- `app/` Next.js routes
- `components/` reusable UI
- `content/`
  - `work/*.mdx`
  - `writing/*.mdx`
- `lib/`
  - mdx loader
  - search index builder
  - optional RAG utilities
- `public/` static assets
- `tests/` Playwright smoke tests

### Content pipeline
- Use MDX with typed frontmatter validation (zod).
- Build a static search index at build time:
  - title, headings, summary, tags, url, body text.
- Implement site-wide search with keyboard shortcut `/` or `Cmd+K`.

### Guided Tour
- Implement accessible tour with focus management:
  - Each step is a dialog that highlights a region.
  - Respect reduced motion.
  - Provide “Skip tour” and “End tour”.

### Performance
- Prefer server components where appropriate.
- Avoid heavy libraries.
- Use `next/image`.
- Keep font loading optimized.

### Testing
- Basic Playwright tests:
  - Home loads, nav works
  - Work index loads and one case study renders
  - Resume page renders
  - Contact page renders

---

## 6) Finishing touches that make it feel “real”

- Add a `/uses` or `/now` section (optional) with a short, grounded snapshot:
  - “Currently: building decision-support tools at NSF; based in Alexandria, VA.”
- Add Open Graph images (generate simple ones programmatically or ship one template).
- Add `sitemap.xml` and `robots.txt`.
- Add JSON-LD for Person schema on home page.
- Add a “press / speaking / workshops” section only if supported by facts (study halls qualify).

---

## 7) Output format

When you finish:
1) Provide all code changes as a complete repo (files and contents).
2) Provide a clear README with:
   - local dev instructions
   - deployment instructions
   - where to edit content
3) Include “Content Integrity Notes” listing any places you used:
   - “sanitized” language
   - “reported” language
   - placeholders requiring Nick to fill (screenshots, links)

---

## 8) Absolute bans

- Do not use exaggerated claims like “world-class,” “top-tier,” “visionary,” “10x,” etc.
- Do not add fake client logos or fake testimonials.
- Do not fabricate open-source projects, conference talks, or awards.

---

# END
