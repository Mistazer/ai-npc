import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityIcon } from "@/components/EntityIcon";
import { getGame } from "@/lib/games";
import { zzzBangboos } from "@/lib/data";

/** Route propre à ZZZ : on ne génère pas la page pour les deux autres jeux. */
export function generateStaticParams() {
  return [{ game: "zenless-zone-zero" }];
}

export const metadata: Metadata = {
  title: "Bangboo — Zenless Zone Zero",
  description: "Liste complète des Bangboo de Zenless Zone Zero avec leur rareté et leur description.",
};

export default async function BangbooPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game || game.id !== "zzz") notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">Bangboo — Zenless Zone Zero</h1>
      <p className="mb-5 text-[0.85rem] text-[var(--muted)]">
        {zzzBangboos.length} Bangboo référencés. Ils occupent le troisième emplacement d&apos;une équipe et
        déclenchent des attaques de soutien.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {zzzBangboos.map((bangboo) => (
          <div key={bangboo.slug} className="surface flex gap-3 p-3">
            <EntityIcon src={bangboo.images.icon} alt={bangboo.name} size={52} rarity={bangboo.rarityRank} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[0.85rem] font-semibold">{bangboo.name}</p>
                <span
                  className="shrink-0 text-[0.72rem] font-bold"
                  style={{ color: bangboo.rarity === "S" ? "var(--r-5)" : "var(--r-4)" }}
                >
                  {bangboo.rarity}
                </span>
              </div>
              <p className="mt-1 line-clamp-3 text-[0.75rem] leading-snug text-[var(--muted)]">
                {bangboo.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
