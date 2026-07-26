import Link from "next/link";
import { GAME_LIST } from "@/lib/games";
import { getCharacterCards, getCounts, meta } from "@/lib/data";
import { getTierListsForGame } from "@/content/tierlists";
import { sortedNews } from "@/content/news";
import { GUIDES } from "@/content/guides";

export default function HomePage() {
  const totals = GAME_LIST.reduce(
    (acc, game) => {
      const counts = getCounts(game.id);
      acc.characters += counts.characters;
      acc.weapons += counts.weapons;
      acc.artifacts += counts.artifacts;
      return acc;
    },
    { characters: 0, weapons: 0, artifacts: 0 },
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      {/* Héro */}
      <section className="mb-10">
        <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-[2.6rem]">
          La base de données <span style={{ color: "#7c9cff" }}>et</span> les tier lists des trois
          jeux HoYoverse.
        </h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--muted)]">
          {totals.characters} personnages, {totals.weapons} armes et {totals.artifacts} sets
          d&apos;équipement pour Honkai: Star Rail, Genshin Impact et Zenless Zone Zero. Fiches
          détaillées, filtres, tier lists commentées et guides de build — le tout en français.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {GAME_LIST.map((game) => (
            <Link key={game.id} href={`/${game.slug}`} className="btn" style={{ borderColor: game.accent }}>
              <span className="h-2 w-2 rounded-full" style={{ background: game.accent }} />
              {game.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Cartes de jeu */}
      <section className="mb-12 grid gap-4 lg:grid-cols-3">
        {GAME_LIST.map((game) => {
          const counts = getCounts(game.id);
          const featured = getCharacterCards(game.id)
            .filter((card) => card.rarityRank === 5)
            .slice(0, 6);

          return (
            <div key={game.id} className="surface overflow-hidden">
              <div className="p-5" style={{ background: game.gradient }}>
                <p className="text-lg font-black tracking-tight text-white drop-shadow">{game.name}</p>
                <p className="mt-1 text-[0.8rem] leading-snug text-white/85">{game.tagline}</p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-b border-[var(--border)]">
                {[
                  { label: game.labels.characters, value: counts.characters, href: "personnages" },
                  { label: game.labels.weapons, value: counts.weapons, href: "armes" },
                  { label: game.labels.artifacts, value: counts.artifacts, href: "sets" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={`/${game.slug}/${item.href}`}
                    className="px-2 py-3 text-center transition hover:bg-[var(--panel-hover)]"
                  >
                    <p className="text-lg font-bold" style={{ color: game.accent }}>
                      {item.value}
                    </p>
                    <p className="truncate text-[0.68rem] text-[var(--muted-dim)]">{item.label}</p>
                  </Link>
                ))}
              </div>

              <div className="p-4">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {getTierListsForGame(game.id).map((list) => (
                    <Link
                      key={list.mode}
                      href={`/${game.slug}/tier-list/${list.mode}`}
                      className="chip chip-accent"
                      style={{ borderColor: game.accent, color: game.accent }}
                    >
                      {list.label}
                    </Link>
                  ))}
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {featured.map((card) => (
                    <Link
                      key={card.slug}
                      href={`/${game.slug}/personnages/${card.slug}`}
                      title={card.name}
                      className="aspect-square overflow-hidden rounded-lg border border-[var(--border-strong)] transition hover:border-[var(--accent)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.icon ?? ""}
                        alt={card.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Guides + actualités */}
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="section-title">Guides de personnage</h2>
            <span className="text-[0.75rem] text-[var(--muted-dim)]">{GUIDES.length} guides détaillés</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GUIDES.map((guide) => {
              const game = GAME_LIST.find((entry) => entry.id === guide.game)!;
              const card = getCharacterCards(guide.game).find((entry) => entry.slug === guide.slug);
              if (!card) return null;

              return (
                <Link
                  key={`${guide.game}-${guide.slug}`}
                  href={`/${game.slug}/personnages/${guide.slug}`}
                  className="surface surface-hover flex gap-3 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.icon ?? ""}
                    alt={card.name}
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-lg border border-[var(--border-strong)] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-semibold" style={{ color: game.accent }}>
                      {game.shortName}
                    </p>
                    <p className="text-sm font-bold">{card.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-[var(--muted-dim)]">
                      {guide.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="section-title">Actualités</h2>
            <Link href="/actualites" className="text-[0.75rem] text-[var(--muted-dim)] hover:text-[var(--text)]">
              Tout voir →
            </Link>
          </div>
          <div className="space-y-2">
            {sortedNews.slice(0, 5).map((item) => (
              <Link key={item.slug} href={`/actualites/${item.slug}`} className="surface surface-hover block p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="chip">{item.category}</span>
                  <span className="text-[0.7rem] text-[var(--muted-dim)]">
                    {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-[0.85rem] font-semibold leading-snug">{item.title}</p>
              </Link>
            ))}
          </div>

          <div className="surface mt-4 p-4">
            <p className="mb-2 text-[0.8rem] font-bold">Sources des données</p>
            <ul className="space-y-1 text-[0.72rem] text-[var(--muted-dim)]">
              {Object.entries(meta.sources).map(([key, value]) => (
                <li key={key}>
                  <span className="font-mono uppercase">{key}</span> — {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
