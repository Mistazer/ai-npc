import { notFound } from "next/navigation";
import { GameTheme } from "@/components/GameThemeProvider";
import { GameNav } from "@/components/GameNav";
import { GAME_LIST, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAME_LIST.map((game) => ({ game: game.slug }));
}

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ game: string }>;
}) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <GameTheme game={game}>
      <GameNav game={game} />
      {children}
    </GameTheme>
  );
}
