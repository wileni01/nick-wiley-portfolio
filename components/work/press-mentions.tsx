"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  pressMentions,
  getMentionsWithLogos,
  getMentionsByCategory,
  type PressMentionCategory,
} from "@/lib/press-mentions";

const categoryLabels: Record<PressMentionCategory, string> = {
  Media: "Media Coverage",
  Tourism: "Tourism & Listings",
  Academic: "Academic Citations",
  Listings: "App Listings",
};

export function PressMentions() {
  const [expanded, setExpanded] = useState(false);
  const logoMentions = getMentionsWithLogos();
  const grouped = getMentionsByCategory();

  return (
    <section className="mt-14 mb-10">
      {/* Section header */}
      <div className="space-y-2 mb-8">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Press and recognition
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          InSite Gettysburg was covered by travel writers, cited in academic
          research, and listed by official tourism organizations.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-8" />

      {/* "Featured by" label */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
        Featured by
      </p>

      {/* Logo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
        {logoMentions.map((mention) => (
          <a
            key={mention.url}
            href={mention.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center rounded-lg border border-border bg-white p-4 h-20 transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-sm"
            title={mention.name}
          >
            {mention.logo?.endsWith(".svg") ? (
              /* SVGs served as <img> to preserve vector quality */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mention.logo}
                alt={`${mention.name} logo`}
                className="max-h-10 w-auto object-contain grayscale opacity-60 transition-all duration-200 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <Image
                src={mention.logo!}
                alt={`${mention.name} logo`}
                width={140}
                height={40}
                className="max-h-10 w-auto object-contain grayscale opacity-60 transition-all duration-200 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                loading="lazy"
              />
            )}
          </a>
        ))}
      </div>

      {/* Microcopy */}
      <p className="text-[11px] text-muted-foreground/60 mt-4">
        Logos are property of their respective owners.
      </p>

      {/* Expandable "View All Mentions" */}
      <div className="mt-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
          {expanded ? "Hide Mentions" : "View All Mentions"}
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[2000px] opacity-100 mt-5" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-6">
            {(
              Object.entries(grouped) as [
                PressMentionCategory,
                (typeof pressMentions)[number][],
              ][]
            )
              .filter(([, mentions]) => mentions.length > 0)
              .map(([category, mentions]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    {categoryLabels[category]}
                  </h3>
                  <ul className="space-y-1.5">
                    {mentions.map((mention) => (
                      <li key={mention.url}>
                        <a
                          href={mention.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground/80 hover:text-primary transition-colors duration-150 underline underline-offset-2 decoration-border hover:decoration-primary"
                        >
                          {mention.description || mention.name}
                          <span className="text-muted-foreground/50 ml-1.5 no-underline">
                            — {mention.name}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
