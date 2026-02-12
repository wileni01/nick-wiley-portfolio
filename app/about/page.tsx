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
            civilian agencies. I&apos;m based in Alexandria, VA.
          </p>

          <p>
            My work sits at the intersection of applied data science, product
            thinking, and governance. I build tools that help experts make
            better decisions without losing accountability — from NLP-powered
            clustering workflows to Tableau reporting suites supporting tens of
            thousands of operations.
          </p>

          <h2>Background</h2>

          <p>
            Before consulting, I founded{" "}
            <strong>VisiTime</strong>, an augmented reality startup that turned
            geospatial data into interactive visitor experiences. I raised
            $200K+, built AR mobile apps, and shipped a six-hour interactive
            iPad tour system. I hold two U.S. patents from that work. Running a
            startup taught me things consulting never could — about focus,
            tradeoffs, sales reality, and knowing when to move on.
          </p>

          <p>
            I started my career as a data analyst at the{" "}
            <strong>Recovery Accountability and Transparency Board</strong>,
            where I used GIS and Palantir to support Recovery Act oversight.
            That experience — working with sensitive data at mission-critical
            stakes — shaped my conviction that analytics is only as valuable as
            the decisions it informs.
          </p>

          <h2>Education</h2>

          <p>
            I hold an <strong>MBA</strong> and an{" "}
            <strong>MS in Information Systems</strong> from the University of
            Maryland, a <strong>BA in Environmental Studies</strong> from
            Gettysburg College, and certificates in Project Management and GIS
            from Penn State. I completed MIT Professional Education&apos;s
            Applied Data Science program in 2024.
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
              Building decision-support tools at NSF. Based in Alexandria, VA.
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
