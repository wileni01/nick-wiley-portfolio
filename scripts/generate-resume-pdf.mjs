import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "../public/resume/nick-wiley-resume.pdf");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 9.5pt;
    line-height: 1.45;
    color: #1a1a1a;
    padding: 0.5in 0.6in;
  }

  header {
    border-bottom: 1.5px solid #d4d4d8;
    padding-bottom: 10px;
    margin-bottom: 14px;
  }

  header h1 {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  header .contact {
    font-size: 8.5pt;
    color: #52525b;
    margin-top: 2px;
  }

  header .contact a {
    color: #2563eb;
    text-decoration: none;
  }

  section {
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #71717a;
    margin-bottom: 6px;
  }

  .summary {
    font-size: 9.5pt;
    line-height: 1.5;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 24px;
    font-size: 9pt;
  }

  .skills-grid strong {
    font-weight: 600;
  }

  .job {
    margin-bottom: 12px;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .job-header h3 {
    font-size: 10pt;
    font-weight: 600;
  }

  .job-header .dates {
    font-size: 8.5pt;
    color: #71717a;
    flex-shrink: 0;
  }

  .job-title {
    font-size: 8.5pt;
    color: #52525b;
    margin-bottom: 4px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  ul li {
    position: relative;
    padding-left: 12px;
    margin-bottom: 3px;
    font-size: 9pt;
    line-height: 1.4;
  }

  ul li::before {
    content: "–";
    position: absolute;
    left: 0;
    color: #a1a1aa;
  }

  ul li strong {
    font-weight: 600;
  }

  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 3px;
    font-size: 9pt;
  }

  .edu-row strong {
    font-weight: 600;
  }

  .edu-row .dates {
    font-size: 8.5pt;
    color: #71717a;
    flex-shrink: 0;
  }

  .cert-list li, .patent-list li {
    font-size: 9pt;
    margin-bottom: 2px;
  }
</style>
</head>
<body>

<header>
  <h1>Nicholas A. Wiley</h1>
  <div class="contact">
    Alexandria, VA &bull;
    <a href="mailto:wileni01@gmail.com">wileni01@gmail.com</a> &bull;
    <a href="https://linkedin.com/in/nicholas-a-wiley-975b3136">LinkedIn</a> &bull;
    <a href="https://www.nickwiley.ai">nickwiley.ai</a>
  </div>
</header>

<section>
  <div class="section-title">Summary</div>
  <p class="summary">
    Managing Consultant and applied data scientist with 12+ years delivering analytics, ML, and decision-support
    solutions across federal civilian agencies (NSF, USDA, USPS, Census), startups, and digital transformation
    engagements. Hands-on builder (Python/SQL, NLP embeddings, clustering, dashboards, browser automation) who
    translates mission needs into scalable, auditable tools. Founder of an AR startup with two U.S. utility patents.
    Comfortable in regulated settings with a focus on governance, documentation, accessibility, and human-in-the-loop
    workflows.
  </p>
</section>

<section>
  <div class="section-title">Core Skills</div>
  <div class="skills-grid">
    <div><strong>AI/ML &amp; NLP:</strong> Sentence Transformers, BERTopic, SciBERT/BERT, UMAP, HDBSCAN, K-Means, Optuna, scikit-learn, human-in-the-loop workflows</div>
    <div><strong>Data &amp; Analytics:</strong> SQL, Python, AWS, Tableau, SAS, data warehouses, ETL pipelines, Salesforce integration</div>
    <div><strong>Platforms &amp; Tools:</strong> Streamlit, Next.js, Stripe, HubSpot, BigQuery, DBeaver, ServiceNow; ESRI, Palantir, Unity</div>
    <div><strong>Governance &amp; Delivery:</strong> Agile/Scrum, stakeholder alignment, Section 508, documentation, adoption enablement, browser automation</div>
  </div>
</section>

<section>
  <div class="section-title">Experience</div>

  <div class="job">
    <div class="job-header">
      <h3>IBM — Global Business Services (AI &amp; Analytics)</h3>
      <span class="dates">2019–Present</span>
    </div>
    <div class="job-title">Managing Consultant</div>
    <ul>
      <li>Lead delivery of analytics and ML solutions for federal clients (NSF, USDA, USPS, Census), aligning technical approach to mission goals and stakeholder needs.</li>
      <li><strong>NSF:</strong> Built Panel Wizard decision-support tool consolidating 8 screens into 1, using sentence transformer embeddings and K-Means clustering. Reduced panel formation from weeks to hours. Built BERTopic-based proposal classification system (7,000+ proposals, 70+ themes, Optuna-optimized). Created researcher lineage dashboard integrating public and internal data. Developed RoboRA document automation, ADCC compliance checking (28 automated checks), and telemetry dashboards.</li>
      <li><strong>USDA:</strong> Built global data warehouse on AWS integrating Salesforce, integrity database, and CBP customs import records. Created NLP taxonomy classifier (scikit-learn) for organic import categorization. Developed dozens of Tableau reports supporting 50,000+ certified operations.</li>
      <li><strong>USPS:</strong> Managed data analytics for international mail operations, identifying leads and operational insights using SAS.</li>
      <li><strong>Census Bureau:</strong> Provided data analytics support including ServiceNow administration and Python-based reporting.</li>
      <li>Led proposal writing supporting a 5-year, $5M contract win.</li>
      <li>Facilitated adoption through study halls and working groups; mentored analysts and supported executive reporting.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <h3>Lincoln Leadership Institute at Gettysburg</h3>
      <span class="dates">2020–Present</span>
    </div>
    <div class="job-title">Lead Software Engineer &amp; Digital Strategist (Contract)</div>
    <ul>
      <li>Led the digital transformation of a premier in-person leadership development program: conceptualized the digital format, identified and vetted production partners, adapted content for virtual delivery, trained and led presenters, and managed advertising and enrollment.</li>
      <li>Rebuilt gettysburgleadership.com using Next.js with Stripe, HubSpot, and PostHog analytics integrations. Modernized from legacy WordPress.</li>
      <li>Conceptualized the "America at 250" program using AI-powered market research; the program has generated significant revenue since launch.</li>
      <li>Designed and executed digital marketing campaigns (HubSpot email automation) that drove direct program registrations, contributing to hundreds of thousands in revenue.</li>
      <li>Automated creation of marketing materials; led migration from Emma to HubSpot for email marketing.</li>
      <li>Mentored an intern through conversion to full-time hire to manage digital assets and marketing operations.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <h3>VisiTime, LLC</h3>
      <span class="dates">2012–~2020</span>
    </div>
    <div class="job-title">Founder</div>
    <ul>
      <li>Founded AR-driven tours using Unity platform programming and geospatial datasets to make historical context accessible and engaging.</li>
      <li>Raised $200K+ to produce a tour book and multiple mobile applications. Managed iPad rental fleet including device imaging and provisioning.</li>
      <li>Painstakingly geocoded historical content for dynamic location-based delivery; coordinated conversion of archival map data into machine-readable formats.</li>
      <li>Presented to Civil War historical societies, building trust for technology adoption in a traditionally technology-resistant market.</li>
      <li>U.S. utility patent holder (9,417,668; 9,900,042).</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <h3>Transform, Inc.</h3>
      <span class="dates">2014–2015</span>
    </div>
    <div class="job-title">Solution Engineer</div>
    <ul>
      <li>Integrated analytics tooling into client-facing visualization products; collaborated with executives to translate goals into measurable reporting.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <h3>U.S. Government — Recovery Accountability and Transparency Board</h3>
      <span class="dates">2011–2012</span>
    </div>
    <div class="job-title">Data Analyst (GIS Lead)</div>
    <ul>
      <li>Led GIS integration of government data for Recovery Act oversight using ESRI and Palantir network/lead analysis.</li>
      <li>Assisted in creation of data ontology for cross-system investigative analysis.</li>
      <li>Conceived investigation that identified 90 contract misrepresentations through geospatial and network analysis.</li>
    </ul>
  </div>
</section>

<section>
  <div class="section-title">Education</div>
  <div class="edu-row">
    <div><strong>University of Maryland</strong> — MBA (Consulting &amp; Management), MS (Information Systems)</div>
    <span class="dates">2019</span>
  </div>
  <div class="edu-row">
    <div><strong>Gettysburg College</strong> — BA Environmental Studies</div>
    <span class="dates">2010</span>
  </div>
  <div class="edu-row">
    <div><strong>Penn State</strong> — Project Management Certificate; GIS Certificate</div>
    <span class="dates">2017; 2012</span>
  </div>
</section>

<section>
  <div class="section-title">Certifications / Programs</div>
  <ul class="cert-list">
    <li>SAFe Scrum Master (2022)</li>
    <li>Tableau Certified Associate (2022)</li>
    <li>MIT Professional Education — Applied Data Science: Leveraging AI for Effective Decision-Making (2024)</li>
  </ul>
</section>

<section>
  <div class="section-title">Patents</div>
  <ul class="patent-list">
    <li>U.S. Patent 9,417,668</li>
    <li>U.S. Patent 9,900,042</li>
  </ul>
</section>

</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outPath,
    format: "Letter",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  console.log(`Resume PDF saved to ${outPath}`);
})();
