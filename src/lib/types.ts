export type GameId = "gi" | "hsr" | "zzz";

/** Notation à la Prydwen : T0 est le sommet du méta. */
export type Tier = "T0" | "T0.5" | "T1" | "T1.5" | "T2" | "T3";

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
  /** Colonnes de rôle des tier lists, façon Prydwen. */
  tierColumns: { id: string; label: string; description: string }[];
  /** Sources éditoriales de référence affichées sur les pages du jeu. */
  sources: { label: string; url: string; note: string }[];
}

export interface Bonus {
  pieces: number;
  effect: string;
}

/** URL unique, ou liste de candidates essayées dans l'ordre (CDN de secours). */
export type ImageSource = string | string[] | null;

export interface BaseEntity {
  game: GameId;
  id: string;
  slug: string;
  name: string;
  images: { icon: ImageSource; splash?: ImageSource; [key: string]: ImageSource | undefined };
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
  pieces: { slot: string; name: string; description: string; icon: ImageSource }[];
  version: string | null;
}

export interface HsrCharacter extends BaseEntity {
  rarity: number;
  path: string;
  pathFr: string;
  pathIcon: ImageSource;
  element: string;
  elementFr: string;
  elementIcon: ImageSource;
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
    icon: ImageSource;
    simple: string;
    description: string;
  }[];
  eidolons: { level: number; name: string; icon: ImageSource; description: string }[];
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
  icon: ImageSource;
  splash: ImageSource;
}

/** Entrée de tier list éditoriale. */
export interface TierEntry {
  slug: string;
  tier: Tier;
  /** Colonne de rôle (voir `tierColumns` du jeu). */
  column: string;
  note?: string;
}

export interface TierList {
  game: GameId;
  mode: string;
  label: string;
  description: string;
  updated: string;
  /** Références utilisées pour établir le classement. */
  sources?: { label: string; url: string }[];
  entries: TierEntry[];
}

export interface BuildBlock {
  title: string;
  /** Étiquette courte : « Recommandé », « Budget », « F2P »… */
  badge?: string;
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
  /** Références consultées pour rédiger le guide. */
  sources?: { label: string; url: string }[];
}

/** Personnage annoncé mais non encore sorti (contenu bêta / CBT). */
export interface BetaEntry {
  game: GameId;
  slug: string;
  /** Version du jeu prévue, ex. « 3.2 ». */
  version: string;
  status: "Bêta" | "Annoncé" | "Datamine";
  summary: string;
  kit?: string[];
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
