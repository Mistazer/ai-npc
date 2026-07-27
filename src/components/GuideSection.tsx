import Link from "next/link";
import { Panel } from "./ui";
import { EntityIcon } from "./EntityIcon";
import { getCharacterCards } from "@/lib/data";
import type { CharacterGuide, GameConfig } from "@/lib/types";

export function GuideSection({ guide, game }: { guide: CharacterGuide; game: GameConfig }) {
  const roster = getCharacterCards(game.id);

  return (
    <div className="space-y-4">
      <Panel title="Analyse">
        <p className="text-[0.87rem] leading-relaxed text-[var(--muted)]">{guide.summary}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[rgba(98,217,138,0.3)] bg-[rgba(98,217,138,0.06)] p-3">
            <p className="mb-2 text-[0.78rem] font-bold text-[#62d98a]">Points forts</p>
            <ul className="space-y-1.5">
              {guide.pros.map((item) => (
                <li key={item} className="flex gap-2 text-[0.8rem] leading-snug text-[var(--muted)]">
                  <span className="text-[#62d98a]">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[rgba(255,84,112,0.3)] bg-[rgba(255,84,112,0.06)] p-3">
            <p className="mb-2 text-[0.78rem] font-bold text-[#ff5470]">Points faibles</p>
            <ul className="space-y-1.5">
              {guide.cons.map((item) => (
                <li key={item} className="flex gap-2 text-[0.8rem] leading-snug text-[var(--muted)]">
                  <span className="text-[#ff5470]">−</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Builds recommandés">
        <div className="space-y-3">
          {guide.builds.map((build) => (
            <div key={build.title} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-[0.83rem] font-bold" style={{ color: game.accent }}>
                  {build.title}
                </p>
                {build.badge ? (
                  <span className="chip chip-accent" style={{ borderColor: game.accent, color: game.accent }}>
                    {build.badge}
                  </span>
                ) : null}
              </div>
              <ul className="space-y-1">
                {build.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8rem] leading-snug text-[var(--muted)]">
                    <span className="text-[var(--muted-dim)]">›</span>
                    {item}
                  </li>
                ))}
              </ul>
              {build.note ? (
                <p className="mt-2 border-t border-[var(--border)] pt-2 text-[0.75rem] italic text-[var(--muted-dim)]">
                  {build.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Équipes">
        <div className="space-y-3">
          {guide.teams.map((team) => (
            <div key={team.name} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <p className="mb-2 text-[0.83rem] font-bold">{team.name}</p>
              <div className="flex flex-wrap gap-2">
                {team.members.map((memberSlug) => {
                  const member = roster.find((card) => card.slug === memberSlug);
                  if (!member) {
                    return (
                      <span key={memberSlug} className="chip">
                        {memberSlug.replace(/-/g, " ")}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={memberSlug}
                      href={`/${game.slug}/personnages/${member.slug}`}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--panel)] px-2 py-1.5 transition hover:border-[var(--accent)]"
                    >
                      <EntityIcon src={member.icon} alt={member.name} size={28} rarity={member.rarityRank} rounded="md" />
                      <span className="text-[0.78rem] font-medium">{member.name}</span>
                    </Link>
                  );
                })}
              </div>
              {team.note ? (
                <p className="mt-2 text-[0.75rem] italic text-[var(--muted-dim)]">{team.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      {guide.verdict ? (
        <Panel title="Verdict">
          <p className="text-[0.87rem] leading-relaxed text-[var(--muted)]">{guide.verdict}</p>
        </Panel>
      ) : null}

      {guide.sources && guide.sources.length > 0 ? (
        <Panel title="Sources consultées">
          <div className="flex flex-wrap gap-2">
            {guide.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip transition hover:border-[var(--accent)]"
              >
                {source.label} ↗
              </a>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
