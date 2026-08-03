# Traduction FR — makeine vol9 (revisionmtl)

Ce dossier contient le pipeline **déjà validé de bout en bout** sur le contenu
réel de l'EPUB (2757 segments, 0 échec, EPUB reconstruit + PDF 111 pages).

- `translate.py` — extraction EPUB → remplacement des noms → traduction
  automatique locale (Argos Translate) → EPUB + PDF en police **sans-serif**.

Remplacements effectués (sur le texte anglais, avant traduction) :
`Shirakawa → Shiratama`, `Amatsuka Ten-ai → Basori Tiara` (+ `Ten-ai → Tiara`,
`Amatsuka → Basori`), `Yakisoba → Yakishio` (forme capitalisée uniquement, pour
ne pas toucher au plat « yakisoba »), `Nuku-chan → Nukkun`.

> Remarque : la sandbox de l'agent n'a pas accès au téléchargement du modèle
> de traduction anglais→français (réseau filtré). Le pipeline a donc été testé
> ici avec la paire anglais→chinois, et il ne reste qu'à le lancer quelque part
> avec un accès internet normal — deux options ci-dessous.

---

## Option A — GitHub Actions (recommandé, 5 minutes, rien à installer)

1. Dans ce dépôt, sur GitHub, créez le fichier
   **`.github/workflows/traduire-fr.yml`** (bouton *Add file → Create new file*)
2. Collez le contenu YAML ci-dessous, validez (*Commit*)
3. Allez dans l'onglet **Actions → « Traduire en français » → Run workflow**

À la fin (~30-60 min), les fichiers apparaissent :
- commités dans **`output/`** sur la branche `arena/019fc95e-ai-npc`
- et joints à l'exécution (onglet Actions → *Artifacts*)

```yaml
name: Traduire en français

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  traduire:
    runs-on: ubuntu-latest
    timeout-minutes: 150
    steps:
      - uses: actions/checkout@v4
        with:
          ref: arena/019fc95e-ai-npc

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Dépendances
        run: |
          pip install --quiet argostranslate beautifulsoup4 lxml xhtml2pdf
          sudo apt-get update -qq && sudo apt-get install -y -qq wkhtmltopdf fonts-dejavu-core fonts-dejavu-extra

      - name: Modèle de traduction EN→FR
        run: |
          argospm update
          argospm install translate-en_fr

      - name: EPUB source
        run: |
          curl -sL -o makeine_vol9.epub \
            https://raw.githubusercontent.com/Mistazer/ai-npc/main/makeine_vol9-revisionmtl.epub
          ls -la makeine_vol9.epub

      - name: Traduction + EPUB + PDF
        run: |
          FROM_CODE=en TO_CODE=fr \
          EPUB_SRC=makeine_vol9.epub OUT_DIR=output \
          BASE_NAME=Makeine_vol9_FR_sans-serif \
          python translation-pipeline/translate.py

      - name: Publier
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add output/
          git commit -m "Traduction FR (sans-serif, noms adaptés)" || echo "rien à commiter"
          git push

      - uses: actions/upload-artifact@v4
        with:
          name: makeine-vol9-fr
          path: |
            output/Makeine_vol9_FR_sans-serif.epub
            output/Makeine_vol9_FR_sans-serif.pdf
            output/rapport.txt
```

---

## Option B — Sur votre machine (Linux/macOS, Windows avec WSL)

```bash
# 1) outils
pip install argostranslate beautifulsoup4 lxml xhtml2pdf
# PDF de meilleure qualité (optionnel) : sudo apt install wkhtmltopdf
argospm update && argospm install translate-en_fr

# 2) lancer (depuis ce dossier du dépôt, avec l'epub à côté)
FROM_CODE=en TO_CODE=fr \
EPUB_SRC=makeine_vol9-revisionmtl.epub OUT_DIR=output \
BASE_NAME=Makeine_vol9_FR_sans-serif \
python translate-pipeline/translate.py
```

Sorties : `output/Makeine_vol9_FR_sans-serif.epub` et
`output/Makeine_vol9_FR_sans-serif.pdf` (+ `rapport.txt`).

## Qualité attendue

Traduction automatique neuronale (Opus-MT via Argos) : lecture confortable de
type « MTL » (comparable à la source anglaise, déjà une MTL révisée). Les noms
propres sont verrouillés par les remplacements ci-dessus.
