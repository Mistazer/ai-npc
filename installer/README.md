# Installer — brancher Player2NPC sur Ollama

Objectif : faire croire à **Player2NPC** (NeoForge 1.21.1) qu'il parle à
l'application Player2 officielle, alors qu'il dialogue en fait avec le pont
local `player2-local` → Ollama.

## Prérequis

* Minecraft 1.21.1 + NeoForge.
* Mod **Player2NPC** (et **PlayerEngine**) installés dans `mods/`.
* Python 3.11+ (pour le pont).
* **Ollama** installé et un modèle tiré (`ollama pull llama3.2`).

## Étapes

### 1. Ne lance PAS l'app Player2 officielle
Le pont prend sa place sur le port `4315`. Deux serveurs ne peuvent pas
occuper le même port.

### 2. Lance Ollama
```bash
ollama serve
ollama pull llama3.2     # ou qwen3:14b, gemma3:12b...
```

### 3. Lance le pont
```bash
cd player2-local
source .venv/bin/activate
python -m player2_local
# Swagger de test : http://127.0.0.1:4315/docs
```

### 4. Lance Minecraft + Player2NPC
Le mod contacte `127.0.0.1:4315`, obtient `client_version`, et envoie les
messages de chat. Les réponses viennent d'Ollama.

## Vérification rapide (sans Minecraft)

Avec le pont lancé :
```bash
bash examples/curl_examples.sh
```
Tu dois voir un `npc_id`, une réponse SSE et un `kill` réussi.

## Dépannage

* **Le mod ne démarre pas / « Pas connecté »** : il attend peut-être un
  endpoint de session/compte que le pont ne réplique pas encore. Voir
  `docs/protocol.md` (« Authentification ») pour capturer et ajouter l'endpoint.
* **Réponses vides** : vérifie qu'Ollama tourne et que `OLLAMA_MODEL` est tiré
  (`ollama list`). En test, `P2L_MOCK_LLM=true` confirme le bon routage.
* **Port 4315 occupé** : une instance de l'app Player2 officielle tourne
  probablement. Ferme-la.

## Améliorations futures

* Vrai TTS/STT local pour la voix.
* *Function calling* : le LLM renvoie des actions (`mine`, `craft`,
  `suit-le-joueur`) exécutées par le mod — nécessite une extension côté mod.
