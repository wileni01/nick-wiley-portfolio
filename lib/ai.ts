import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export type AIProvider = "openai" | "anthropic";

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
