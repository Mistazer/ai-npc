import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterBrowser } from "@/components/CharacterBrowser";
import { getGame } from "@/lib/games";
import { getCharacterCards, getFilterOptions } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.labels.characters} ${game.name}`,
    description: `Liste complète et filtrable des ${game.labels.characters.toLowerCase()} de ${game.name} : rareté, ${game.labels.element.toLowerCase()}, ${game.labels.role.toLowerCase()}, statistiques et compétences.`,
  };
}

export default async function CharactersPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const cards = getCharacterCards(game.id);
  const options = getFilterOptions(game.id);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="mb-1 text-2xl font-black tracking-tight">
        {game.labels.characters} — {game.name}
      </h1>
      <p className="mb-5 text-[0.85rem] text-[var(--muted)]">
        {cards.length} {game.labels.characters.toLowerCase()} référencés, filtrables par rareté,{" "}
        {game.labels.element.toLowerCase()} et {game.labels.role.toLowerCase()}.
      </p>
      <CharacterBrowser game={game} cards={cards} options={options} />
    </div>
  );
}
