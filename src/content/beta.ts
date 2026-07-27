import type { BetaEntry } from "@/lib/types";

/**
 * Personnages annoncés ou en bêta, pas encore disponibles en version live.
 *
 * Les données de kit proviennent des mêmes dépôts que le reste du site
 * (genshin-db, StarRailRes, Hakushin), qui indexent les versions bêta.
 * Elles changent fréquemment d'une itération de test à l'autre : ces pages
 * sont donc explicitement signalées comme provisoires.
 *
 * Référence de suivi : GachaBase (hsr.gachabase.net, zzz.gachabase.net).
 */
export const BETA: BetaEntry[] = [
  /* ------------------------------ Star Rail ------------------------------ */
  {
    game: "hsr",
    slug: "evanescia",
    version: "3.9",
    status: "Bêta",
    summary:
      "Personnage 5★ apparu dans les fichiers de bêta. Kit en cours d'équilibrage, les valeurs affichées évolueront d'une itération à l'autre.",
  },
  {
    game: "hsr",
    slug: "ashveil",
    version: "3.9",
    status: "Bêta",
    summary: "Nouvelle unité 5★ en test. Rôle et multiplicateurs encore susceptibles de changer.",
  },
  {
    game: "hsr",
    slug: "mortenax-blade",
    version: "4.0",
    status: "Datamine",
    summary:
      "Variante de Blade repérée dans les données. Aucune confirmation officielle : à considérer comme purement indicatif.",
  },
  {
    game: "hsr",
    slug: "silver-wolf-lv-999",
    version: "4.0",
    status: "Datamine",
    summary: "Version alternative de Silver Wolf présente dans les fichiers, non annoncée officiellement.",
  },
  {
    game: "hsr",
    slug: "gilgamesh",
    version: "4.0",
    status: "Annoncé",
    summary: "Unité de collaboration annoncée. Les détails du kit restent partiels à ce stade.",
  },
  {
    game: "hsr",
    slug: "himeko-nova",
    version: "4.0",
    status: "Datamine",
    summary: "Variante de Himeko indexée dans les données de test.",
  },
  {
    game: "hsr",
    slug: "sparxie",
    version: "3.9",
    status: "Bêta",
    summary: "Nouvelle unité en phase de test, kit non finalisé.",
  },
  {
    game: "hsr",
    slug: "yao-guang",
    version: "3.9",
    status: "Bêta",
    summary: "Personnage 5★ en bêta, données susceptibles d'être ajustées avant la sortie.",
  },

  /* ------------------------------- Genshin ------------------------------- */
  {
    game: "gi",
    slug: "sandrone",
    version: "6.7",
    status: "Bêta",
    summary:
      "Membre des Fatui apparue en bêta. Les multiplicateurs de talents changent presque à chaque itération de test.",
  },
  {
    game: "gi",
    slug: "lohen",
    version: "6.6",
    status: "Bêta",
    summary: "Nouveau personnage en test pour la version 6.6.",
  },
  {
    game: "gi",
    slug: "prune",
    version: "6.6",
    status: "Bêta",
    summary: "Personnage 4★ en bêta, kit en cours d'ajustement.",
  },
  {
    game: "gi",
    slug: "nicole",
    version: "6.6",
    status: "Bêta",
    summary: "Nouvelle unité indexée dans les fichiers de la 6.6.",
  },
  {
    game: "gi",
    slug: "linnea",
    version: "6.5",
    status: "Bêta",
    summary: "Personnage en phase de test, données provisoires.",
  },
  {
    game: "gi",
    slug: "varka",
    version: "6.4",
    status: "Annoncé",
    summary:
      "Grand Maître des Chevaliers de Favonius, attendu de longue date. Kit encore incomplet dans les données.",
  },

  /* --------------------------------- ZZZ --------------------------------- */
  {
    game: "zzz",
    slug: "velina",
    version: "3.2",
    status: "Bêta",
    summary: "Agent S en bêta. Les valeurs de compétences évoluent d'une itération de test à l'autre.",
  },
  {
    game: "zzz",
    slug: "sunna",
    version: "3.2",
    status: "Bêta",
    summary: "Nouvel agent S en phase de test.",
  },
  {
    game: "zzz",
    slug: "starlight-billy",
    version: "3.2",
    status: "Bêta",
    summary: "Variante de Billy repérée dans les données de bêta.",
  },
  {
    game: "zzz",
    slug: "seed",
    version: "3.1",
    status: "Bêta",
    summary: "Agent S en test, rôle et multiplicateurs non définitifs.",
  },
  {
    game: "zzz",
    slug: "pyrois",
    version: "3.1",
    status: "Bêta",
    summary: "Nouvel agent Feu apparu en bêta.",
  },
  {
    game: "zzz",
    slug: "orphie-magus",
    version: "3.1",
    status: "Bêta",
    summary: "Agent indexé dans les fichiers de test.",
  },
  {
    game: "zzz",
    slug: "promeia",
    version: "3.1",
    status: "Bêta",
    summary: "Agent S en phase de test.",
  },
  {
    game: "zzz",
    slug: "cissia",
    version: "3.0",
    status: "Bêta",
    summary: "Agent S apparu dans les données de bêta.",
  },
  {
    game: "zzz",
    slug: "dialyn",
    version: "3.0",
    status: "Bêta",
    summary: "Nouvel agent en test, kit susceptible d'évoluer.",
  },
  {
    game: "zzz",
    slug: "yidhari",
    version: "3.0",
    status: "Bêta",
    summary: "Agent S indexé dans les fichiers de test.",
  },
];

export function getBetaForGame(game: string) {
  return BETA.filter((entry) => entry.game === game).sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );
}

export function getBetaEntry(game: string, slug: string) {
  return BETA.find((entry) => entry.game === game && entry.slug === slug);
}
