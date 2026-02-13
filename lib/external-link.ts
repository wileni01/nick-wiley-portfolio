export function openExternalUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return false;
  const opened = window.open(normalized, "_blank", "noopener,noreferrer");
  return Boolean(opened);
}

export function openExternalUrls(urls: string[]): {
  attempted: number;
  opened: number;
  openedUrls: string[];
} {
  let opened = 0;
  const openedUrls: string[] = [];
  let attempted = 0;

  urls.forEach((url) => {
    const didOpen = openExternalUrl(url);
    attempted += 1;
    if (didOpen) {
      opened += 1;
      openedUrls.push(url);
    }
  });

  return { attempted, opened, openedUrls };
}

function normalizeExternalUrl(url: string): string | null {
  try {
    const normalized = new URL(url, window.location.origin);
    if (normalized.protocol !== "http:" && normalized.protocol !== "https:") {
      return null;
    }
    return normalized.toString();
  } catch {
    return null;
  }
}
