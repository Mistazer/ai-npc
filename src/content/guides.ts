import type { CharacterGuide } from "@/lib/types";

/**
 * Guides éditoriaux détaillés. Un personnage sans guide affiche automatiquement
 * un encart « guide à venir » sur sa fiche.
 */
export const GUIDES: CharacterGuide[] = [
  {
    game: "hsr",
    slug: "acheron",
    summary:
      "Acheron est une DPS Néant qui ignore le système d'énergie classique : son ultime se charge via les débuffs appliqués par l'équipe. Elle demande une composition mono-Néant pour atteindre son plein potentiel.",
    pros: [
      "Dégâts d'ultime parmi les plus élevés du jeu",
      "Ignore la régénération d'énergie, donc pas de contrainte de vitesse d'ultime",
      "Fonctionne sans buffeur de dégâts dédié",
    ],
    cons: [
      "Nécessite deux personnages Néant pour charger ses Slashed Dreams",
      "Faible en Pure Fiction (dégâts orientés mono-cible)",
      "Très dépendante de son eidolon 2 pour le confort",
    ],
    builds: [
      {
        title: "Build principal — DPS Néant",
        items: [
          "Cône : Along the Passing Shore (S5 : Good Night and Sleep Well)",
          "Reliques 4p : Pioneer Diver of Dead Waters",
          "Ornement 2p : Izumo Gensei and Takama Divine Realm",
          "Stats : ATK% / DMG Néant / CRIT DMG",
        ],
        note: "Viser 70 % CRIT Rate et 180 %+ CRIT DMG. La vitesse au-delà de 134 n'est pas prioritaire.",
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
  },
  {
    game: "hsr",
    slug: "firefly",
    summary:
      "Firefly transforme les dégâts de rupture en source de dégâts principale. Elle exige une équipe Break dédiée mais offre un plafond de dégâts très élevé sur les ennemis à faiblesse Feu ou après implantation.",
    pros: [
      "Dégâts de rupture Feu massifs et répétés",
      "Auto-suffisante en survie grâce à son état SAM",
      "Excellente contre les ennemis à barre de résistance élevée",
    ],
    cons: [
      "Dépend fortement de Ruan Mei et d'un support Break",
      "Peu efficace si l'ennemi n'a pas de faiblesse Feu implantable",
      "Consommation élevée de points de compétence",
    ],
    builds: [
      {
        title: "Build principal — Break Feu",
        items: [
          "Cône : Whereabouts Should Dreams Rest",
          "Reliques 4p : Iron Cavalry Against the Scourge",
          "Ornement 2p : Talia: Kingdom of Banditry",
          "Stats : Break Effect / ATK% / SPD",
        ],
        note: "Objectif : 200 %+ d'effet de rupture et 134 de vitesse minimum.",
      },
      {
        title: "Priorité de traces",
        items: ["Compétence > Talent > Ultime > Attaque de base"],
      },
    ],
    teams: [
      {
        name: "Super Break classique",
        members: ["firefly", "ruan-mei", "trailblazer-harmony-imaginary", "lingsha"],
        note: "La Trailblazer Harmonie convertit la rupture en dégâts additionnels.",
      },
    ],
    verdict: "Investissement lourd mais rentable : l'une des rares DPS capables de clear le contenu le plus difficile en solo carry.",
  },
  {
    game: "gi",
    slug: "furina",
    summary:
      "Furina est le meilleur buffeur de dégâts de Genshin Impact. Sa mécanique de Fanfare convertit les variations de PV de l'équipe en bonus de dégâts pouvant dépasser 70 %, tout en fournissant une application Hydro off-field.",
    pros: [
      "Buff de dégâts polyvalent applicable à toutes les équipes",
      "Application Hydro off-field constante",
      "Soigne l'équipe en état Ousia inversé",
    ],
    cons: [
      "Exige un soigneur dédié (Kokomi, Charlotte, Jean)",
      "Coût d'énergie élevé sans batterie",
      "Le drain de PV peut être risqué sans bouclier",
    ],
    builds: [
      {
        title: "Build principal — Support HP",
        items: [
          "Arme : Splendor of Tranquil Waters (alt. Fleuve Cendre et Salut)",
          "Artéfacts 4p : Golden Troupe (ou 4p Marechaussee Hunter en sous-DPS)",
          "Stats : PV% / PV% / PV%",
          "Sous-stats : Recharge d'énergie (~200 %) puis PV%",
        ],
        note: "En équipe Hyperbloom, 4p Golden Troupe reste la valeur sûre.",
      },
      {
        title: "Priorité de talents",
        items: ["Compétence élémentaire > Déchaînement > Attaque normale"],
      },
    ],
    teams: [
      {
        name: "Neuvillette Vaporize",
        members: ["neuvillette", "furina", "kaedehara-kazuha", "sangonomiya-kokomi"],
      },
      {
        name: "Hu Tao Vaporize",
        members: ["hu-tao", "furina", "yelan", "sangonomiya-kokomi"],
        note: "Kokomi maintient les PV pour éviter la mort sous Blood Blossom.",
      },
    ],
    verdict: "Achat quasi obligatoire pour tout compte sérieux : elle améliore n'importe quelle équipe existante.",
  },
  {
    game: "gi",
    slug: "neuvillette",
    summary:
      "Neuvillette est un DPS Hydro qui scale sur les PV et n'a besoin d'aucun temps de recharge : son attaque chargée applique une Hydro constante et inflige des dégâts très élevés sur la durée.",
    pros: [
      "Aucune contrainte de rotation ni de recharge d'énergie",
      "Application Hydro continue, parfaite pour la Vaporisation",
      "Excellent en mono-cible comme en AoE cônique",
    ],
    cons: [
      "Vulnérable aux interruptions sans bouclier ou Zhongli",
      "Dépend des marques de Droit de jugement pour son plein potentiel",
      "Peu mobile pendant son attaque chargée",
    ],
    builds: [
      {
        title: "Build principal — Attaque chargée",
        items: [
          "Arme : Tome of the Eternal Flow (alt. Prototype Amber, Sacrificial Jade)",
          "Artéfacts 4p : Marechaussee Hunter",
          "Stats : PV% / Bonus dégâts Hydro / CRIT DMG",
        ],
        note: "Avec Furina, les variations de PV maintiennent en permanence les 3 stacks de Marechaussee Hunter.",
      },
    ],
    teams: [
      {
        name: "Vaporize double soigneur",
        members: ["neuvillette", "furina", "kaedehara-kazuha", "sangonomiya-kokomi"],
      },
      {
        name: "Team Dendro",
        members: ["neuvillette", "nahida", "furina", "baizhu"],
      },
    ],
    verdict: "L'un des DPS les plus confortables du jeu : peu de contraintes, dégâts élevés, s'occupe seul d'une moitié d'Abîme.",
  },
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
      "Fortement avantagée par son W-Engine signature",
      "Le cycle de Frostburn demande de la pratique",
      "Investissement en disques driver conséquent",
    ],
    builds: [
      {
        title: "Build principal — Anomalie Givre",
        items: [
          "W-Engine : Hailstorm Shrine (alt. Weeping Gemini)",
          "Disques 4p : Branch & Blade Song + 2p Woodpecker Electro",
          "Stats : Maîtrise d'anomalie / ATK% / Dégâts Glace",
        ],
        note: "Prioriser la maîtrise d'anomalie sur le taux critique : ses dégâts principaux sont d'origine anomalie.",
      },
    ],
    teams: [
      {
        name: "Équipe Givre standard",
        members: ["miyabi", "yanagi", "astra-yao"],
        note: "Yanagi déclenche les Disorder, Astra Yao buffe l'ensemble.",
      },
      {
        name: "Variante budget",
        members: ["miyabi", "soukaku", "lucy"],
      },
    ],
    verdict: "Meilleur agent du jeu, tous rôles confondus. Si vous ne devez tirer qu'une seule bannière, c'est celle-ci.",
  },
  {
    game: "zzz",
    slug: "astra-yao",
    summary:
      "Astra Yao est une buffeuse universelle qui augmente l'ATK de l'équipe, fournit des soins et amplifie les dégâts pendant ses fenêtres d'Idol. Elle s'insère dans absolument toutes les compositions.",
    pros: [
      "Buff d'ATK et de dégâts applicable à tous les attributs",
      "Soins passifs qui remplacent un défenseur",
      "Aucune synergie d'attribut requise",
    ],
    cons: [
      "Apport de dégâts personnel faible",
      "Le buff demande une bonne gestion des rotations",
    ],
    builds: [
      {
        title: "Build principal — Support",
        items: [
          "W-Engine : Elegant Vanity",
          "Disques 4p : Astral Voice + 2p Swing Jazz",
          "Stats : ATK% / Régénération d'énergie / PV%",
        ],
        note: "Viser au moins 1,8 de régénération d'énergie pour enchaîner les ultimes.",
      },
    ],
    teams: [
      { name: "Givre", members: ["miyabi", "yanagi", "astra-yao"] },
      { name: "Éther", members: ["yixuan", "trigger", "astra-yao"] },
    ],
    verdict: "Le support le plus flexible du jeu : rentable sur n'importe quel compte, quel que soit le DPS possédé.",
  },
];

export function getGuide(game: string, slug: string) {
  return GUIDES.find((guide) => guide.game === game && guide.slug === slug);
}

export function getGuidesForGame(game: string) {
  return GUIDES.filter((guide) => guide.game === game);
}
