import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  honeypot: z.string().max(200).optional().default(""),
});

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

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

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON payload." }, 400);
    }
    const parsedBody = contactRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return jsonResponse(
        { error: "Please provide valid name, email, and message." },
        400
      );
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

    // TODO: Integrate with Resend or SendGrid for email delivery
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'portfolio@nickwiley.dev',
    //   to: process.env.CONTACT_EMAIL,
    //   subject: `Portfolio Contact: ${sanitized.subject}`,
    //   text: `From: ${sanitized.name} (${sanitized.email})\n\n${sanitized.message}`,
    // });

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
