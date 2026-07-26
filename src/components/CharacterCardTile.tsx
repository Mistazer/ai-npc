import Link from "next/link";
import clsx from "clsx";
import { EntityIcon } from "./EntityIcon";
import type { CharacterCard, GameConfig } from "@/lib/types";

export function CharacterCardTile({
  card,
  game,
  tier,
}: {
  card: CharacterCard;
  game: GameConfig;
  tier?: string;
}) {
  return (
    <Link
      href={`/${game.slug}/personnages/${card.slug}`}
      className={clsx(
        "surface surface-hover group relative flex flex-col items-center gap-2 p-3 text-center",
        `rarity-${card.rarityRank}`,
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[13px]"
        style={{ background: "var(--rarity)" }}
      />
      {tier ? (
        <span
          className="absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[0.65rem] font-black text-black"
          style={{ background: "var(--tier)" }}
        >
          {tier}
        </span>
      ) : null}
      <EntityIcon src={card.icon} alt={card.name} rarity={card.rarityRank} size={76} />
      <div className="min-w-0 w-full">
        <p className="truncate text-[0.82rem] font-semibold leading-tight">{card.name}</p>
        <p className="mt-0.5 truncate text-[0.7rem] text-[var(--muted-dim)]">
          {[card.elementFr, card.roleFr].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
