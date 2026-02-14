const IP_TOKEN_MAX_CHARS = 80;
const SAFE_IP_TOKEN_PATTERN = /[^a-fA-F0-9:.]/g;

function normalizeIpToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
  const bounded = trimmed.slice(0, IP_TOKEN_MAX_CHARS);
  const sanitized = bounded.replace(SAFE_IP_TOKEN_PATTERN, "");
  return sanitized || null;
}

export function getRequestIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstToken = forwarded.split(",")[0];
    const normalized = normalizeIpToken(firstToken);
    if (normalized) return normalized;
  }

  const realIp = normalizeIpToken(req.headers.get("x-real-ip"));
  if (realIp) return realIp;

  return "anonymous";
}
