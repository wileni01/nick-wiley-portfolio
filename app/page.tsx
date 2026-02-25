import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Brain,
  Database,
  ShieldCheck,
  Linkedin,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedCaseStudies } from "@/lib/mdx";
import { HomeClient } from "@/components/home/home-client";
import { PersonalizedHero } from "@/components/adaptive/personalized-hero";

const proofPoints = [
  {
    icon: Brain,
    title: "NLP pipeline for research proposal triage",
    description:
      "Designed a SciBERT embedding and clustering workflow (HDBSCAN, k-means, Bayesian optimization) that classified 7,000+ research proposals into 70+ themes. Ambiguous proposals flagged for human review, not forced into poor-fit clusters.",
  },
  {
    icon: ShieldCheck,
    title: "Governance, auditability, responsible AI",
    description:
      "Partnered with governance and security stakeholders to define responsible AI guardrails: data quality checks, monitoring expectations, review workflows, and documentation standards for reproducible, auditable pipelines.",
  },
  {
    icon: Database,
    title: "Data platform supporting 50,000+ operations",
    description:
      "Built a global data warehouse and Tableau reporting suite for USDA's organic program, integrating Salesforce, CBP customs records, and investigative databases into a governed source of truth.",
  },
];

const howIWork = [
  {
    step: "01",
    title: "Align",
    description:
      "Identify the decision, the stakeholders, and the constraints. Define success criteria before writing code.",
  },
  {
    step: "02",
    title: "Architect",
    description:
      "Design the system end-to-end: data pipelines, model workflows, integration points, governance controls, and audit trails.",
  },
  {
    step: "03",
    title: "Prototype",
    description:
      "Build working software quickly. Validate assumptions with real users and real data before committing to scale.",
  },
  {
    step: "04",
    title: "Operationalize",
    description:
      "Harden pipelines, document everything, establish monitoring. Make it reproducible and maintainable.",
  },
  {
    step: "05",
    title: "Drive adoption",
    description:
      "Train users, run stakeholder reviews, retire legacy processes. A tool nobody uses is a tool that failed.",
  },
];

export default function HomePage() {
  const featured = getFeaturedCaseStudies();

  return (
    <div className="relative">
      {/* ── Hero Section ────────────────────────────────── */}
      <section
        id="hero-section"
        className="relative min-h-[80vh] flex items-center overflow-hidden"
      >
        {/* Hero background image */}
        <Image
          src="/images/data_meeting2.jpg"
          alt="Professional presenting data to colleagues"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-background/85 dark:bg-background/90" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full py-20 sm:py-28">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] leading-[1.15]">
                I architect AI systems that
                <br />
                <span className="text-primary">
                  earn trust in regulated environments.
                </span>
              </h1>

              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
                End-to-end AI solution architecture, delivery leadership,
                and governance for federal agencies.{" "}
                <strong className="text-foreground font-medium">
                  12+ years designing systems where the people accountable
                  for outcomes can see, override, and explain every
                  recommendation
                </strong>
                .
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/work">
                  View Case Studies
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/resume/nick-wiley-resume.pdf" download>
                  <Download className="h-4 w-4" />
                  Download Resume
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a
                  href="https://linkedin.com/in/nicholas-a-wiley-975b3136"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/contact">Contact</Link>
              </Button>
            </div>

            {/* Adaptive personalization */}
            <PersonalizedHero />

            {/* Tour + trust signals */}
            <HomeClient />
          </div>
        </div>
      </section>

      {/* ── What I Deliver ────────────────────────────────── */}
      <section id="what-i-deliver" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight mb-10">
            What I deliver
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <Card key={item.title} className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-3">
                  <item.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selected Work ───────────────────────────────── */}
      <section
        id="selected-work"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight">
              Selected work
            </h2>
            <Button asChild variant="ghost" size="sm" className="group">
              <Link href="/work">
                All case studies
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((study) => {
              const hasImage =
                study.image && !study.image.includes("placeholder");
              return (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  className="group block"
                >
                  <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {hasImage ? (
                        <Image
                          src={study.image!}
                          alt={study.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                          <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                            {study.client}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>

                    <CardContent className="pt-5 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {study.client}
                      </p>
                      <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                        {study.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {study.executiveSummary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {study.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="muted"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How I Work ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight mb-10">
            How I work
          </h2>
          <div className="space-y-6">
            {howIWork.map((item) => (
              <div key={item.step} className="flex gap-5">
                <span className="text-2xl font-bold text-primary/30 tabular-nums shrink-0 w-8 text-right">
                  {item.step}
                </span>
                <div className="space-y-1 pb-6 border-b border-border last:border-0">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────── */}
      <section
        id="testimonial-section"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <Quote className="h-8 w-8 text-primary mx-auto" />
          <blockquote className="text-xl font-medium leading-relaxed italic">
            &ldquo;Professional and collaborative, uniquely suited for DAO
            work.&rdquo;
          </blockquote>
          <cite className="block text-sm text-muted-foreground not-italic">
            Data Analytics Officer, NSF Engineering Directorate
          </cite>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Worth a conversation?
          </h2>
          <p className="text-muted-foreground">
            If you need AI solution architecture, delivery leadership,
            or governance expertise for a regulated environment, I&apos;d
            be glad to talk.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/work">View My Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
