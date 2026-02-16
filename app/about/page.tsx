import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillsHighlight } from "@/components/adaptive/skills-highlight";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nick Wiley, managing consultant and applied data scientist based in Alexandria, VA. 12+ years building analytics and ML solutions for federal agencies, with a startup and two patents along the way.",
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
            I&apos;m Nick, a Managing Consultant at IBM, where I build
            analytics and ML tools for federal civilian agencies like NSF,
            USDA, and USPS. I also run digital strategy for the Lincoln
            Leadership Institute at Gettysburg. Based in Alexandria, VA.
          </p>
        </div>

        <div className="prose max-w-none space-y-6">
          <p>
            Most of my work comes down to one question: what decision is
            someone trying to make, and what do they need to make it well?
            I build tools that answer that: NLP-powered clustering workflows,
            AI-assisted decision-support apps, global data warehouses, and
            the training and governance work that makes those tools stick.
          </p>

          <h2>Background</h2>

          <p>
            At <strong>IBM</strong>, I build analytics and ML solutions for
            NSF, USDA, USPS, and Census. The work ranges from a
            BERTopic-powered proposal classification system (7,000+ proposals,
            70+ themes) to a global data warehouse integrating Salesforce,
            CBP customs records, and investigative databases. At NSF, I built
            the Panel Wizard, a decision-support tool that consolidated 8
            separate screens into 1 and cut panel formation time from weeks
            to hours, and researcher lineage dashboards that connect public
            and internal funding data.
          </p>

          <p>
            On the side, I run digital strategy for the{" "}
            <strong>Lincoln Leadership Institute at Gettysburg</strong>. I
            converted their flagship in-person leadership program to a digital
            format, finding and vetting producers, adapting content, training
            presenters, and managing enrollment. I rebuilt their website (
            <a
              href="https://www.gettysburgleadership.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              gettysburgleadership.com
            </a>
            ) with Next.js, Stripe, and HubSpot integrations. I also
            conceptualized the &ldquo;America at 250&rdquo; program using
            AI-powered market research. It has generated significant revenue
            since launch. I designed email campaigns that produced direct
            program registrations, mentored an intern into a full-time hire,
            and automated the creation of marketing materials.
          </p>

          {/* Gettysburg Battlefield image */}
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm not-prose">
            <Image
              src="/images/gettysburg_battlefield.jpg"
              alt="Gettysburg Battlefield"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          <p>
            Before consulting, I founded <strong>VisiTime</strong>, an AR
            startup that turned geospatial data into interactive visitor
            experiences. I built the AR system on Unity, raised $200K+,
            shipped a six-hour interactive iPad tour, and personally geocoded
            every piece of historical content for location-based delivery.
            I hold two U.S. utility patents from that work. I spent a lot of
            time presenting to Civil War historical societies, earning trust
            for technology in a market that was not naturally interested in it.
            Running a startup taught me things consulting never could: how to
            prioritize under real constraints, when to walk away from a
            feature, and how hard it is to sell something that doesn&apos;t
            exist yet.
          </p>

          <p>
            I started as a data analyst at the{" "}
            <strong>Recovery Accountability and Transparency Board</strong>,
            where I led GIS integration of government data and used Palantir
            for network and lead analysis. I conceived an investigation that
            identified 90 contract misrepresentations and helped create a
            data ontology for cross-system investigative analysis. Working
            with sensitive data at those stakes is where I first learned that
            analytics is only useful if it actually changes a decision.
          </p>

          {/* U.S. Capitol image */}
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm not-prose">
            <Image
              src="/images/capitol.jpeg"
              alt="U.S. Capitol Building"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          <h2>Education</h2>

          <p>
            I hold an <strong>MBA</strong> and{" "}
            <strong>MS in Information Systems</strong> from Maryland, a{" "}
            <strong>BA in Environmental Studies</strong> from Gettysburg
            College, and certificates in Project Management and GIS from Penn
            State. I completed MIT&apos;s Applied Data Science program in
            2024. In grad school I built a Keras-based code language
            classifier trained on Stack Overflow data and an ML model that
            scored Washington, DC intersections by accident risk, both
            good exercises in moving from messy data to something actionable.
          </p>

          <h2>How I think about the work</h2>

          <p>
            I start with the decision someone needs to make and work backwards.
            What data do they need? What does the workflow look like? Who is
            accountable? Then I build a system that makes the decision faster,
            more consistent, and auditable, with governance and usability as
            engineering requirements, not afterthoughts.
          </p>

          <p>
            The strongest AI systems I&apos;ve worked on don&apos;t replace
            experts. They make expert judgment easier to apply consistently.
            Human-in-the-loop isn&apos;t a concession. It&apos;s the whole
            point.
          </p>

          <h2>Currently</h2>

          <div className="flex items-center gap-2 text-muted-foreground not-prose">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              Building decision-support tools at NSF. Running digital strategy
              at LLI. Alexandria, VA.
            </span>
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
