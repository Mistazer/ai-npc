import { EntityIcon } from "./EntityIcon";
import { Illustration } from "./Illustration";
import type { CharacterCard, GameConfig, Tier } from "@/lib/types";

const TIER_CLASS: Record<string, string> = {
  T0: "tier-t0",
  "T0.5": "tier-t05",
  T1: "tier-t1",
  "T1.5": "tier-t15",
  T2: "tier-t2",
  T3: "tier-t3",
};

export function CharacterHero({
  card,
  game,
  subtitle,
  chips,
  tiers,
}: {
  card: CharacterCard;
  game: GameConfig;
  subtitle?: string | null;
  chips: { label: string; value: string }[];
  tiers: { label: string; tier: Tier; href: string }[];
}) {
  return (
    <section className="surface relative mb-6 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.18]" style={{ background: game.gradient }} />
      {card.splash ? (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2 overflow-hidden opacity-25 [mask-image:linear-gradient(to_left,black,transparent)]"
        >
          <Illustration src={card.splash} alt="" className="h-full w-full rounded-none object-cover" />
        </div>
      ) : null}

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <EntityIcon
          src={card.icon}
          alt={card.name}
          size={112}
          rarity={card.rarityRank}
          className="h-24 w-24 sm:h-28 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className="chip"
              style={{
                borderColor: card.rarityRank === 5 ? "var(--r-5)" : "var(--r-4)",
                color: card.rarityRank === 5 ? "var(--r-5)" : "var(--r-4)",
              }}
            >
              {card.rarityLabel}
            </span>
            {chips.map((chip) => (
              <span key={chip.label} className="chip">
                <span className="text-[var(--muted-dim)]">{chip.label}</span> {chip.value}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{card.name}</h1>
          {subtitle ? <p className="mt-0.5 text-[0.85rem] text-[var(--muted)]">{subtitle}</p> : null}

          {tiers.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tiers.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.href}
                  className={`flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 transition hover:border-[var(--accent)] ${TIER_CLASS[entry.tier]}`}
                >
                  <span
                    className="grid h-6 w-7 place-items-center rounded text-[0.72rem] font-black text-black"
                    style={{ background: "var(--tier)" }}
                  >
                    {entry.tier}
                  </span>
                  <span className="text-[0.75rem] text-[var(--muted)]">{entry.label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
