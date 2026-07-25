# Protocole Player2 — notes de reverse-engineering

Ce document décrit les endpoints que le pont `player2-local` émule, et d'où
viennent ces informations. Il sert à valider/ajuster l'implémentation une fois
qu'on aura capturé le trafic réel du mod.

## Sources

* Client de référence officiel : `elefant-ai/chatclef`, package
  `src/main/java/adris/altoclef/player2api/Player2APIService.java`.
* Blog officiel Player2 : « Say Hello to the Player2 NPC API » et
  « How to build AI NPCs with Player2 API ».
* App de bureau : `player2.game`, API locale sur **`127.0.0.1:4315`**
  (Swagger sur `http://127.0.0.1:4315/docs`).

## API « legacy » (chat completions)

Utilisée par les mods type ChatClef/AltoClef.

### `GET /v1/health`
Réponse attendue (cœur) :
```json
{ "client_version": "1.4.0" }
```
Le pont renvoie en plus `status`, `logged_in`, `mock_llm`. Le mod s'en sert
comme heartbeat (envoyé ~toutes les 60 s).

### `GET /v1/selected_characters`
```json
{
  "characters": [
    { "name": "Compagnon", "short_name": "Compagnon",
      "greeting": "…", "description": "…", "voice_ids": [] }
  ]
}
```
Le pont sert la liste des personnalités (`personalities.py`).

### `POST /v1/selected_characters`
Le pont accepte `{ "character": "miner" }` pour changer la personnalité
active. (Endpoint absent du client de référence ; ajout pratique.)

### `POST /v1/chat/completions`
Corps (OpenAI-like) :
```json
{ "messages": [ { "role": "system", "content": "…" },
                 { "role": "user", "content": "…" } ] }
```
Réponse attendue :
```json
{ "choices": [ { "message": { "role": "assistant", "content": "…" } } ] }
```
C'est ce que le pont renvoie (format `chat.completion` complet).

### `POST /v1/tts/speak`
Corps : `{ "play_in_app": true, "speed": 1, "text": "…", "voice_ids": [] }`.
Réponse ignorée par le client → le pont renvoie `{}` (stub).

### `POST /v1/stt/start` / `POST /v1/stt/stop`
`start` : `{ "timeout": 30 }`. `stop` renvoie `{ "text": "…" }`.
Le pont renvoie `{}` / `{ "text": "" }` (stub).

### En-tête
Le client envoie `player2-game-key: <jeu>` (ex. `chatclef`). Le pont l'accepte
sans l'exiger.

## API « NPC » (Player2NPC 1.4.x)

Documentée par le blog Player2 (tag `NPC` de l'OpenAPI).

### `POST /npc/games/{game_id}/npcs/spawn`
Crée un NPC côté client. Le pont génère un `npc_id` et renvoie :
```json
{ "npc_id": "abcd1234efgh", "character": "Compagnon",
  "greeting": "…", "status": "spawned" }
```
Hypothèse : corps optionnel `{ "character": "miner", "name": "…" }`.

### `POST /npc/games/{game_id}/npcs/{npc_id}/chat`
Envoie une ligne de dialogue. Le pont accepte `message` / `text` / `content`
ou un tableau `messages`. Réponse : `{ "status": "queued" }`.

### `GET /npc/games/{game_id}/npcs/responses`
**Server-Sent Events** (`text/event-stream`). Le pont émet, par événement :
```json
{ "npc_id": "abcd1234efgh", "text": "…", "done": true }
```
ou, en mode streaming de tokens (`P2L_STREAM_TOKENS=true`) :
```json
{ "npc_id": "…", "text": "fragment", "done": false }
```
⚠️ **Inconnu à valider** : le schéma exact attendu par Player2NPC (noms de
champs, présence d'un `type`, découpage des tokens). À confirmer en capturant
le trafic réel.

### `POST /npc/games/{game_id}/npcs/{npc_id}/kill`
Désactive le NPC. Le pont renvoie `{ "status": "killed", "npc_id": "…" }`.

## Comment capturer le trafic réel (pour affiner)

1. Lance l'app Player2 officielle + Wireshark/Fiddler sur `127.0.0.1:4315`.
2. Utilise Player2NPC (spawn, chat, attendre la réponse).
3. Note les chemins, corps de requête et forme des événements SSE.
4. Ajoute/ajuste les routes dans `player2_local/server.py` en conséquence.

## Authentification / compte

L'app Player2 utilise un système de **crédits/compte** (login dans l'app).
Le mod pourrait appeler un endpoint de statut de session que ce pont ne
réplique pas encore. Si le mod refuse de démarrer sans « login », il faudra
identifier cet endpoint (cf. capture ci-dessus) et le stuber (`logged_in: true`).
