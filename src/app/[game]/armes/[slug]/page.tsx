/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, GameText, Panel, StatGrid } from "@/components/ui";
import { EntityIcon } from "@/components/EntityIcon";
import { GAME_LIST, getGame } from "@/lib/games";
import { getWeapon, getWeapons } from "@/lib/data";
import type { GiWeapon, HsrLightCone, ZzzWeapon } from "@/lib/types";

export function generateStaticParams() {
  return GAME_LIST.flatMap((game) =>
    getWeapons(game.id).map((weapon) => ({ game: game.slug, slug: weapon.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  const weapon = game ? getWeapon(game.id, slug) : undefined;
  if (!game || !weapon) return {};
  return {
    title: `${weapon.name} — ${game.labels.weapon} (${game.shortName})`,
    description: `Statistiques et effet passif de ${weapon.name} dans ${game.name}.`,
  };
}

export default async function WeaponPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  if (!game) notFound();
  const weapon = getWeapon(game.id, slug);
  if (!weapon) notFound();

  const rarityRank =
    game.id === "zzz" ? (weapon as ZzzWeapon).rarityRank : ((weapon as GiWeapon).rarity as number);
  const rarityLabel = game.id === "zzz" ? (weapon as ZzzWeapon).rarity : `${(weapon as GiWeapon).rarity}★`;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <Breadcrumbs
        items={[
          { label: game.shortName, href: `/${game.slug}` },
          { label: game.labels.weapons, href: `/${game.slug}/armes` },
          { label: weapon.name },
        ]}
      />

      <section className="surface relative mb-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ background: game.gradient }} />
        <div className="relative flex items-center gap-4 p-5">
          <EntityIcon src={weapon.images.icon} alt={weapon.name} size={90} rarity={rarityRank} />
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="chip" style={{ borderColor: "var(--r-5)", color: "var(--r-5)" }}>
                {rarityLabel}
              </span>
              {game.id === "gi" ? <span className="chip">{(weapon as GiWeapon).typeFr}</span> : null}
              {game.id === "hsr" ? <span className="chip">{(weapon as HsrLightCone).pathFr}</span> : null}
              {game.id === "zzz" && (weapon as ZzzWeapon).specialtyFr ? (
                <span className="chip">{(weapon as ZzzWeapon).specialtyFr}</span>
              ) : null}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{weapon.name}</h1>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {game.id === "gi" ? (
            <>
              <Panel title={(weapon as GiWeapon).effectName ?? "Effet passif"}>
                <GameText>{(weapon as GiWeapon).effect}</GameText>
                {(weapon as GiWeapon).refinements.length > 1 ? (
                  <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
                    <p className="text-[0.75rem] font-semibold text-[var(--muted-dim)]">Par raffinement</p>
                    {(weapon as GiWeapon).refinements.map((text, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="chip shrink-0">R{index + 1}</span>
                        <GameText className="flex-1">{text}</GameText>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Panel>
              {(weapon as GiWeapon).description ? (
                <Panel title="Description">
                  <GameText>{(weapon as GiWeapon).description}</GameText>
                </Panel>
              ) : null}
            </>
          ) : null}

          {game.id === "hsr" ? (
            <>
              <Panel title="Effet">
                <GameText>{(weapon as HsrLightCone).effect}</GameText>
              </Panel>
              <Panel title="Description">
                <GameText>{(weapon as HsrLightCone).description}</GameText>
              </Panel>
            </>
          ) : null}

          {game.id === "zzz" ? (
            <>
              <Panel title={(weapon as ZzzWeapon).effectName ?? "Effet"}>
                <GameText>{(weapon as ZzzWeapon).effect}</GameText>
              </Panel>
              {(weapon as ZzzWeapon).description ? (
                <Panel title="Description">
                  <GameText>{(weapon as ZzzWeapon).description}</GameText>
                </Panel>
              ) : null}
            </>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Panel title="Statistiques">
            <StatGrid
              stats={
                game.id === "gi"
                  ? [
                      { label: "ATQ de base", value: String((weapon as GiWeapon).baseAtk ?? "—") },
                      { label: "Stat secondaire", value: (weapon as GiWeapon).mainStat ?? "—" },
                    ]
                  : game.id === "zzz"
                    ? [
                        { label: "ATQ de base", value: String((weapon as ZzzWeapon).baseAtk ?? "—") },
                        { label: "Stat secondaire", value: (weapon as ZzzWeapon).subStat ?? "—" },
                      ]
                    : [{ label: "Voie", value: (weapon as HsrLightCone).pathFr }]
              }
            />
          </Panel>

          {weapon.images.splash ? (
            <Panel title="Illustration">
              <img src={weapon.images.splash} alt={weapon.name} loading="lazy" className="w-full rounded-lg" />
            </Panel>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
