import Link from "next/link";
import { GAME_LIST } from "@/lib/games";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center px-4 py-24 text-center">
      <p className="text-5xl font-black" style={{ color: "#7c9cff" }}>
        404
      </p>
      <h1 className="mt-3 text-xl font-bold">Cette page n&apos;existe pas</h1>
      <p className="mt-2 text-[0.88rem] text-[var(--muted)]">
        Le contenu recherché a peut-être été renommé lors d&apos;une mise à jour de données.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn">
          Accueil
        </Link>
        {GAME_LIST.map((game) => (
          <Link key={game.id} href={`/${game.slug}`} className="btn" style={{ borderColor: game.accent }}>
            {game.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}
