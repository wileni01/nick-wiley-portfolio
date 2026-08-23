import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Contact form delivery.
 *
 * Email is sent through Resend when RESEND_API_KEY is configured. Until it
 * is, the route answers 503 so the visitor is told to email directly instead
 * of being shown a success message for a message nobody will receive.
 *
 * Env:
 *   RESEND_API_KEY  – required for delivery
 *   CONTACT_EMAIL   – inbox that receives submissions (defaults to siteConfig.email)
 *   RESEND_FROM     – sender; must be on a domain verified in Resend. Without
 *                     a verified domain, Resend's onboarding sender only
 *                     delivers to the account owner's address.
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || siteConfig.email;
const RESEND_FROM =
  process.env.RESEND_FROM || "Portfolio Contact <onboarding@resend.dev>";

const FALLBACK_MESSAGE = `The contact form isn't connected to email delivery right now. Please email ${CONTACT_EMAIL} directly.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitResult = rateLimit(`contact:${ip}`, {
      maxRequests: 5,
      windowMs: 3600000, // 5 per hour
    });
    if (!rateLimitResult.success) {
      return json(
        { error: "Too many submissions. Please try again later." },
        429
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const { name, email, subject, message, honeypot, turnstileToken } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      honeypot?: string;
      turnstileToken?: string;
    };

    // Honeypot: a filled hidden field means a bot. Pretend it worked.
    if (honeypot) {
      return json({ success: true });
    }

    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return json({ error: "CAPTCHA verification is required." }, 400);
      }
      const valid = await verifyTurnstile(turnstileToken, ip);
      if (!valid) {
        return json(
          { error: "CAPTCHA verification failed. Please try again." },
          403
        );
      }
    }

    if (!name || !email || !message) {
      return json({ error: "Name, email, and message are required." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    const sanitized = {
      name: sanitizeInput(name, 100),
      email: email.trim().slice(0, 254),
      subject: sanitizeInput(subject || "", 200),
      message: sanitizeInput(message, 5000),
    };

    if (!RESEND_API_KEY) {
      console.warn(
        "[contact] RESEND_API_KEY is not set; submission was NOT delivered.",
        { from: sanitized.email, name: sanitized.name }
      );
      return json(
        { error: FALLBACK_MESSAGE, fallbackEmail: CONTACT_EMAIL, undelivered: true },
        503
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [CONTACT_EMAIL],
      replyTo: sanitized.email,
      subject: `Portfolio contact: ${sanitized.subject || sanitized.name}`,
      text: [
        `From: ${sanitized.name} <${sanitized.email}>`,
        `Subject: ${sanitized.subject || "(none)"}`,
        `IP: ${ip}`,
        "",
        sanitized.message,
      ].join("\n"),
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return json(
        {
          error: `Sending failed. Please email ${CONTACT_EMAIL} directly.`,
          fallbackEmail: CONTACT_EMAIL,
          undelivered: true,
        },
        502
      );
    }

    return json({
      success: true,
      message: "Thank you! Your message has been received.",
    });
  } catch (error) {
    console.error("[contact] Unexpected error:", error);
    return json(
      {
        error: `An error occurred. Please email ${CONTACT_EMAIL} directly.`,
        fallbackEmail: CONTACT_EMAIL,
        undelivered: true,
      },
      500
    );
  }
}
