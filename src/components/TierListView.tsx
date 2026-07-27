"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { EntityIcon } from "./EntityIcon";
import type { CharacterCard, GameConfig, Tier, TierList } from "@/lib/types";

const TIER_ORDER: Tier[] = ["T0", "T0.5", "T1", "T1.5", "T2", "T3"];

const TIER_META: Record<Tier, { class: string; label: string }> = {
  T0: { class: "tier-t0", label: "Méta absolu" },
  "T0.5": { class: "tier-t05", label: "Excellent" },
  T1: { class: "tier-t1", label: "Très bon" },
  "T1.5": { class: "tier-t15", label: "Bon" },
  T2: { class: "tier-t2", label: "Situationnel" },
  T3: { class: "tier-t3", label: "Faible" },
};

/** Groupe de filtres, défini hors du composant pour rester stable entre les rendus. */
function FilterGroup({
  label,
  values,
  active,
  accent,
  onSelect,
}: {
  label: string;
  values: string[];
  active: string | null;
  accent: string;
  onSelect: (value: string | null) => void;
}) {
  if (values.length <= 1) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-[70px] shrink-0 text-[0.72rem] font-semibold text-[var(--muted-dim)]">{label}</span>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(active === value ? null : value)}
          className={clsx("chip cursor-pointer", active === value && "chip-accent")}
          style={active === value ? { borderColor: accent, color: accent } : undefined}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function TierListView({
  list,
  game,
  cards,
}: {
  list: TierList;
  game: GameConfig;
  cards: CharacterCard[];
}) {
  const [element, setElement] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);

  const cardBySlug = useMemo(() => new Map(cards.map((card) => [card.slug, card])), [cards]);

  const options = useMemo(() => {
    const present = list.entries
      .map((entry) => cardBySlug.get(entry.slug))
      .filter(Boolean) as CharacterCard[];
    return {
      elements: [...new Set(present.map((card) => card.elementFr).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
      rarities: [...new Set(present.map((card) => card.rarityLabel))].sort().reverse(),
    };
  }, [list.entries, cardBySlug]);

  /** grille[tier][colonne] = entrées */
  const grid = useMemo(() => {
    const map = new Map<Tier, Map<string, { card: CharacterCard; note?: string }[]>>();
    for (const tier of TIER_ORDER) {
      const row = new Map<string, { card: CharacterCard; note?: string }[]>();
      for (const column of game.tierColumns) row.set(column.id, []);
      map.set(tier, row);
    }

    for (const entry of list.entries) {
      const card = cardBySlug.get(entry.slug);
      if (!card) continue;
      if (element && card.elementFr !== element) continue;
      if (rarity && card.rarityLabel !== rarity) continue;
      map.get(entry.tier as Tier)?.get(entry.column)?.push({ card, note: entry.note });
    }
    return map;
  }, [list.entries, cardBySlug, element, rarity, game.tierColumns]);

  const total = [...grid.values()].reduce(
    (sum, row) => sum + [...row.values()].reduce((acc, items) => acc + items.length, 0),
    0,
  );

  const columnWidth = `minmax(0,1fr)`;

  return (
    <div>
      <div className="surface mb-4 space-y-2.5 p-4">
        <FilterGroup label="Rareté" values={options.rarities} active={rarity} accent={game.accent} onSelect={setRarity} />
        <FilterGroup
          label={game.labels.element}
          values={options.elements}
          active={element}
          accent={game.accent}
          onSelect={setElement}
        />
        <div className="flex items-center justify-between pt-1">
          <p className="text-[0.75rem] text-[var(--muted-dim)]">{total} entrées affichées</p>
          <button
            type="button"
            onClick={() => setCompact((value) => !value)}
            className={clsx("chip cursor-pointer", compact && "chip-accent")}
            style={compact ? { borderColor: game.accent, color: game.accent } : undefined}
          >
            {compact ? "Vue détaillée" : "Vue compacte"}
          </button>
        </div>
      </div>

      {/* En-tête des colonnes de rôle */}
      <div
        className="mb-2 hidden gap-2 lg:grid"
        style={{ gridTemplateColumns: `72px repeat(${game.tierColumns.length}, ${columnWidth})` }}
      >
        <div />
        {game.tierColumns.map((column) => (
          <div key={column.id} className="surface px-3 py-2 text-center">
            <p className="text-[0.82rem] font-bold">{column.label}</p>
            <p className="mt-0.5 text-[0.66rem] leading-tight text-[var(--muted-dim)]">{column.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {TIER_ORDER.map((tier) => {
          const row = grid.get(tier);
          if (!row) return null;
          const rowTotal = [...row.values()].reduce((sum, items) => sum + items.length, 0);
          if (rowTotal === 0) return null;
          const meta = TIER_META[tier];

          return (
            <div
              key={tier}
              className={clsx("surface overflow-hidden lg:grid lg:gap-2 lg:border-0 lg:bg-transparent", meta.class)}
              style={{ gridTemplateColumns: `72px repeat(${game.tierColumns.length}, ${columnWidth})` }}
            >
              {/* Étiquette du palier */}
              <div
                className="flex items-center gap-2 px-3 py-2 lg:flex-col lg:justify-center lg:rounded-xl lg:px-1 lg:py-4"
                style={{ background: "var(--tier)" }}
              >
                <span className="text-lg font-black text-black">{tier}</span>
                <span className="text-[0.6rem] font-bold uppercase leading-tight text-black/70 lg:text-center">
                  {meta.label}
                </span>
              </div>

              {game.tierColumns.map((column) => {
                const items = row.get(column.id) ?? [];
                return (
                  <div
                    key={column.id}
                    className="border-t border-[var(--border)] p-2 lg:min-h-[72px] lg:rounded-xl lg:border lg:bg-[var(--panel)]"
                  >
                    <p className="mb-1.5 text-[0.7rem] font-bold text-[var(--muted-dim)] lg:hidden">
                      {column.label}
                    </p>

                    {items.length === 0 ? (
                      <p className="hidden py-2 text-center text-[0.7rem] text-[var(--muted-dim)] lg:block">—</p>
                    ) : compact ? (
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(({ card }) => (
                          <Link
                            key={card.slug}
                            href={`/${game.slug}/personnages/${card.slug}`}
                            title={card.name}
                            className="w-[54px] text-center"
                          >
                            <EntityIcon src={card.icon} alt={card.name} size={54} rarity={card.rarityRank} />
                            <p className="mt-0.5 truncate text-[0.6rem] text-[var(--muted-dim)]">{card.name}</p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {items.map(({ card, note }) => (
                          <Link
                            key={card.slug}
                            href={`/${game.slug}/personnages/${card.slug}`}
                            className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1.5 transition hover:border-[var(--accent)]"
                          >
                            <EntityIcon src={card.icon} alt={card.name} size={38} rarity={card.rarityRank} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.78rem] font-semibold">{card.name}</p>
                              {note ? (
                                <p className="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-[var(--muted-dim)]">
                                  {note}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {total === 0 ? (
        <p className="surface p-8 text-center text-sm text-[var(--muted-dim)]">
          Aucune entrée ne correspond à ces filtres.
        </p>
      ) : null}
    </div>
  );
}
