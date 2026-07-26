import { GAMES, GAME_ORDER } from "./games";
import { getArtifacts, getCharacterCards, getWeapons, zzzBangboos } from "./data";
import type { GameId } from "./types";

export interface SearchEntry {
  n: string; // nom
  u: string; // url
  g: GameId; // jeu
  t: string; // type affiché
  i: string | null; // icône
  r: number | string | null; // rareté
}

/** Index de recherche compact, généré au build et envoyé au client. */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const id of GAME_ORDER) {
    const game = GAMES[id];

    for (const card of getCharacterCards(id)) {
      entries.push({
        n: card.name,
        u: `/${game.slug}/personnages/${card.slug}`,
        g: id,
        t: game.labels.character,
        i: card.icon,
        r: card.rarityLabel,
      });
    }

    for (const weapon of getWeapons(id)) {
      entries.push({
        n: weapon.name,
        u: `/${game.slug}/armes/${weapon.slug}`,
        g: id,
        t: game.labels.weapon,
        i: weapon.images.icon,
        r: "rarity" in weapon ? (weapon.rarity as number | string) : null,
      });
    }

    for (const artifact of getArtifacts(id)) {
      entries.push({
        n: artifact.name,
        u: `/${game.slug}/sets/${artifact.slug}`,
        g: id,
        t: game.labels.artifact,
        i: artifact.images.icon,
        r: "rarity" in artifact ? (artifact.rarity as number | string) : null,
      });
    }
  }

  for (const bangboo of zzzBangboos) {
    entries.push({
      n: bangboo.name,
      u: `/${GAMES.zzz.slug}/bangboo`,
      g: "zzz",
      t: "Bangboo",
      i: bangboo.images.icon,
      r: bangboo.rarity,
    });
  }

  return entries;
}
