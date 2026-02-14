import { z } from "zod";

export interface ParseJsonRequestOptions {
  invalidJsonMessage?: string;
  invalidPayloadMessage?: string;
}

type ParseJsonRequestResult<TSchema extends z.ZodTypeAny> =
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: Response };

export function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  req: Request,
  schema: TSchema,
  options?: ParseJsonRequestOptions
): Promise<ParseJsonRequestResult<TSchema>> {
  const invalidJsonMessage = options?.invalidJsonMessage ?? "Invalid JSON payload.";
  const invalidPayloadMessage =
    options?.invalidPayloadMessage ?? "Invalid request payload.";

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400),
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      success: false,
      response: jsonResponse({ error: invalidPayloadMessage }, 400),
    };
  }

  return { success: true, data: parsed.data };
}
