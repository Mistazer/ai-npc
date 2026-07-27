# HoyoDex

Base de données **et** tier lists pour les trois jeux HoYoverse : **Honkai: Star Rail**, **Genshin Impact** et **Zenless Zone Zero**.

Le site combine deux approches :

- l'exhaustivité d'une base de données (personnages, armes, sets, statistiques, compétences complètes) ;
- des tier lists commentées et des guides de build éditoriaux, par mode de fin de jeu.

Interface entièrement en français.

---

## Démarrage rapide

```bash
npm install
npm run dev     # http://localhost:3000
```

Les données de jeu sont déjà versionnées dans `src/data/generated/`, le site fonctionne donc immédiatement après `npm install`, sans accès réseau.

### Autres commandes

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production : export statique dans `out/` (947 pages) |
| `npm run search-index` | Régénère `public/search-index.json` (inclus dans le build) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run sync` | Régénère toutes les données de jeu |
| `npm run sync -- hsr zzz` | Régénère uniquement les jeux indiqués |
| `npm run check-content` | Vérifie que l'éditorial référence des slugs existants |

---

## Déploiement sur GitHub Pages

Le site est exporté en HTML statique (`output: "export"`), il s'héberge donc directement sur GitHub Pages.

Le workflow prêt à l'emploi est dans **`deploy/github-pages.yml`**. Il doit être déplacé vers `.github/workflows/` — voir **[`deploy/README.md`](deploy/README.md)** pour la marche à suivre complète (3 étapes).

En résumé :

```bash
mkdir -p .github/workflows
git mv deploy/github-pages.yml .github/workflows/deploy.yml
git commit -m "ci: workflow de déploiement GitHub Pages" && git push
```

Puis dans les réglages du dépôt : le rendre **public** (Pages sur dépôt privé exige GitHub Pro), et `Settings` → `Pages` → `Source` : **GitHub Actions**.

> Si le workflow échoue avec `Get Pages site failed / Not Found`, c'est qu'il s'est lancé avant l'activation de Pages : activer Pages puis relancer le job depuis l'onglet `Actions`. Voir [`deploy/README.md`](deploy/README.md#erreurs-courantes-au-premier-lancement).

Le site sera publié sur `https://<utilisateur>.github.io/<dépôt>/`.

### Le `basePath`

Une *Project Page* est servie dans un sous-dossier (`/ai-npc/`), ce que Next doit connaître à la compilation. Le workflow récupère cette valeur automatiquement via `actions/configure-pages` et la passe en `NEXT_PUBLIC_BASE_PATH` — aucun réglage manuel n'est nécessaire.

Pour reproduire un build de production en local :

```bash
NEXT_PUBLIC_BASE_PATH=/ai-npc npm run build
npx serve out          # ou : python3 -m http.server --directory out
```

En développement (`npm run dev`), la variable est vide et le site est servi à la racine.

### Domaine personnalisé

Placer un fichier `public/CNAME` contenant le domaine, puis vider `NEXT_PUBLIC_BASE_PATH` dans le workflow (le site est alors servi à la racine).

### Alternatives sans rendre le dépôt public

L'export statique dans `out/` fonctionne tel quel sur **Vercel**, **Netlify** ou **Cloudflare Pages**, qui acceptent tous les dépôts privés sur leur offre gratuite. Sur Vercel, il n'y a même pas besoin de `basePath` : laisser la variable vide.

---

## Contenu actuel

| Jeu | Personnages | Armes | Sets | Autre |
| --- | --- | --- | --- | --- |
| Honkai: Star Rail | 95 | 165 cônes de lumière | 60 reliques | — |
| Genshin Impact | 120 | 237 armes | 61 artéfacts | — |
| Zenless Zone Zero | 56 agents | 93 W-Engines | 28 disques driver | 40 Bangboo |

Plus **8 tier lists** couvrant tous les modes de fin de jeu, un **onglet bêta** suivant 24 personnages à venir, 7 guides de personnage détaillés et 6 articles.

| Jeu | Tier lists |
| --- | --- |
| Honkai: Star Rail | Memory of Chaos, Pure Fiction, Apocalyptic Shadow |
| Genshin Impact | Abîme Spiralé, Théâtre Imaginarium, Onirique Stygien |
| Zenless Zone Zero | Shiyu Defense, Deadly Assault |

Les classements utilisent la notation **T0 → T3** et sont répartis en **colonnes par rôle** (DPS, sous-DPS, support, sustain), à la manière de Prydwen : on compare les personnages à l'intérieur d'une colonne, pas entre colonnes.

Soit 947 pages HTML pré-rendues, sans serveur ni base de données.

---

## Architecture

