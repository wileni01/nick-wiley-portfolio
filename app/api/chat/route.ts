import { streamText } from "ai";
import { getModel, type AIProvider } from "@/lib/ai";
import { findRelevantContext } from "@/lib/embeddings";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitResult = rateLimit(`chat:${ip}`, {
      maxRequests: 50,
      windowMs: 3600000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000),
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const messages = body.messages || [];
    const provider: AIProvider = body.provider || "openai";

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      lastMessage.content = sanitizeInput(lastMessage.content);
    }

    // Find relevant context from knowledge base
    const context = await findRelevantContext(lastMessage.content);

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
${context}`;

    const model = getModel(provider);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please check that API keys are configured.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
