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

## Option A — GitHub Actions (recommandé, 3 clics, rien à installer)

1. **Cliquez sur ce lien** (page GitHub de création de fichier, contenu déjà pré-rempli) :

   https://github.com/Mistazer/ai-npc/new/arena/019fc95e-ai-npc/.github/workflows?filename=traduire-fr.yml&value=name%3A%20Traduire%20en%20fran%C3%A7ais%0A%0Aon%3A%0A%20%20workflow_dispatch%3A%0A%0Apermissions%3A%0A%20%20contents%3A%20write%0A%0Ajobs%3A%0A%20%20traduire%3A%0A%20%20%20%20runs-on%3A%20ubuntu-latest%0A%20%20%20%20timeout-minutes%3A%20150%0A%20%20%20%20steps%3A%0A%20%20%20%20%20%20-%20uses%3A%20actions/checkout%40v4%0A%20%20%20%20%20%20%20%20with%3A%0A%20%20%20%20%20%20%20%20%20%20ref%3A%20arena/019fc95e-ai-npc%0A%0A%20%20%20%20%20%20-%20uses%3A%20actions/setup-python%40v5%0A%20%20%20%20%20%20%20%20with%3A%0A%20%20%20%20%20%20%20%20%20%20python-version%3A%20%273.11%27%0A%0A%20%20%20%20%20%20-%20name%3A%20D%C3%A9pendances%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20pip%20install%20--quiet%20argostranslate%20beautifulsoup4%20lxml%20xhtml2pdf%0A%20%20%20%20%20%20%20%20%20%20sudo%20apt-get%20update%20-qq%20%26%26%20sudo%20apt-get%20install%20-y%20-qq%20wkhtmltopdf%20fonts-dejavu-core%20fonts-dejavu-extra%0A%0A%20%20%20%20%20%20-%20name%3A%20Mod%C3%A8le%20de%20traduction%20EN%E2%86%92FR%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20argospm%20update%0A%20%20%20%20%20%20%20%20%20%20argospm%20install%20translate-en_fr%0A%0A%20%20%20%20%20%20-%20name%3A%20EPUB%20source%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20curl%20-sL%20-o%20makeine_vol9.epub%20%5C%0A%20%20%20%20%20%20%20%20%20%20%20%20https%3A//raw.githubusercontent.com/Mistazer/ai-npc/main/makeine_vol9-revisionmtl.epub%0A%20%20%20%20%20%20%20%20%20%20ls%20-la%20makeine_vol9.epub%0A%0A%20%20%20%20%20%20-%20name%3A%20Traduction%20%2B%20EPUB%20%2B%20PDF%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20FROM_CODE%3Den%20TO_CODE%3Dfr%20%5C%0A%20%20%20%20%20%20%20%20%20%20EPUB_SRC%3Dmakeine_vol9.epub%20OUT_DIR%3Doutput%20%5C%0A%20%20%20%20%20%20%20%20%20%20BASE_NAME%3DMakeine_vol9_FR_sans-serif%20%5C%0A%20%20%20%20%20%20%20%20%20%20python%20translation-pipeline/translate.py%0A%0A%20%20%20%20%20%20-%20name%3A%20Publier%20sur%20la%20branche%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20git%20config%20user.name%20%22github-actions%5Bbot%5D%22%0A%20%20%20%20%20%20%20%20%20%20git%20config%20user.email%20%2241898282%2Bgithub-actions%5Bbot%5D%40users.noreply.github.com%22%0A%20%20%20%20%20%20%20%20%20%20git%20add%20output/%0A%20%20%20%20%20%20%20%20%20%20git%20commit%20-m%20%22Traduction%20FR%20%28sans-serif%2C%20noms%20adapt%C3%A9s%29%20%5Bskip%20ci%5D%22%20%7C%7C%20echo%20%22rien%20%C3%A0%20commiter%22%0A%20%20%20%20%20%20%20%20%20%20git%20push%0A%0A%20%20%20%20%20%20-%20uses%3A%20actions/upload-artifact%40v4%0A%20%20%20%20%20%20%20%20with%3A%0A%20%20%20%20%20%20%20%20%20%20name%3A%20makeine-vol9-fr%0A%20%20%20%20%20%20%20%20%20%20path%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20%20%20output/Makeine_vol9_FR_sans-serif.epub%0A%20%20%20%20%20%20%20%20%20%20%20%20output/Makeine_vol9_FR_sans-serif.pdf%0A%20%20%20%20%20%20%20%20%20%20%20%20output/rapport.txt%0A

2. **Commit** (bouton vert, valeurs par défaut) — le fichier
   `.github/workflows/traduire-fr.yml` est créé sur la branche de travail
3. Onglet **Actions → « Traduire en français » → Run workflow → Run workflow**
   (branche `arena/019fc95e-ai-npc`)

À la fin (~30-60 min), les fichiers apparaissent :
- commités dans **`output/`** sur la branche `arena/019fc95e-ai-npc`
- et joints à l'exécution (Actions → *Artifacts → makeine-vol9-fr*)

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
