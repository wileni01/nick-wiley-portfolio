"use client";

import { useEffect } from "react";
import { useAdaptive } from "./adaptive-provider";

/**
 * Applies company-specific theme tokens as CSS custom properties on <html>.
 * Reverts to defaults when adaptive mode is deactivated.
 */
export function AdaptiveTheme() {
  const { isActive, company } = useAdaptive();

  useEffect(() => {
    const root = document.documentElement;

    if (!isActive || !company) {
      // Remove any adaptive overrides
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-accent");
      root.style.removeProperty("--color-ring");
      return;
    }

    const isDark = root.classList.contains("dark");
    const tokens = isDark ? company.theme.dark : company.theme.light;

    root.style.setProperty("--color-primary", tokens.primary);
    root.style.setProperty("--color-accent", tokens.accent);
    root.style.setProperty("--color-ring", tokens.ring);

    // Observe theme changes to update tokens
    const observer = new MutationObserver(() => {
      const nowDark = root.classList.contains("dark");
      const t = nowDark ? company.theme.dark : company.theme.light;
      root.style.setProperty("--color-primary", t.primary);
      root.style.setProperty("--color-accent", t.accent);
      root.style.setProperty("--color-ring", t.ring);
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-accent");
      root.style.removeProperty("--color-ring");
    };
  }, [isActive, company]);

  return null;
}
