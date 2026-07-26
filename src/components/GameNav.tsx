"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { GameConfig } from "@/lib/types";

export function GameNav({ game }: { game: GameConfig }) {
  const pathname = usePathname();
  const base = `/${game.slug}`;

  const links = [
    { href: base, label: "Accueil" },
    { href: `${base}/personnages`, label: game.labels.characters },
    { href: `${base}/armes`, label: game.labels.weapons },
    { href: `${base}/sets`, label: game.labels.artifacts },
    ...(game.id === "zzz" ? [{ href: `${base}/bangboo`, label: "Bangboo" }] : []),
    { href: `${base}/tier-list`, label: "Tier lists" },
  ];

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-4 py-2">
        <span className="mr-2 shrink-0 text-[0.8rem] font-bold" style={{ color: game.accent }}>
          {game.shortName}
        </span>
        {links.map((link) => {
          const active = link.href === base ? pathname === base : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "shrink-0 rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]",
              )}
              style={active ? { boxShadow: `inset 0 0 0 1px ${game.accent}` } : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
