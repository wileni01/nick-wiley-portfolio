import { z } from "zod";
import { jsonResponse, parseJsonRequest } from "@/lib/api-http";
import { deliverContactSubmission } from "@/lib/contact-delivery";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { sanitizeInput } from "@/lib/utils";

const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  honeypot: z.string().max(200).optional().default(""),
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getRequestIp(req);

    const rateLimitResult = rateLimit(`contact:${ip}`, {
      maxRequests: 5,
      windowMs: 3600000, // 5 per hour
    });

    if (!rateLimitResult.success) {
      return jsonResponse(
        {
          error: "Too many submissions. Please try again later.",
        },
        429
      );
    }

    const parsedBody = await parseJsonRequest(req, contactRequestSchema, {
      invalidPayloadMessage: "Please provide valid name, email, and message.",
      maxChars: 12000,
      tooLargeMessage: "Contact form payload is too large.",
    });
    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const { name, email, subject, message, honeypot } = parsedBody.data;

    // Honeypot check — if filled, it's a bot
    if (honeypot) {
      // Return success to not tip off bots
      return jsonResponse({ success: true }, 200);
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
        400
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
        502
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Thank you! Your message has been received.",
      },
      200
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return jsonResponse({ error: "An error occurred. Please try again." }, 500);
  }
}
