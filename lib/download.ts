const DOWNLOAD_URL_REVOKE_DELAY_MS = 2000;
const DOWNLOAD_FILENAME_MAX_CHARS = 140;

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

function sanitizeDownloadFilename(filename: string): string {
  const normalized = filename
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, DOWNLOAD_FILENAME_MAX_CHARS);
  return normalized || "download.txt";
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
    const safeFilename = sanitizeDownloadFilename(input.filename);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, DOWNLOAD_URL_REVOKE_DELAY_MS);
    return true;
  } catch {
    return false;
  }
}
