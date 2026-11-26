"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import AuthGuard from "./AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "./AppHeader";
import SidebarNav, { defaultNavItems } from "./SidebarNav";
import CommandPalette from "@/components/ui/CommandPalette";

export default function AppLayout({ children, initialSelectedNav = "Dashboard" }) {
  const router = useRouter();
  const { userProfile, logout } = useAuth();
  const [selectedNav, setSelectedNav] = useState(initialSelectedNav);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = userProfile?.displayName || "User";
  const role = (userProfile?.role || "writer").toLowerCase();
  const visibleNavItems = defaultNavItems.filter(({ label }) => {
    if (label === "Create Content") return ["writer", "admin"].includes(role);
    if (label === "Review") return ["reviewer", "approver", "admin"].includes(role);
    if (label === "Analytics") return ["reviewer", "approver", "admin"].includes(role);
    return true;
  });

  const handleNavSelect = ({ label, route }) => {
    setSelectedNav(label);
    setIsMenuOpen(false);

    if (route) {
      router.push(route);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen text-body">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-5 shadow-[1px_0_0_rgba(15,23,42,0.02),8px_0_24px_-16px_rgba(15,23,42,0.08)] lg:flex">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand via-amber to-indigo" aria-hidden="true" />
          <SidebarNav items={visibleNavItems} selectedNav={selectedNav} onSelect={handleNavSelect} />
        </aside>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div
              className="absolute inset-0 bg-[rgba(9,9,11,0.45)] backdrop-blur-[2px]"
              aria-hidden="true"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[min(300px,86vw)] animate-[drawer-in_0.2s_ease-out] flex-col overflow-y-auto border-r border-line bg-surface px-4 py-4 shadow-[var(--shadow-pop)]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand via-amber to-indigo" aria-hidden="true" />
              <div className="mb-5 flex items-center justify-between gap-3 px-1">
                <div className="flex min-w-0 items-center gap-3">
                  <Image src="/gitlab.jpg" alt="" width={36} height={36} className="h-9 w-9 flex-none rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold leading-tight text-ink">GitLab AI</div>
                    <div className="text-[12px] leading-tight text-muted">Content &amp; Documentation Engine</div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-ghost btn-icon flex-none"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav
                items={visibleNavItems}
                selectedNav={selectedNav}
                onSelect={handleNavSelect}
                isMobile
              />
            </div>
          </div>
        )}

        <div className="relative isolate flex min-h-screen min-w-0 flex-col lg:pl-64">
          <div className="app-band -z-10" aria-hidden="true" />
          <AppHeader
            onMenuToggle={() => setIsMenuOpen((prev) => !prev)}
            userName={displayName}
            onLogout={logout}
          />

          <main className="min-w-0 flex-1">{children}</main>
        </div>

        <CommandPalette items={visibleNavItems} onNavigate={handleNavSelect} onLogout={logout} />
      </div>
    </AuthGuard>
  );
}
