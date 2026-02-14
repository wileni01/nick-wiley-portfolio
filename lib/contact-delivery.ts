interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactDeliveryResult {
  attempted: boolean;
  delivered: boolean;
  error?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const CONTACT_DELIVERY_TIMEOUT_MS = 8000;
const DEFAULT_CONTACT_FROM = "Portfolio Contact <onboarding@resend.dev>";
const LOG_ERROR_BODY_MAX_CHARS = 500;
const MIN_RESEND_API_KEY_CHARS = 10;
const EMAIL_VALUE_MAX_CHARS = 320;
const SUBJECT_VALUE_MAX_CHARS = 200;
const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const BIDI_OVERRIDE_PATTERN = /[\u202A-\u202E\u2066-\u2069]/g;
const EMAIL_REDACTION_PATTERN =
  /[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,63}/gi;
const SIMPLE_EMAIL_PATTERN =
  /^[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,63}$/i;
const FORMATTED_EMAIL_PATTERN =
  /^([^<>\r\n]{1,120})<\s*([A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,63})\s*>$/i;

function sanitizeInlineValue(
  value: string,
  maxChars: number = EMAIL_VALUE_MAX_CHARS
): string {
  return value
    .replace(CONTROL_CHARS_PATTERN, "")
    .replace(BIDI_OVERRIDE_PATTERN, "")
    .replace(/[\r\n\t]/g, " ")
    .trim()
    .slice(0, maxChars);
}

function normalizeSubject(value: string): string {
  const normalized = sanitizeInlineValue(value)
    .replace(/\s+/g, " ")
    .slice(0, SUBJECT_VALUE_MAX_CHARS);
  return normalized || "New message";
}

function isSimpleEmail(value: string): boolean {
  return SIMPLE_EMAIL_PATTERN.test(value);
}

function normalizeFromAddress(value: string): string {
  const sanitized = sanitizeInlineValue(value);
  if (isSimpleEmail(sanitized)) return sanitized;
  const formattedMatch = sanitized.match(FORMATTED_EMAIL_PATTERN);
  if (!formattedMatch) return DEFAULT_CONTACT_FROM;
  const displayName = sanitizeInlineValue(formattedMatch[1] ?? "").slice(0, 120);
  const email = sanitizeInlineValue(formattedMatch[2] ?? "");
  if (!displayName || !isSimpleEmail(email)) return DEFAULT_CONTACT_FROM;
  return `${displayName} <${email}>`;
}

function redactEmails(value: string): string {
  return value.replace(EMAIL_REDACTION_PATTERN, (email) => {
    const [localPart, domain = ""] = email.split("@");
    const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
    return `${visiblePrefix}***@${domain}`;
  });
}

async function readResponseTextSafely(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function isAbortLikeError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function getContactDeliveryConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toEmail = sanitizeInlineValue(process.env.CONTACT_EMAIL ?? "");
  const fromEmail = normalizeFromAddress(
    process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_CONTACT_FROM
  );
  if (
    !apiKey ||
    apiKey.length < MIN_RESEND_API_KEY_CHARS ||
    !toEmail ||
    !isSimpleEmail(toEmail)
  ) {
    return null;
  }
  return { apiKey, toEmail, fromEmail };
}

function buildEmailText(input: ContactSubmission): string {
  return `New portfolio contact form submission

From: ${input.name} <${input.email}>
Subject: ${input.subject || "(none)"}

Message:
${input.message}`;
}

export async function deliverContactSubmission(
  submission: ContactSubmission
): Promise<ContactDeliveryResult> {
  const config = getContactDeliveryConfig();
  if (!config) {
    return { attempted: false, delivered: false };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONTACT_DELIVERY_TIMEOUT_MS);
  const safeReplyTo = sanitizeInlineValue(submission.email);
  const safeSubject = normalizeSubject(submission.subject);
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [config.toEmail],
        subject: `Portfolio Contact: ${safeSubject}`,
        ...(isSimpleEmail(safeReplyTo) ? { reply_to: safeReplyTo } : {}),
        text: buildEmailText(submission),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = sanitizeInlineValue(
        redactEmails((await readResponseTextSafely(response))),
        LOG_ERROR_BODY_MAX_CHARS
      );
      return {
        attempted: true,
        delivered: false,
        error: `Resend delivery failed (${response.status}): ${errorBody || "unknown error"}`,
      };
    }

    return { attempted: true, delivered: true };
  } catch (error) {
    const message = isAbortLikeError(error)
      ? `Resend request timed out after ${CONTACT_DELIVERY_TIMEOUT_MS}ms`
      : error instanceof Error
        ? sanitizeInlineValue(
            redactEmails(error.message),
            LOG_ERROR_BODY_MAX_CHARS
          ) || "unknown delivery error"
        : "unknown delivery error";
    return {
      attempted: true,
      delivered: false,
      error: `Resend request error: ${message}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
