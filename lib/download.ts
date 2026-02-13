export function sanitizeFileToken(
  value: string | null | undefined,
  fallback: string
): string {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return normalized || fallback;
}

export function triggerDownload(input: {
  content: BlobPart | BlobPart[];
  mimeType: string;
  filename: string;
}): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const parts = Array.isArray(input.content) ? input.content : [input.content];
    const blob = new Blob(parts, { type: input.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = input.filename;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
