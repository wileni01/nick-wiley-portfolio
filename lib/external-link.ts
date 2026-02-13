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
  openedIndexes: number[];
} {
  let opened = 0;
  const openedIndexes: number[] = [];
  let attempted = 0;

  urls.forEach((url, index) => {
    const didOpen = openExternalUrl(url);
    attempted += 1;
    if (didOpen) {
      opened += 1;
      openedIndexes.push(index);
    }
  });

  return { attempted, opened, openedIndexes };
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
