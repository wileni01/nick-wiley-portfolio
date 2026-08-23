import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Download,
  Search,
  Users,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedCaseStudies } from "@/lib/mdx";
import { HomeClient } from "@/components/home/home-client";
import { PersonalizedHero } from "@/components/adaptive/personalized-hero";
import { PlatinionHomeContent } from "@/components/home/platinion-home-content";
import { ExitTailoredView } from "@/components/adaptive/exit-tailored-view";
import {
  ADAPTIVE_MODE_COOKIE,
  getAdaptiveModeFromSearchParams,
  isPlatinionView,
  parseAdaptiveModeCookie,
} from "@/lib/adaptive/platinion";
import { siteConfig } from "@/lib/site";

type SearchParams = Record<string, string | string[] | undefined>;

type HomePageProps = {
  searchParams?: Promise<SearchParams>;
};

async function unwrapSearchParams(
  searchParams?: Promise<SearchParams>
): Promise<SearchParams> {
  if (!searchParams) return {};
  return await searchParams;
}

const proofPoints = [
  {
    icon: Search,
    title: "Discovery inside the workflow",
    description:
      "Panel Wizard started by watching program staff work across 8 screens and spreadsheets. The product consolidated them into 1, let sentence embeddings suggest review panels, and kept every decision with the staff. Panel formation went from weeks to hours.",
  },
  {
    icon: ShieldCheck,
    title: "AI product judgment",
    description:
      "Ambiguous proposals go to people instead of being forced into clusters. Assistants have to cite their sources. Overrides are logged and measured, not hidden. I design for evaluation and human oversight from the first sprint, because that is what gets an AI product adopted in an agency.",
  },
  {
    icon: Users,
    title: "Shipping through teams I do not control",
    description:
      "Consulting means executing through agency staff, security and governance stakeholders, and vendors. I delivered a governed AWS data platform across Salesforce, CBP customs records, and investigative systems for 50,000+ USDA operations, then ran the study halls that made adoption stick.",
  },
];

const howIWork = [
  {
    step: "01",
    title: "Discover",
    description:
      "Sit with the people doing the work. Find the decision, the constraints, and the step where a model genuinely belongs. Requirements documents come after, not before.",
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

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const resolvedSearchParams = await unwrapSearchParams(searchParams);
  const platinionVariantFromQuery = isPlatinionView(resolvedSearchParams);

  return {
    alternates: {
      canonical: "/",
    },
    robots: platinionVariantFromQuery
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await unwrapSearchParams(searchParams);
  const modeFromQuery = getAdaptiveModeFromSearchParams(resolvedSearchParams);
  const modeFromCookie = parseAdaptiveModeCookie(
    (await cookies()).get(ADAPTIVE_MODE_COOKIE)?.value
  );
  const platinionVariant = Boolean(modeFromQuery || modeFromCookie);
  const featured = getFeaturedCaseStudies();
  const primaryCtaHref = platinionVariant ? "#impact-examples" : "/work";
  const primaryCtaLabel = platinionVariant
    ? "View impact examples"
    : "View Case Studies";

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
              {platinionVariant && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-medium text-primary">
                  BCG Platinion-focused view: AI platform architecture + delivery proof
                  <ExitTailoredView />
                </div>
              )}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] leading-[1.15]">
                {platinionVariant ? (
                  <>
                    AI platform architecture and delivery leadership
                    <br />
                    <span className="text-primary">
                      for measurable outcomes and governed scale.
                    </span>
                  </>
                ) : (
                  <>
                    I find where AI belongs in government work,
                    <br />
                    <span className="text-primary">
                      and ship products people can trust.
                    </span>
                  </>
                )}
              </h1>

              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
                {platinionVariant ? (
                  <>
                    I lead AI-enabled delivery from discovery through
                    operationalization in constrained environments. My approach
                    emphasizes repeatable patterns, explicit tradeoffs, and
                    operating models where teams can review, override, and
                    explain outcomes.
                  </>
                ) : (
                  <>
                    Product and delivery leadership for AI in federal
                    agencies. 12+ years building decision-support systems for
                    NSF, USDA, USPS, and Census, plus a startup I founded.{" "}
                    <strong className="text-foreground font-medium">
                      I do discovery inside the workflow, and I ship systems
                      where the people accountable for outcomes can see,
                      override, and explain every recommendation
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href={primaryCtaHref}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={siteConfig.resumePdf} download>
                  <Download className="h-4 w-4" />
                  Download Resume
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            </div>

            {platinionVariant && (
              <ul className="grid gap-3 text-sm text-muted-foreground">
                <li>
                  Built a proposal triage pipeline for <strong className="text-foreground">7,000+ proposals</strong> and{" "}
                  <strong className="text-foreground">70+ themes</strong>, with
                  ambiguous cases routed to human review.
                </li>
                <li>
                  Delivered a governed AWS data platform across Salesforce,
                  CBP, and investigative systems for{" "}
                  <strong className="text-foreground">50,000+ operations</strong>{" "}
                  with <strong className="text-foreground">5+ billion records</strong>.
                </li>
                <li>
                  Delivered HITL panel formation that reduced a manual process{" "}
                  <strong className="text-foreground">from weeks to hours</strong>{" "}
                  while preserving reviewer control.
                </li>
              </ul>
            )}

            {/* Adaptive personalization */}
            {!platinionVariant && <PersonalizedHero />}

            {/* Tour + trust signals */}
            <HomeClient />
          </div>
        </div>
      </section>

      {platinionVariant ? (
        <PlatinionHomeContent />
      ) : (
        <>
      {/* ── What I Deliver ────────────────────────────────── */}
      <section id="what-i-deliver" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight mb-10">
            What I bring
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
            If you need someone to find where AI belongs in a government
            workflow and carry it through to adoption, I&apos;d be glad to
            talk.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/projects">See the products</Link>
            </Button>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
