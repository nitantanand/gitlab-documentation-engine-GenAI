"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiArrowRight, FiCornerDownLeft, FiLogOut, FiMoon, FiSearch } from "react-icons/fi";
import { toggleTheme } from "@/lib/theme";

export const OPEN_PALETTE_EVENT = "command-palette:open";

/*
 * Ctrl/⌘+K command palette. UI-only state: open, query, active row.
 * Actions reuse what the app already has: `onNavigate` (the existing nav
 * handler), the theme toggle and `onLogout` (the existing logout function).
 */
export default function CommandPalette({ items = [], onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const openRef = useRef(false);
  const listId = useId();

  useEffect(() => {
    openRef.current = open;
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const show = () => {
      if (openRef.current) return;
      restoreFocusRef.current = document.activeElement;
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, show);
    };
  }, []);

  const close = () => {
    setOpen(false);
    const target = restoreFocusRef.current;
    if (target && typeof target.focus === "function") setTimeout(() => target.focus(), 0);
  };

  const commands = [
    ...items.map((item) => ({
      id: `nav-${item.route}`,
      group: "Pages",
      label: item.label,
      icon: item.icon,
      run: () => onNavigate?.(item),
    })),
    { id: "theme", group: "Preferences", label: "Toggle theme", icon: FiMoon, run: toggleTheme },
    ...(onLogout ? [{ id: "logout", group: "Account", label: "Log out", icon: FiLogOut, run: onLogout }] : []),
  ];

  const normalized = query.trim().toLowerCase();
  const filtered = normalized ? commands.filter((command) => command.label.toLowerCase().includes(normalized)) : commands;
  const activeIndex = filtered.length ? Math.min(active, filtered.length - 1) : -1;
  const activeId = activeIndex >= 0 ? `${listId}-${filtered[activeIndex].id}` : undefined;

  useEffect(() => {
    if (open && activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  const runCommand = (command) => {
    close();
    command.run();
  };

  const onInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length) setActive((activeIndex + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length) setActive((activeIndex - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) runCommand(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[10vh] sm:px-6 sm:pt-[14vh]">
      <div
        className="absolute inset-0 animate-[fade-in_0.15s_ease-out] bg-[rgba(9,9,11,0.45)] backdrop-blur-[3px]"
        aria-hidden="true"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-[600px] animate-[palette-in_0.18s_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-2xl border border-line bg-[color-mix(in_srgb,var(--color-elevated)_86%,transparent)] shadow-[var(--shadow-pop)] backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <FiSearch className="h-[18px] w-[18px] flex-none text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages and actions…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="kbd hidden sm:inline-flex">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[min(380px,55vh)] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-10 text-center text-[14px] text-muted" role="presentation">
              No results for “{query}”
            </li>
          )}
          {filtered.map((command, index) => {
            const Icon = command.icon;
            const isActive = index === activeIndex;
            const showGroup = index === 0 || filtered[index - 1].group !== command.group;
            return (
              <li key={command.id} role="presentation">
                {showGroup && <div className="eyebrow px-3 pb-1.5 pt-3 text-[12px]" role="presentation">{command.group}</div>}
                <div
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseMove={() => setActive(index)}
                  onClick={() => runCommand(command)}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors duration-100 ${
                    isActive ? "bg-brand-soft text-ink" : "text-body"
                  }`}
                >
                  <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ring-1 ${isActive ? "bg-surface text-brand ring-brand-line" : "bg-subtle text-muted ring-line"}`}>
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{command.label}</span>
                  {isActive && (
                    command.group === "Pages"
                      ? <FiArrowRight className="h-4 w-4 flex-none text-brand" aria-hidden="true" />
                      : <FiCornerDownLeft className="h-4 w-4 flex-none text-brand" aria-hidden="true" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-4 border-t border-line bg-subtle/60 px-4 py-2.5 text-[12px] text-muted sm:flex">
          <span className="flex items-center gap-1.5"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> Navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="kbd">Enter</kbd> Select</span>
          <span className="flex items-center gap-1.5"><kbd className="kbd">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
