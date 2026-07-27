import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityIcon } from "@/components/EntityIcon";
import { Panel } from "@/components/ui";
import { GAME_LIST, getGame } from "@/lib/games";
import { getCharacterCards } from "@/lib/data";
import { getBetaForGame } from "@/content/beta";

export function generateStaticParams() {
  return GAME_LIST.map((game) => ({ game: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `Bêta ${game.name} — personnages à venir`,
    description: `Personnages et agents en bêta ou annoncés pour ${game.name} : versions prévues, kits provisoires et statut de chaque unité.`,
  };
}

const STATUS_COLOR: Record<string, string> = {
  Bêta: "#ff8f4d",
  Annoncé: "#7c9cff",
  Datamine: "#9aa4bd",
};

export default async function BetaPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const entries = getBetaForGame(game.id);
  const cards = getCharacterCards(game.id);

  // Regroupement par version de jeu prévue.
  const byVersion = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = byVersion.get(entry.version) ?? [];
    list.push(entry);
    byVersion.set(entry.version, list);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">Bêta — {game.name}</h1>
      <p className="mb-4 max-w-3xl text-[0.85rem] leading-relaxed text-[var(--muted)]">
        Personnages annoncés ou repérés dans les fichiers de test, pas encore disponibles en version
        live. Les kits, multiplicateurs et statistiques évoluent d&apos;une itération de bêta à
        l&apos;autre.
      </p>

      <div className="mb-6 rounded-xl border border-[rgba(255,143,77,0.35)] bg-[rgba(255,143,77,0.07)] p-3">
        <p className="text-[0.8rem] leading-relaxed text-[var(--muted)]">
          <strong className="text-[#ff8f4d]">Données provisoires.</strong> Ces informations
          proviennent de versions de test et ne reflètent pas nécessairement le contenu final. Les
          personnages marqués <em>Datamine</em> n&apos;ont fait l&apos;objet d&apos;aucune annonce
          officielle.
        </p>
      </div>

      {entries.length === 0 ? (
        <Panel>
          <p className="text-sm text-[var(--muted-dim)]">
            Aucun contenu bêta suivi pour {game.name} actuellement.
          </p>
        </Panel>
      ) : (
        <div className="space-y-6">
          {[...byVersion.entries()].map(([version, list]) => (
            <section key={version}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="section-title">Version {version}</h2>
                <span className="chip">{list.length}</span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((entry) => {
                  const card = cards.find((item) => item.slug === entry.slug);
                  if (!card) return null;

                  return (
                    <Link
                      key={entry.slug}
                      href={`/${game.slug}/personnages/${entry.slug}`}
                      className="surface surface-hover flex gap-3 p-3"
                    >
                      <EntityIcon src={card.icon} alt={card.name} size={56} rarity={card.rarityRank} />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[0.88rem] font-bold">{card.name}</span>
                          <span
                            className="chip"
                            style={{
                              borderColor: STATUS_COLOR[entry.status],
                              color: STATUS_COLOR[entry.status],
                            }}
                          >
                            {entry.status}
                          </span>
                        </div>
                        <p className="mb-1 text-[0.7rem] text-[var(--muted-dim)]">
                          {[card.rarityLabel, card.elementFr, card.roleFr].filter(Boolean).join(" · ")}
                        </p>
                        <p className="line-clamp-3 text-[0.75rem] leading-snug text-[var(--muted)]">
                          {entry.summary}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-[0.75rem] leading-relaxed text-[var(--muted-dim)]">
        Suivi des versions de test inspiré de{" "}
        <a href="https://gachabase.net" className="underline hover:text-[var(--text)]">
          GachaBase
        </a>
        , qui référence en continu le contenu bêta et CBT des trois jeux.
      </p>
    </div>
  );
}
