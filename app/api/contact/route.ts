import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY!,
          response: token,
          remoteip: ip,
        }),
      }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
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
      return new Response(
        JSON.stringify({
          error: "Too many submissions. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { name, email, subject, message, honeypot, turnstileToken } = body;

    // Honeypot check — if filled, it's a bot
    if (honeypot) {
      // Return success to not tip off bots
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cloudflare Turnstile verification (when secret key is configured)
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification is required." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const turnstileValid = await verifyTurnstile(turnstileToken, ip);
      if (!turnstileValid) {
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification failed. Please try again." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitized = {
      name: sanitizeInput(name).slice(0, 100),
      email: email.trim().slice(0, 254),
      subject: sanitizeInput(subject || "").slice(0, 200),
      message: sanitizeInput(message).slice(0, 5000),
    };

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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! Your message has been received.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
