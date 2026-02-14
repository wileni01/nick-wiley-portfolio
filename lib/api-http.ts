import { z } from "zod";

export interface ParseJsonRequestOptions {
  invalidJsonMessage?: string;
  invalidPayloadMessage?: string;
  maxChars?: number;
  tooLargeMessage?: string;
}

type ParseJsonRequestResult<TSchema extends z.ZodTypeAny> =
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: Response };

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit
): Response {
  const responseHeaders = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (headers) {
    const customHeaders = new Headers(headers);
    customHeaders.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
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
  const tooLargeMessage =
    options?.tooLargeMessage ?? "Request payload is too large.";
  const maxChars = Number.isFinite(options?.maxChars)
    ? Math.max(1, Math.floor(options?.maxChars ?? 0))
    : null;

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: invalidJsonMessage }, 400),
    };
  }
  if (maxChars !== null && rawText.length > maxChars) {
    return {
      success: false,
      response: jsonResponse({ error: tooLargeMessage }, 413),
    };
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(rawText) as unknown;
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
