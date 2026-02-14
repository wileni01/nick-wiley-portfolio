import { embed } from "ai";
import { getEmbeddingModel } from "./ai";
import { knowledgeBase, type KnowledgeEntry } from "@/content/knowledge-base";

interface EmbeddedEntry {
  entry: KnowledgeEntry;
  embedding: number[];
}

// In-memory vector store (sufficient for portfolio-scale data)
let vectorStore: EmbeddedEntry[] = [];
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let lastInitializationFailureAt = 0;
const VECTOR_INIT_RETRY_COOLDOWN_MS = 30000;
const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 10;

function normalizeTopK(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TOP_K;
  return Math.max(1, Math.min(MAX_TOP_K, Math.floor(value)));
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  const dimensions = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < dimensions; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initializeVectorStore(): Promise<void> {
  if (isInitialized) return;
  const now = Date.now();
  if (
    lastInitializationFailureAt > 0 &&
    now - lastInitializationFailureAt < VECTOR_INIT_RETRY_COOLDOWN_MS
  ) {
    throw new Error("Vector store initialization cooldown active.");
  }
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const model = getEmbeddingModel();

    // Embed all knowledge base entries
    const embeddings = await Promise.all(
      knowledgeBase.map(async (entry) => {
        const { embedding } = await embed({
          model,
          value: entry.content,
        });
        return { entry, embedding };
      })
    );

    vectorStore = embeddings;
    isInitialized = true;
    lastInitializationFailureAt = 0;
  })();

  try {
    await initializationPromise;
  } catch (error) {
    lastInitializationFailureAt = Date.now();
    throw error;
  } finally {
    initializationPromise = null;
  }
}

export async function findRelevantContext(
  query: string,
  topK: number = DEFAULT_TOP_K
): Promise<string> {
  const safeTopK = normalizeTopK(topK);
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return knowledgeBase
      .slice(0, safeTopK)
      .map((entry) => entry.content)
      .join("\n\n");
  }

  // If no API key, return the full knowledge base as context
  if (!process.env.OPENAI_API_KEY) {
    return knowledgeBase
      .slice(0, safeTopK)
      .map((entry) => entry.content)
      .join("\n\n");
  }

  try {
    await initializeVectorStore();

    const model = getEmbeddingModel();
    const { embedding: queryEmbedding } = await embed({
      model,
      value: normalizedQuery,
    });

    // Find most similar entries
    const scored = vectorStore
      .map((item) => ({
        entry: item.entry,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, safeTopK);

    return scored.map((s) => s.entry.content).join("\n\n");
  } catch {
    // Fallback: return a bounded deterministic subset of knowledge base content.
    return knowledgeBase
      .slice(0, safeTopK)
      .map((entry) => entry.content)
      .join("\n\n");
  }
}
