import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityIcon } from "@/components/EntityIcon";
import { getGame } from "@/lib/games";
import { getCharacterCards } from "@/lib/data";
import { getTierListsForGame } from "@/content/tierlists";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `Tier lists ${game.name}`,
    description: `Tier lists commentées de ${game.name} pour chaque mode de fin de jeu, mises à jour à chaque patch.`,
  };
}

export default async function TierListIndex({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const lists = getTierListsForGame(game.id);
  const cards = getCharacterCards(game.id);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">Tier lists — {game.name}</h1>
      <p className="mb-5 max-w-2xl text-[0.85rem] text-[var(--muted)]">
        Chaque mode de fin de jeu a ses propres exigences : un personnage excellent en mono-cible peut
        être médiocre face à des vagues. Nos classements sont donc établis par contenu.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
          const top = list.entries
            .filter((entry) => entry.tier === "T0")
            .map((entry) => cards.find((card) => card.slug === entry.slug))
            .filter(Boolean)
            .slice(0, 6);

          return (
            <Link key={list.mode} href={`/${game.slug}/tier-list/${list.mode}`} className="surface surface-hover overflow-hidden">
              <div className="p-4">
                <p className="text-[0.95rem] font-bold">{list.label}</p>
                <p className="mt-1 text-[0.78rem] leading-snug text-[var(--muted-dim)]">{list.description}</p>
              </div>
              <div className="flex gap-1.5 border-t border-[var(--border)] p-3">
                {top.map((card) => (
                  <EntityIcon key={card!.slug} src={card!.icon} alt={card!.name} size={40} rarity={card!.rarityRank} />
                ))}
              </div>
              <p className="border-t border-[var(--border)] px-4 py-2 text-[0.7rem] text-[var(--muted-dim)]">
                {list.entries.length} entrées · {new Date(list.updated).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
