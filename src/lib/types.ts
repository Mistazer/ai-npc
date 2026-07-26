export type GameId = "gi" | "hsr" | "zzz";

export type Tier = "S+" | "S" | "A" | "B" | "C" | "D";

export interface GameConfig {
  id: GameId;
  name: string;
  shortName: string;
  slug: string;
  accent: string;
  accentSoft: string;
  gradient: string;
  tagline: string;
  /** Libellés spécifiques au jeu, utilisés partout dans l'UI. */
  labels: {
    characters: string;
    character: string;
    weapons: string;
    weapon: string;
    artifacts: string;
    artifact: string;
    element: string;
    role: string;
    extra?: string;
  };
  /** Catégories de tier list disponibles pour ce jeu. */
  tierModes: { id: string; label: string; description: string }[];
}

export interface Bonus {
  pieces: number;
  effect: string;
}

export interface BaseEntity {
  game: GameId;
  id: string;
  slug: string;
  name: string;
  images: { icon: string | null; splash?: string | null; [key: string]: string | null | undefined };
}

export interface GiCharacter extends BaseEntity {
  title: string | null;
  rarity: number;
  element: string;
  elementFr: string;
  weapon: string;
  weaponFr: string;
  region: string | null;
  affiliation: string | null;
  substat: string | null;
  gender: string | null;
  birthday: string | null;
  constellationName: string | null;
  version: string | null;
  description: string;
  stats: { hp: number; atk: number; def: number; special: number | null } | null;
  cv: Record<string, string> | null;
  talents: {
    combat: { name: string; description: string }[];
    passives: { name: string; description: string }[];
  };
  constellations: { level: number; name: string; description: string }[];
  materials: { name: string; count: number }[];
}

export interface GiWeapon extends BaseEntity {
  rarity: number;
  type: string;
  typeFr: string;
  baseAtk: number | null;
  mainStat: string | null;
  effectName: string | null;
  effect: string;
  refinements: string[];
  description: string;
  version: string | null;
}

export interface GiArtifact extends BaseEntity {
  rarities: number[];
  rarity: number;
  bonuses: Bonus[];
  pieces: { slot: string; name: string; description: string; icon: string | null }[];
  version: string | null;
}

export interface HsrCharacter extends BaseEntity {
  rarity: number;
  path: string;
  pathFr: string;
  pathIcon: string | null;
  element: string;
  elementFr: string;
  elementIcon: string | null;
  maxSp: number | null;
  stats: {
    hp: number | null;
    atk: number | null;
    def: number | null;
    spd: number | null;
    critRate: number | null;
    critDmg: number | null;
  } | null;
  skills: {
    id: string;
    name: string;
    type: string;
    effect: string | null;
    icon: string | null;
    simple: string;
    description: string;
  }[];
  eidolons: { level: number; name: string; icon: string | null; description: string }[];
}

export interface HsrLightCone extends BaseEntity {
  rarity: number;
  path: string;
  pathFr: string;
  description: string;
  effect: string;
}

export interface HsrRelic extends BaseEntity {
  kind: "relic" | "planar";
  kindFr: string;
  bonuses: Bonus[];
}

export interface ZzzCharacter extends BaseEntity {
  fullName: string | null;
  rarity: string;
  rarityRank: number;
  specialty: string | null;
  specialtyFr: string | null;
  element: string | null;
  elementFr: string | null;
  attackType: string | null;
  faction: string | null;
  birthday: string | null;
  gender: string | null;
  description: string;
  tagline: string | null;
  role: string | null;
  stats: {
    hp: number | null;
    atk: number | null;
    def: number | null;
    impact: number | null;
    critRate: number | null;
    critDmg: number | null;
    anomalyMastery: number | null;
    anomalyProficiency: number | null;
    energyRegen: number | null;
  };
  skills: { type: string; entries: { name: string; description: string }[] }[];
  coreSkills: { name: string; description: string }[];
  mindscapes: { level: number; name: string; description: string; extra: string | null }[];
}

export interface ZzzWeapon extends BaseEntity {
  rarity: string;
  rarityRank: number;
  specialty: string | null;
  specialtyFr: string | null;
  baseAtk: number | null;
  subStat: string | null;
  description: string;
  effectName: string | null;
  effect: string;
}

export interface ZzzDisc extends BaseEntity {
  bonuses: Bonus[];
}

export interface ZzzBangboo extends BaseEntity {
  rarity: string;
  rarityRank: number;
  description: string;
}

export type AnyCharacter = GiCharacter | HsrCharacter | ZzzCharacter;

/** Fiche normalisée utilisée par les grilles, la recherche et les tier lists. */
export interface CharacterCard {
  game: GameId;
  id: string;
  slug: string;
  name: string;
  /** 4 ou 5 pour GI/HSR ; A ou S pour ZZZ (converti en 4/5 pour le tri). */
  rarityRank: number;
  rarityLabel: string;
  element: string | null;
  elementFr: string | null;
  role: string | null;
  roleFr: string | null;
  extra: string | null;
  icon: string | null;
  splash: string | null;
}

/** Entrée de tier list éditoriale. */
export interface TierEntry {
  slug: string;
  tier: Tier;
  note?: string;
}

export interface TierList {
  game: GameId;
  mode: string;
  label: string;
  description: string;
  updated: string;
  entries: TierEntry[];
}

export interface BuildBlock {
  title: string;
  items: string[];
  note?: string;
}

export interface CharacterGuide {
  game: GameId;
  slug: string;
  summary: string;
  pros: string[];
  cons: string[];
  builds: BuildBlock[];
  teams: { name: string; members: string[]; note?: string }[];
  verdict?: string;
}

export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  game: GameId | "all";
  category: "Patch" | "Tier list" | "Guide" | "Site";
  excerpt: string;
  body: string;
}
