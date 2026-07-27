import type { CharacterGuide } from "@/lib/types";

/**
 * Guides éditoriaux détaillés, avec plusieurs builds proposés par personnage
 * (signature, alternative, budget) à la manière de Prydwen.
 *
 * Sources par jeu :
 * - Honkai: Star Rail et Zenless Zone Zero → Prydwen
 * - Genshin Impact → La Gazette de Teyvat, KeqingMains, Stygian.moe, GenshinLab
 *
 * Un personnage sans guide affiche automatiquement un encart « guide à venir ».
 */
export const GUIDES: CharacterGuide[] = [
  /* ------------------------------ Star Rail ------------------------------ */
  {
    game: "hsr",
    slug: "acheron",
    summary:
      "Acheron est une DPS Néant qui ignore le système d'énergie classique : son ultime se charge via les débuffs appliqués par l'équipe. Elle demande une composition mono-Néant pour atteindre son plein potentiel.",
    pros: [
      "Dégâts d'ultime parmi les plus élevés du jeu",
      "Ignore la régénération d'énergie : aucune contrainte de vitesse d'ultime",
      "Fonctionne sans buffeur de dégâts dédié",
    ],
    cons: [
      "Nécessite deux personnages Néant pour charger ses Slashed Dreams",
      "Faible en Pure Fiction, ses dégâts étant orientés mono-cible",
      "Très dépendante de son éidolon 2 pour le confort de jeu",
    ],
    builds: [
      {
        title: "Along the Passing Shore",
        badge: "Signature",
        items: [
          "Cône : Along the Passing Shore",
          "Reliques 4p : Pioneer Diver of Dead Waters",
          "Ornement 2p : Izumo Gensei and Takama Divine Realm",
          "Stats : ATK% / Dégâts Néant / Dégâts CRIT",
        ],
        note: "Viser 70 % de taux critique et 180 %+ de dégâts critiques. La vitesse au-delà de 134 n'est pas prioritaire.",
      },
      {
        title: "Good Night and Sleep Well",
        badge: "Alternative 4★",
        items: [
          "Cône : Good Night and Sleep Well (S5)",
          "Reliques 4p : Pioneer Diver of Dead Waters",
          "Ornement 2p : Firmament Frontline: Glamoth",
          "Stats : ATK% / Dégâts Néant / Dégâts CRIT",
        ],
        note: "Le cône 4★ à superposition 5 reste très proche de la signature : c'est l'option la plus rentable en free-to-play.",
      },
      {
        title: "Priorité de traces",
        items: ["Ultime > Talent > Compétence > Attaque de base"],
      },
    ],
    teams: [
      {
        name: "Mono-Néant standard",
        members: ["acheron", "jiaoqiu", "pela", "aventurine"],
        note: "Jiaoqiu multiplie les applications de débuffs, Pela réduit la défense.",
      },
      {
        name: "Variante double soutien",
        members: ["acheron", "silver-wolf", "sparkle", "fu-xuan"],
        note: "Sparkle avance Acheron et fournit les points de compétence.",
      },
    ],
    verdict:
      "Toujours au sommet du méta mono-cible malgré son ancienneté. À prioriser si vous n'avez pas encore de DPS Néant.",
    sources: [{ label: "Prydwen — Acheron", url: "https://www.prydwen.gg/star-rail/characters/acheron" }],
  },
  {
    game: "hsr",
    slug: "firefly",
    summary:
      "Firefly transforme les dégâts de rupture en source de dégâts principale. Elle exige une équipe Break dédiée mais offre un plafond très élevé sur les ennemis à faiblesse Feu ou après implantation.",
    pros: [
      "Dégâts de rupture Feu massifs et répétés",
      "Autosuffisante en survie grâce à son état SAM",
      "Excellente contre les ennemis à barre de résistance élevée",
    ],
    cons: [
      "Dépend fortement de Ruan Mei et d'un support Break",
      "Peu efficace si l'ennemi n'a pas de faiblesse Feu implantable",
      "Consommation élevée de points de compétence",
    ],
    builds: [
      {
        title: "Whereabouts Should Dreams Rest",
        badge: "Signature",
        items: [
          "Cône : Whereabouts Should Dreams Rest",
          "Reliques 4p : Iron Cavalry Against the Scourge",
          "Ornement 2p : Forge of the Kalpagni Lantern",
          "Stats : Effet de rupture / ATK% / Vitesse",
        ],
        note: "Objectif : 200 %+ d'effet de rupture et 134 de vitesse minimum.",
      },
      {
        title: "Build budget",
        badge: "F2P",
        items: [
          "Cône : On the Fall of an Aeon (S5)",
          "Reliques 4p : Thief of Shooting Meteor",
          "Ornement 2p : Talia: Kingdom of Banditry",
          "Stats : Effet de rupture / ATK% / Vitesse",
        ],
        note: "Talia demande 145 de vitesse pour activer son bonus : à vérifier avant de l'équiper.",
      },
      {
        title: "Priorité de traces",
        items: ["Compétence > Talent > Ultime > Attaque de base"],
      },
    ],
    teams: [
      {
        name: "Super Break classique",
        members: ["firefly", "ruan-mei", "trailblazer-shaman-imaginary", "lingsha"],
        note: "La Pionnière de l'Harmonie convertit la rupture en dégâts additionnels.",
      },
      {
        name: "Variante budget",
        members: ["firefly", "ruan-mei", "trailblazer-shaman-imaginary", "gallagher"],
      },
    ],
    verdict:
      "Investissement lourd mais rentable : l'une des rares DPS capables de venir à bout du contenu le plus difficile en solo carry.",
    sources: [{ label: "Prydwen — Firefly", url: "https://www.prydwen.gg/star-rail/characters/firefly" }],
  },

  /* ------------------------------- Genshin ------------------------------- */
  {
    game: "gi",
    slug: "furina",
    summary:
      "Furina est le meilleur buffeur de dégâts de Genshin Impact. Sa mécanique de Fanfare convertit les variations de PV de l'équipe en bonus de dégâts pouvant dépasser 70 %, tout en fournissant une application Hydro hors terrain.",
    pros: [
      "Buff de dégâts polyvalent, applicable à presque toutes les équipes",
      "Application Hydro hors terrain constante",
      "Soigne l'équipe en état Ousia inversé",
    ],
    cons: [
      "Exige un soigneur dédié (Kokomi, Charlotte, Jean)",
      "Coût d'énergie élevé sans batterie",
      "Le drain de PV devient risqué sans bouclier",
    ],
    builds: [
      {
        title: "Splendor of Tranquil Waters",
        badge: "Signature",
        items: [
          "Arme : Splendor of Tranquil Waters",
          "Artéfacts 4p : Golden Troupe",
          "Stats : PV% / PV% / PV%",
          "Sous-stats : Recharge d'énergie (~200 %) puis PV%",
        ],
        note: "Le seuil de recharge dépend de l'équipe : 180 % suffisent avec une seconde source d'énergie.",
      },
      {
        title: "Fleuve Cendre et Salut",
        badge: "Alternative",
        items: [
          "Arme : Fleuve Cendre et Salut (ou Favonius Sword en batterie)",
          "Artéfacts 4p : Golden Troupe",
          "Stats : PV% / PV% / PV%",
        ],
        note: "Favonius Sword se justifie si l'équipe manque de particules ; privilégier alors le taux critique.",
      },
      {
        title: "Sous-DPS Marechaussee",
        badge: "Situationnel",
        items: [
          "Arme : Splendor of Tranquil Waters",
          "Artéfacts 4p : Marechaussee Hunter",
          "Stats : PV% / Bonus dégâts Hydro / Dégâts CRIT",
        ],
        note: "Uniquement dans les équipes où Furina passe du temps sur le terrain.",
      },
      {
        title: "Priorité de talents",
        items: ["Compétence élémentaire > Déchaînement > Attaque normale"],
      },
    ],
    teams: [
      {
        name: "Neuvillette Vaporisation",
        members: ["neuvillette", "furina", "kaedehara-kazuha", "sangonomiya-kokomi"],
      },
      {
        name: "Hu Tao Vaporisation",
        members: ["hu-tao", "furina", "yelan", "sangonomiya-kokomi"],
        note: "Kokomi maintient les PV pour éviter la mort sous Blood Blossom.",
      },
    ],
    verdict:
      "Achat quasi obligatoire pour tout compte sérieux : elle améliore la quasi-totalité des équipes existantes.",
    sources: [
      { label: "La Gazette de Teyvat", url: "https://lagazettedeteyvat.fr" },
      { label: "KeqingMains — Furina", url: "https://keqingmains.com/furina/" },
    ],
  },
  {
    game: "gi",
    slug: "neuvillette",
    summary:
      "Neuvillette est un DPS Hydro qui scale sur les PV et n'a besoin d'aucun temps de recharge : son attaque chargée applique une Hydro constante et inflige des dégâts très élevés sur la durée.",
    pros: [
      "Aucune contrainte de rotation ni de recharge d'énergie",
      "Application Hydro continue, idéale pour la Vaporisation",
      "Excellent en mono-cible comme en zone conique",
    ],
    cons: [
      "Vulnérable aux interruptions sans bouclier ou Zhongli",
      "Dépend des marques de Droit de jugement pour son plein potentiel",
      "Peu mobile pendant son attaque chargée",
    ],
    builds: [
      {
        title: "Tome of the Eternal Flow",
        badge: "Signature",
        items: [
          "Arme : Tome of the Eternal Flow",
          "Artéfacts 4p : Marechaussee Hunter",
          "Stats : PV% / Bonus dégâts Hydro / Dégâts CRIT",
        ],
        note: "Avec Furina, les variations de PV maintiennent en permanence les trois cumuls de Marechaussee Hunter.",
      },
      {
        title: "Prototype Amber",
        badge: "F2P",
        items: [
          "Arme : Prototype Amber (forgeable) ou Sacrificial Jade",
          "Artéfacts 4p : Marechaussee Hunter",
          "Stats : PV% / Bonus dégâts Hydro / Dégâts CRIT",
        ],
        note: "Prototype Amber est forgeable gratuitement et reste très correcte à superposition élevée.",
      },
      {
        title: "Sans Furina",
        badge: "Alternative",
        items: [
          "Artéfacts 4p : Heart of Depth (ou 2p Hydro / 2p PV%)",
          "Stats : PV% / Bonus dégâts Hydro / Dégâts CRIT",
        ],
        note: "Sans variations de PV fréquentes, Marechaussee Hunter perd l'essentiel de son intérêt.",
      },
    ],
    teams: [
      {
        name: "Vaporisation",
        members: ["neuvillette", "furina", "kaedehara-kazuha", "sangonomiya-kokomi"],
      },
      {
        name: "Équipe Dendro",
        members: ["neuvillette", "nahida", "furina", "baizhu"],
      },
    ],
    verdict:
      "L'un des DPS les plus confortables du jeu : peu de contraintes, dégâts élevés, capable de gérer seul une moitié d'Abîme.",
    sources: [
      { label: "La Gazette de Teyvat", url: "https://lagazettedeteyvat.fr" },
      { label: "KeqingMains — Neuvillette", url: "https://keqingmains.com/neuvillette/" },
      { label: "Stygian.moe", url: "https://www.stygian.moe/fr" },
    ],
  },
  {
    game: "gi",
    slug: "arlecchino",
    summary:
      "Arlecchino est une DPS Pyro on-field qui convertit les Blood-Debt Directives en dégâts bruts. Elle se passe totalement de soins classiques, sa vie remontant via ses propres attaques.",
    pros: [
      "Dégâts on-field parmi les plus élevés du jeu",
      "Ne dépend pas de la recharge d'énergie pour ses dégâts principaux",
      "Excellente en mono-cible, précieuse en Onirique Stygien",
    ],
    cons: [
      "Les soins classiques sont bloqués sous Bond of Life",
      "Sensible aux interruptions sans bouclier",
      "Demande une bonne maîtrise du cycle d'attaques normales",
    ],
    builds: [
      {
        title: "Crimson Moon's Semblance",
        badge: "Signature",
        items: [
          "Arme : Crimson Moon's Semblance",
          "Artéfacts 4p : Fragment of Harmonic Whimsy",
          "Stats : ATK% / Bonus dégâts Pyro / Dégâts CRIT",
        ],
        note: "Le set 4p se déclenche à chaque variation du Bond of Life, ce qui est constant sur son cycle.",
      },
      {
        title: "Staff of the Scarlet Sands",
        badge: "Alternative",
        items: [
          "Arme : Staff of the Scarlet Sands ou Deathmatch",
          "Artéfacts 4p : Fragment of Harmonic Whimsy",
          "Stats : ATK% / Bonus dégâts Pyro / Dégâts CRIT",
        ],
      },
      {
        title: "Priorité de talents",
        items: ["Attaque normale > Compétence élémentaire > Déchaînement"],
      },
    ],
    teams: [
      {
        name: "Vaporisation",
        members: ["arlecchino", "yelan", "kaedehara-kazuha", "bennett"],
        note: "Bennett doit rester à faible constellation pour ne pas écraser le Bond of Life.",
      },
      {
        name: "Mono-Pyro",
        members: ["arlecchino", "xiangling", "bennett", "kaedehara-kazuha"],
      },
    ],
    verdict:
      "Référence actuelle du DPS mono-cible sur Genshin, particulièrement forte sur les modes à score comme l'Onirique Stygien.",
    sources: [
      { label: "La Gazette de Teyvat", url: "https://lagazettedeteyvat.fr" },
      { label: "KeqingMains — Arlecchino", url: "https://keqingmains.com/arlecchino/" },
      { label: "Stygian.moe", url: "https://www.stygian.moe/fr" },
    ],
  },

  /* --------------------------------- ZZZ --------------------------------- */
  {
    game: "zzz",
    slug: "miyabi",
    summary:
      "Miyabi est l'agent le plus fort de Zenless Zone Zero. Elle génère ses propres anomalies Givre et déclenche des Disorder à répétition, tout en restant autonome grâce à son mode Kamuriyama.",
    pros: [
      "Dégâts d'anomalie Givre les plus élevés du jeu",
      "Autonome : n'a pas besoin d'un applicateur d'anomalie secondaire",
      "Fenêtres d'esquive généreuses avec ralentissement du temps",
    ],
    cons: [
      "Nettement avantagée par son W-Engine signature",
      "Le cycle de Frostburn demande de la pratique",
      "Investissement en disques driver conséquent",
    ],
    builds: [
      {
        title: "Hailstorm Shrine",
        badge: "Signature",
        items: [
          "W-Engine : Hailstorm Shrine",
          "Disques 4p : Branch & Blade Song + 2p Woodpecker Electro",
          "Stats : Maîtrise d'anomalie / ATK% / Dégâts Glace",
        ],
        note: "Prioriser la maîtrise d'anomalie sur le taux critique : ses dégâts principaux sont d'origine anomalie.",
      },
      {
        title: "Weeping Gemini",
        badge: "Budget",
        items: [
          "W-Engine : Weeping Gemini (A) ou Marcato Desire",
          "Disques 4p : Polar Metal + 2p Woodpecker Electro",
          "Stats : Maîtrise d'anomalie / ATK% / Dégâts Glace",
        ],
      },
    ],
    teams: [
      {
        name: "Givre standard",
        members: ["miyabi", "yanagi", "astra-yao"],
        note: "Yanagi déclenche les Disorder, Astra Yao amplifie l'ensemble.",
      },
      {
        name: "Variante budget",
        members: ["miyabi", "soukaku", "lucy"],
      },
    ],
    verdict:
      "Meilleur agent du jeu, tous rôles confondus. Si vous ne devez tirer qu'une seule bannière, c'est celle-ci.",
    sources: [{ label: "Prydwen — Miyabi", url: "https://www.prydwen.gg/zenless/characters/miyabi" }],
  },
  {
    game: "zzz",
    slug: "astra-yao",
    summary:
      "Astra Yao est une buffeuse universelle qui augmente l'ATK de l'équipe, fournit des soins et amplifie les dégâts pendant ses fenêtres d'Idol. Elle s'insère dans absolument toutes les compositions.",
    pros: [
      "Buff d'ATK et de dégâts applicable à tous les attributs",
      "Soins passifs qui dispensent d'un défenseur dédié",
      "Aucune synergie d'attribut requise",
    ],
    cons: ["Apport de dégâts personnel faible", "Le buff demande une bonne gestion des rotations"],
    builds: [
      {
        title: "Elegant Vanity",
        badge: "Signature",
        items: [
          "W-Engine : Elegant Vanity",
          "Disques 4p : Astral Voice + 2p Swing Jazz",
          "Stats : ATK% / Régénération d'énergie / PV%",
        ],
        note: "Viser au moins 1,8 de régénération d'énergie pour enchaîner les ultimes sans temps mort.",
      },
      {
        title: "Kaboom the Cannon",
        badge: "Budget",
        items: [
          "W-Engine : Kaboom the Cannon (A)",
          "Disques 4p : Swing Jazz + 2p Hormone Punk",
          "Stats : ATK% / Régénération d'énergie / PV%",
        ],
      },
    ],
    teams: [
      { name: "Givre", members: ["miyabi", "yanagi", "astra-yao"] },
      { name: "Éther", members: ["yixuan", "trigger", "astra-yao"] },
    ],
    verdict:
      "Le support le plus flexible du jeu : rentable sur n'importe quel compte, quel que soit le DPS possédé.",
    sources: [{ label: "Prydwen — Astra Yao", url: "https://www.prydwen.gg/zenless/characters/astra-yao" }],
  },
];

export function getGuide(game: string, slug: string) {
  return GUIDES.find((guide) => guide.game === game && guide.slug === slug);
}

export function getGuidesForGame(game: string) {
  return GUIDES.filter((guide) => guide.game === game);
}
