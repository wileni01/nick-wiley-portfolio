import { z } from "zod";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import { buildApiRequestContext } from "@/lib/api-request-context";
import { deliverContactSubmission } from "@/lib/contact-delivery";
import { logServerError, logServerInfo, logServerWarning } from "@/lib/server-error";
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

function redactEmail(email: string): string {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart) return `***@${domain}`.replace(/^@\*+/, "***");
  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
  return `${visiblePrefix}***@${domain}`.slice(0, 254);
}

export async function POST(req: Request) {
  const context = buildApiRequestContext({
    req,
    rateLimitNamespace: "contact",
    rateLimitConfig: CONTACT_RATE_LIMIT,
  });
  const { requestId, responseHeaders, exceededHeaders, rateLimitResult } = context;
  try {
    if (!rateLimitResult.success) {
      return jsonResponse(
        {
          error: "Too many submissions. Please try again later.",
        },
        429,
        exceededHeaders
      );
    }

    const parsedBody = await parseJsonRequest(req, contactRequestSchema, {
      invalidPayloadMessage: "Please provide valid name, email, and message.",
      invalidContentTypeMessage: "Contact form requests must use application/json.",
      emptyBodyMessage: "Contact form payload is required.",
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
      responseHeaders.set("X-Contact-Delivery", "skipped");
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

    // Log metadata only (avoid full user-message content in logs).
    logServerInfo({
      route: "api/contact",
      requestId,
      message: "Contact form submission received",
      details: {
        fromEmail: redactEmail(sanitized.email),
        subjectChars: sanitized.subject.length,
        messageChars: sanitized.message.length,
      },
    });

    const delivery = await deliverContactSubmission(sanitized);
    if (!delivery.attempted) {
      responseHeaders.set("X-Contact-Delivery", "skipped");
    } else if (delivery.delivered) {
      responseHeaders.set("X-Contact-Delivery", "delivered");
    } else {
      responseHeaders.set("X-Contact-Delivery", "error");
    }
    if (delivery.attempted && !delivery.delivered) {
      logServerWarning({
        route: "api/contact",
        requestId,
        message: "Contact delivery failed",
        details: {
          deliveryError: delivery.error ?? "unknown delivery error",
        },
      });
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
    logServerError({
      route: "api/contact",
      requestId,
      error,
    });
    return jsonResponse(
      { error: "An error occurred. Please try again." },
      500,
      responseHeaders
    );
  }
}
