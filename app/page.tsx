import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Brain,
  Database,
  Users,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedCaseStudies } from "@/lib/mdx";
import { HomeClient } from "@/components/home/home-client";
import { PersonalizedHero } from "@/components/adaptive/personalized-hero";

const whatIDo = [
  {
    icon: Brain,
    title: "Decision Support Apps",
    description:
      "Human-centered tools that let experts override models, audit decisions, and stay in control.",
  },
  {
    icon: Database,
    title: "Data Platforms & Analytics",
    description:
      "Warehouses, pipelines, and dashboards that turn messy systems into trustworthy reporting.",
  },
  {
    icon: Users,
    title: "Adoption & Governance",
    description:
      "I run the meetings, write the docs, build the training, and sweat the compliance details.",
  },
];

export default function HomePage() {
  const featured = getFeaturedCaseStudies();

  return (
    <div className="relative">
      {/* ── Hero Section ────────────────────────────────── */}
      <section
        id="hero-section"
        className="relative min-h-[80vh] flex items-center grid-bg"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full py-20 sm:py-28">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] leading-[1.15]">
                Human-in-the-loop AI
                <br />
                <span className="text-primary">
                  for high-stakes decisions.
                </span>
              </h1>

              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
                I build decision-support tools that help experts move
                faster{" "}
                <strong className="text-foreground font-medium">
                  without giving up accountability
                </strong>
                — from federal analytics platforms to ML-assisted workflow
                apps.
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

      {/* ── What I Do ───────────────────────────────────── */}
      <section id="what-i-do" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight mb-10">
            What I do
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {whatIDo.map((item) => (
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
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            How I work
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I start by clarifying the decision someone is trying to make.
            </p>
            <p>
              Then I design a system that makes the decision{" "}
              <strong className="text-foreground font-medium">
                easier, safer, and repeatable
              </strong>
              — with governance and usability treated as first-class
              engineering requirements.
            </p>
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
            &ldquo;Professional and collaborative — uniquely suited for DAO
            work.&rdquo;
          </blockquote>
          <cite className="block text-sm text-muted-foreground not-italic">
            — Data Analytics Officer, NSF Engineering Directorate
          </cite>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Interested in working together?
          </h2>
          <p className="text-muted-foreground">
            I&apos;m always open to conversations about decision-support
            systems, analytics platforms, and responsible AI.
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
