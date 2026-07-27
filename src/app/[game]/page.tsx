import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCardTile } from "@/components/CharacterCardTile";
import { EntityIcon } from "@/components/EntityIcon";
import { getGame } from "@/lib/games";
import { getCharacterCards, getCounts } from "@/lib/data";
import { getTierListsForGame } from "@/content/tierlists";
import { getGuidesForGame } from "@/content/guides";
import { sortedNews } from "@/content/news";
import { getBetaForGame } from "@/content/beta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.name} — base de données, tier lists et guides`,
    description: game.tagline,
  };
}

export default async function GameHome({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const counts = getCounts(game.id);
  const cards = getCharacterCards(game.id);
  const latest = cards.filter((card) => card.rarityRank >= 5).slice(0, 12);
  const tierLists = getTierListsForGame(game.id);
  const guides = getGuidesForGame(game.id);
  const beta = getBetaForGame(game.id);
  const news = sortedNews.filter((item) => item.game === game.id || item.game === "all").slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <section className="surface mb-8 overflow-hidden">
        <div className="p-6 sm:p-8" style={{ background: game.gradient }}>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow sm:text-3xl">
            {game.name}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.9rem] text-white/85">{game.tagline}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
          {[
            { label: game.labels.characters, value: counts.characters, href: "personnages" },
            { label: game.labels.weapons, value: counts.weapons, href: "armes" },
            { label: game.labels.artifacts, value: counts.artifacts, href: "sets" },
            game.id === "zzz"
              ? { label: "Bangboo", value: counts.bangboos, href: "bangboo" }
              : { label: "Tier lists", value: tierLists.length, href: "tier-list" },
          ].map((item) => (
            <Link
              key={item.href}
              href={`/${game.slug}/${item.href}`}
              className="p-4 text-center transition hover:bg-[var(--panel-hover)]"
            >
              <p className="text-2xl font-black" style={{ color: game.accent }}>
                {item.value}
              </p>
              <p className="text-[0.75rem] text-[var(--muted-dim)]">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {beta.length > 0 ? (
        <section className="mb-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="section-title">Contenu bêta</h2>
            <Link href={`/${game.slug}/beta`} className="text-[0.78rem] text-[var(--muted-dim)] hover:text-[var(--text)]">
              Voir les {beta.length} entrées →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {beta.slice(0, 8).map((entry) => {
              const card = cards.find((item) => item.slug === entry.slug);
              if (!card) return null;
              return (
                <Link
                  key={entry.slug}
                  href={`/${game.slug}/personnages/${entry.slug}`}
                  className="surface surface-hover flex items-center gap-2 p-2"
                >
                  <EntityIcon src={card.icon} alt={card.name} size={34} rarity={card.rarityRank} rounded="md" />
                  <div>
                    <p className="text-[0.78rem] font-semibold">{card.name}</p>
                    <p className="text-[0.65rem] text-[var(--muted-dim)]">v{entry.version} · {entry.status}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="section-title mb-3">Tier lists</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tierLists.map((list) => (
            <Link
              key={list.mode}
              href={`/${game.slug}/tier-list/${list.mode}`}
              className="surface surface-hover p-4"
            >
              <p className="text-sm font-bold">{list.label}</p>
              <p className="mt-1 text-[0.78rem] leading-snug text-[var(--muted-dim)]">
                {list.description}
              </p>
              <p className="mt-3 text-[0.7rem] text-[var(--muted-dim)]">
                {list.entries.length} entrées · mise à jour le{" "}
                {new Date(list.updated).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="section-title">{game.labels.characters} — mise en avant</h2>
          <Link
            href={`/${game.slug}/personnages`}
            className="text-[0.78rem] text-[var(--muted-dim)] hover:text-[var(--text)]"
          >
            Voir les {counts.characters} {game.labels.characters.toLowerCase()} →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
          {latest.map((card) => (
            <CharacterCardTile key={card.slug} card={card} game={game} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="section-title mb-3">Sources de référence</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {game.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="surface surface-hover p-3"
            >
              <p className="text-[0.83rem] font-bold" style={{ color: game.accent }}>
                {source.label} ↗
              </p>
              <p className="mt-0.5 text-[0.72rem] leading-snug text-[var(--muted-dim)]">{source.note}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="section-title mb-3">Guides disponibles</h2>
          {guides.length === 0 ? (
            <p className="surface p-4 text-sm text-[var(--muted-dim)]">
              Aucun guide publié pour ce jeu pour l&apos;instant.
            </p>
          ) : (
            <div className="space-y-2">
              {guides.map((guide) => {
                const card = cards.find((entry) => entry.slug === guide.slug);
                return (
                  <Link
                    key={guide.slug}
                    href={`/${game.slug}/personnages/${guide.slug}`}
                    className="surface surface-hover flex gap-3 p-3"
                  >
                    <EntityIcon src={card?.icon ?? null} alt={card?.name ?? guide.slug} size={48} rarity={card?.rarityRank} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{card?.name ?? guide.slug}</p>
                      <p className="line-clamp-2 text-[0.75rem] leading-snug text-[var(--muted-dim)]">
                        {guide.summary}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title mb-3">Actualités</h2>
          <div className="space-y-2">
            {news.map((item) => (
              <Link key={item.slug} href={`/actualites/${item.slug}`} className="surface surface-hover block p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="chip">{item.category}</span>
                  <span className="text-[0.7rem] text-[var(--muted-dim)]">
                    {new Date(item.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="text-[0.85rem] font-semibold">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-[0.75rem] text-[var(--muted-dim)]">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
