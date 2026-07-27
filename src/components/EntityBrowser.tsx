"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { EntityIcon } from "./EntityIcon";
import type { GameConfig, ImageSource } from "@/lib/types";

export interface BrowseRow {
  slug: string;
  name: string;
  icon: ImageSource;
  rarityLabel: string | null;
  rarityRank: number;
  facet: string | null;
  description: string;
}

export function EntityBrowser({
  game,
  rows,
  facetLabel,
  basePath,
  emptyLabel = "Aucun résultat.",
}: {
  game: GameConfig;
  rows: BrowseRow[];
  facetLabel?: string;
  basePath: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string | null>(null);
  const [facet, setFacet] = useState<string | null>(null);

  const rarities = useMemo(
    () => [...new Set(rows.map((row) => row.rarityLabel).filter(Boolean) as string[])].sort().reverse(),
    [rows],
  );
  const facets = useMemo(
    () => [...new Set(rows.map((row) => row.facet).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "fr")),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && !row.name.toLowerCase().includes(needle)) return false;
      if (rarity && row.rarityLabel !== rarity) return false;
      if (facet && row.facet !== facet) return false;
      return true;
    });
  }, [rows, query, rarity, facet]);

  return (
    <div>
      <div className="surface mb-4 space-y-2.5 p-4">
        <input
          className="input sm:max-w-xs"
          placeholder="Rechercher…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {rarities.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-[70px] shrink-0 text-[0.72rem] font-semibold text-[var(--muted-dim)]">Rareté</span>
            {rarities.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRarity(rarity === value ? null : value)}
                className={clsx("chip cursor-pointer", rarity === value && "chip-accent")}
                style={rarity === value ? { borderColor: game.accent, color: game.accent } : undefined}
              >
                {value}
              </button>
            ))}
          </div>
        ) : null}

        {facets.length > 1 && facetLabel ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-[70px] shrink-0 text-[0.72rem] font-semibold text-[var(--muted-dim)]">
              {facetLabel}
            </span>
            {facets.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFacet(facet === value ? null : value)}
                className={clsx("chip cursor-pointer", facet === value && "chip-accent")}
                style={facet === value ? { borderColor: game.accent, color: game.accent } : undefined}
              >
                {value}
              </button>
            ))}
          </div>
        ) : null}

        <p className="pt-1 text-[0.75rem] text-[var(--muted-dim)]">
          {filtered.length} sur {rows.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="surface p-8 text-center text-sm text-[var(--muted-dim)]">{emptyLabel}</p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <Link
              key={row.slug}
              href={`${basePath}/${row.slug}`}
              className={clsx("surface surface-hover flex gap-3 p-3", `rarity-${row.rarityRank}`)}
            >
              <EntityIcon src={row.icon} alt={row.name} size={52} rarity={row.rarityRank} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[0.85rem] font-semibold">{row.name}</p>
                  {row.rarityLabel ? (
                    <span className="shrink-0 text-[0.7rem] font-bold" style={{ color: "var(--rarity)" }}>
                      {row.rarityLabel}
                    </span>
                  ) : null}
                </div>
                {row.facet ? <p className="text-[0.7rem] text-[var(--muted-dim)]">{row.facet}</p> : null}
                <p className="mt-1 line-clamp-2 text-[0.75rem] leading-snug text-[var(--muted)]">
                  {row.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
