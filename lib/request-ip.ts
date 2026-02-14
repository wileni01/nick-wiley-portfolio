import { isIP } from "node:net";

const IP_TOKEN_MAX_CHARS = 80;
const SAFE_IP_TOKEN_PATTERN = /^[a-fA-F0-9:.]+$/;
const FORWARDED_FOR_PATTERN = /for=(?:"?\[?([^\];",]+)\]?"?)/i;
const BRACKETED_IP_PATTERN = /^\[([^[\]]+)\](?::\d+)?$/;
const IPV4_WITH_PORT_PATTERN = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/;
const DIRECT_IP_HEADER_CANDIDATES = [
  "cf-connecting-ip",
  "fly-client-ip",
  "true-client-ip",
  "x-client-ip",
  "x-real-ip",
] as const;

function normalizeIpToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/^"|"$/g, "");
  if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
  const bracketedMatch = trimmed.match(BRACKETED_IP_PATTERN);
  const withoutBrackets = bracketedMatch ? bracketedMatch[1] : trimmed;
  const ipv4WithPortMatch = withoutBrackets.match(IPV4_WITH_PORT_PATTERN);
  const withoutPort = ipv4WithPortMatch ? ipv4WithPortMatch[1] : withoutBrackets;
  const withoutZoneId = withoutPort.split("%")[0] ?? withoutPort;
  if (withoutZoneId.length > IP_TOKEN_MAX_CHARS) return null;
  if (!SAFE_IP_TOKEN_PATTERN.test(withoutZoneId)) return null;
  const normalized = withoutZoneId.toLowerCase();
  return isIP(normalized) > 0 ? normalized : null;
}

function getForwardedHeaderIp(forwardedHeader: string | null): string | null {
  if (!forwardedHeader) return null;
  for (const segment of forwardedHeader.split(",")) {
    const match = segment.match(FORWARDED_FOR_PATTERN);
    if (!match) continue;
    const normalized = normalizeIpToken(match[1]);
    if (normalized) return normalized;
  }
  return null;
}

function getDirectHeaderIp(req: Request): string | null {
  for (const headerName of DIRECT_IP_HEADER_CANDIDATES) {
    const normalized = normalizeIpToken(req.headers.get(headerName));
    if (normalized) return normalized;
  }
  return null;
}

export function getRequestIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    for (const token of forwarded.split(",")) {
      const normalized = normalizeIpToken(token);
      if (normalized) return normalized;
    }
  }

  const standardizedForwardedIp = getForwardedHeaderIp(req.headers.get("forwarded"));
  if (standardizedForwardedIp) return standardizedForwardedIp;

  const directHeaderIp = getDirectHeaderIp(req);
  if (directHeaderIp) return directHeaderIp;

  return "anonymous";
}
