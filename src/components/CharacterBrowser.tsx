"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { CharacterCardTile } from "./CharacterCardTile";
import type { CharacterCard, GameConfig } from "@/lib/types";

interface Props {
  game: GameConfig;
  cards: CharacterCard[];
  options: { elements: string[]; roles: string[]; extras: string[]; rarities: string[] };
}

type SortKey = "name" | "rarity" | "element" | "role";


/** Ligne de filtres à choix unique. Définie hors du composant pour rester stable entre les rendus. */
function FilterRow({
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
  if (values.length === 0) return null;
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

export function CharacterBrowser({ game, cards, options }: Props) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [extra, setExtra] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("rarity");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = cards.filter((card) => {
      if (needle && !card.name.toLowerCase().includes(needle)) return false;
      if (element && card.elementFr !== element) return false;
      if (role && card.roleFr !== role) return false;
      if (rarity && card.rarityLabel !== rarity) return false;
      if (extra && card.extra !== extra) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "rarity") return b.rarityRank - a.rarityRank || a.name.localeCompare(b.name, "fr");
      if (sort === "element")
        return (a.elementFr ?? "").localeCompare(b.elementFr ?? "", "fr") || a.name.localeCompare(b.name, "fr");
      if (sort === "role")
        return (a.roleFr ?? "").localeCompare(b.roleFr ?? "", "fr") || a.name.localeCompare(b.name, "fr");
      return a.name.localeCompare(b.name, "fr");
    });
  }, [cards, query, element, role, rarity, extra, sort]);

  const hasFilters = Boolean(query || element || role || rarity || extra);

  const reset = () => {
    setQuery("");
    setElement(null);
    setRole(null);
    setRarity(null);
    setExtra(null);
  };

  return (
    <div>
      <div className="surface mb-4 space-y-2.5 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input sm:max-w-xs"
            placeholder={`Rechercher un ${game.labels.character.toLowerCase()}…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.72rem] font-semibold text-[var(--muted-dim)]">Trier</span>
            {(
              [
                ["rarity", "Rareté"],
                ["name", "Nom"],
                ["element", game.labels.element],
                ["role", game.labels.role],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={clsx("chip cursor-pointer", sort === key && "chip-accent")}
                style={sort === key ? { borderColor: game.accent, color: game.accent } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <FilterRow label="Rareté" values={options.rarities} active={rarity} accent={game.accent} onSelect={setRarity} />
        <FilterRow
          label={game.labels.element}
          values={options.elements}
          active={element}
          accent={game.accent}
          onSelect={setElement}
        />
        <FilterRow
          label={game.labels.role}
          values={options.roles}
          active={role}
          accent={game.accent}
          onSelect={setRole}
        />
        {game.labels.extra ? (
          <FilterRow
            label={game.labels.extra}
            values={options.extras}
            active={extra}
            accent={game.accent}
            onSelect={setExtra}
          />
        ) : null}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[0.75rem] text-[var(--muted-dim)]">
            {filtered.length} {filtered.length > 1 ? "résultats" : "résultat"} sur {cards.length}
          </p>
          {hasFilters ? (
            <button type="button" onClick={reset} className="text-[0.75rem] text-[var(--muted)] underline hover:text-[var(--text)]">
              Réinitialiser
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="surface p-8 text-center text-sm text-[var(--muted-dim)]">
          Aucun résultat ne correspond à ces filtres.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {filtered.map((card) => (
            <CharacterCardTile key={card.slug} card={card} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
