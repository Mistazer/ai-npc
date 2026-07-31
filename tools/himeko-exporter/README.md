# Himeko Nova – Exporteur Direct (sans capture réseau)

Alternative **100% fiable** à `reliquary-archiver` pour les serveurs privés. Au lieu de sniffer les paquets (qui échoue sur loopback 127.0.0.1 ou si le chiffrement est custom), on lit directement les fichiers du serveur privé.

## Pourquoi ?

- `reliquary-archiver` écoute `23301-23302` UDP. Avec `himeko-nova`, le traffic est local, parfois même en mémoire partagée. Il faut admin + pktmon, et même là ça peut rater si la clé initiale est inconnue.
- Les serveurs privés stockent déjà ton inventaire en clair dans une DB ou des JSON. Autant l'exporter directement.

## Fonctionnement

Ce dossier contient 2 outils :

### 1. `export.py` (Python)
Cherche automatiquement les données dans le dossier `himeko-nova-sr` :

- `gameserver/data/` ou `data/` ou `resources/`
- `accounts.db`, `database.sqlite`, `players/*.json`, `accounts/*.json`
- ou un dossier de type `database/` avec des fichiers par UID

Il convertit :
- `relic_list` → format Fribbels / Optimizer
- `equipment_list` (cônes)
- `avatar_list` + `avatar_path`
- `material_list` (optionnel)

Sortie : `archive_output-*.json` compatible avec https://fribbels.github.io/hsr-optimizer/ ou importable dans HoyoDex.

### 2. `himeko_to_optimizer.js` (Node)
Même logique mais pour les installations qui ont Node. Lit `config.json` de himeko-nova pour trouver le chemin des saves.

## Utilisation rapide

### Python

```bash
# 1. Installe les dépendances (aucune, juste Python 3)
python export.py --help

# 2. Exemples
python export.py --server-dir ../himeko-nova-sr --uid 10001 --out optimizer.json

# Si tu ne connais pas l'UID, il listera les comptes :
python export.py --server-dir ../himeko-nova-sr --list-accounts

# Si la DB est ailleurs :
python export.py --db C:/himeko-nova-sr/gameserver/database.db --uid 10001
```

### Node

```bash
node himeko_to_optimizer.js --data ../himeko-nova-sr/gameserver/data --uid 10001 --out optimizer.json
```

## Format de sortie

Le même que `reliquary-archiver` v4 :

```json
{
  "source": "himeko_nova_direct",
  "build": "4.4.53",
  "version": 4,
  "metadata": {"uid": 10001, "trailblazer": "Stelle"},
  "relics": [...],
  "light_cones": [...],
  "characters": [...],
  "materials": [...]
}
```

Tu peux l'importer directement dans Fribbels Optimizer → Import → fichier.

## Si ton serveur a un format différent

Ouvre `export.py`, cherche `def load_player_data()`, adapte le parsing. Le script est volontairement permissif : il cherche `relic`, `equipment`, `avatar` dans n'importe quel JSON/SQLite et tente de mapper.

Si tu as un dump `.sql` ou autre, lance avec `--raw-json ton_dump.json` et il tentera une conversion best-effort.

## Intégration HoyoDex

Une fois l'export généré, tu peux aussi l'importer dans notre outil HoyoDex `/outils/himeko` qui te donnera une visualisation + optimisation avant envoi vers Fribbels.
