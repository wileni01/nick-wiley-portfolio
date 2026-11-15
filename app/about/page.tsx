import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Nick Wiley’s background in consulting, analytics, and independent software.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="article-shell page-space">
      <header className="page-heading"><h1>About</h1></header>
      <div className="about-layout">
        <div className="prose">
          <p>I’m Nick Wiley, a {siteConfig.jobTitle} at {siteConfig.employer}, based in {siteConfig.location}. Before BCG, I worked at IBM on analytics and software for federal agencies, including tools for NSF proposal review and reporting for USDA’s organic program.</p>
          <p>I founded VisiTime, which released an interactive iPad tour of Gettysburg. The tour used maps, narration, and historical imagery tied to locations on the battlefield.</p>
          <p>My recent projects include rebuilding a 1990s pirate game for 64-bit Windows and installing a new operating system on my car’s infotainment unit.</p>
          <p>On recent projects, I used Codex and Claude Code for specific assignments, from adding regression tests to writing a game test driver. I checked the resulting changes against source records, test runs, and the behavior of the software.</p>
          <p>I have an MBA and an MS in Information Systems from the University of Maryland.</p>
          <Link href="/resume" className="text-link">View résumé <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <Image src="/images/professional_headshot.jpg" alt="Nick Wiley" width={240} height={240} className="h-auto w-full" />
      </div>
    </div>
  );
}
