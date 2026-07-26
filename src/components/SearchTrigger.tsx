"use client";

import { useSearch } from "./SearchProvider";

export function SearchTrigger() {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[0.82rem] text-[var(--muted-dim)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Rechercher</span>
      <kbd className="hidden rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[0.65rem] sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
