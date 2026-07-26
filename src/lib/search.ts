import type { GameId } from "./types";

/**
 * Entrée de l'index de recherche global.
 * L'index est généré par `scripts/build-search-index.mjs` dans
 * public/search-index.json et chargé à la demande par le SearchProvider.
 */
export interface SearchEntry {
  n: string; // nom
  u: string; // url
  g: GameId; // jeu
  t: string; // type affiché
  i: string | null; // icône
  r: number | string | null; // rareté
}
