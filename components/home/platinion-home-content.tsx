import Link from "next/link";
import { ArrowRight, ShieldCheck, Layers3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const impactMetrics = [
  {
    metric: "7,000+ proposals, 70+ themes",
    outcome:
      "SciBERT + clustering pipeline for reviewer decision support with ambiguous proposals routed to human review.",
    source: "/work/nsf-proposal-classification",
  },
  {
    metric: "5+ billion records, millions processed daily",
    outcome:
      "AWS data platform integrating Salesforce, CBP customs, and investigative data for 50,000+ USDA organic operations.",
    source: "/work/usda-organic-analytics",
  },
  {
    metric: "Weeks to hours",
    outcome:
      "Panel formation moved from an 8-screen manual workflow to a single HITL decision-support experience.",
    source: "/work/panel-wizard",
  },
];

const architecturePatterns = [
  {
    title: "HITL decision support in regulated workflows",
    problem:
      "High-stakes review operations where staff must own final decisions.",
    pattern:
      "Embedding + clustering recommendations with fit scores, transparent rationale, and explicit override controls.",
    whyItMatters:
      "Improves throughput without removing accountability from program staff.",
    href: "/work/panel-wizard",
  },
  {
    title: "RAG/embedding pipelines with governance controls",
    problem:
      "Large technical corpora where manual classification does not scale.",
    pattern:
      "Domain-specific embeddings, optimization harnesses, and auditable parameter and version tracking.",
    whyItMatters:
      "Raises signal quality while preserving reproducibility and reviewability.",
    href: "/work/nsf-proposal-classification",
  },
  {
    title: "Secure integration across constrained legacy estates",
    problem:
      "Critical workflows spread across systems that do not expose modern APIs.",
    pattern:
      "Automated data pipelines plus browser-based integration where no API exists, with traceable outputs.",
    whyItMatters:
      "Delivers modernization outcomes without waiting on full platform replacement.",
    href: "/work/nsf-robora",
  },
  {
    title: "Operational governance as a built-in delivery track",
    problem:
      "Teams need confidence that analytics and AI outputs are reliable, explainable, and compliance-ready.",
    pattern:
      "Rules-based checks, data lineage, metric definitions, review workflows, and accessibility requirements baked into delivery.",
    whyItMatters:
      "Reduces audit risk and improves adoption by making quality visible and repeatable.",
    href: "/work/nsf-adcc",
  },
];

const caseSnapshots = [
  {
    title: "Federal proposal triage modernization",
    detail:
      "Designed a modular NLP architecture to classify 7,000+ proposals and surface 70+ themes while routing ambiguous cases to manual review.",
    linkLabel: "Read proposal classification case",
    href: "/work/nsf-proposal-classification",
  },
  {
    title: "Legacy workflow automation without APIs",
    detail:
      "Replaced fragile spreadsheet-heavy document workflows with pipeline automation and browser orchestration into legacy interfaces.",
    linkLabel: "Read RoboRA case",
    href: "/work/nsf-robora",
  },
];

const governanceApproach = [
  "Define success criteria and risk boundaries before model or pipeline decisions.",
  "Design for explainability, overrides, and audit traceability from day one.",
  "Run discovery -> pilot -> scale with clear checkpoints for adoption and controls.",
  "Partner directly with governance, security, and stakeholder leads to align delivery decisions.",
];

export function PlatinionHomeContent() {
  return (
    <>
      <section
        id="impact-examples"
        className="py-20 px-4 sm:px-6 lg:px-8 border-y border-primary/10 bg-muted/20"
      >
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Impact examples
            </h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Evidence from delivery work in regulated settings. All metrics
              and outcomes below are sourced from existing case studies.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {impactMetrics.map((item) => (
              <Card key={item.metric} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.metric}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.outcome}
                  </p>
                  <Button asChild variant="ghost" size="sm" className="group px-0">
                    <Link href={item.source}>
                      Case detail
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                AI Platform & Delivery Patterns I Lead
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Repeatable architecture patterns I deliver under operating
              constraints, tied to outcomes and risk posture.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {architecturePatterns.map((pattern) => (
              <Card key={pattern.title} className="h-full">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-lg">{pattern.title}</CardTitle>
                  <Badge variant="muted" className="w-fit">
                    Problem context
                  </Badge>
                  <p className="text-sm text-muted-foreground">{pattern.problem}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      Pattern
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pattern.pattern}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      Why it matters
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pattern.whyItMatters}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="group px-0">
                    <Link href={pattern.href}>
                      See related case
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-5xl space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Case snapshots
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {caseSnapshots.map((snapshot) => (
              <Card key={snapshot.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{snapshot.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {snapshot.detail}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={snapshot.href}>{snapshot.linkLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                Governance, risk, and delivery approach
              </h2>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {governanceApproach.map((item) => (
                <li key={item} className="text-sm text-muted-foreground leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button asChild>
                <Link href="/work">
                  View full case studies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <div className="flex justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Delivery leadership style
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            I design and deliver AI-enabled systems in environments where
            governance, transparency, and adoption are non-negotiable. My focus
            is leading cross-functional teams from discovery through production,
            with clear tradeoffs, measurable outcomes, and durable delivery
            practices.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/about">About my background</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Start a conversation</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
