import type { Metadata } from "next";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { sortedNews } from "@/content/news";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Actualités, mises à jour de tier lists et guides pour Honkai: Star Rail, Genshin Impact et Zenless Zone Zero.",
};

export default function NewsIndex() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <h1 className="mb-1 text-2xl font-black tracking-tight">Actualités</h1>
      <p className="mb-6 text-[0.85rem] text-[var(--muted)]">
        Mises à jour du site, révisions de tier lists et guides de fond.
      </p>

      <div className="space-y-3">
        {sortedNews.map((item) => {
          const game = item.game === "all" ? null : GAMES[item.game];
          return (
            <Link key={item.slug} href={`/actualites/${item.slug}`} className="surface surface-hover block p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="chip">{item.category}</span>
                {game ? (
                  <span className="chip" style={{ borderColor: game.accent, color: game.accent }}>
                    {game.shortName}
                  </span>
                ) : (
                  <span className="chip">Tous les jeux</span>
                )}
                <span className="text-[0.72rem] text-[var(--muted-dim)]">
                  {new Date(item.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                </span>
              </div>
              <p className="text-[1rem] font-bold leading-snug">{item.title}</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--muted)]">{item.excerpt}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
