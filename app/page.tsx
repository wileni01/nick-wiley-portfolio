"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypingEffect } from "@/components/home/typing-effect";
import { StatsCounter } from "@/components/home/stats-counter";
import { TechOrbit } from "@/components/home/tech-orbit";
import { FeaturedProjects } from "@/components/home/featured-projects";

export default function HomePage() {
  return (
    <div className="relative">
      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                  Available for opportunities
                </motion.div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Hi, I&apos;m{" "}
                  <span className="gradient-text">Nick Wiley</span>
                </h1>

                <div className="text-2xl font-medium text-muted-foreground sm:text-3xl h-10">
                  <TypingEffect />
                </div>

                <p className="max-w-lg text-lg text-muted-foreground">
                  I build production-grade web applications with AI integration,
                  data engineering pipelines, and cybersecurity analysis tools.
                  From federal government contracts to startup-speed innovation.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button asChild size="xl" className="group">
                  <Link href="/chat">
                    <MessageSquare className="h-5 w-5" />
                    Chat with My AI
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link href="/projects">
                    View Projects
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="xl">
                  <Link href="/experience">
                    <Download className="h-5 w-5" />
                    Resume
                  </Link>
                </Button>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Open to Work
                </span>
                <span>IBM Federal Experience</span>
                <span>9+ Production Apps</span>
              </div>
            </motion.div>

            {/* Right: Tech Orbit */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:flex lg:justify-center"
            >
              <TechOrbit />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <StatsCounter />
        </div>
      </section>

      {/* ── Featured Projects Section ───────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <FeaturedProjects />
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Want to know more?{" "}
              <span className="gradient-text">Ask my AI.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I built a RAG-powered chatbot trained on my professional
              experience. Ask it anything about my skills, projects, or
              background — powered by GPT-4o and Claude.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5" />
                  Start a Conversation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
