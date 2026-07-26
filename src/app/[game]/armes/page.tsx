import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityBrowser, type BrowseRow } from "@/components/EntityBrowser";
import { getGame } from "@/lib/games";
import { getWeapons } from "@/lib/data";
import type { GiWeapon, HsrLightCone, ZzzWeapon } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.labels.weapons} ${game.name}`,
    description: `Liste complète des ${game.labels.weapons.toLowerCase()} de ${game.name} avec statistiques et effets passifs.`,
  };
}

export default async function WeaponsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const weapons = getWeapons(game.id);

  const rows: BrowseRow[] = weapons.map((weapon) => {
    if (game.id === "gi") {
      const w = weapon as GiWeapon;
      return {
        slug: w.slug,
        name: w.name,
        icon: w.images.icon,
        rarityLabel: `${w.rarity}★`,
        rarityRank: w.rarity,
        facet: w.typeFr,
        description: w.effectName ? `${w.effectName} — ${w.effect}` : w.description,
      };
    }
    if (game.id === "hsr") {
      const w = weapon as HsrLightCone;
      return {
        slug: w.slug,
        name: w.name,
        icon: w.images.icon,
        rarityLabel: `${w.rarity}★`,
        rarityRank: w.rarity,
        facet: w.pathFr,
        description: w.effect || w.description,
      };
    }
    const w = weapon as ZzzWeapon;
    return {
      slug: w.slug,
      name: w.name,
      icon: w.images.icon,
      rarityLabel: w.rarity,
      rarityRank: w.rarityRank,
      facet: w.specialtyFr,
      description: w.effectName ? `${w.effectName} — ${w.effect}` : w.description,
    };
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">
        {game.labels.weapons} — {game.name}
      </h1>
      <p className="mb-5 text-[0.85rem] text-[var(--muted)]">
        {rows.length} {game.labels.weapons.toLowerCase()} avec leurs effets détaillés.
      </p>
      <EntityBrowser
        game={game}
        rows={rows}
        facetLabel={game.id === "hsr" ? "Voie" : game.id === "gi" ? "Type" : "Spécialité"}
        basePath={`/${game.slug}/armes`}
      />
    </div>
  );
}
