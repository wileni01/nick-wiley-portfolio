import { z } from "zod";
import { streamText } from "ai";
import {
  applyResolvedAIProviderHeaders,
  getModel,
  resolveAIProvider,
} from "@/lib/ai";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import { buildApiRequestContext } from "@/lib/api-request-context";
import { findRelevantContext } from "@/lib/embeddings";
import { logServerError, logServerInfo, logServerWarning } from "@/lib/server-error";
import { sanitizeInput } from "@/lib/utils";

export const maxDuration = 30;

const chatRequestSchema = z.object({
  provider: z.enum(["openai", "anthropic"]).optional().default("openai"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(24),
});
const CHAT_RATE_LIMIT = {
  maxRequests: 50,
  windowMs: 3600000,
} as const;
const CHAT_RETRIEVAL_TIMEOUT_MS = 4500;
const CHAT_RETRIEVAL_QUERY_MAX_CHARS = 600;
const NO_CONTEXT_FALLBACK_NOTE =
  "No indexed portfolio context is currently available. Respond cautiously and suggest contacting Nick for unsupported details.";
type ChatContextSource = "none" | "retrieval" | "fallback";
type ChatContextFallbackReason =
  | "none"
  | "invalid_payload"
  | "no_provider"
  | "rate_limited"
  | "retrieval_error"
  | "retrieval_timeout"
  | "empty_context"
  | "internal_error";

class RetrievalTimeoutError extends Error {
  constructor() {
    super("Context retrieval timed out.");
    this.name = "RetrievalTimeoutError";
  }
}

async function withTimeout<T>(input: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      input,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new RetrievalTimeoutError()), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  const context = buildApiRequestContext({
    req,
    rateLimitNamespace: "chat",
    rateLimitConfig: CHAT_RATE_LIMIT,
  });
  const { requestId, responseHeaders, exceededHeaders, rateLimitResult } = context;
  responseHeaders.set("X-AI-Provider-Requested", "unspecified");
  responseHeaders.set("X-AI-Provider", "none");
  responseHeaders.set("X-AI-Provider-Fallback", "none");
  exceededHeaders.set("X-AI-Provider-Requested", "unspecified");
  exceededHeaders.set("X-AI-Provider", "none");
  exceededHeaders.set("X-AI-Provider-Fallback", "none");
  responseHeaders.set("X-Chat-Context-Source", "none");
  responseHeaders.set("X-Chat-Context-Fallback", "invalid_payload");
  exceededHeaders.set("X-Chat-Context-Source", "fallback");
  exceededHeaders.set("X-Chat-Context-Fallback", "rate_limited");
  try {
    if (!rateLimitResult.success) {
      return jsonResponse(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000),
        },
        429,
        exceededHeaders
      );
    }

    const parsed = await parseJsonRequest(req, chatRequestSchema, {
      invalidPayloadMessage: "Messages are required and must be valid chat entries.",
      invalidContentTypeMessage: "Chat requests must use application/json.",
      emptyBodyMessage: "Chat request body is required.",
      maxChars: 120000,
      tooLargeMessage: "Chat payload is too large.",
      responseHeaders,
      allowMissingContentType: false,
    });
    if (!parsed.success) {
      return parsed.response;
    }
    responseHeaders.set("X-Chat-Context-Fallback", "none");

    const providerResolution = resolveAIProvider(parsed.data.provider);
    applyResolvedAIProviderHeaders(responseHeaders, providerResolution);
    const provider = providerResolution.selected;
    if (!provider) {
      responseHeaders.set("X-Chat-Context-Source", "fallback");
      responseHeaders.set("X-Chat-Context-Fallback", "no_provider");
      logServerInfo({
        route: "api/chat",
        requestId,
        message: "No AI provider configured for chat request",
        details: {
          requestedProvider: providerResolution.requested,
        },
      });
      return jsonResponse(
        {
          error:
            "No AI provider key is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
        },
        503,
        responseHeaders
      );
    }

    const messages = parsed.data.messages
      .map((message) => ({
        role: message.role,
        content: sanitizeInput(message.content, 2000),
      }))
      .filter((message) => message.content.length > 0);

    if (!messages.length) {
      responseHeaders.set("X-Chat-Context-Source", "none");
      responseHeaders.set("X-Chat-Context-Fallback", "invalid_payload");
      return jsonResponse(
        { error: "Messages are empty after sanitization." },
        400,
        responseHeaders
      );
    }

    const lastUserMessage = [...messages].reverse().find(
      (message) => message.role === "user"
    );
    if (!lastUserMessage?.content) {
      responseHeaders.set("X-Chat-Context-Source", "none");
      responseHeaders.set("X-Chat-Context-Fallback", "invalid_payload");
      return jsonResponse(
        { error: "At least one user message is required to generate a response." },
        400,
        responseHeaders
      );
    }
    const query = lastUserMessage.content;
    const retrievalQuery = query.slice(0, CHAT_RETRIEVAL_QUERY_MAX_CHARS);

    // Find relevant context from knowledge base (fallback safely if retrieval fails).
    let ragContext = "";
    let contextSource: ChatContextSource = "retrieval";
    let contextFallbackReason: ChatContextFallbackReason = "none";
    try {
      ragContext = sanitizeInput(
        await withTimeout(
          findRelevantContext(retrievalQuery),
          CHAT_RETRIEVAL_TIMEOUT_MS
        ),
        10000
      );
    } catch (error) {
      contextFallbackReason =
        error instanceof RetrievalTimeoutError
          ? "retrieval_timeout"
          : "retrieval_error";
      logServerWarning({
        route: "api/chat",
        requestId,
        message:
          contextFallbackReason === "retrieval_timeout"
            ? "Context retrieval timed out; continuing with model-only response"
            : "Context retrieval failed; continuing with model-only response",
        details: { error, fallbackReason: contextFallbackReason },
      });
      contextSource = "fallback";
    }
    if (!ragContext && contextSource !== "fallback") {
      contextSource = "fallback";
      contextFallbackReason = "empty_context";
      logServerInfo({
        route: "api/chat",
        requestId,
        message:
          "Context retrieval returned empty results; continuing with model-only response",
        details: {
          queryChars: query.length,
          retrievalQueryChars: retrievalQuery.length,
        },
      });
    }
    const effectiveContext = ragContext || NO_CONTEXT_FALLBACK_NOTE;
    responseHeaders.set("X-Chat-Context-Source", contextSource);
    if (contextFallbackReason !== "none") {
      responseHeaders.set("X-Chat-Context-Fallback", contextFallbackReason);
    } else {
      responseHeaders.set("X-Chat-Context-Fallback", "none");
    }

    // System prompt with RAG context
    const systemPrompt = `You are Nick Wiley's AI assistant on his professional portfolio website. You answer questions about Nick's professional experience, skills, projects, and background in a helpful, conversational, and professional tone. You speak in first person as if you are representing Nick directly.

IMPORTANT RULES:
- Only answer questions related to Nick's professional background, skills, projects, education, and career.
- If asked about something not in your knowledge base, politely say you don't have that information and suggest the visitor contact Nick directly.
- Be enthusiastic but professional. You're helping Nick land his next opportunity.
- Keep responses concise (2-4 paragraphs) unless asked for detail.
- When discussing projects, highlight the technologies used and the impact achieved.
- If asked about salary expectations, availability, or personal questions, redirect to the contact page.

NICK'S PROFESSIONAL CONTEXT:
${effectiveContext}`;

    const model = getModel(provider);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.2,
      maxTokens: 500,
    });

    return result.toDataStreamResponse({
      headers: {
        ...Object.fromEntries(responseHeaders.entries()),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    responseHeaders.set("X-Chat-Context-Source", "fallback");
    responseHeaders.set("X-Chat-Context-Fallback", "internal_error");
    logServerError({
      route: "api/chat",
      requestId,
      error,
    });
    return jsonResponse(
      {
        error: "An error occurred processing your request. Please check that API keys are configured.",
      },
      500,
      responseHeaders
    );
  }
}
