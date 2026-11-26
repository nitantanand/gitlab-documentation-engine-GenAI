import Image from "next/image";
import {
  FiBarChart2,
  FiClipboard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiSettings,
} from "react-icons/fi";

export const defaultNavItems = [
  { icon: FiGrid, label: "Dashboard", route: "/dashboard" },
  { icon: FiFileText, label: "Create Content", route: "/create-content" },
  { icon: FiFolder, label: "My Jobs", route: "/my-jobs" },
  { icon: FiClipboard, label: "Review", route: "/review" },
  { icon: FiBarChart2, label: "Analytics", route: "/analytics" },
  { icon: FiSettings, label: "Settings", route: "/settings" },
];

export default function SidebarNav({
  items = defaultNavItems,
  selectedNav,
  onSelect,
  isMobile = false,
}) {
  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <>
      {!isMobile && (
        <div className="flex items-center gap-3 px-2 pb-7 pt-2">
          <Image
            src="/gitlab.jpg"
            alt="GitLab icon"
            width={40}
            height={40}
            className="h-10 w-10 flex-none rounded-xl object-cover shadow-[0_2px_8px_-2px_rgba(15,23,42,0.2)] ring-1 ring-line"
          />

          <div className="min-w-0">
            <div className="font-display text-[16px] font-bold leading-tight tracking-[-0.02em] text-ink">GitLab AI</div>
            <div className="mt-0.5 text-[12px] font-medium leading-tight text-muted">
              Content &amp; Documentation Engine
            </div>
          </div>
        </div>
      )}

      <div className="eyebrow px-3 pb-2">Workspace</div>
      <nav className="space-y-1" aria-label="Main navigation">
        {items.map(({ icon: Icon, label, route }) => {
          const isActive = selectedNav === label;

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleSelect({ label, route })}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[14px] font-medium transition-colors duration-150 lg:min-h-[40px] ${
                isActive
                  ? "bg-gradient-to-r from-brand-soft to-brand-soft/40 text-ink shadow-[inset_0_0_0_1px_var(--color-brand-line)]"
                  : "text-body hover:bg-neutral-soft hover:text-ink"
              }`}
            >
              {isActive && (
                <span className="absolute inset-y-2.5 -left-4 w-[3px] rounded-r-full bg-brand" aria-hidden="true" />
              )}
              <Icon
                aria-hidden="true"
                className={`h-[18px] w-[18px] flex-none transition-colors duration-150 ${isActive ? "text-brand" : "text-muted group-hover:text-ink"}`}
              />
              <span className="min-w-0 truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="relative mt-auto overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand-soft/60 via-surface to-link-soft/70 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(226,67,41,0.18),transparent_70%)]" aria-hidden="true" />
          <p className="relative font-display text-[14px] font-semibold leading-snug text-ink">“Better docs.</p>
          <p className="relative font-display text-[14px] font-semibold leading-snug text-ink">Faster releases.</p>
          <p className="relative mt-1 font-display text-[14px] font-semibold leading-snug text-ink">A stronger GitLab.”</p>
          <div className="relative mt-3 h-px w-full bg-gradient-to-r from-line to-transparent" />
          <p className="relative mt-3 text-[12px] font-medium text-muted">Build. Document. Together.</p>
        </div>
      )}
    </>
  );
}
