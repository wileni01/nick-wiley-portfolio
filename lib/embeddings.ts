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

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initializeVectorStore(): Promise<void> {
  if (isInitialized) return;

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
}

export async function findRelevantContext(
  query: string,
  topK: number = 5
): Promise<string> {
  // If no API key, return the full knowledge base as context
  if (!process.env.OPENAI_API_KEY) {
    return knowledgeBase.map((e) => e.content).join("\n\n");
  }

  try {
    await initializeVectorStore();

    const model = getEmbeddingModel();
    const { embedding: queryEmbedding } = await embed({
      model,
      value: query,
    });

    // Find most similar entries
    const scored = vectorStore
      .map((item) => ({
        entry: item.entry,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((s) => s.entry.content).join("\n\n");
  } catch {
    // Fallback: return all knowledge base content
    return knowledgeBase.map((e) => e.content).join("\n\n");
  }
}
