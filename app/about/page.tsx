import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillsHighlight } from "@/components/adaptive/skills-highlight";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nick Wiley, product and delivery leader for AI in federal agencies. 12+ years building analytics platforms, ML workflows, and governance inside NSF, USDA, USPS, and Census. Managing Consultant at IBM. Startup founder and U.S. patent holder.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About</h1>

        {/* Profile photo + intro */}
        <div className="flex items-start gap-6 mb-8">
          <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-border shadow-sm">
            <Image
              src="/images/professional_headshot.jpg"
              alt="Nick Wiley"
              fill
              sizes="112px"
              className="object-cover"
              priority
            />
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed pt-2">
            I&apos;m Nick, a Managing Consultant at IBM Global Business
            Services (AI &amp; Analytics), where I architect and deliver
            analytics platforms, ML workflows, and decision-support systems
            for federal civilian agencies. Based in Alexandria, VA.
          </p>
        </div>

        <div className="prose max-w-none space-y-6">
          <p>
            Over 12+ years across federal consulting, a startup, and SaaS,
            I&apos;ve developed a consistent approach: start with the decision
            someone needs to make, then design the system that makes it
            faster, more consistent, and auditable. I own delivery
            end-to-end, from technical architecture through stakeholder
            alignment, documentation, governance, and adoption.
          </p>

          <p>
            At IBM, I&apos;ve led engagements at NSF, USDA, USPS, and Census.
            I designed NLP pipelines (SciBERT embeddings, HDBSCAN/k-means
            clustering, Bayesian optimization) for research proposal
            classification and reviewer decision support. I architected a
            global data warehouse supporting 50,000+ USDA organic operations,
            integrating Salesforce, CBP customs records, and investigative
            databases. I&apos;ve partnered with governance and security
            stakeholders to define responsible AI guardrails, including
            data quality checks, monitoring expectations, and review
            workflows. I&apos;ve mentored junior analysts and contributed
            to proposals, delivery plans, and risk assessments.
          </p>

          <p>
            Before consulting, I founded <strong>VisiTime</strong> (2012–2020),
            an AR startup where I built the product on Unity, raised $200K+,
            shipped to market, and earned a U.S. patent. That experience
            taught me delivery ownership at a level consulting rarely
            provides: I owned the architecture, the roadmap, the stakeholder
            relationships, the operations, and the revenue.
          </p>

          {/* U.S. Capitol image */}
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm not-prose">
            <Image
              src="/images/capitol.jpg"
              alt="U.S. Capitol Building"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          <h2>Education &amp; certifications</h2>

          <p>
            <strong>MBA</strong> and{" "}
            <strong>MS in Information Systems</strong> from the University of
            Maryland. <strong>MIT Applied Data Science</strong> program
            (2024). SAFe Scrum Master (2022), Tableau Certified Associate
            (2022), Project Management certificate (2017), GIS certificate
            (2012).
          </p>

          <h2>What I&apos;m looking for</h2>

          <p>
            Product work at the intersection of frontier AI and government:
            sitting inside agency workflows, finding where a model genuinely
            belongs in the production path of the work, and owning the
            decisions that get it deployed, adopted, and trusted. I have
            spent 12+ years doing the discovery, delivery, and governance
            parts of that job inside federal agencies, usually through teams
            I did not manage. The part I want next is shaping the product
            itself, and carrying what agencies need back into the roadmap.
          </p>

          <div className="flex items-center gap-2 text-muted-foreground not-prose">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Alexandria, VA</span>
          </div>
        </div>

        {/* Adaptive skills highlight */}
        <div className="mt-8">
          <SkillsHighlight />
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild className="group">
            <Link href="/work">
              View My Work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Get in Touch</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/resume">Resume</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
