# Player2 Local — pont Ollama ↔ mod Player2NPC

Serveur autonome (Python/FastAPI) qui **imite l'API locale de l'application
Player2** (`http://127.0.0.1:4315`) et redirige les appels au LLM vers une
instance **Ollama** locale. Résultat : le mod **Player2NPC** (NeoForge 1.21.1)
fonctionne **100 % hors-ligne**, sans compte ni cloud Player2.

> C'est le composant manquant du projet décrit dans la conversation
> (voir `docs/architecture.md` et `docs/protocol.md`).

## Démarrage rapide

```bash
cd player2-local
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 1) Lance Ollama et tire un modèle
ollama serve
ollama pull llama3.2          # ou qwen3:14b, gemma3:12b, mistral...

# 2) Lance le pont (en mode démo si Ollama n'est pas dispo)
P2L_MOCK_LLM=true python -m player2_local
# ou en mode réel :
python -m player2_local
```

Le serveur expose Swagger UI sur `http://127.0.0.1:4315/docs` (comme la vraie
app Player2).

## Configuration

Tout se configure via variables d'environnement `P2L_*` ou un `config.toml`
(voir `config.toml.example`). Exemples :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `P2L_PORT` | `4315` | Port d'écoute (laisse 4315) |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL Ollama |
| `OLLAMA_MODEL` | `llama3.2` | Modèle utilisé |
| `P2L_MOCK_LLM` | `false` | Réponse factice (test sans GPU) |
| `P2L_DEFAULT_PERSONALITY` | `companion` | Personnalité par défaut |
| `P2L_PERSIST_MEMORY` | `true` | Mémoire disque par NPC |

## Utilisation avec Player2NPC

1. **Ne lance pas** l'application officielle Player2.
2. Lance Ollama + ce pont sur `127.0.0.1:4315`.
3. Lance Minecraft avec le mod Player2NPC : il croira parler à Player2, mais
   les réponses viennent de ton Ollama local.

Voir `../installer/README.md` pour les détails et les inconnues restantes.

## API exposée

* **Legacy** (mods type ChatClef) : `/v1/health`, `/v1/selected_characters`,
  `/v1/chat/completions`, `/v1/tts/speak`, `/v1/stt/start`, `/v1/stt/stop`.
* **NPC** (Player2NPC 1.4.x) : `/npc/games/{game_id}/npcs/spawn`,
  `/npc/games/{game_id}/npcs/{npc_id}/chat`,
  `/npc/games/{game_id}/npcs/responses` (SSE),
  `/npc/games/{game_id}/npcs/{npc_id}/kill`.

## Personnalités

`personalities.py` définit plusieurs compagnons (Compagnon, Mineur, Bâtisseur,
Chevalier, Fermier, Explorateur). Ajoutes-en ou modifie les prompts système.
Bascule la personnalité active via `POST /v1/selected_characters`.

## Limites connues

* Le schéma exact du flux SSE `/npc/.../responses` attendu par Player2NPC n'est
  pas encore capturé sur le réseau (l'app officielle est fermée). Le pont émet
  des événements `{"npc_id", "text", "done"}` ; voir `docs/protocol.md` pour
  affiner si besoin.
* TTS/STT sont des stubs (pas de synthèse vocale locale pour l'instant).
* Le mod peut exiger une étape d'authentification/compte que ce pont ne
  réplique pas encore. `docs/protocol.md` explique comment la capturer.