```
scripts/                 Pipeline de synchronisation des données
  sync-all.mjs           Orchestrateur (npm run sync)
  sync-genshin.mjs       Genshin Impact  → paquet npm genshin-db
  sync-hsr.mjs           Honkai: Star Rail → Mar-7th/StarRailRes
  sync-zzz.mjs           Zenless Zone Zero → Hakushin (miroir Genshin-Optimizer)
  build-search-index.mjs Génère public/search-index.json (chargé à la demande)
  lib/                   Client GitHub, utilitaires (slugs, nettoyage de texte)

src/
  data/generated/        JSON produits par les scripts (versionnés, ~2,9 Mo)
  lib/
    games.ts             Configuration des 3 jeux (couleurs, libellés, modes)
    types.ts             Types TypeScript partagés
    data.ts              Accès aux données + normalisation multi-jeux
    search.ts            Index de recherche global
  content/               Contenu éditorial, écrit à la main
    tierlists.ts         Tier lists (T0→T3, colonnes par rôle) et commentaires
    guides.ts            Guides de build (plusieurs builds par personnage)
    beta.ts              Personnages annoncés / en test
    news.ts              Articles
  components/            Composants UI (grilles, filtres, tier lists, recherche)
  app/
    page.tsx                        Accueil multi-jeux
    [game]/                         Hub par jeu (routes en français)
      personnages/[slug]            Fiches détaillées
      armes/[slug]                  Armes / cônes / W-Engines
      sets/[slug]                   Artéfacts / reliques / disques
      bangboo                       Spécifique à ZZZ
      tier-list/[mode]              Tier lists filtrables
      beta                          Contenu bêta du jeu
    beta                            Contenu bêta des trois jeux
    actualites/[slug]               Articles
```

### Choix techniques

- **Next.js 16 (App Router) + TypeScript + Tailwind v4.** Tout est pré-rendu statiquement (`generateStaticParams` + `output: "export"`), le site est donc déployable sur n'importe quel hébergeur de fichiers et excellent en SEO.
- **Données découplées du contenu.** `src/data/generated/` est régénérable à volonté ; `src/content/` contient uniquement l'éditorial écrit à la main. Une mise à jour de patch ne détruit jamais les tier lists.
- **Une seule structure normalisée** (`CharacterCard`) permet aux grilles, filtres, tier lists et à la recherche de fonctionner à l'identique pour les trois jeux, malgré des modèles de données très différents.
- **Thème par jeu** via variables CSS (`--accent`), appliqué par le layout de segment.
- **Images non optimisées par Next** : elles proviennent de CDN communautaires, on les sert directement via `<img loading="lazy">` (l'optimiseur est de toute façon indisponible en export statique).
- **Index de recherche chargé à la demande.** Servi comme fichier statique (166 Ko) téléchargé à la première ouverture de la recherche, plutôt qu'intégré au payload de chaque page — ce qui faisait passer l'export de 781 Mo à 162 Mo.

---

## Ajouter du contenu

**Une tier list** — ajouter une entrée dans `src/content/tierlists.ts` et déclarer le mode dans `tierModes` du jeu concerné (`src/lib/games.ts`). Les `slug` doivent correspondre à ceux de `src/data/generated/*-characters.json` ; une entrée inconnue est ignorée à l'affichage.

**Un guide** — ajouter un objet dans `src/content/guides.ts` avec le `game` et le `slug` du personnage. Il apparaît automatiquement sur sa fiche et sur les pages d'accueil.

**Un article** — ajouter une entrée dans `src/content/news.ts` (le corps accepte du Markdown).

---

## Sources des données

### Données de jeu (générées)

| Jeu | Source | Nature |
| --- | --- | --- |
| Genshin Impact | [`genshin-db`](https://github.com/theBowja/genshin-db) (npm) | Données extraites du jeu, communautaire |
| Honkai: Star Rail | [`Mar-7th/StarRailRes`](https://github.com/Mar-7th/StarRailRes) | Index JSON + assets, communautaire |
| Zenless Zone Zero | [`Genshin-Optimizer/zzz-hakushin-data`](https://github.com/Genshin-Optimizer/zzz-hakushin-data) | Données Hakushin, communautaire |

### Références éditoriales (tier lists et guides)

| Jeu | Références |
| --- | --- |
| Honkai: Star Rail | [Prydwen](https://www.prydwen.gg/star-rail/) |
| Genshin Impact | [La Gazette de Teyvat](https://lagazettedeteyvat.fr), [KeqingMains](https://keqingmains.com), [Stygian.moe](https://www.stygian.moe/fr) et [GenshinLab](https://genshinlab.com) pour l'endgame |
| Zenless Zone Zero | [Prydwen](https://www.prydwen.gg/zenless/) |
| Suivi bêta | [GachaBase](https://gachabase.net) |

Chaque tier list et chaque guide affiche ses sources sur la page correspondante.

### Note sur les images ZZZ

Hakushin (`static.nanoka.cc`) a fermé début 2026, ce qui a cassé tous les visuels de Zenless Zone Zero. Les données stockent désormais **plusieurs URL candidates par visuel** et le composant `EntityIcon` essaie chaque source dans l'ordre avant d'afficher un remplacement textuel. Pour ajouter un CDN, modifier la constante `CDNS` dans `scripts/sync-zzz.mjs` puis relancer `npm run sync -- zzz`.

Le script de synchronisation passe par l'API `api.github.com` (et non `raw.githubusercontent.com`) pour rester utilisable derrière des proxys restrictifs. Dans un environnement avec inspection TLS, définir `NODE_EXTRA_CA_CERTS` — le script `npm run sync` le fait déjà par défaut.

---

## Avertissement

HoyoDex est un projet communautaire non officiel. Honkai: Star Rail, Genshin Impact et Zenless Zone Zero sont des marques de HoYoverse / COGNOSPHERE PTE. LTD. Tous les visuels, noms et contenus de jeu restent la propriété de leurs détenteurs respectifs.
