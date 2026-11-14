import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/lib/types";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="project-card">
      <Link href={`/work/${study.slug}`} className="project-link">
        {study.image && (
          <div className={study.imageKind === "illustrative" ? "project-image project-image-illustration" : "project-image"}>
            <Image
              src={study.image}
              alt=""
              fill
              sizes="(min-width: 1120px) 530px, (min-width: 700px) 48vw, 100vw"
              className={study.imageKind === "screenshot" || study.imageKind === "recreation" ? "object-cover object-top" : "object-cover"}
            />
          </div>
        )}
        <div className="project-info">
          <p className="eyebrow">{study.status ?? study.client}</p>
          <h3>{study.title}<ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" /></h3>
          <p className="project-summary">{study.summary}</p>
        </div>
      </Link>
    </article>
  );
}
