import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityBrowser, type BrowseRow } from "@/components/EntityBrowser";
import { getGame } from "@/lib/games";
import { getArtifacts } from "@/lib/data";
import type { GiArtifact, HsrRelic, ZzzDisc } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.labels.artifacts} ${game.name}`,
    description: `Tous les ${game.labels.artifacts.toLowerCase()} de ${game.name} avec leurs bonus de set.`,
  };
}

export default async function SetsPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const artifacts = getArtifacts(game.id);

  const rows: BrowseRow[] = artifacts.map((entry) => {
    const bonuses = (entry as GiArtifact | HsrRelic | ZzzDisc).bonuses;
    const description = bonuses.map((bonus) => `${bonus.pieces}p : ${bonus.effect}`).join(" · ");

    if (game.id === "gi") {
      const a = entry as GiArtifact;
      return {
        slug: a.slug,
        name: a.name,
        icon: a.images.icon,
        rarityLabel: `${a.rarity}★`,
        rarityRank: a.rarity,
        facet: null,
        description,
      };
    }
    if (game.id === "hsr") {
      const r = entry as HsrRelic;
      return {
        slug: r.slug,
        name: r.name,
        icon: r.images.icon,
        rarityLabel: null,
        rarityRank: 5,
        facet: r.kindFr,
        description,
      };
    }
    const d = entry as ZzzDisc;
    return {
      slug: d.slug,
      name: d.name,
      icon: d.images.icon,
      rarityLabel: null,
      rarityRank: 5,
      facet: null,
      description,
    };
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">
        {game.labels.artifacts} — {game.name}
      </h1>
      <p className="mb-5 text-[0.85rem] text-[var(--muted)]">
        {rows.length} sets référencés avec leurs bonus complets.
      </p>
      <EntityBrowser
        game={game}
        rows={rows}
        facetLabel={game.id === "hsr" ? "Type" : undefined}
        basePath={`/${game.slug}/sets`}
      />
    </div>
  );
}
