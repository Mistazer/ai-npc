"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { EntityIcon } from "./EntityIcon";
import type { CharacterCard, GameConfig, Tier, TierList } from "@/lib/types";

const TIER_ORDER: Tier[] = ["S+", "S", "A", "B", "C", "D"];

const TIER_META: Record<Tier, { class: string; label: string }> = {
  "S+": { class: "tier-splus", label: "Méta absolu" },
  S: { class: "tier-s", label: "Excellent" },
  A: { class: "tier-a", label: "Très bon" },
  B: { class: "tier-b", label: "Correct" },
  C: { class: "tier-c", label: "Situationnel" },
  D: { class: "tier-d", label: "Faible" },
};


/** Groupe de filtres à choix unique, défini hors du composant pour rester stable entre les rendus. */
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
      <span className="w-[70px] shrink-0 text-[0.72rem] font-semibold text-[var(--muted-dim)]">
        {label}
      </span>
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
  const [role, setRole] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(true);

  const cardBySlug = useMemo(() => new Map(cards.map((card) => [card.slug, card])), [cards]);

  const options = useMemo(() => {
    const present = list.entries.map((entry) => cardBySlug.get(entry.slug)).filter(Boolean) as CharacterCard[];
    const unique = (values: (string | null)[]) =>
      [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "fr"));
    return {
      elements: unique(present.map((card) => card.elementFr)),
      roles: unique(present.map((card) => card.roleFr)),
      rarities: [...new Set(present.map((card) => card.rarityLabel))].sort().reverse(),
    };
  }, [list.entries, cardBySlug]);

  const grouped = useMemo(() => {
    const map = new Map<Tier, { card: CharacterCard; note?: string }[]>();
    for (const tier of TIER_ORDER) map.set(tier, []);

    for (const entry of list.entries) {
      const card = cardBySlug.get(entry.slug);
      if (!card) continue;
      if (element && card.elementFr !== element) continue;
      if (role && card.roleFr !== role) continue;
      if (rarity && card.rarityLabel !== rarity) continue;
      map.get(entry.tier as Tier)?.push({ card, note: entry.note });
    }
    return map;
  }, [list.entries, cardBySlug, element, role, rarity]);

  const total = [...grouped.values()].reduce((sum, items) => sum + items.length, 0);

  return (
    <div>
      <div className="surface mb-4 space-y-2.5 p-4">
        <FilterGroup
          label="Rareté"
          values={options.rarities}
          active={rarity}
          accent={game.accent}
          onSelect={setRarity}
        />
        <FilterGroup
          label={game.labels.element}
          values={options.elements}
          active={element}
          accent={game.accent}
          onSelect={setElement}
        />
        <FilterGroup
          label={game.labels.role}
          values={options.roles}
          active={role}
          accent={game.accent}
          onSelect={setRole}
        />
        <div className="flex items-center justify-between pt-1">
          <p className="text-[0.75rem] text-[var(--muted-dim)]">{total} entrées affichées</p>
          <button
            type="button"
            onClick={() => setShowNotes((value) => !value)}
            className={clsx("chip cursor-pointer", showNotes && "chip-accent")}
            style={showNotes ? { borderColor: game.accent, color: game.accent } : undefined}
          >
            {showNotes ? "Masquer les commentaires" : "Afficher les commentaires"}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {TIER_ORDER.map((tier) => {
          const items = grouped.get(tier) ?? [];
          if (items.length === 0) return null;
          const meta = TIER_META[tier];

          return (
            <div key={tier} className={clsx("surface overflow-hidden", meta.class)}>
              <div className="flex">
                <div
                  className="flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 py-4 sm:w-20"
                  style={{ background: "var(--tier)" }}
                >
                  <span className="text-xl font-black text-black sm:text-2xl">{tier}</span>
                  <span className="px-1 text-center text-[0.58rem] font-bold uppercase leading-tight text-black/70">
                    {meta.label}
                  </span>
                </div>

                <div className="min-w-0 flex-1 p-3">
                  {showNotes ? (
                    <div className="space-y-2">
                      {items.map(({ card, note }) => (
                        <Link
                          key={card.slug}
                          href={`/${game.slug}/personnages/${card.slug}`}
                          className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2 transition hover:border-[var(--accent)]"
                        >
                          <EntityIcon src={card.icon} alt={card.name} size={44} rarity={card.rarityRank} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[0.83rem] font-semibold">{card.name}</span>
                              <span className="chip">{[card.elementFr, card.roleFr].filter(Boolean).join(" · ")}</span>
                            </div>
                            {note ? (
                              <p className="mt-0.5 text-[0.75rem] leading-snug text-[var(--muted-dim)]">{note}</p>
                            ) : null}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {items.map(({ card }) => (
                        <Link
                          key={card.slug}
                          href={`/${game.slug}/personnages/${card.slug}`}
                          title={card.name}
                          className="w-[62px] text-center"
                        >
                          <EntityIcon src={card.icon} alt={card.name} size={62} rarity={card.rarityRank} />
                          <p className="mt-1 truncate text-[0.66rem] text-[var(--muted-dim)]">{card.name}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
