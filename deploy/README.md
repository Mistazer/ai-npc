# Déploiement

## GitHub Pages

Le workflow prêt à l'emploi se trouve dans ce dossier : **`github-pages.yml`**.

Il n'a pas pu être placé directement dans `.github/workflows/` car le jeton
d'accès utilisé par l'agent ne dispose pas de la permission `workflows` de
GitHub — une restriction de sécurité côté GitHub, pas un problème du projet.

### À faire une fois, de ton côté

```bash
mkdir -p .github/workflows
git mv deploy/github-pages.yml .github/workflows/deploy.yml
git commit -m "ci: workflow de déploiement GitHub Pages"
git push
```

(Tu peux aussi le faire depuis l'interface web : `Add file` → `Create new file`,
nommer le fichier `.github/workflows/deploy.yml` et y coller le contenu de
`deploy/github-pages.yml`.)

### Puis, dans les réglages du dépôt

1. **Rendre le dépôt public.** GitHub Pages sur un dépôt privé exige un
   abonnement GitHub Pro/Team.
   `Settings` → `General` → bas de page → `Change repository visibility`.
2. **Activer Pages.** `Settings` → `Pages` → `Source` : **GitHub Actions**.
3. **Déployer.** Pousser sur `main`, ou onglet `Actions` →
   `Déploiement GitHub Pages` → `Run workflow`.

Le site sera publié sur `https://<utilisateur>.github.io/<dépôt>/`.

---

## Sans rendre le dépôt public

L'export statique (`out/`) fonctionne tel quel chez des hébergeurs qui acceptent
les dépôts privés en offre gratuite :

| Hébergeur | Réglages |
| --- | --- |
| **Vercel** | Import du dépôt, tout est auto-détecté. Laisser `NEXT_PUBLIC_BASE_PATH` vide. |
| **Netlify** | Build : `npm run build` — Publish directory : `out` |
| **Cloudflare Pages** | Build : `npm run build` — Output directory : `out` |

Sur ces plateformes le site est servi à la racine du domaine : ne pas définir
`NEXT_PUBLIC_BASE_PATH`.

---

## Vérifier un build de production en local

```bash
# Reproduit exactement ce que produit GitHub Pages (sous-dossier /ai-npc)
NEXT_PUBLIC_BASE_PATH=/ai-npc npm run build
python3 -m http.server 8000 --directory .   # puis ouvrir http://localhost:8000/ai-npc/

# Ou à la racine, comme sur Vercel/Netlify
npm run build
python3 -m http.server 8000 --directory out
```
