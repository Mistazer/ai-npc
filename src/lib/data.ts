import giArtifactsRaw from "@/data/generated/gi-artifacts.json";
import giCharactersRaw from "@/data/generated/gi-characters.json";
import giWeaponsRaw from "@/data/generated/gi-weapons.json";
import hsrCharactersRaw from "@/data/generated/hsr-characters.json";
import hsrLightConesRaw from "@/data/generated/hsr-lightcones.json";
import hsrRelicsRaw from "@/data/generated/hsr-relics.json";
import metaRaw from "@/data/generated/meta.json";
import zzzBangboosRaw from "@/data/generated/zzz-bangboos.json";
import zzzCharactersRaw from "@/data/generated/zzz-characters.json";
import zzzDiscsRaw from "@/data/generated/zzz-discs.json";
import zzzWeaponsRaw from "@/data/generated/zzz-weapons.json";

import type {
  CharacterCard,
  GameId,
  GiArtifact,
  GiCharacter,
  GiWeapon,
  HsrCharacter,
  HsrLightCone,
  HsrRelic,
  ZzzBangboo,
  ZzzCharacter,
  ZzzDisc,
  ZzzWeapon,
} from "./types";

export const giCharacters = giCharactersRaw as unknown as GiCharacter[];
export const giWeapons = giWeaponsRaw as unknown as GiWeapon[];
export const giArtifacts = giArtifactsRaw as unknown as GiArtifact[];

export const hsrCharacters = hsrCharactersRaw as unknown as HsrCharacter[];
export const hsrLightCones = hsrLightConesRaw as unknown as HsrLightCone[];
export const hsrRelics = hsrRelicsRaw as unknown as HsrRelic[];

export const zzzCharacters = zzzCharactersRaw as unknown as ZzzCharacter[];
export const zzzWeapons = zzzWeaponsRaw as unknown as ZzzWeapon[];
export const zzzDiscs = zzzDiscsRaw as unknown as ZzzDisc[];
export const zzzBangboos = zzzBangboosRaw as unknown as ZzzBangboo[];

export const meta = metaRaw as {
  syncedAt: string;
  games: Record<string, Record<string, number>>;
  sources: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/* Normalisation vers un format de carte commun aux trois jeux         */
/* ------------------------------------------------------------------ */

function giCard(character: GiCharacter): CharacterCard {
  return {
    game: "gi",
    id: character.id,
    slug: character.slug,
    name: character.name,
    rarityRank: character.rarity,
    rarityLabel: `${character.rarity}★`,
    element: character.element,
    elementFr: character.elementFr,
    role: character.weapon,
    roleFr: character.weaponFr,
    extra: character.region,
    icon: character.images.icon,
    splash: character.images.splash ?? null,
  };
}

function hsrCard(character: HsrCharacter): CharacterCard {
  return {
    game: "hsr",
    id: character.id,
    slug: character.slug,
    name: character.name,
    rarityRank: character.rarity,
    rarityLabel: `${character.rarity}★`,
    element: character.element,
    elementFr: character.elementFr,
    role: character.path,
    roleFr: character.pathFr,
    extra: null,
    icon: character.images.icon,
    splash: character.images.splash ?? null,
  };
}

function zzzCard(character: ZzzCharacter): CharacterCard {
  return {
    game: "zzz",
    id: character.id,
    slug: character.slug,
    name: character.name,
    rarityRank: character.rarityRank,
    rarityLabel: character.rarity,
    element: character.element,
    elementFr: character.elementFr,
    role: character.specialty,
    roleFr: character.specialtyFr,
    extra: character.faction,
    icon: character.images.icon,
    splash: character.images.splash ?? null,
  };
}

export function getCharacterCards(game: GameId): CharacterCard[] {
  if (game === "gi") return giCharacters.map(giCard);
  if (game === "hsr") return hsrCharacters.map(hsrCard);
  return zzzCharacters.map(zzzCard);
}

export const allCharacterCards: CharacterCard[] = [
  ...getCharacterCards("hsr"),
  ...getCharacterCards("gi"),
  ...getCharacterCards("zzz"),
];

export function getCharacter(game: GameId, slug: string) {
  if (game === "gi") return giCharacters.find((c) => c.slug === slug);
  if (game === "hsr") return hsrCharacters.find((c) => c.slug === slug);
  return zzzCharacters.find((c) => c.slug === slug);
}

export function getCharacterCard(game: GameId, slug: string): CharacterCard | undefined {
  return getCharacterCards(game).find((card) => card.slug === slug);
}

export function getWeapons(game: GameId) {
  if (game === "gi") return giWeapons;
  if (game === "hsr") return hsrLightCones;
  return zzzWeapons;
}

export function getWeapon(game: GameId, slug: string) {
  return getWeapons(game).find((weapon) => weapon.slug === slug);
}

export function getArtifacts(game: GameId) {
  if (game === "gi") return giArtifacts;
  if (game === "hsr") return hsrRelics;
  return zzzDiscs;
}

export function getArtifact(game: GameId, slug: string) {
  return getArtifacts(game).find((entry) => entry.slug === slug);
}

/** Options de filtres calculées à partir des données réelles. */
export function getFilterOptions(game: GameId) {
  const cards = getCharacterCards(game);
  const unique = (values: (string | null)[]) =>
    [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
      a.localeCompare(b, "fr"),
    );

  return {
    elements: unique(cards.map((card) => card.elementFr)),
    roles: unique(cards.map((card) => card.roleFr)),
    extras: unique(cards.map((card) => card.extra)),
    rarities: [...new Set(cards.map((card) => card.rarityLabel))].sort().reverse(),
  };
}

export function getCounts(game: GameId) {
  return {
    characters: getCharacterCards(game).length,
    weapons: getWeapons(game).length,
    artifacts: getArtifacts(game).length,
    bangboos: game === "zzz" ? zzzBangboos.length : 0,
  };
}
