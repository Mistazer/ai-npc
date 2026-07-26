import type { GameConfig, GameId } from "./types";

export const GAMES: Record<GameId, GameConfig> = {
  hsr: {
    id: "hsr",
    name: "Honkai: Star Rail",
    shortName: "Star Rail",
    slug: "honkai-star-rail",
    accent: "#7c9cff",
    accentSoft: "rgba(124,156,255,0.14)",
    gradient: "linear-gradient(135deg,#1b2452 0%,#3a2b6b 55%,#7c9cff 100%)",
    tagline: "Personnages, cônes de lumière, reliques et tier lists Memory of Chaos.",
    labels: {
      characters: "Personnages",
      character: "Personnage",
      weapons: "Cônes de lumière",
      weapon: "Cône de lumière",
      artifacts: "Reliques",
      artifact: "Set de reliques",
      element: "Élément",
      role: "Voie",
    },
    tierModes: [
      { id: "moc", label: "Memory of Chaos", description: "Contenu de donjon à étages, priorité aux DPS de zone et aux buffeurs." },
      { id: "pf", label: "Pure Fiction", description: "Vagues d'ennemis multiples : les DPS AoE dominent." },
      { id: "as", label: "Apocalyptic Shadow", description: "Boss uniques : DPS mono-cible et breakers." },
    ],
  },
  gi: {
    id: "gi",
    name: "Genshin Impact",
    shortName: "Genshin",
    slug: "genshin-impact",
    accent: "#5fd0c5",
    accentSoft: "rgba(95,208,197,0.14)",
    gradient: "linear-gradient(135deg,#123738 0%,#1f5a52 55%,#5fd0c5 100%)",
    tagline: "Personnages, armes, artéfacts et tier lists Abîme & Théâtre Imaginarium.",
    labels: {
      characters: "Personnages",
      character: "Personnage",
      weapons: "Armes",
      weapon: "Arme",
      artifacts: "Artéfacts",
      artifact: "Set d'artéfacts",
      element: "Élément",
      role: "Arme",
      extra: "Région",
    },
    tierModes: [
      { id: "abyss", label: "Abîme Spiralé", description: "Deux équipes, deux moitiés : polyvalence et burst." },
      { id: "theater", label: "Théâtre Imaginarium", description: "Roster large exigé : la profondeur du compte prime." },
      { id: "overworld", label: "Monde ouvert", description: "Exploration et confort au quotidien." },
    ],
  },
  zzz: {
    id: "zzz",
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
    slug: "zenless-zone-zero",
    accent: "#ffd23f",
    accentSoft: "rgba(255,210,63,0.14)",
    gradient: "linear-gradient(135deg,#3a2a05 0%,#7a5a10 55%,#ffd23f 100%)",
    tagline: "Agents, W-Engines, disques driver, Bangboo et tier lists Shiyu Defense.",
    labels: {
      characters: "Agents",
      character: "Agent",
      weapons: "W-Engines",
      weapon: "W-Engine",
      artifacts: "Disques driver",
      artifact: "Set de disques",
      element: "Attribut",
      role: "Spécialité",
      extra: "Faction",
    },
    tierModes: [
      { id: "shiyu", label: "Shiyu Defense", description: "Contenu chronométré : burst, rotations et Stun." },
      { id: "da", label: "Deadly Assault", description: "Boss à score : dégâts bruts sur une cible." },
    ],
  },
};

export const GAME_ORDER: GameId[] = ["hsr", "gi", "zzz"];

export const GAME_LIST = GAME_ORDER.map((id) => GAMES[id]);

export function getGame(slugOrId: string): GameConfig | undefined {
  const byId = GAMES[slugOrId as GameId];
  if (byId) return byId;
  return GAME_LIST.find((game) => game.slug === slugOrId);
}

export function gameHref(game: GameConfig, ...segments: string[]): string {
  return ["", game.slug, ...segments].join("/").replace(/\/+/g, "/");
}
