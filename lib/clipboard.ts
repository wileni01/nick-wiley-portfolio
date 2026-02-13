"use client";

export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (window.navigator?.clipboard?.writeText) {
      await window.navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to legacy copy path.
  }

  if (typeof document === "undefined" || !document.body) return false;

  let textArea: HTMLTextAreaElement | null = null;
  try {
    textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    if (textArea?.parentNode) {
      textArea.parentNode.removeChild(textArea);
    }
  }
}
