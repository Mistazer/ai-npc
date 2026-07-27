import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterHero } from "@/components/CharacterHero";
import { GuideSection } from "@/components/GuideSection";
import { EntityIcon } from "@/components/EntityIcon";
import { Accordion, Breadcrumbs, GameText, Panel, StatGrid } from "@/components/ui";
import { GAME_LIST, getGame } from "@/lib/games";
import { getCharacter, getCharacterCard, getCharacterCards } from "@/lib/data";
import { getGuide } from "@/content/guides";
import { getTierListsForGame } from "@/content/tierlists";
import { getBetaEntry } from "@/content/beta";
import type { GiCharacter, HsrCharacter, Tier, ZzzCharacter } from "@/lib/types";

export function generateStaticParams() {
  return GAME_LIST.flatMap((game) =>
    getCharacterCards(game.id).map((card) => ({ game: game.slug, slug: card.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  const card = game ? getCharacterCard(game.id, slug) : undefined;
  if (!game || !card) return {};

  return {
    title: `${card.name} — build, compétences et tier list (${game.shortName})`,
    description: `Fiche complète de ${card.name} dans ${game.name} : statistiques, compétences, ${
      game.id === "gi" ? "constellations" : game.id === "hsr" ? "éidolons" : "mindscapes"
    }, build recommandé et classement en tier list.`,
  };
}

const percent = (value: number | null | undefined, alreadyPercent = false) =>
  value === null || value === undefined ? "—" : `${(alreadyPercent ? value : value * 100).toFixed(1)} %`;

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const game = getGame(gameSlug);
  if (!game) notFound();

  const card = getCharacterCard(game.id, slug);
  const character = getCharacter(game.id, slug);
  if (!card || !character) notFound();

  const guide = getGuide(game.id, slug);
  const beta = getBetaEntry(game.id, slug);

  const tiers = getTierListsForGame(game.id)
    .map((list) => {
      const entry = list.entries.find((item) => item.slug === slug);
      if (!entry) return null;
      return { label: list.label, tier: entry.tier as Tier, href: `/${game.slug}/tier-list/${list.mode}` };
    })
    .filter((value): value is { label: string; tier: Tier; href: string } => value !== null);

  const tierNotes = getTierListsForGame(game.id)
    .map((list) => {
      const entry = list.entries.find((item) => item.slug === slug);
      return entry?.note ? { label: list.label, note: entry.note, tier: entry.tier } : null;
    })
    .filter(Boolean) as { label: string; note: string; tier: string }[];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <Breadcrumbs
        items={[
          { label: game.shortName, href: `/${game.slug}` },
          { label: game.labels.characters, href: `/${game.slug}/personnages` },
          { label: card.name },
        ]}
      />

      {beta ? (
        <div className="mb-4 rounded-xl border border-[rgba(255,143,77,0.4)] bg-[rgba(255,143,77,0.08)] p-3">
          <p className="text-[0.82rem] leading-relaxed text-[var(--muted)]">
            <strong className="text-[#ff8f4d]">Contenu {beta.status.toLowerCase()} — version {beta.version}.</strong>{" "}
            {beta.summary} Les valeurs affichées ci-dessous proviennent des fichiers de test et
            changeront probablement avant la sortie.{" "}
            <Link href={`/${game.slug}/beta`} className="underline hover:text-[var(--text)]">
              Voir tout le contenu bêta
            </Link>
          </p>
        </div>
      ) : null}

      <CharacterHero
        card={card}
        game={game}
        subtitle={
          game.id === "gi"
            ? (character as GiCharacter).title
            : game.id === "zzz"
              ? (character as ZzzCharacter).tagline
              : `${(character as HsrCharacter).pathFr} · ${(character as HsrCharacter).elementFr}`
        }
        chips={[
          card.elementFr ? { label: game.labels.element, value: card.elementFr } : null,
          card.roleFr ? { label: game.labels.role, value: card.roleFr } : null,
          card.extra && game.labels.extra ? { label: game.labels.extra, value: card.extra } : null,
        ].filter(Boolean) as { label: string; value: string }[]}
        tiers={tiers}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* ---------------- Genshin Impact ---------------- */}
          {game.id === "gi" ? <GiSections character={character as GiCharacter} /> : null}
          {/* ---------------- Honkai: Star Rail ---------------- */}
          {game.id === "hsr" ? <HsrSections character={character as HsrCharacter} /> : null}
          {/* ---------------- Zenless Zone Zero ---------------- */}
          {game.id === "zzz" ? <ZzzSections character={character as ZzzCharacter} /> : null}

          {guide ? (
            <GuideSection guide={guide} game={game} />
          ) : (
            <Panel title="Guide">
              <p className="text-[0.85rem] text-[var(--muted)]">
                Le guide détaillé de {card.name} n&apos;est pas encore publié. Les statistiques, compétences
                et classements en tier list ci-dessus restent à jour.
              </p>
            </Panel>
          )}
        </div>

        <aside className="space-y-4">
          <Panel title="Statistiques">
            <StatsBlock game={game.id} character={character} />
          </Panel>

          {tierNotes.length > 0 ? (
            <Panel title="Évaluation">
              <div className="space-y-2.5">
                {tierNotes.map((entry) => (
                  <div key={entry.label}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="chip chip-accent">{entry.tier}</span>
                      <span className="text-[0.78rem] font-semibold">{entry.label}</span>
                    </div>
                    <p className="text-[0.78rem] leading-snug text-[var(--muted)]">{entry.note}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel title="Informations">
            <InfoBlock game={game.id} character={character} />
          </Panel>

          <Panel title="Sources de référence">
            <div className="flex flex-wrap gap-1.5">
              {game.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={source.note}
                  className="chip transition hover:border-[var(--accent)]"
                >
                  {source.label} ↗
                </a>
              ))}
            </div>
          </Panel>

          <Panel title={`Autres ${game.labels.characters.toLowerCase()}`}>
            <div className="grid grid-cols-5 gap-1.5">
              {getCharacterCards(game.id)
                .filter((entry) => entry.slug !== slug && entry.elementFr === card.elementFr)
                .slice(0, 10)
                .map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/${game.slug}/personnages/${entry.slug}`}
                    title={entry.name}
                    className="overflow-hidden rounded-lg border border-[var(--border-strong)] transition hover:border-[var(--accent)]"
                  >
                    <EntityIcon src={entry.icon} alt={entry.name} size={56} rarity={entry.rarityRank} className="w-full" />
                  </Link>
                ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */

function StatsBlock({ game, character }: { game: string; character: unknown }) {
  if (game === "gi") {
    const c = character as GiCharacter;
    if (!c.stats) return <p className="text-sm text-[var(--muted-dim)]">Données indisponibles.</p>;
    return (
      <>
        <p className="mb-2 text-[0.7rem] text-[var(--muted-dim)]">Niveau 90, ascension 6</p>
        <StatGrid
          stats={[
            { label: "PV", value: c.stats.hp.toLocaleString("fr-FR") },
            { label: "ATQ", value: c.stats.atk.toLocaleString("fr-FR") },
            { label: "DÉF", value: c.stats.def.toLocaleString("fr-FR") },
            { label: c.substat ?? "Bonus", value: c.stats.special ? percent(c.stats.special) : "—" },
          ]}
        />
      </>
    );
  }

  if (game === "hsr") {
    const c = character as HsrCharacter;
    if (!c.stats) return <p className="text-sm text-[var(--muted-dim)]">Données indisponibles.</p>;
    return (
      <>
        <p className="mb-2 text-[0.7rem] text-[var(--muted-dim)]">Niveau 80, ascension maximale</p>
        <StatGrid
          stats={[
            { label: "PV", value: c.stats.hp?.toLocaleString("fr-FR") ?? "—" },
            { label: "ATQ", value: c.stats.atk?.toLocaleString("fr-FR") ?? "—" },
            { label: "DÉF", value: c.stats.def?.toLocaleString("fr-FR") ?? "—" },
            { label: "VIT", value: String(c.stats.spd ?? "—") },
            { label: "CRIT", value: percent(c.stats.critRate) },
            { label: "DGT CRIT", value: percent(c.stats.critDmg) },
          ]}
        />
      </>
    );
  }

  const c = character as ZzzCharacter;
  return (
    <>
      <p className="mb-2 text-[0.7rem] text-[var(--muted-dim)]">Statistiques de base (niveau 1)</p>
      <StatGrid
        stats={[
          { label: "PV", value: c.stats.hp?.toLocaleString("fr-FR") ?? "—" },
          { label: "ATQ", value: c.stats.atk?.toLocaleString("fr-FR") ?? "—" },
          { label: "DÉF", value: c.stats.def?.toLocaleString("fr-FR") ?? "—" },
          { label: "Impact", value: String(c.stats.impact ?? "—") },
          { label: "CRIT", value: percent(c.stats.critRate, true) },
          { label: "DGT CRIT", value: percent(c.stats.critDmg, true) },
          { label: "Maîtrise anom.", value: String(c.stats.anomalyMastery ?? "—") },
          { label: "Compét. anom.", value: String(c.stats.anomalyProficiency ?? "—") },
          { label: "Régén. énergie", value: c.stats.energyRegen?.toFixed(2) ?? "—" },
        ]}
      />
    </>
  );
}

function InfoBlock({ game, character }: { game: string; character: unknown }) {
  const rows: [string, string | null][] = [];

  if (game === "gi") {
    const c = character as GiCharacter;
    rows.push(
      ["Région", c.region],
      ["Affiliation", c.affiliation],
      ["Anniversaire", c.birthday],
      ["Constellation", c.constellationName],
      ["Version", c.version],
      ["Voix (JP)", c.cv?.japanese ?? null],
    );
  } else if (game === "hsr") {
    const c = character as HsrCharacter;
    rows.push(
      ["Voie", c.pathFr],
      ["Élément", c.elementFr],
      ["Énergie max", c.maxSp ? String(c.maxSp) : null],
    );
  } else {
    const c = character as ZzzCharacter;
    rows.push(
      ["Nom complet", c.fullName],
      ["Faction", c.faction],
      ["Type d'attaque", c.attackType],
      ["Anniversaire", c.birthday],
      ["Rôle", c.role],
    );
  }

  const filtered = rows.filter(([, value]) => Boolean(value));
  if (filtered.length === 0) return <p className="text-sm text-[var(--muted-dim)]">—</p>;

  return (
    <dl className="space-y-1.5">
      {filtered.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 text-[0.8rem]">
          <dt className="text-[var(--muted-dim)]">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------- */

function GiSections({ character }: { character: GiCharacter }) {
  return (
    <>
      {character.description ? (
        <Panel title="Présentation">
          <GameText>{character.description}</GameText>
        </Panel>
      ) : null}

      <Panel title="Talents">
        <Accordion
          items={[
            ...character.talents.combat.map((talent, index) => ({
              key: `c${index}`,
              title: talent.name,
              subtitle: ["Attaque normale", "Compétence élémentaire", "Déchaînement élémentaire"][index] ?? "Talent",
              body: <GameText>{talent.description}</GameText>,
            })),
            ...character.talents.passives.map((talent, index) => ({
              key: `p${index}`,
              title: talent.name,
              subtitle: "Talent passif",
              body: <GameText>{talent.description}</GameText>,
            })),
          ]}
        />
      </Panel>

      <Panel title="Constellations">
        <Accordion
          items={character.constellations.map((constellation) => ({
            key: `c${constellation.level}`,
            title: `C${constellation.level} — ${constellation.name}`,
            body: <GameText>{constellation.description}</GameText>,
          }))}
        />
      </Panel>

      {character.materials.length > 0 ? (
        <Panel title="Matériaux d'ascension (total niveau 90)">
          <div className="flex flex-wrap gap-1.5">
            {character.materials.map((material) => (
              <span key={material.name} className="chip">
                {material.name} <span className="font-bold text-[var(--text)]">×{material.count}</span>
              </span>
            ))}
          </div>
        </Panel>
      ) : null}
    </>
  );
}

function HsrSections({ character }: { character: HsrCharacter }) {
  return (
    <>
      <Panel title="Compétences">
        <Accordion
          items={character.skills.map((skill) => ({
            key: skill.id,
            title: (
              <span className="flex items-center gap-2">
                {skill.icon ? <EntityIcon src={skill.icon} alt={skill.name} size={22} rounded="md" /> : null}
                {skill.name}
              </span>
            ),
            subtitle: [skill.type, skill.effect].filter(Boolean).join(" · "),
            body: (
              <>
                {skill.simple ? (
                  <p className="mb-2 text-[0.78rem] italic text-[var(--muted-dim)]">{skill.simple}</p>
                ) : null}
                <GameText>{skill.description}</GameText>
              </>
            ),
          }))}
        />
      </Panel>

      <Panel title="Éidolons">
        <Accordion
          items={character.eidolons.map((eidolon) => ({
            key: `e${eidolon.level}`,
            title: (
              <span className="flex items-center gap-2">
                {eidolon.icon ? <EntityIcon src={eidolon.icon} alt={eidolon.name} size={22} rounded="md" /> : null}
                E{eidolon.level} — {eidolon.name}
              </span>
            ),
            body: <GameText>{eidolon.description}</GameText>,
          }))}
        />
      </Panel>
    </>
  );
}

function ZzzSections({ character }: { character: ZzzCharacter }) {
  return (
    <>
      {character.description ? (
        <Panel title="Présentation">
          <GameText>{character.description}</GameText>
        </Panel>
      ) : null}

      <Panel title="Compétences">
        <Accordion
          items={character.skills.map((block) => ({
            key: block.type,
            title: block.type,
            subtitle: `${block.entries.length} entrée${block.entries.length > 1 ? "s" : ""}`,
            body: (
              <div className="space-y-3">
                {block.entries.map((entry) => (
                  <div key={entry.name}>
                    <p className="mb-1 text-[0.8rem] font-semibold">{entry.name}</p>
                    <GameText>{entry.description}</GameText>
                  </div>
                ))}
              </div>
            ),
          }))}
        />
      </Panel>

      {character.coreSkills.length > 0 ? (
        <Panel title="Compétences de base">
          <Accordion
            items={character.coreSkills.map((skill, index) => ({
              key: `core${index}`,
              title: skill.name,
              body: <GameText>{skill.description}</GameText>,
            }))}
          />
        </Panel>
      ) : null}

      <Panel title="Mindscape Cinema">
        <Accordion
          items={character.mindscapes.map((mindscape) => ({
            key: `m${mindscape.level}`,
            title: `M${mindscape.level} — ${mindscape.name}`,
            body: (
              <>
                <GameText>{mindscape.description}</GameText>
                {mindscape.extra ? (
                  <p className="mt-2 text-[0.75rem] italic text-[var(--muted-dim)]">{mindscape.extra}</p>
                ) : null}
              </>
            ),
          }))}
        />
      </Panel>
    </>
  );
}
