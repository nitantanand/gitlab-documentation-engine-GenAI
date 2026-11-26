"use client";

import { useEffect } from "react";
import { applyTheme, hasStoredTheme } from "@/lib/theme";

/*
 * Global, UI-only effects (renders nothing):
 *  - cursor spotlight on .card elements (sets --mx / --my CSS vars)
 *  - follows OS light/dark changes while the user has no saved preference
 */
export default function UIEffects() {
  useEffect(() => {
    const onPointerMove = (event) => {
      const card = event.target instanceof Element ? event.target.closest(".card") : null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = (event) => {
      if (!hasStoredTheme()) applyTheme(event.matches ? "dark" : "light", { persist: false });
    };
    media.addEventListener("change", onSchemeChange);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      media.removeEventListener("change", onSchemeChange);
    };
  }, []);

  return null;
}
