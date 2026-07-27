import type { Metadata } from "next";
import Link from "next/link";
import { EntityIcon } from "@/components/EntityIcon";
import { GAME_LIST } from "@/lib/games";
import { getCharacterCards } from "@/lib/data";
import { getBetaForGame } from "@/content/beta";

export const metadata: Metadata = {
  title: "Bêta — personnages à venir sur les trois jeux",
  description:
    "Suivi du contenu bêta et des personnages annoncés pour Honkai: Star Rail, Genshin Impact et Zenless Zone Zero : versions prévues, statut et kits provisoires.",
};

const STATUS_COLOR: Record<string, string> = {
  Bêta: "#ff8f4d",
  Annoncé: "#7c9cff",
  Datamine: "#9aa4bd",
};

export default function BetaHub() {
  const sections = GAME_LIST.map((game) => ({
    game,
    entries: getBetaForGame(game.id),
    cards: getCharacterCards(game.id),
  })).filter((section) => section.entries.length > 0);

  const total = sections.reduce((sum, section) => sum + section.entries.length, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <h1 className="mb-1 text-2xl font-black tracking-tight">Contenu bêta</h1>
      <p className="mb-4 max-w-3xl text-[0.85rem] leading-relaxed text-[var(--muted)]">
        {total} personnages annoncés ou repérés dans les fichiers de test des trois jeux, pas encore
        disponibles en version live.
      </p>

      <div className="mb-8 rounded-xl border border-[rgba(255,143,77,0.35)] bg-[rgba(255,143,77,0.07)] p-3">
        <p className="text-[0.8rem] leading-relaxed text-[var(--muted)]">
          <strong className="text-[#ff8f4d]">Données provisoires.</strong> Kits, multiplicateurs et
          statistiques évoluent d&apos;une itération de bêta à l&apos;autre. Les entrées{" "}
          <em>Datamine</em> n&apos;ont fait l&apos;objet d&apos;aucune annonce officielle.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map(({ game, entries, cards }) => (
          <section key={game.id}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="section-title" style={{ color: game.accent }}>
                {game.name}
              </h2>
              <Link
                href={`/${game.slug}/beta`}
                className="text-[0.78rem] text-[var(--muted-dim)] hover:text-[var(--text)]"
              >
                Détail des {entries.length} entrées →
              </Link>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => {
                const card = cards.find((item) => item.slug === entry.slug);
                if (!card) return null;

                return (
                  <Link
                    key={entry.slug}
                    href={`/${game.slug}/personnages/${entry.slug}`}
                    className="surface surface-hover flex gap-3 p-3"
                  >
                    <EntityIcon src={card.icon} alt={card.name} size={52} rarity={card.rarityRank} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[0.85rem] font-bold">{card.name}</span>
                        <span
                          className="chip"
                          style={{
                            borderColor: STATUS_COLOR[entry.status],
                            color: STATUS_COLOR[entry.status],
                          }}
                        >
                          {entry.status}
                        </span>
                        <span className="chip">v{entry.version}</span>
                      </div>
                      <p className="line-clamp-2 text-[0.74rem] leading-snug text-[var(--muted)]">
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
