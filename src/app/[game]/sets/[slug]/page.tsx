import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, GameText, Panel } from "@/components/ui";
import { EntityIcon } from "@/components/EntityIcon";
import { GAME_LIST, getGame } from "@/lib/games";
import { getArtifact, getArtifacts } from "@/lib/data";
import type { GiArtifact, HsrRelic, ZzzDisc } from "@/lib/types";

export function generateStaticParams() {
  return GAME_LIST.flatMap((game) =>
    getArtifacts(game.id).map((entry) => ({ game: game.slug, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  const entry = game ? getArtifact(game.id, slug) : undefined;
  if (!game || !entry) return {};
  return {
    title: `${entry.name} — ${game.labels.artifact} (${game.shortName})`,
    description: `Bonus de set complet de ${entry.name} dans ${game.name}.`,
  };
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  if (!game) notFound();
  const entry = getArtifact(game.id, slug);
  if (!entry) notFound();

  const bonuses = (entry as GiArtifact | HsrRelic | ZzzDisc).bonuses;
  const rarity = game.id === "gi" ? (entry as GiArtifact).rarity : 5;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <Breadcrumbs
        items={[
          { label: game.shortName, href: `/${game.slug}` },
          { label: game.labels.artifacts, href: `/${game.slug}/sets` },
          { label: entry.name },
        ]}
      />

      <section className="surface relative mb-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ background: game.gradient }} />
        <div className="relative flex items-center gap-4 p-5">
          <EntityIcon src={entry.images.icon} alt={entry.name} size={80} rarity={rarity} />
          <div>
            <div className="mb-1 flex flex-wrap gap-2">
              {game.id === "gi" ? (
                <span className="chip">{(entry as GiArtifact).rarities.map((r) => `${r}★`).join(" / ")}</span>
              ) : null}
              {game.id === "hsr" ? <span className="chip">{(entry as HsrRelic).kindFr}</span> : null}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{entry.name}</h1>
          </div>
        </div>
      </section>

      <Panel title="Bonus de set" className="mb-4">
        <div className="space-y-2">
          {bonuses.map((bonus) => (
            <div
              key={bonus.pieces}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
            >
              <p className="mb-1 text-[0.78rem] font-bold" style={{ color: game.accent }}>
                {bonus.pieces} pièces
              </p>
              <GameText>{bonus.effect}</GameText>
            </div>
          ))}
        </div>
      </Panel>

      {game.id === "gi" && (entry as GiArtifact).pieces.length > 0 ? (
        <Panel title="Pièces du set">
          <div className="grid gap-2 sm:grid-cols-2">
            {(entry as GiArtifact).pieces.map((piece) => (
              <div key={piece.slot} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <EntityIcon src={piece.icon} alt={piece.name} size={44} rarity={rarity} />
                <div className="min-w-0">
                  <p className="text-[0.82rem] font-semibold">{piece.name}</p>
                  <p className="mt-1 line-clamp-3 text-[0.73rem] leading-snug text-[var(--muted-dim)]">
                    {piece.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
