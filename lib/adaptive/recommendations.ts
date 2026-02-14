import { getPortfolioAssets } from "./portfolio-index";
import {
  companyProfiles,
  getCompanyProfileById,
  getPersonaById,
} from "./profiles";
import type {
  CompanyId,
  RecommendationBundle,
  PersonaProfile,
  RankedRecommendation,
} from "./types";

const tagAliases: Record<string, string> = {
  "responsible ai": "responsible-ai",
  "human in the loop": "human-in-the-loop",
  "decision support": "decision-support",
  "ai safety": "ai-safety",
  "change management": "change-management",
  "enterprise delivery": "enterprise-delivery",
  "program delivery": "program-delivery",
  "stakeholder alignment": "stakeholder-alignment",
};

function normalizeTag(tag: string): string {
  const normalized = tag.trim().toLowerCase().replace(/_/g, "-");
  return tagAliases[normalized] ?? normalized;
}

function buildWeightMap(persona: PersonaProfile, companyTags: string[]) {
  const weightMap = new Map<string, number>();

  for (const tag of companyTags) {
    const key = normalizeTag(tag);
    weightMap.set(key, (weightMap.get(key) ?? 0) + 1.8);
  }

  for (const tag of persona.focusTags) {
    const key = normalizeTag(tag);
    weightMap.set(key, (weightMap.get(key) ?? 0) + 2.8);
  }

  return weightMap;
}

function buildReason(matchedTags: string[], summary: string): string {
  if (!matchedTags.length) {
    return summary;
  }

  const [first, second] = matchedTags;
  if (second) {
    return `Strong overlap on ${first} and ${second}. ${summary}`;
  }

  return `Strong overlap on ${first}. ${summary}`;
}

function rankForPersona(
  companyId: CompanyId,
  personaId: string
): RankedRecommendation[] {
  const company = getCompanyProfileById(companyId);
  const persona = getPersonaById(companyId, personaId);

  if (!company || !persona) return [];

  const weightMap = buildWeightMap(persona, company.priorityTags);

  return getPortfolioAssets()
    .map((asset) => {
      const normalizedTags = asset.tags.map(normalizeTag);
      const matchedTags = normalizedTags.filter((tag) => weightMap.has(tag));

      let score = matchedTags.reduce(
        (acc, tag) => acc + (weightMap.get(tag) ?? 0),
        0
      );

      if (matchedTags.length > 0) {
        score += 0.4;
      }

      const typeWeight = persona.assetTypeWeights?.[asset.kind] ?? 1;
      score *= typeWeight;

      return {
        asset,
        score: Number(score.toFixed(3)),
        matchedTags,
        reason: buildReason(matchedTags, asset.summary),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function pickDiverse(
  ranked: RankedRecommendation[],
  limit: number
): RankedRecommendation[] {
  const selected: RankedRecommendation[] = [];
  const perKindLimit = new Map<string, number>();

  for (const entry of ranked) {
    const current = perKindLimit.get(entry.asset.kind) ?? 0;
    if (current >= 2) continue;

    selected.push(entry);
    perKindLimit.set(entry.asset.kind, current + 1);
    if (selected.length >= limit) break;
  }

  return selected;
}

function buildHighlights(bundle: {
  companyName: string;
  personaName: string;
  personaRole: string;
  recommendations: RankedRecommendation[];
}): string[] {
  const top = bundle.recommendations.slice(0, 3);
  const topTitle = top[0]?.asset.title ?? "applied AI case studies";
  const tags = [
    ...new Set(top.flatMap((r) => r.matchedTags).slice(0, 4)),
  ];
  const tagPhrase = tags.length > 1 ? tags.slice(0, 3).join(", ") : "your priority areas";
  return [
    `Nick's work on ${topTitle} maps directly to ${bundle.companyName}'s focus on ${tagPhrase}.`,
    `His background combines hands-on delivery with governance and human-in-the-loop design — key for a ${bundle.personaRole} perspective.`,
    `Explore the highlighted projects below to see production examples of the skills ${bundle.companyName} values most.`,
  ];
}

export function getRecommendationBundle(
  companyId: CompanyId,
  personaId: string
): RecommendationBundle | null {
  const company = getCompanyProfileById(companyId);
  const persona = getPersonaById(companyId, personaId);

  if (!company || !persona) return null;

  const ranked = rankForPersona(companyId, personaId);
  const topRecommendations = pickDiverse(ranked, 5);
  const supportingRecommendations = ranked
    .filter(
      (candidate) =>
        !topRecommendations.some(
          (topRecommendation) => topRecommendation.asset.id === candidate.asset.id
        )
    )
    .slice(0, 4);

  return {
    company,
    persona,
    topRecommendations,
    supportingRecommendations,
    highlights: buildHighlights({
      companyName: company.name,
      personaName: persona.name,
      personaRole: persona.role,
      recommendations: topRecommendations,
    }),
  };
}

export function buildVisitorNarrative(
  companyId: CompanyId,
  personaId: string
): string {
  const bundle = getRecommendationBundle(companyId, personaId);
  if (!bundle) {
    return "Select a company and perspective to see a tailored view of this portfolio.";
  }

  const topTitles = bundle.topRecommendations
    .slice(0, 3)
    .map((recommendation) => recommendation.asset.title)
    .join(", ");

  return `Tailored for ${bundle.company.name}: ${bundle.persona.recommendationGoal} Start with: ${topTitles}.`;
}

export const supportedCompanyIds = companyProfiles.map((company) => company.id);
