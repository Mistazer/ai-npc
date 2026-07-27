import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { TierListView } from "@/components/TierListView";
import { Breadcrumbs } from "@/components/ui";
import { GAME_LIST, getGame } from "@/lib/games";
import { getCharacterCards } from "@/lib/data";
import { TIER_LISTS, getTierList, getTierListsForGame } from "@/content/tierlists";

export function generateStaticParams() {
  return TIER_LISTS.map((list) => ({
    game: GAME_LIST.find((game) => game.id === list.game)!.slug,
    mode: list.mode,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; mode: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, mode } = await params;
  const game = getGame(gameSlug);
  const list = game ? getTierList(game.id, mode) : undefined;
  if (!game || !list) return {};
  return {
    title: `Tier list ${list.label} — ${game.name}`,
    description: `${list.description} Classement commenté de ${list.entries.length} ${game.labels.characters.toLowerCase()}.`,
  };
}

export default async function TierListPage({
  params,
}: {
  params: Promise<{ game: string; mode: string }>;
}) {
  const { game: gameSlug, mode } = await params;
  const game = getGame(gameSlug);
  if (!game) notFound();
  const list = getTierList(game.id, mode);
  if (!list) notFound();

  const cards = getCharacterCards(game.id);
  const siblings = getTierListsForGame(game.id);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <Breadcrumbs
        items={[
          { label: game.shortName, href: `/${game.slug}` },
          { label: "Tier lists", href: `/${game.slug}/tier-list` },
          { label: list.label },
        ]}
      />

      <h1 className="text-2xl font-black tracking-tight">
        Tier list {list.label} — {game.name}
      </h1>
      <p className="mt-1 max-w-3xl text-[0.85rem] leading-relaxed text-[var(--muted)]">{list.description}</p>
      <p className="mt-1 text-[0.75rem] text-[var(--muted-dim)]">
        Dernière mise à jour : {new Date(list.updated).toLocaleDateString("fr-FR", { dateStyle: "long" })}
      </p>

      {list.sources && list.sources.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[0.72rem] text-[var(--muted-dim)]">Sources :</span>
          {list.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chip transition hover:border-[var(--accent)]"
            >
              {source.label} ↗
            </a>
          ))}
        </div>
      ) : null}

      {siblings.length > 1 ? (
        <div className="my-4 flex flex-wrap gap-2">
          {siblings.map((sibling) => (
            <Link
              key={sibling.mode}
              href={`/${game.slug}/tier-list/${sibling.mode}`}
              className={clsx("btn", sibling.mode === mode && "btn-active")}
              style={sibling.mode === mode ? { borderColor: game.accent } : undefined}
            >
              {sibling.label}
            </Link>
          ))}
        </div>
      ) : null}

      <TierListView list={list} game={game} cards={cards} />

      <div className="surface mt-6 p-4">
        <p className="mb-1.5 text-[0.8rem] font-bold">Méthodologie</p>
        <p className="text-[0.75rem] leading-relaxed text-[var(--muted-dim)]">
          Les classements supposent un investissement raisonnable — niveau maximum, arme adaptée non
          signature, équipement correctement optimisé — et une équipe cohérente. Les personnages sont
          répartis par rôle : comparez-les à l&apos;intérieur d&apos;une colonne, pas entre colonnes.
          <strong className="text-[var(--muted)]"> T0</strong> désigne le sommet du méta,{" "}
          <strong className="text-[var(--muted)]">T3</strong> les unités en difficulté. Un personnage
          classé bas reste jouable : il demande simplement plus d&apos;efforts pour un résultat
          équivalent.
        </p>
      </div>
    </div>
  );
}
