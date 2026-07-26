import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SearchProvider } from "@/components/SearchProvider";
import { GAME_LIST } from "@/lib/games";
import { meta } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hoyodex.local"),
  title: {
    default: "HoyoDex — Base de données et tier lists HSR, Genshin & ZZZ",
    template: "%s | HoyoDex",
  },
  description:
    "Base de données complète et tier lists commentées pour Honkai: Star Rail, Genshin Impact et Zenless Zone Zero : personnages, armes, artéfacts, builds et guides en français.",
  keywords: [
    "Honkai Star Rail",
    "Genshin Impact",
    "Zenless Zone Zero",
    "tier list",
    "guide",
    "build",
    "base de données",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "HoyoDex",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const syncedAt = new Date(meta.syncedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <html lang="fr">
      <body>
        <SearchProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>

            <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="mb-2 text-sm font-bold">HoyoDex</p>
                  <p className="text-[0.8rem] leading-relaxed text-[var(--muted-dim)]">
                    Base de données et tier lists pour les trois jeux HoYoverse, en français.
                    Données synchronisées le {syncedAt}.
                  </p>
                </div>

                {GAME_LIST.map((game) => (
                  <div key={game.id}>
                    <p className="mb-2 text-sm font-bold" style={{ color: game.accent }}>
                      {game.name}
                    </p>
                    <ul className="space-y-1 text-[0.8rem] text-[var(--muted-dim)]">
                      <li>
                        <Link href={`/${game.slug}/personnages`} className="hover:text-[var(--text)]">
                          {game.labels.characters}
                        </Link>
                      </li>
                      <li>
                        <Link href={`/${game.slug}/armes`} className="hover:text-[var(--text)]">
                          {game.labels.weapons}
                        </Link>
                      </li>
                      <li>
                        <Link href={`/${game.slug}/sets`} className="hover:text-[var(--text)]">
                          {game.labels.artifacts}
                        </Link>
                      </li>
                      <li>
                        <Link href={`/${game.slug}/tier-list`} className="hover:text-[var(--text)]">
                          Tier lists
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] px-4 py-5">
                <p className="mx-auto max-w-[1400px] text-[0.72rem] leading-relaxed text-[var(--muted-dim)]">
                  HoyoDex est un projet communautaire non officiel. Honkai: Star Rail, Genshin Impact et
                  Zenless Zone Zero sont des marques de HoYoverse / COGNOSPHERE PTE. LTD. Tous les
                  visuels et noms restent la propriété de leurs détenteurs respectifs. Données de jeu
                  issues de <span className="text-[var(--muted)]">genshin-db</span>,{" "}
                  <span className="text-[var(--muted)]">Mar-7th/StarRailRes</span> et{" "}
                  <span className="text-[var(--muted)]">Hakushin</span>.
                </p>
              </div>
            </footer>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
