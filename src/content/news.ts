import type { NewsItem } from "@/lib/types";

export const NEWS: NewsItem[] = [
  {
    slug: "lancement-hoyodex",
    title: "HoyoDex ouvre ses portes",
    date: "2026-07-26",
    game: "all",
    category: "Site",
    excerpt:
      "Une base de données complète et des tier lists commentées pour Honkai: Star Rail, Genshin Impact et Zenless Zone Zero, réunies sur un seul site.",
    body: `HoyoDex regroupe deux besoins qui vivaient jusqu'ici sur des sites séparés : une **base de données exhaustive** et des **tier lists éditoriales** avec guides de build.

Au programme pour ce lancement :

- 271 personnages/agents des trois jeux, avec compétences, éidolons, constellations et statistiques au niveau maximum ;
- 495 armes, cônes de lumière et W-Engines ;
- 149 sets d'artéfacts, reliques et disques driver ;
- 6 tier lists couvrant les modes de fin de jeu (Memory of Chaos, Pure Fiction, Abîme Spiralé, Théâtre Imaginarium, Shiyu Defense, Deadly Assault).

Toutes les données de jeu sont régénérées depuis les dépôts communautaires via une commande unique, ce qui garantit une mise à jour rapide à chaque patch.`,
  },
  {
    slug: "tier-list-update-juillet",
    title: "Mise à jour des tier lists — juillet 2026",
    date: "2026-07-20",
    game: "all",
    category: "Tier list",
    excerpt:
      "Réévaluation complète des trois jeux après les derniers patchs : nouvelles entrées S+, ajustements des supports et déclassements attendus.",
    body: `Les six tier lists du site ont été revues.

**Honkai: Star Rail** — Sunday et The Herta rejoignent le rang S+ en Memory of Chaos. Les compositions Break Feu autour de Firefly restent la référence sur les boss à faiblesse implantable.

**Genshin Impact** — Mavuika s'installe en S+ sur l'Abîme. Furina et Kazuha conservent leur place au sommet grâce à leur compatibilité universelle.

**Zenless Zone Zero** — Miyabi et Yixuan dominent toujours, Astra Yao s'impose comme support par défaut de presque toutes les équipes.`,
  },
  {
    slug: "guide-comprendre-anomalies-zzz",
    title: "Comprendre les anomalies et le Disorder dans ZZZ",
    date: "2026-07-14",
    game: "zzz",
    category: "Guide",
    excerpt:
      "Maîtrise d'anomalie, compétence d'anomalie, Disorder : le point sur les mécaniques qui déterminent la moitié de vos dégâts.",
    body: `Les dégâts d'anomalie dans Zenless Zone Zero reposent sur trois statistiques distinctes qu'il est facile de confondre.

**Maîtrise d'anomalie (Anomaly Mastery)** — Détermine la vitesse à laquelle vous remplissez la jauge d'anomalie de l'ennemi.

**Compétence d'anomalie (Anomaly Proficiency)** — Multiplie les dégâts infligés lors du déclenchement de l'anomalie.

**Disorder** — Déclenché lorsqu'une nouvelle anomalie remplace une anomalie existante. Les dégâts dépendent du temps restant sur l'anomalie écrasée : plus elle était fraîche, plus le Disorder frappe fort.

En pratique, une équipe à double anomalie (Miyabi + Yanagi, Jane + Burnice) vise à alterner les deux attributs pour déclencher un Disorder à chaque rotation.`,
  },
  {
    slug: "abime-spirale-rotation",
    title: "Abîme Spiralé : optimiser ses rotations à 20 secondes",
    date: "2026-07-08",
    game: "gi",
    category: "Guide",
    excerpt:
      "La plupart des équipes Genshin perdent des dégâts sur la fin de rotation. Voici comment structurer un cycle propre.",
    body: `Une rotation Genshin efficace tient en trois temps :

1. **Mise en place** — Bouclier ou soins d'abord (Zhongli, Bennett), puis les buffs longue durée (Furina, Kazuha).
2. **Application off-field** — Les personnages qui posent leurs effets sans rester sur le terrain (Xiangling, Yelan, Fischl).
3. **Fenêtre de dégâts** — Le DPS on-field exploite les dix à douze secondes restantes.

Le piège classique consiste à déclencher le déchaînement du DPS avant que tous les buffs soient posés. Une seconde perdue en début de rotation coûte plusieurs milliers de dégâts sur la durée d'un étage d'Abîme.`,
  },
  {
    slug: "hsr-break-effect-explication",
    title: "Star Rail : pourquoi le Break Effect a changé le méta",
    date: "2026-07-02",
    game: "hsr",
    category: "Guide",
    excerpt:
      "Les compositions Super Break ont ouvert une voie parallèle aux builds critiques classiques. Explications.",
    body: `Historiquement, un personnage de Honkai: Star Rail se construisait autour du taux et des dégâts critiques. L'arrivée du Super Break a changé la donne.

Le Super Break convertit une partie de l'effet de rupture en dégâts additionnels à chaque action portée sur un ennemi dont la barre de résistance est brisée. Ces dégâts **ne peuvent pas être critiques**, ce qui rend inutiles les statistiques critiques sur les personnages concernés.

Conséquence : sur Firefly, Rappa ou Boothill, un artéfact avec 60 % d'effet de rupture vaut davantage qu'un artéfact critique parfait. C'est aussi ce qui rend Ruan Mei et la Trailblazer Harmonie incontournables dans ces équipes.`,
  },
];

export function getNews(slug: string) {
  return NEWS.find((item) => item.slug === slug);
}

export const sortedNews = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
