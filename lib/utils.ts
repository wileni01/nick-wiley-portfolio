import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const BIDI_OVERRIDE_PATTERN = /[\u202A-\u202E\u2066-\u2069]/g;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function sanitizeInput(input: string, maxChars: number = 2000): string {
  const safeMaxChars = Number.isFinite(maxChars)
    ? Math.max(1, Math.floor(maxChars))
    : 2000;
  return input
    .replace(CONTROL_CHARS_PATTERN, "")
    .replace(BIDI_OVERRIDE_PATTERN, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, safeMaxChars);
}
