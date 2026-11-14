import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeActions } from "@/components/resume/resume-actions";
import resume from "@/lib/resume.json";
import { mailtoUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Nicholas A. Wiley, Lead IT Architect at Boston Consulting Group. Experience, education, and patents.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <article className="article-shell page-space resume-document">
      <div className="no-print flex items-center justify-end gap-2 mb-6">
        <ResumeActions />
        <Button asChild size="sm">
          <a href={siteConfig.resumePdf} download><Download size={16} aria-hidden="true" /> Download PDF</a>
        </Button>
      </div>
      <header className="page-heading border-b border-border pb-4 mb-5 print:mb-3">
        <h1>{siteConfig.fullName}</h1>
        <p className="resume-contact mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{siteConfig.location}</span>
          <a href={mailtoUrl()}>{siteConfig.email}</a>
          <a href={siteConfig.linkedin}>LinkedIn</a>
          <a className="hidden print:inline" href={siteConfig.url}>nickwiley.ai</a>
        </p>
      </header>

      <p className="leading-relaxed">{resume.summary}</p>

      <section className="mt-7" aria-labelledby="experience">
        <h2 id="experience" className="resume-heading">Experience</h2>
        {resume.experience.map((job) => (
          <div className="resume-job mb-5" key={job.organization}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 className="font-bold">{job.organization}</h3>
              {job.dates && <span className="text-sm text-muted-foreground print:text-xs">{job.dates}</span>}
            </div>
            <p className="text-sm text-muted-foreground">{job.role}</p>
            {job.bullets.length > 0 && (
              <ul className="mt-1.5 list-disc pl-4 text-sm leading-relaxed">
                {job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="mt-7" aria-labelledby="education">
        <h2 id="education" className="resume-heading">Education and training</h2>
        <ul className="space-y-1 text-sm">{[...resume.education, ...resume.training].map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="mt-7" aria-labelledby="patents">
        <h2 id="patents" className="resume-heading">Patents</h2>
        <p className="text-sm">Co-inventor of a folding shade case for portable devices. U.S. patents{" "}
          <a className="underline underline-offset-2" href={resume.patents[0].url}>{resume.patents[0].number}</a>{" and "}
          <a className="underline underline-offset-2" href={resume.patents[1].url}>{resume.patents[1].number}</a>.
        </p>
      </section>
    </article>
  );
}
