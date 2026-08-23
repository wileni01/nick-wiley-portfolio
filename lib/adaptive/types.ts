export type CompanyId = "kungfu-ai" | "anthropic" | "bcg";

export type AssetKind = "work" | "writing" | "project" | "resume" | "page";

export interface CompanyThemeTokens {
  primary: string;
  accent: string;
  ring: string;
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
}

export interface CompanyTheme {
  light: CompanyThemeTokens;
  dark: CompanyThemeTokens;
}

export interface PersonaProfile {
  id: string;
  name: string;
  role: string;
  focusTags: string[];
  recommendationGoal: string;
  focusPresets?: string[];
  assetTypeWeights?: Partial<Record<AssetKind, number>>;
}

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  website: string;
  summary: string;
  priorityTags: string[];
  personas: PersonaProfile[];
  theme: CompanyTheme;
  sources: string[];
}

export interface PortfolioAsset {
  id: string;
  title: string;
  url: string;
  kind: AssetKind;
  summary: string;
  tags: string[];
}

export interface RankedRecommendation {
  asset: PortfolioAsset;
  score: number;
  matchedTags: string[];
  reason: string;
}

export interface RecommendationBundle {
  company: CompanyProfile;
  persona: PersonaProfile;
  topRecommendations: RankedRecommendation[];
  supportingRecommendations: RankedRecommendation[];
  highlights: string[];
}
