"use client";

import { motion } from "framer-motion";
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/experience/timeline";
import {
  getWorkExperience,
  getEducation,
  getCertifications,
} from "@/lib/experience";

export default function ExperiencePage() {
  const workExperience = getWorkExperience();
  const education = getEducation();
  const certifications = getCertifications();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Professional <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A timeline of my career spanning federal government contracts,
            AI solutions architecture, and full-stack development.
          </p>

          {/* Resume Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 no-print">
            <Button size="lg" className="group" asChild>
              <a href="/nick-wiley-resume.pdf" download>
                <Download className="h-4 w-4" />
                Download Resume (PDF)
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print This Page
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <a
                href="https://linkedin.com/in/nickwiley"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4" />
                View on LinkedIn
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Print Header (hidden on screen, shown on print) */}
        <div className="hidden print:block print:mb-8">
          <h1 className="text-3xl font-bold">Nick Wiley</h1>
          <p className="text-lg text-gray-600">
            Full-Stack Engineer & AI Solutions Architect
          </p>
          <p className="text-sm text-gray-500 mt-1">
            nick@example.com | linkedin.com/in/nickwiley | github.com/nickwiley
          </p>
          <hr className="mt-4" />
        </div>

        {/* Timelines */}
        <div className="space-y-16">
          <Timeline entries={workExperience} title="Work Experience" />
          <Timeline entries={education} title="Education" />
          {certifications.length > 0 && (
            <Timeline entries={certifications} title="Certifications" />
          )}
        </div>

        {/* Professional Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-border bg-card p-8"
        >
          <h2 className="text-2xl font-bold mb-4">Professional Summary</h2>
          <p className="text-muted-foreground leading-relaxed">
            Full-Stack Software Engineer and AI Solutions Architect with experience
            spanning federal government technology projects (IBM Federal — USPS, Census,
            USDA, NSF), nonprofit digital transformation (Lincoln Leadership Institute),
            and independent AI/ML tool development. Specializing in production-grade web
            applications with AI integration, data engineering pipelines, CRM platform
            integration, and cybersecurity analysis tools. Proven ability to deliver
            complex systems across both enterprise and agile environments.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
