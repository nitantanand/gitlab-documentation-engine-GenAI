/* Decorative empty-state illustration (theme-aware via CSS variables). */
export default function EmptyIllustration({ className = "h-24 w-32" }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true" fill="none">
      <ellipse cx="80" cy="108" rx="52" ry="6" fill="var(--color-neutral-soft)" />
      <rect x="44" y="20" width="64" height="80" rx="8" fill="var(--color-subtle)" stroke="var(--color-line-strong)" transform="rotate(-8 76 60)" />
      <rect x="52" y="14" width="64" height="80" rx="8" fill="var(--color-surface)" stroke="var(--color-line-strong)" />
      <rect x="62" y="28" width="30" height="6" rx="3" fill="var(--color-brand)" opacity="0.85" />
      <rect x="62" y="42" width="44" height="4" rx="2" fill="var(--color-line-strong)" />
      <rect x="62" y="52" width="38" height="4" rx="2" fill="var(--color-line-strong)" />
      <rect x="62" y="62" width="42" height="4" rx="2" fill="var(--color-line-strong)" />
      <rect x="62" y="72" width="24" height="4" rx="2" fill="var(--color-line-strong)" />
      <circle cx="118" cy="22" r="12" fill="var(--color-brand-soft)" stroke="var(--color-brand-line)" />
      <path d="M113 22h10M118 17v10" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="34" r="3" fill="var(--color-indigo)" opacity="0.5" />
      <circle cx="132" cy="70" r="2.5" fill="var(--color-amber)" opacity="0.7" />
    </svg>
  );
}
