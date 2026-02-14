import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export type AIProvider = "openai" | "anthropic";
const MIN_API_KEY_CHARS = 10;
const FALLBACK_PROVIDER_BY_PREFERENCE: Record<AIProvider, AIProvider> = {
  openai: "anthropic",
  anthropic: "openai",
};

export interface ResolvedAIProvider {
  requested: AIProvider;
  selected: AIProvider | null;
  didFallback: boolean;
}

function getProviderApiKey(provider: AIProvider): string | null {
  const rawValue =
    provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;
  if (!rawValue) return null;
  const normalized = rawValue.trim();
  return normalized.length >= MIN_API_KEY_CHARS ? normalized : null;
}

export function hasProviderApiKey(provider: AIProvider): boolean {
  return getProviderApiKey(provider) !== null;
}

export function resolveAIProvider(
  requested: AIProvider
): ResolvedAIProvider {
  if (hasProviderApiKey(requested)) {
    return {
      requested,
      selected: requested,
      didFallback: false,
    };
  }

  const fallbackProvider = FALLBACK_PROVIDER_BY_PREFERENCE[requested];
  if (hasProviderApiKey(fallbackProvider)) {
    return {
      requested,
      selected: fallbackProvider,
      didFallback: true,
    };
  }

  return {
    requested,
    selected: null,
    didFallback: false,
  };
}

export function applyResolvedAIProviderHeaders(
  headers: Headers,
  resolution: ResolvedAIProvider
): Headers {
  headers.set("X-AI-Provider-Requested", resolution.requested);
  if (resolution.selected) {
    headers.set("X-AI-Provider", resolution.selected);
    headers.set("X-AI-Provider-Fallback", resolution.didFallback ? "1" : "none");
    return headers;
  }

  headers.set("X-AI-Provider", "none");
  headers.set("X-AI-Provider-Fallback", "none");
  return headers;
}

export function getModel(provider: AIProvider = "openai") {
  switch (provider) {
    case "openai":
      return openai("gpt-4o");
    case "anthropic":
      return anthropic("claude-3-5-sonnet-latest");
    default:
      return openai("gpt-4o");
  }
}

export function getEmbeddingModel() {
  return openai.embedding("text-embedding-3-small");
}
