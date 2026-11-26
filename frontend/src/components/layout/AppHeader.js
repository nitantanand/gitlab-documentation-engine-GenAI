import Image from "next/image";
import { FiLogOut, FiMenu, FiSearch } from "react-icons/fi";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { OPEN_PALETTE_EVENT } from "@/components/ui/CommandPalette";

function openPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

export default function AppHeader({
  onMenuToggle,
  userName = "User",
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-[color-mix(in_srgb,var(--color-surface)_72%,transparent)] px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={onMenuToggle}
          className="btn btn-secondary btn-icon flex-none lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <Image src="/gitlab.jpg" alt="" width={28} height={28} className="h-7 w-7 flex-none rounded-md object-cover" />
          <span className="hidden truncate text-[15px] font-semibold text-ink min-[400px]:inline">GitLab AI</span>
        </div>

        {/* Command palette trigger */}
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          aria-keyshortcuts="Control+K Meta+K"
          className="group hidden h-10 w-[260px] items-center gap-2.5 rounded-[10px] border border-line bg-surface/60 px-3 text-left text-[14px] text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-line-strong hover:text-ink md:flex"
        >
          <FiSearch className="h-4 w-4 flex-none" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Search or jump to…</span>
          <kbd className="kbd">⌘K</kbd>
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          className="btn btn-ghost btn-icon flex-none md:hidden"
        >
          <FiSearch className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        <ThemeToggle className="flex-none" />
        <div className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber font-display text-sm font-bold text-white shadow-[0_2px_8px_-2px_rgba(226,67,41,0.5)] ring-2 ring-surface"
            aria-hidden="true"
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden min-w-0 sm:block md:hidden lg:block">
            <div className="max-w-[140px] truncate xl:max-w-[200px] text-[14px] font-semibold text-ink">{userName}</div>
          </div>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className="btn btn-ghost btn-sm min-h-[44px] px-2.5 sm:px-3 lg:min-h-[36px]"
          >
            <FiLogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        )}
      </div>
    </header>
  );
}
