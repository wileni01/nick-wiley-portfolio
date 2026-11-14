import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HarborPreview } from "@/components/work/harbor-preview";
import { StartupPreview } from "@/components/work/startup-preview";
import { ProjectStack } from "@/components/work/project-stack";
import type { CaseStudy } from "@/lib/types";

export function CaseStudyCard({
  study,
  preview,
}: {
  study: CaseStudy;
  preview?: "startup" | "harbor";
}) {
  const cover = study.image && (
    <div className={study.imageKind === "illustrative" ? "project-image project-image-illustration" : "project-image"}>
      <Image
        src={study.image}
        alt=""
        fill
        sizes="(min-width: 1120px) 530px, (min-width: 700px) 48vw, 100vw"
        className={study.imageKind === "screenshot" || study.imageKind === "recreation" ? "object-cover object-top" : "object-cover"}
      />
    </div>
  );

  let media = cover;
  if (cover && preview === "startup") media = <StartupPreview compact>{cover}</StartupPreview>;
  if (cover && preview === "harbor") media = <HarborPreview>{cover}</HarborPreview>;

  return (
    <article className="project-card" data-animated={preview ? "true" : undefined}>
      {media}
      <div className="project-info">
        <p className="eyebrow">{study.status ?? study.client}</p>
        <h3>
          <Link href={`/work/${study.slug}`} className="project-link">{study.title}</Link>
          <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />
        </h3>
        <p className="project-summary">{study.summary}</p>
        <ProjectStack stack={study.stack} />
      </div>
    </article>
  );
}
