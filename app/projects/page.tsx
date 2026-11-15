import type { Metadata } from "next";
import { ProjectStack } from "@/components/work/project-stack";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "More projects",
  description: "Additional client builds and independent prototypes by Nick Wiley.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="article-shell page-space">
      <Link href="/work" className="text-link"><ArrowLeft size={15} aria-hidden="true" /> All work</Link>
      <header className="page-heading case-heading"><h1>More projects</h1></header>
      <ul className="work-list">
        {products.map((project) => (
          <li key={project.title}>
            {project.image && (
              <div className="project-image mt-4">
                <Image src={project.image} alt={`Screenshot of ${project.title}`} fill sizes="(min-width: 880px) 800px, 100vw" className="object-cover object-top" />
              </div>
            )}
            <div className="work-list-link">
              <div>
                <p className="eyebrow">{project.label}</p>
                <h2>{project.url ? <Link className="hover:underline underline-offset-4" href={project.url}>{project.title}</Link> : project.title}</h2>
                <p>{project.summary}</p>
                <ProjectStack languages={project.languages} stack={project.stack} />
                {project.assistantNote && <p className="project-method">{project.assistantNote}</p>}
              </div>
              {project.url && <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
