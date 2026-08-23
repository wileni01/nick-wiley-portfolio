import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Code2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  engagements,
  products,
  programs,
  prototypes,
  type Product,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Products Nick Wiley has shipped: Gettysburg Tours, GettysburgLeadership.com, the Moment of Command Assessment, CRM recovery tools, CaseKit for coding agents, and the government systems behind the case studies.",
};

const statusLabel: Record<Product["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "in-development": "In development",
  beta: "Beta",
  retired: "2012 to 2020",
};

const imageKindLabel: Record<Product["imageKind"], string> = {
  screenshot: "Screenshot",
  terminal: "Real output",
  recreation: "Recreation",
  photo: "Photo",
};

function ProductCard({ product }: { product: Product }) {
  const primaryHref = product.liveUrl
    ? product.liveUrl
    : product.caseStudySlug
      ? `/work/${product.caseStudySlug}`
      : product.sourceUrl;

  return (
    <Card className="h-full overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted border-b border-border">
        <Image
          src={product.image}
          alt={
            product.imageKind === "recreation"
              ? `Representative recreation of ${product.title}`
              : `${product.title} screenshot`
          }
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top"
        />
        <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          {imageKindLabel[product.imageKind]}
        </span>
      </div>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug">
              {primaryHref ? (
                <a
                  href={primaryHref}
                  target={primaryHref.startsWith("http") ? "_blank" : undefined}
                  rel={primaryHref.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hover:text-primary transition-colors"
                >
                  {product.title}
                </a>
              ) : (
                product.title
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.org}
              {product.year ? ` · ${product.year}` : ""}
            </p>
          </div>
          <Badge
            variant={product.status === "live" ? "default" : "outline"}
            className="shrink-0 text-[10px]"
          >
            {statusLabel[product.status]}
          </Badge>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{product.summary}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{product.detail}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.stack.map((tech) => (
            <Badge key={tech} variant="muted" className="text-[10px]">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
          {product.liveUrl && (
            <a
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Visit site <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {product.caseStudySlug && (
            <Link
              href={`/work/${product.caseStudySlug}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Case study <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Source <Code2 className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Things I have shipped and own end to end: public products,
            client tools, programs with revenue behind them, and the
            government systems behind the case studies. Images are real
            screenshots where the product is public. For internal
            government tools they are recreations built from the case
            study, and they are labeled that way.
          </p>
        </div>

        {/* Shipped products */}
        <section className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Shipped products
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        {/* Programs */}
        <section className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Programs and operations
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            Product ownership that was not software. Lincoln Leadership
            Institute at Gettysburg, 2020 to present, as Lead Software
            Engineer and Digital Strategist.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {programs.map((program) => (
              <Card key={program.title} className="h-full">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-base font-semibold">{program.title}</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {program.summary}
                  </p>
                  <dl className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 text-sm">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-0.5">
                      Owned
                    </dt>
                    <dd className="text-muted-foreground leading-relaxed">
                      {program.owned}
                    </dd>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-0.5">
                      Result
                    </dt>
                    <dd className="text-muted-foreground leading-relaxed">
                      {program.outcome}
                    </dd>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Government engagements */}
        <section className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Government systems
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            Built inside federal agencies as a consultant. Details are
            sanitized; each case study describes the approach, the
            constraints, and what changed.
          </p>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {engagements.map((item) => {
              const inner = (
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {item.title}
                      <span className="ml-2 font-normal text-xs text-muted-foreground">
                        {item.agency}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.summary}
                    </p>
                  </div>
                  {item.caseStudySlug && (
                    <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              );
              return item.caseStudySlug ? (
                <Link
                  key={item.title}
                  href={`/work/${item.caseStudySlug}`}
                  className="group block hover:bg-muted/40 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {inner}
                </Link>
              ) : (
                <div key={item.title}>{inner}</div>
              );
            })}
          </div>
        </section>

        {/* Prototypes */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Prototypes and experiments
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            Starting points for new work, and a couple of older projects
            that shaped how I approach production systems.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {prototypes.map((project) => (
              <Card key={project.title} className="h-full hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-base font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <Badge key={tech} variant="muted" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {project.availability}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
