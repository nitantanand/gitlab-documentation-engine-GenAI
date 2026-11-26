"use client";

import { useLayoutEffect, useRef } from "react";

/*
 * Animates a number from 0 to `value` by writing to the DOM directly
 * (no React state). Non-numeric values render as-is. Respects reduced motion.
 */
export default function CountUp({ value, suffix = "", duration = 900 }) {
  const ref = useRef(null);
  const finalText = `${value}${suffix}`;

  useLayoutEffect(() => {
    const el = ref.current;
    const target = Number(value);
    if (!el || value === null || value === undefined || value === "" || !Number.isFinite(target)) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target === 0) {
      el.textContent = `${value}${suffix}`;
      return undefined;
    }

    const decimals = String(value).includes(".") ? String(value).split(".")[1].length : 0;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = progress < 1 ? `${(target * eased).toFixed(decimals)}${suffix}` : `${value}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    el.textContent = `${(0).toFixed(decimals)}${suffix}`;
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, suffix, duration]);

  return <span ref={ref} aria-label={finalText}>{finalText}</span>;
}
