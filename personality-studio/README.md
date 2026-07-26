# Personality Studio — l'espace de création de personnalités

Petite app web **locale** pour créer et gérer les personnalités de tes NPCs
SecondBrain (Fabric), avec des personnalités **préeffaites FR** et la
possibilité d'en **créer nous-mêmes** (prompt + skin + modèle Ollama).

C'est l'« espace où on peut les créer nous-même » demandé : au lieu
d'une liste figée, tu édites chaque personnalité (nom, prompt, skin
`.png` + modèle **steve**/**alex**, modèle Ollama) via l'UI ou le
fichier `personalities.json`.

## Lancer

```bash
cd personality-studio
pip install -r requirements.txt      # ou: pip install flask
python app.py                          # http://127.0.0.1:5000
```

Ouvre `http://127.0.0.1:5000`. Tu y vois les personnalités
préeffaites (Compagnon, Mineur, Bâtisseur, Chevalier, Fermier,
Explorateur) et tu peux en créer/éditer/supprimer de nouvelles.

## Champs → GUI SecondBrain (`/secondbrain` → Edit)

| Champ Studio | GUI SecondBrain |
|---|---|
| `name` | « Name of the NPC » |
| `prompt` | « Characteristics » (le `llmCharacter`) |
| `llm.type = ollama` | « Type » = `OLLAMA` |
| `llm.model` | « Model » (ex. `gemma4:12b`) |
| `llm.url` | « URL » (ex. `http://localhost:11434`) |
| `tts` | « Text to Speech » |

Bouton **Appliquer** → affiche le texte à coller dans le GUI.

## Skins : la réalité (à lire)

`NPCConfig.java` (SecondBrain) **n'a pas de champ skin**. Aujoud'hui le
skin d'un NPC dépend de son **nom** (utilisé comme `GameProfile` Mojang,
donc skin du compte Minecraft portant ce nom). Deux options :

1. **Sans fourche (marche maintenant)** : renseigne `mojang_name`
   (compte Minecraft dont tu veux le skin). Le Studio mettra ce nom
   dans « Name of the NPC ».
2. **Skin `.png` + `steve`/`alex` propre à chaque perso** : il faut
   une **petite fourche** de SecondBrain pour ajouter un champ `skin`.
   Voir **`FORK.md`** (spec prête à coder : champ `skinPng` + `skinModel`
   dans `NPCConfig`, appliqué au `ServerPlayerEntity` au spawn).

## Setup rapide : SecondBrain + Ollama

1. **Modloader** : installe **Fabric** + **Fabric API** pour ta version de
   Minecraft. SecondBrain supporte plusieurs versions via *stonecutter*
   (1.20.1, 1.21.1, 1.21.11…). Prends la build correspondante.
2. **Mod** : télécharge **SecondBrain** (Modrinth/curseforge) → dossier `mods/`.
3. **Ollama** :
   ```bash
   ollama serve
   ollama pull gemma4:12b          # ou qwen3:14b, gemma3:12b…
   ```
4. **En jeu** : `/secondbrain` → **spawn** un NPC → **Edit** → colle
   le `prompt` (Characteristics), mets **Type = OLLAMA**, le **Model** et
   l'**URL** Ollama, coche **Text to Speech** si voulu.
5. **Parle-lui** dans le chat. Répète pour autant de personnalités
   différentes que tu veux (plusieurs NPCs cohabitent).

## Personnalités préeffaites

Stockées dans `personalities.json` (6 FR, chacune avec un modèle
steve/alex par défaut). Tu peux les éditer directement dans ce fichier
ou via l'UI — le JSON est la source de vérité.
