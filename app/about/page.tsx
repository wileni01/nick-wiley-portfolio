import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nick Wiley — AI Solutions Architect based in Alexandria, VA. Background in federal consulting, startups, GIS, and human-in-the-loop AI.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About</h1>

        <div className="prose max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            I&apos;m Nick Wiley — a Managing Consultant at IBM Global Business
            Services, where I build analytics and ML solutions for federal
            civilian agencies. I also lead digital strategy for the Lincoln
            Leadership Institute at Gettysburg. Based in Alexandria, VA.
          </p>

          <p>
            My work sits at the intersection of applied data science, product
            thinking, and governance. I build tools that help experts make
            better decisions without losing accountability — from NLP-powered
            clustering workflows and AI-assisted decision-support tools to
            global data warehouses and digital transformation programs that
            drive real revenue.
          </p>

          <h2>Background</h2>

          <p>
            At <strong>IBM</strong>, I&apos;ve delivered analytics and ML
            solutions for the National Science Foundation, USDA, USPS, and
            Census Bureau — building everything from BERTopic-powered proposal
            classification systems to global data warehouses integrating
            Salesforce, CBP customs records, and investigative databases. My
            NSF work includes the Panel Wizard (a decision-support tool that
            consolidated 8 screens into 1) and researcher lineage dashboards
            that integrate public and internal funding data.
          </p>

          <p>
            Alongside consulting, I lead digital strategy for the{" "}
            <strong>Lincoln Leadership Institute at Gettysburg</strong>, where
            I&apos;ve driven a comprehensive digital transformation. I
            converted their flagship in-person leadership development program
            to a digital format — conceptualizing the approach, identifying and
            vetting producers, adapting content, training presenters, and
            managing enrollment. I rebuilt their website (
            <a
              href="https://www.gettysburgleadership.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              gettysburgleadership.com
            </a>
            ) using modern web technologies with Stripe, HubSpot, and
            analytics integrations. I conceptualized the &ldquo;America at
            250&rdquo; program using AI-powered market research — a program
            that has generated significant revenue since launch. I also
            designed email marketing campaigns that drove direct program
            signups, mentored an intern through conversion to a full-time hire,
            and automated the creation of marketing materials.
          </p>

          <p>
            Before consulting, I founded{" "}
            <strong>VisiTime</strong>, an augmented reality startup that turned
            geospatial data into interactive visitor experiences. I built the AR
            experience on Unity, raised $200K+, shipped a six-hour interactive
            iPad tour system, and personally geocoded historical content for
            location-based delivery. I hold two U.S. utility patents from that
            work. I gave presentations to Civil War historical societies —
            building trust for technology adoption in a traditionally resistant
            market. Running a startup taught me things consulting never could —
            about focus, tradeoffs, sales reality, and knowing when to move on.
          </p>

          <p>
            I started my career as a data analyst at the{" "}
            <strong>Recovery Accountability and Transparency Board</strong>,
            where I led GIS integration of government data and used Palantir
            for network and lead analysis. I conceived an investigation that
            identified 90 contract misrepresentations and assisted in the
            creation of a data ontology for cross-system investigative
            analysis. That experience — working with sensitive data at
            mission-critical stakes — shaped my conviction that analytics is
            only as valuable as the decisions it informs.
          </p>

          <h2>Education</h2>

          <p>
            I hold an <strong>MBA</strong> and an{" "}
            <strong>MS in Information Systems</strong> from the University of
            Maryland, a <strong>BA in Environmental Studies</strong> from
            Gettysburg College, and certificates in Project Management and GIS
            from Penn State. I completed MIT Professional Education&apos;s
            Applied Data Science program in 2024. During graduate school, I
            built machine learning projects including a Keras-based code
            language classifier trained on Stack Overflow data and a Python ML
            model assigning risk scores to Washington, DC intersections based
            on car accident data.
          </p>

          <h2>How I think about work</h2>

          <p>
            I start by clarifying the decision someone is trying to make. Then
            I design a system that makes the decision easier, safer, and
            repeatable — with governance and usability treated as first-class
            engineering requirements.
          </p>

          <p>
            I believe that human-in-the-loop isn&apos;t a compromise —
            it&apos;s the point. The strongest AI systems I&apos;ve worked on
            don&apos;t replace experts. They make expert judgment easier to
            apply consistently.
          </p>

          <h2>Currently</h2>

          <div className="flex items-center gap-2 text-muted-foreground not-prose">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              Building decision-support tools at NSF. Driving digital strategy
              at LLI. Based in Alexandria, VA.
            </span>
          </div>
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
