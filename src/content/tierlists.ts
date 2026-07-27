import type { TierList } from "@/lib/types";

/**
 * Tier lists éditoriales, notées T0 (méta absolu) à T3.
 *
 * Chaque entrée est rangée dans une colonne de rôle définie par `tierColumns`
 * du jeu (voir src/lib/games.ts), à la manière de Prydwen.
 *
 * Les `slug` doivent correspondre à ceux des données générées ; les entrées
 * inconnues sont ignorées à l'affichage et signalées par `npm run check-content`.
 *
 * Références : Prydwen (HSR, ZZZ) ; La Gazette de Teyvat, KeqingMains,
 * Stygian.moe et GenshinLab (Genshin).
 */
export const TIER_LISTS: TierList[] = [
  /* ------------------------------------------------------------------ */
  /* Honkai: Star Rail                                                   */
  /* ------------------------------------------------------------------ */
  {
    game: "hsr",
    mode: "moc",
    label: "Memory of Chaos",
    description:
      "Deux moitiés à nettoyer dans un nombre de cycles limité. On valorise les dégâts de zone, la vitesse de rotation et les amplificateurs capables de porter une équipe entière.",
    updated: "2026-07-20",
    sources: [{ label: "Prydwen", url: "https://www.prydwen.gg/star-rail/tier-list/" }],
    entries: [
      // DPS
      { slug: "acheron", tier: "T0", column: "dps", note: "Ultime dévastateur en équipe mono-Néant, ignore la régénération d'énergie." },
      { slug: "firefly", tier: "T0", column: "dps", note: "Cœur des équipes Super Break, dégâts de rupture massifs." },
      { slug: "the-herta", tier: "T0", column: "dps", note: "DPS AoE dominant, s'occupe seule des vagues denses." },
      { slug: "feixiao", tier: "T0.5", column: "dps", note: "Mono-cible d'élite grâce aux attaques de suivi." },
      { slug: "jingliu", tier: "T1", column: "dps", note: "Puissante mais exige un soutien dédié et beaucoup d'énergie." },
      { slug: "boothill", tier: "T1", column: "dps", note: "Rupture mono-cible, nécessite Ruan Mei pour briller." },
      { slug: "rappa", tier: "T1", column: "dps", note: "Break AoE efficace, meilleure encore en Pure Fiction." },
      { slug: "blade", tier: "T1.5", column: "dps", note: "Scaling PV solide mais kit vieillissant." },
      { slug: "seele", tier: "T2", column: "dps", note: "Mono-cible pure, largement dépassée par Feixiao." },
      { slug: "jing-yuan", tier: "T2", column: "dps", note: "Lightning-Lord lent à monter en puissance." },
      { slug: "yanqing", tier: "T3", column: "dps", note: "Trop fragile, conditions de buff punitives." },

      // Sous-DPS
      { slug: "kafka", tier: "T0.5", column: "sub", note: "Référence du DoT, à jouer avec Black Swan." },
      { slug: "black-swan", tier: "T0.5", column: "sub", note: "Empile l'Arcana, dégâts exponentiels sur la durée." },
      { slug: "jade", tier: "T1", column: "sub", note: "Dégâts de suivi constants, brille avec The Herta." },
      { slug: "topaz-numby", tier: "T1", column: "sub", note: "Excellente en équipe d'attaques de suivi." },
      { slug: "himeko", tier: "T1.5", column: "sub", note: "Très bonne en Pure Fiction, correcte ici." },
      { slug: "clara", tier: "T2", column: "sub", note: "Contre-attaques agréables, plafond limité." },
      { slug: "welt", tier: "T2", column: "sub", note: "Contrôle utile, dégâts datés." },

      // Amplificateurs
      { slug: "sunday", tier: "T0", column: "amp", note: "Relance immédiate et buff d'invocations, sans équivalent." },
      { slug: "robin", tier: "T0", column: "amp", note: "ATK%, DMG% et action avancée : le buff le plus complet." },
      { slug: "ruan-mei", tier: "T0", column: "amp", note: "Vitesse, rupture et réduction de résistance, universelle." },
      { slug: "sparkle", tier: "T0.5", column: "amp", note: "Points de compétence quasi illimités pour les DPS gourmands." },
      { slug: "tribbie", tier: "T0.5", column: "amp", note: "Amplificatrice AoE, excellente sur plusieurs cibles." },
      { slug: "jiaoqiu", tier: "T0.5", column: "amp", note: "Debuffeur Ashen Roast, partenaire naturel d'Acheron." },
      { slug: "silver-wolf", tier: "T1.5", column: "amp", note: "Implantation de faiblesse, devenue niche." },
      { slug: "pela", tier: "T1.5", column: "amp", note: "Réduction de défense à moindre coût, 4★ solide." },
      { slug: "bronya", tier: "T1.5", column: "amp", note: "Relance efficace, supplantée par Sunday." },

      // Sustain
      { slug: "aventurine", tier: "T0", column: "sustain", note: "Boucliers fiables et dégâts de suivi non négligeables." },
      { slug: "huohuo", tier: "T0", column: "sustain", note: "Soins et régénération d'énergie, confort maximal." },
      { slug: "lingsha", tier: "T0", column: "sustain", note: "Soins plus rupture Feu, indispensable en équipe Firefly." },
      { slug: "fu-xuan", tier: "T0.5", column: "sustain", note: "Mitigation d'équipe, sécurise les compositions fragiles." },
      { slug: "luocha", tier: "T1", column: "sustain", note: "Soins automatiques sans coût en points de compétence." },
      { slug: "gallagher", tier: "T1", column: "sustain", note: "Break Feu et soins, très bon marché." },
      { slug: "gepard", tier: "T2", column: "sustain", note: "Bouclier fiable, aucun apport offensif." },
      { slug: "bailu", tier: "T2", column: "sustain", note: "Soins irréguliers, remplacée par Huohuo." },
    ],
  },
  {
    game: "hsr",
    mode: "pf",
    label: "Pure Fiction",
    description:
      "Vagues d'ennemis en continu et score cumulé. Les dégâts de zone et la génération d'actions écrasent tout le reste ; les DPS mono-cible sont hors-sujet.",
    updated: "2026-07-20",
    sources: [{ label: "Prydwen", url: "https://www.prydwen.gg/star-rail/tier-list/" }],
    entries: [
      // DPS
      { slug: "the-herta", tier: "T0", column: "dps", note: "Conçue pour le mode : dégâts AoE en cascade." },
      { slug: "rappa", tier: "T0", column: "dps", note: "Rupture de zone, nettoie des écrans entiers." },
      { slug: "argenti", tier: "T0.5", column: "dps", note: "Ultime AoE massif et gestion d'énergie simple." },
      { slug: "jing-yuan", tier: "T1", column: "dps", note: "Lightning-Lord dévastateur si l'équipe tient la distance." },
      { slug: "acheron", tier: "T1", column: "dps", note: "Excellente en soi, mais orientée mono-cible." },
      { slug: "firefly", tier: "T1.5", column: "dps", note: "Rupture mono-cible peu adaptée aux vagues." },
      { slug: "feixiao", tier: "T2", column: "dps", note: "Mono-cible, hors-sujet ici." },
      { slug: "seele", tier: "T2", column: "dps", note: "Resurgence aide un peu, sans plus." },

      // Sous-DPS
      { slug: "himeko", tier: "T0", column: "sub", note: "Ses suivis se déclenchent en boucle sur les vagues." },
      { slug: "jade", tier: "T0.5", column: "sub", note: "Dégâts de suivi constants sur toute la largeur." },
      { slug: "kafka", tier: "T1", column: "sub", note: "DoT de zone efficace mais lent à démarrer." },
      { slug: "black-swan", tier: "T1", column: "sub", note: "Excellente sur la durée, moins sur les vagues rapides." },

      // Amplificateurs
      { slug: "robin", tier: "T0", column: "amp", note: "Buff global, déterminant pour le score." },
      { slug: "sunday", tier: "T0", column: "amp", note: "Relance les invocations, parfait avec Jing Yuan." },
      { slug: "ruan-mei", tier: "T0", column: "amp", note: "Vitesse et rupture pour enchaîner les vagues." },
      { slug: "tribbie", tier: "T0", column: "amp", note: "Amplification AoE taillée pour le mode." },
      { slug: "sparkle", tier: "T0.5", column: "amp", note: "Alimente les DPS en points de compétence." },

      // Sustain
      { slug: "huohuo", tier: "T0.5", column: "sustain", note: "Régénération d'énergie, confortable sur la durée." },
      { slug: "lingsha", tier: "T0.5", column: "sustain", note: "Soins de zone et rupture." },
      { slug: "aventurine", tier: "T1", column: "sustain", note: "Boucliers solides, moins utiles sur ennemis faibles." },
      { slug: "gallagher", tier: "T1.5", column: "sustain", note: "Suffisant pour la plupart des étages." },
      { slug: "gepard", tier: "T2", column: "sustain", note: "Bouclier superflu face à des packs peu menaçants." },
    ],
  },
  {
    game: "hsr",
    mode: "as",
    label: "Apocalyptic Shadow",
    description:
      "Boss uniques avec score basé sur la vitesse d'élimination et la rupture des barres de résistance. Les DPS mono-cible, les briseurs et les amplificateurs de burst dominent.",
    updated: "2026-07-20",
    sources: [{ label: "Prydwen", url: "https://www.prydwen.gg/star-rail/tier-list/" }],
    entries: [
      // DPS
      { slug: "acheron", tier: "T0", column: "dps", note: "Burst mono-cible parmi les plus élevés du jeu." },
      { slug: "feixiao", tier: "T0", column: "dps", note: "Attaques de suivi idéales contre une cible unique." },
      { slug: "firefly", tier: "T0", column: "dps", note: "Rupture Feu massive, score maximal sur boss cassables." },
      { slug: "boothill", tier: "T0.5", column: "dps", note: "Spécialiste de la rupture mono-cible." },
      { slug: "jingliu", tier: "T1", column: "dps", note: "Bons dégâts, mais rotation exigeante." },
      { slug: "rappa", tier: "T1", column: "dps", note: "Efficace en rupture, meilleure sur plusieurs cibles." },
      { slug: "blade", tier: "T1.5", column: "dps", note: "Survie confortable, dégâts en retrait." },
      { slug: "the-herta", tier: "T1.5", column: "dps", note: "Orientée AoE, moins adaptée aux boss seuls." },
      { slug: "seele", tier: "T2", column: "dps", note: "Sans Resurgence, son plafond chute." },

      // Sous-DPS
      { slug: "topaz-numby", tier: "T0.5", column: "sub", note: "Marque Prooof taillée pour les cibles uniques." },
      { slug: "kafka", tier: "T1", column: "sub", note: "DoT correct, mais le mode récompense le burst." },
      { slug: "black-swan", tier: "T1", column: "sub", note: "Montée en puissance trop lente pour le score." },
      { slug: "jade", tier: "T1.5", column: "sub", note: "Moins de déclenchements sur une seule cible." },

      // Amplificateurs
      { slug: "sunday", tier: "T0", column: "amp", note: "Relance le DPS pendant la fenêtre de rupture." },
      { slug: "robin", tier: "T0", column: "amp", note: "Buff offensif complet, universel." },
      { slug: "ruan-mei", tier: "T0", column: "amp", note: "Prolonge l'état de rupture : cruciale ici." },
      { slug: "jiaoqiu", tier: "T0.5", column: "amp", note: "Amplifie fortement Acheron sur cible unique." },
      { slug: "sparkle", tier: "T1", column: "amp", note: "Excellente, mais Sunday la devance sur les boss." },
      { slug: "pela", tier: "T1.5", column: "amp", note: "Réduction de défense à petit budget." },

      // Sustain
      { slug: "lingsha", tier: "T0", column: "sustain", note: "Soins et rupture Feu : double rôle décisif." },
      { slug: "aventurine", tier: "T0", column: "sustain", note: "Absorbe les burst de boss sans faillir." },
      { slug: "huohuo", tier: "T0.5", column: "sustain", note: "Énergie et soins pour enchaîner les ultimes." },
      { slug: "fu-xuan", tier: "T0.5", column: "sustain", note: "Mitigation précieuse face aux attaques lourdes." },
      { slug: "gallagher", tier: "T1", column: "sustain", note: "Option budget très correcte en équipe Break." },
      { slug: "luocha", tier: "T1", column: "sustain", note: "Soins passifs sans coût en points de compétence." },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Genshin Impact                                                      */
  /* ------------------------------------------------------------------ */
  {
    game: "gi",
    mode: "abyss",
    label: "Abîme Spiralé",
    description:
      "Deux équipes complètes et une contrainte de temps par chambre. On valorise le burst, la fiabilité des réactions et la capacité à s'insérer dans plusieurs compositions.",
    updated: "2026-07-20",
    sources: [
      { label: "La Gazette de Teyvat", url: "https://lagazettedeteyvat.fr" },
      { label: "KeqingMains", url: "https://keqingmains.com" },
      { label: "GenshinLab", url: "https://genshinlab.com" },
    ],
    entries: [
      // DPS principaux
      { slug: "neuvillette", tier: "T0", column: "dps", note: "Autonome, s'occupe d'une moitié d'Abîme sans contrainte de rotation." },
      { slug: "arlecchino", tier: "T0", column: "dps", note: "DPS Pyro on-field au rapport dégâts/investissement excellent." },
      { slug: "mavuika", tier: "T0", column: "dps", note: "Burst Pyro mobile, très flexible en équipe." },
      { slug: "hu-tao", tier: "T0.5", column: "dps", note: "Vaporisation dévastatrice avec Yelan ou Xingqiu." },
      { slug: "kamisato-ayaka", tier: "T0.5", column: "dps", note: "Freeze impeccable avec Kazuha et Shenhe." },
      { slug: "clorinde", tier: "T1", column: "dps", note: "Excellente en Aggravate, dépendante de son support." },
      { slug: "wriothesley", tier: "T1", column: "dps", note: "Cryo mono-cible fiable et confortable." },
      { slug: "navia", tier: "T1", column: "dps", note: "Burst Géo puissant, dépend des cristaux." },
      { slug: "cyno", tier: "T1.5", column: "dps", note: "Bon en Aggravate, rotation rigide." },
      { slug: "eula", tier: "T1.5", column: "dps", note: "Physique puissante mais fenêtre de burst étroite." },
      { slug: "ganyu", tier: "T2", column: "dps", note: "Charged shots vieillissants face aux nouveaux DPS." },
      { slug: "diluc", tier: "T2", column: "dps", note: "Kit daté, remplacé dans presque toutes les équipes." },

      // Sous-DPS
      { slug: "xiangling", tier: "T0", column: "sub", note: "Meilleur off-field Pyro du jeu, et c'est une 4★." },
      { slug: "yelan", tier: "T0", column: "sub", note: "Hydro off-field avec buff de dégâts progressif." },
      { slug: "xingqiu", tier: "T0", column: "sub", note: "Application Hydro et mitigation, indémodable." },
      { slug: "raiden-shogun", tier: "T0.5", column: "sub", note: "Batterie d'énergie et dégâts corrects." },
      { slug: "fischl", tier: "T1", column: "sub", note: "Électro off-field constant, très économique." },
      { slug: "nilou", tier: "T1", column: "sub", note: "Bloom exceptionnel mais verrouille l'équipe." },
      { slug: "xianyun", tier: "T1", column: "sub", note: "Excellente pour les DPS à attaques plongeantes." },

      // Supports
      { slug: "furina", tier: "T0", column: "support", note: "Buff de dégâts hors catégorie, s'insère presque partout." },
      { slug: "kaedehara-kazuha", tier: "T0", column: "support", note: "Regroupement, Swirl et réduction de résistance élémentaire." },
      { slug: "nahida", tier: "T0", column: "support", note: "Colonne vertébrale de toutes les équipes Dendro." },
      { slug: "bennett", tier: "T0", column: "support", note: "Buff d'ATK et soins : increvable depuis la 1.0." },
      { slug: "xilonen", tier: "T0.5", column: "support", note: "Réduction de résistance Géo et soutien de rotation." },
      { slug: "sucrose", tier: "T1", column: "support", note: "Alternative très correcte à Kazuha." },
      { slug: "faruzan", tier: "T1.5", column: "support", note: "Indispensable aux équipes Anémo, inutile ailleurs." },

      // Soins et boucliers
      { slug: "zhongli", tier: "T0", column: "healer", note: "Bouclier universel et réduction de résistance." },
      { slug: "kuki-shinobu", tier: "T0.5", column: "healer", note: "Soins Électro, pilier des équipes Hyperbloom." },
      { slug: "sangonomiya-kokomi", tier: "T0.5", column: "healer", note: "Soins constants, partenaire obligé de Furina." },
      { slug: "baizhu", tier: "T1", column: "healer", note: "Soins et Dendro off-field, très sûr." },
      { slug: "jean", tier: "T1.5", column: "healer", note: "Polyvalente mais sans buff offensif." },
      { slug: "qiqi", tier: "T2", column: "healer", note: "Soins solides, aucun apport offensif." },
      { slug: "barbara", tier: "T3", column: "healer", note: "Application Hydro utile, personnage très fragile." },
    ],
  },
  {
    game: "gi",
    mode: "theater",
    label: "Théâtre Imaginarium",
    description:
      "Le mode impose des éléments et exige un roster large. Les 4★ polyvalents et les personnages hors-méta retrouvent une vraie valeur.",
    updated: "2026-07-20",
    sources: [
      { label: "La Gazette de Teyvat", url: "https://lagazettedeteyvat.fr" },
      { label: "GenshinLab", url: "https://genshinlab.com" },
    ],
    entries: [
      { slug: "neuvillette", tier: "T0", column: "dps", note: "Nettoie les étages seul quand l'Hydro est autorisé." },
      { slug: "arlecchino", tier: "T0.5", column: "dps", note: "Rentable dès qu'un élément Pyro est imposé." },
      { slug: "mavuika", tier: "T0.5", column: "dps", note: "Flexible, s'adapte à la plupart des contraintes." },
      { slug: "noelle", tier: "T1.5", column: "dps", note: "Géo autonome, dépanne sur les étages faciles." },

      { slug: "xiangling", tier: "T0", column: "sub", note: "4★ Pyro imbattable pour remplir les contraintes." },
      { slug: "xingqiu", tier: "T0", column: "sub", note: "Hydro off-field disponible sur tous les comptes." },
      { slug: "fischl", tier: "T0.5", column: "sub", note: "Électro off-field constant et bon marché." },
      { slug: "collei", tier: "T1.5", column: "sub", note: "Dendro d'appoint quand l'élément est imposé." },

      { slug: "bennett", tier: "T0", column: "support", note: "Choisi presque systématiquement, quel que soit l'élément." },
      { slug: "furina", tier: "T0", column: "support", note: "S'insère dans toutes les compositions." },
      { slug: "kaedehara-kazuha", tier: "T0.5", column: "support", note: "Utilitaire universel." },
      { slug: "nahida", tier: "T0.5", column: "support", note: "Débloque les contraintes Dendro." },
      { slug: "sucrose", tier: "T1", column: "support", note: "Regroupement à petit budget." },

      { slug: "kuki-shinobu", tier: "T0.5", column: "healer", note: "Soins et Électro : deux besoins couverts d'un coup." },
      { slug: "zhongli", tier: "T0.5", column: "healer", note: "Bouclier qui sécurise les étages difficiles." },
      { slug: "barbara", tier: "T1.5", column: "healer", note: "Soigneuse de secours, disponible gratuitement." },
    ],
  },
  {
    game: "gi",
    mode: "stygian",
    label: "Onirique Stygien",
    description:
      "Mode de difficulté chronométré face à des boss très résistants. Le score dépend des dégâts mono-cible bruts et de la capacité à survivre sans perdre de temps.",
    updated: "2026-07-20",
    sources: [
      { label: "Stygian.moe", url: "https://www.stygian.moe/fr" },
      { label: "KeqingMains", url: "https://keqingmains.com" },
    ],
    entries: [
      { slug: "arlecchino", tier: "T0", column: "dps", note: "Dégâts mono-cible soutenus, idéale contre les boss." },
      { slug: "neuvillette", tier: "T0", column: "dps", note: "Pression constante sans temps mort de rotation." },
      { slug: "mavuika", tier: "T0", column: "dps", note: "Burst élevé et bonne mobilité face aux attaques." },
      { slug: "hu-tao", tier: "T0.5", column: "dps", note: "Excellente en Vaporisation, mais fragile sous pression." },
      { slug: "wriothesley", tier: "T1", column: "dps", note: "Mono-cible fiable, survie correcte." },
      { slug: "clorinde", tier: "T1", column: "dps", note: "Bon burst, demande une gestion prudente des PV." },
      { slug: "kamisato-ayaka", tier: "T1.5", column: "dps", note: "Le Freeze est inefficace sur les boss immunisés." },
      { slug: "eula", tier: "T2", column: "dps", note: "Fenêtre de burst trop rigide pour le format." },

      { slug: "yelan", tier: "T0", column: "sub", note: "Dégâts off-field et buff progressif sur cible unique." },
      { slug: "xingqiu", tier: "T0.5", column: "sub", note: "Mitigation précieuse face aux boss agressifs." },
      { slug: "xiangling", tier: "T0.5", column: "sub", note: "Pyro constant, sous réserve de tenir la rotation." },
      { slug: "raiden-shogun", tier: "T1", column: "sub", note: "Recharge d'énergie utile sur les combats longs." },

      { slug: "furina", tier: "T0", column: "support", note: "Buff décisif pour le score, à condition d'avoir un soigneur." },
      { slug: "kaedehara-kazuha", tier: "T0", column: "support", note: "Réduction de résistance et regroupement d'ajouts." },
      { slug: "xilonen", tier: "T0.5", column: "support", note: "Shred Géo et soins d'appoint." },
      { slug: "nahida", tier: "T1", column: "support", note: "Forte, mais les boss résistent souvent au Dendro." },

      { slug: "zhongli", tier: "T0", column: "healer", note: "Le bouclier évite les interruptions, décisif au score." },
      { slug: "sangonomiya-kokomi", tier: "T0.5", column: "healer", note: "Soins constants pour tenir sous Furina." },
      { slug: "baizhu", tier: "T1", column: "healer", note: "Soins automatiques et résurrection de sécurité." },
      { slug: "jean", tier: "T1.5", column: "healer", note: "Correcte, sans apport offensif." },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Zenless Zone Zero                                                   */
  /* ------------------------------------------------------------------ */
  {
    game: "zzz",
    mode: "shiyu",
    label: "Shiyu Defense",
    description:
      "Deux équipes et un chronomètre. On note la vitesse de nettoyage, la fiabilité du Stun et la fluidité des rotations entre agents.",
    updated: "2026-07-20",
    sources: [{ label: "Prydwen", url: "https://www.prydwen.gg/zenless/tier-list/" }],
    entries: [
      // DPS
      { slug: "miyabi", tier: "T0", column: "dps", note: "Agent le plus puissant du jeu, autonome et sans contrainte." },
      { slug: "yixuan", tier: "T0", column: "dps", note: "Dégâts Encre aurique énormes avec sustain intégré." },
      { slug: "evelyn", tier: "T0", column: "dps", note: "DPS Feu très régulier, excellente sur boss." },
      { slug: "zhu-yuan", tier: "T0.5", column: "dps", note: "Référence Éther en mono-cible." },
      { slug: "ellen", tier: "T1", column: "dps", note: "DPS Glace fiable, rotation exigeante." },
      { slug: "harumasa", tier: "T1", column: "dps", note: "Électro correct, plafond de dégâts moyen." },
      { slug: "soldier-11", tier: "T1.5", column: "dps", note: "DPS Feu daté mais toujours jouable." },
      { slug: "nekomata", tier: "T2", column: "dps", note: "Physique vieillissante, dépend du positionnement." },
      { slug: "billy", tier: "T3", column: "dps", note: "Dégâts faibles, contenu de début de jeu uniquement." },

      // Anomalie
      { slug: "yanagi", tier: "T0", column: "anomaly", note: "Disorder Électro, redoutable en double anomalie." },
      { slug: "hugo", tier: "T0", column: "anomaly", note: "Anomalie Glace de très haut niveau." },
      { slug: "burnice", tier: "T0", column: "anomaly", note: "Anomalie Feu hors terrain, universelle." },
      { slug: "jane", tier: "T0.5", column: "anomaly", note: "Anomalie Physique explosive, excellente avec Seth." },
      { slug: "grace", tier: "T1.5", column: "anomaly", note: "Électro correcte, dépassée par Yanagi." },
      { slug: "piper", tier: "T2", column: "anomaly", note: "Dégâts dispersés, ciblage peu fiable." },

      // Stun
      { slug: "trigger", tier: "T0", column: "stun", note: "Rupture Électro et rotation très rapide." },
      { slug: "lighter", tier: "T0", column: "stun", note: "Stun Feu qui amplifie les dégâts critiques." },
      { slug: "qingyi", tier: "T0.5", column: "stun", note: "Stun Électro solide, un cran sous Trigger." },
      { slug: "lycaon", tier: "T1", column: "stun", note: "Stun Glace de référence pour Ellen." },
      { slug: "koleda", tier: "T1.5", column: "stun", note: "Stun Feu au tempo difficile à maîtriser." },
      { slug: "anby", tier: "T2", column: "stun", note: "Option 4★ de démarrage." },

      // Support
      { slug: "astra-yao", tier: "T0", column: "support", note: "Buffeuse universelle, s'insère dans toutes les équipes." },
      { slug: "caesar", tier: "T0", column: "support", note: "Bouclier et buff d'impact, sécurise les clears." },
      { slug: "rina", tier: "T0.5", column: "support", note: "Support Électro à pénétration de défense." },
      { slug: "soukaku", tier: "T1", column: "support", note: "Buffeuse Glace 4★, indispensable en budget." },
      { slug: "nicole", tier: "T1", column: "support", note: "Regroupe les ennemis et réduit leur défense." },
      { slug: "lucy", tier: "T1.5", column: "support", note: "Buff d'ATK simple et efficace." },
      { slug: "seth", tier: "T1.5", column: "support", note: "Bouclier et accumulation d'anomalie." },
    ],
  },
  {
    game: "zzz",
    mode: "da",
    label: "Deadly Assault",
    description:
      "Boss uniques notés au score. Les dégâts mono-cible bruts et la longueur des fenêtres de Stun font toute la différence.",
    updated: "2026-07-20",
    sources: [{ label: "Prydwen", url: "https://www.prydwen.gg/zenless/tier-list/" }],
    entries: [
      { slug: "miyabi", tier: "T0", column: "dps", note: "Score maximal quasi garanti sur tous les boss." },
      { slug: "evelyn", tier: "T0", column: "dps", note: "Excellente contre une cible unique immobile." },
      { slug: "yixuan", tier: "T0", column: "dps", note: "Burst mono-cible énorme." },
      { slug: "zhu-yuan", tier: "T0.5", column: "dps", note: "Domine les boss à faiblesse Éther." },
      { slug: "ellen", tier: "T1", column: "dps", note: "Très bonne, sous réserve d'un Stun bien synchronisé." },
      { slug: "harumasa", tier: "T1.5", column: "dps", note: "Correct sans plus face aux boss résistants." },

      { slug: "hugo", tier: "T0", column: "anomaly", note: "Anomalie Glace au-dessus du lot sur cible unique." },
      { slug: "jane", tier: "T0.5", column: "anomaly", note: "Forte sur la durée, moins en burst pur." },
      { slug: "burnice", tier: "T0.5", column: "anomaly", note: "Dégâts hors terrain constants." },
      { slug: "yanagi", tier: "T1", column: "anomaly", note: "Moins de Disorder face à un ennemi seul." },

      { slug: "trigger", tier: "T0", column: "stun", note: "Allonge nettement les fenêtres de Stun." },
      { slug: "lighter", tier: "T0", column: "stun", note: "Amplifie les dégâts pendant le Stun." },
      { slug: "qingyi", tier: "T0.5", column: "stun", note: "Stun régulier et fiable." },
      { slug: "lycaon", tier: "T1", column: "stun", note: "Efficace sur les boss à faiblesse Glace." },
      { slug: "koleda", tier: "T1.5", column: "stun", note: "Correct sur les boss lents." },

      { slug: "astra-yao", tier: "T0", column: "support", note: "Buff constant, relève tous les scores." },
      { slug: "caesar", tier: "T0.5", column: "support", note: "Sécurise les phases de contre-attaque." },
      { slug: "rina", tier: "T1", column: "support", note: "Pénétration utile contre les boss blindés." },
      { slug: "soukaku", tier: "T1.5", column: "support", note: "Buff Glace à petit budget." },
    ],
  },
];

export function getTierList(game: string, mode: string) {
  return TIER_LISTS.find((list) => list.game === game && list.mode === mode);
}

export function getTierListsForGame(game: string) {
  return TIER_LISTS.filter((list) => list.game === game);
}
