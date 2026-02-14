import { z } from "zod";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import {
  buildApiResponseHeaders,
} from "@/lib/api-rate-limit";
import { deliverContactSubmission } from "@/lib/contact-delivery";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createRequestId } from "@/lib/request-id";
import { sanitizeInput } from "@/lib/utils";

const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  honeypot: z.string().max(200).optional().default(""),
});
const CONTACT_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 3600000,
} as const;

export async function POST(req: Request) {
  const requestId = createRequestId();
  let responseHeaders = new Headers({ "X-Request-Id": requestId });
  try {
    // Rate limiting
    const ip = getRequestIp(req);

    const rateLimitResult = rateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT);
    responseHeaders = buildApiResponseHeaders({
      config: CONTACT_RATE_LIMIT,
      snapshot: rateLimitResult,
      requestId,
    });

    if (!rateLimitResult.success) {
      return jsonResponse(
        {
          error: "Too many submissions. Please try again later.",
        },
        429,
        buildApiResponseHeaders({
          config: CONTACT_RATE_LIMIT,
          snapshot: rateLimitResult,
          requestId,
          includeRetryAfter: true,
        })
      );
    }

    const parsedBody = await parseJsonRequest(req, contactRequestSchema, {
      invalidPayloadMessage: "Please provide valid name, email, and message.",
      invalidContentTypeMessage: "Contact form requests must use application/json.",
      maxChars: 12000,
      tooLargeMessage: "Contact form payload is too large.",
      responseHeaders,
      allowMissingContentType: false,
    });
    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const { name, email, subject, message, honeypot } = parsedBody.data;

    // Honeypot check — if filled, it's a bot
    if (honeypot) {
      // Return success to not tip off bots
      return jsonResponse({ success: true }, 200, responseHeaders);
    }

    // Sanitize inputs
    const sanitized = {
      name: sanitizeInput(name, 100),
      email: email.trim().slice(0, 254),
      subject: sanitizeInput(subject, 200),
      message: sanitizeInput(message, 5000),
    };
    if (!sanitized.name || !sanitized.email || !sanitized.message) {
      return jsonResponse(
        { error: "Name, email, and message are required." },
        400,
        responseHeaders
      );
    }

    // Log the submission (in production, send email via Resend, SendGrid, etc.)
    console.log("=== NEW CONTACT FORM SUBMISSION ===");
    console.log(`From: ${sanitized.name} <${sanitized.email}>`);
    console.log(`Subject: ${sanitized.subject || "(none)"}`);
    console.log(`Message: ${sanitized.message}`);
    console.log("===================================");

    const delivery = await deliverContactSubmission(sanitized);
    if (delivery.attempted && !delivery.delivered) {
      console.error("Contact form delivery error:", delivery.error);
      return jsonResponse(
        {
          error:
            "Your message could not be delivered right now. Please try again shortly.",
        },
        502,
        responseHeaders
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Thank you! Your message has been received.",
      },
      200,
      responseHeaders
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return jsonResponse(
      { error: "An error occurred. Please try again." },
      500,
      responseHeaders
    );
  }
}
