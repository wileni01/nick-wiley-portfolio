export interface Skill {
  name: string;
  level: number; // 0-100
  projectSlugs: string[]; // links to projects that demonstrate this skill
}

export interface SkillCategory {
  name: string;
  icon: string; // lucide icon name
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Frontend",
    icon: "Monitor",
    skills: [
      { name: "React / Next.js", level: 95, projectSlugs: ["gettysburg-leadership", "nickwchat"] },
      { name: "TypeScript", level: 90, projectSlugs: ["gettysburg-leadership", "nickwchat"] },
      { name: "Tailwind CSS", level: 95, projectSlugs: ["gettysburg-leadership", "nw-resume-generator"] },
      { name: "D3.js / Data Viz", level: 85, projectSlugs: ["nickantir"] },
      { name: "HTML5 / CSS3", level: 95, projectSlugs: ["nickantir", "nw-resume-generator"] },
      { name: "Framer Motion", level: 80, projectSlugs: [] },
    ],
  },
  {
    name: "Backend",
    icon: "Server",
    skills: [
      { name: "Python", level: 95, projectSlugs: ["lli-email-data-miner", "lli-golden-record", "nw-resume-generator", "nickwchat"] },
      { name: "FastAPI", level: 90, projectSlugs: ["lli-email-data-miner", "nw-resume-generator", "nickwchat"] },
      { name: "Node.js", level: 85, projectSlugs: ["gettysburg-leadership", "g15-modes-console"] },
      { name: "Flask", level: 80, projectSlugs: ["lli-golden-record"] },
      { name: "SQL / SQLite", level: 85, projectSlugs: ["lli-email-data-miner", "lli-golden-record", "nw-resume-generator"] },
      { name: "Neo4j / Graph DB", level: 75, projectSlugs: ["nickwchat"] },
    ],
  },
  {
    name: "AI / Machine Learning",
    icon: "Brain",
    skills: [
      { name: "OpenAI GPT-4o", level: 90, projectSlugs: ["nw-resume-generator", "lli-golden-record"] },
      { name: "RAG / Embeddings", level: 85, projectSlugs: ["nw-resume-generator"] },
      { name: "Azure AI / Document Intelligence", level: 80, projectSlugs: ["lli-email-data-miner"] },
      { name: "Prompt Engineering", level: 90, projectSlugs: ["nw-resume-generator", "lli-golden-record"] },
      { name: "LangChain / AI SDK", level: 80, projectSlugs: [] },
      { name: "NLP / Text Processing", level: 85, projectSlugs: ["lli-email-data-miner", "nw-resume-generator"] },
    ],
  },
  {
    name: "DevOps & Cloud",
    icon: "Cloud",
    skills: [
      { name: "Docker / Docker Compose", level: 85, projectSlugs: ["nickwchat"] },
      { name: "Vercel", level: 90, projectSlugs: ["gettysburg-leadership"] },
      { name: "CI/CD Pipelines", level: 80, projectSlugs: [] },
      { name: "PowerShell Automation", level: 90, projectSlugs: ["g15-modes-console", "mtw2-qol-installer"] },
      { name: "Git / GitHub", level: 95, projectSlugs: [] },
      { name: "Linux / WSL", level: 85, projectSlugs: ["lli-email-data-miner"] },
    ],
  },
  {
    name: "Cybersecurity",
    icon: "Shield",
    skills: [
      { name: "Fraud Detection / Analysis", level: 85, projectSlugs: ["nickantir"] },
      { name: "Graph-Based Threat Analysis", level: 80, projectSlugs: ["nickantir"] },
      { name: "Data Integrity (SHA-256)", level: 85, projectSlugs: ["mtw2-qol-installer"] },
      { name: "Secure API Design", level: 85, projectSlugs: ["gettysburg-leadership", "nw-resume-generator"] },
      { name: "Input Sanitization / CSP", level: 80, projectSlugs: [] },
    ],
  },
  {
    name: "Data Engineering",
    icon: "Database",
    skills: [
      { name: "ETL Pipelines", level: 85, projectSlugs: ["lli-email-data-miner"] },
      { name: "HubSpot CRM Integration", level: 90, projectSlugs: ["gettysburg-leadership", "lli-golden-record", "lli-email-data-miner"] },
      { name: "Apollo.io / Data Enrichment", level: 80, projectSlugs: ["lli-email-data-miner", "lli-golden-record"] },
      { name: "Web Scraping / Parsing", level: 85, projectSlugs: ["lli-email-data-miner", "nw-resume-generator"] },
      { name: "Stripe Payment Integration", level: 80, projectSlugs: ["gettysburg-leadership"] },
    ],
  },
];

export function getAllSkillNames(): string[] {
  return skillCategories.flatMap((cat) => cat.skills.map((s) => s.name));
}
