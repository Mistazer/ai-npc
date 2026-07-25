# ai-npc

Projet : faire fonctionner le mod Minecraft **Player2NPC** (NeoForge 1.21.1)
avec un LLM **100 % local** (Ollama), sans l'application cloud Player2.

## En bref

Le mod Player2NPC contacte une « application Player2 » via une **API REST
locale sur `127.0.0.1:4315`**. Cette application est fermée et payante
(crédits). On la **réimplémente** donc sous forme d'un petit serveur Python
qui parle exactement la même API, mais qui envoie les requêtes au LLM vers
**Ollama** sur ta machine.

➡️ Le mod `.jar` n'est **pas modifié**. On remplace juste l'application par
`player2-local`.

## Structure

```
ai-npc/
├── player2-local/     ← le pont (serveur FastAPI, voir son README)
├── docs/              ← architecture.md, protocol.md (reverse-engineering)
├── examples/          ← tests curl + faux Ollama
├── installer/         ← comment brancher sur Player2NPC
└── README.md
```

## Démarrage (30 s, mode démo)

```bash
cd player2-local
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
P2L_MOCK_LLM=true python -m player2_local      # réponses factices, pas besoin d'Ollama
curl -s http://127.0.0.1:4315/v1/health
```

## Démarrage (réel, avec Ollama)

```bash
ollama serve && ollama pull llama3.2
cd player2-local && source .venv/bin/activate
python -m player2_local
```

Lance ensuite Minecraft avec Player2NPC (sans l'app Player2 officielle).
Voir `installer/README.md`.

## Comment ça marche

```
Minecraft (Player2NPC) ──▶ 127.0.0.1:4315 (player2-local) ──▶ Ollama ──▶ modèle local
```

Détails et diagrammes : `docs/architecture.md`. Endpoints et hypothèses :
`docs/protocol.md`.

## État

* ✅ Pont fonctionnel (API legacy + API NPC, flux SSE, mémoire par NPC,
  personnalités, mode démo).
* ⚠️ Le schéma précis du flux SSE attendu par Player2NPC reste à valider en
  capturant le trafic réel (l'app officielle est fermée). Voir `docs/protocol.md`.
* ⚠️ TTS/STT sont des stubs.

## Crédits / sources

* client de référence Player2 : `elefant-ai/chatclef`
* blog Player2 (API NPC) : `blog.player2.game`
* mod comparable (Fabric) : `sailex428/SecondBrain`
* mod cible : Player2NPC / PlayerEngine (NeoForge 1.21.1)
