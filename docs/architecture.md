# Architecture du projet `ai-npc`

Ce dépôt contient un **pont local « Player2 »** qui permet d'utiliser le mod
Minecraft **Player2NPC** (NeoForge 1.21.1) avec un LLM **100 % local** (Ollama)
au lieu du service cloud Player2.

## D'où vient l'idée

La conversation à l'origine du projet voulait fusionner deux mods :

* **Player2NPC** : crée un compagnon IA qui se comporte comme un joueur
  (déplacement, minage, combat…) via le framework *PlayerEngine*.
* **Verity JE** : assistant IA local (LLM via Ollama/Groq/OpenRouter).

Le but : donner au compagnon de Player2NPC un « cerveau » LLM local.

## Ce que la recherche a révélé (et qui corrige la conversation)

1. `HalfstarDev/player2` — cité dans la discussion — est une **extension
   Defold (Lua)**, l'API *in-game*. Ce **n'est pas** l'application de bureau
   Player2. L'app de bureau (`player2.game`) est **fermée**.
2. L'app de bureau expose une **API REST locale sur `127.0.0.1:4315`**
   (Swagger dispo sur `http://127.0.0.1:4315/docs`). C'est elle que le mod
   contacte. On peut donc la **réimplémenter** sans toucher au mod.
3. `sailex428/SecondBrain` fait déjà ce travail… mais pour **Fabric**, pas
   NeoForge/Player2NPC. Le composant manquant pour ton mod est donc ce pont.

## Flux cible

```
Joueur (Minecraft)
      │  mod Player2NPC (NeoForge 1.21.1)
      ▼
Player2 Local  ─── 127.0.0.1:4315  (ce dépôt)
      │  réplique l'API Player2
      ▼
Ollama  ─── http://localhost:11434/api/chat
      │
  Llama 3 / Qwen 3 / Gemma 3 / Mistral ...
```

Avantage : **le mod .jar n'est pas modifié**. On remplace simplement
l'application Player2 par ce serveur.

## Composants du dépôt

```
ai-npc/
├── player2-local/            ← le pont (serveur FastAPI)
│   └── player2_local/
│       ├── server.py         ← API Player2 émulée + flux SSE
│       ├── ollama_client.py  ← client Ollama (async)
│       ├── personalities.py  ← personnages (Compagnon, Mineur…)
│       ├── memory.py         ← mémoire par NPC (disque)
│       └── config.py         ← configuration (P2L_* / config.toml)
├── docs/
│   ├── architecture.md       ← ce fichier
│   └── protocol.md           ← endpoints reverse-engineered + hypothèses
├── examples/                 ← tests (curl, mock Ollama)
├── installer/                ← brancher sur Player2NPC
└── README.md
```

## Vue interne du pont

```
            ┌──────────────────────────────┐
Requête mod │  FastAPI (server.py)         │
──────────▶ │  /v1/*  (legacy)             │
            │  /npc/games/{id}/npcs/*      │
            └───────────┬──────────────────┘
                        │ messages + system prompt
                        ▼
            ┌──────────────────────────────┐
            │  MemoryStore (memory.py)     │  (historique par NPC, persistant)
            └───────────┬──────────────────┘
                        │
                        ▼
            ┌──────────────────────────────┐
            │  Ollama client (async)        │──▶ http://localhost:11434/api/chat
            └───────────┬──────────────────┘
                        │ réponse
                        ▼
            ┌──────────────────────────────┐
            │  GameChannel (SSE)            │──▶ GET /npc/.../responses
            └──────────────────────────────┘
```

## Prochaines étapes possibles

* Capturer le trafic réel Player2NPC ↔ app pour valider le schéma SSE.
* Ajouter un vrai moteur TTS local (ex. Coqui / piper) et STT.
* Ajouter le *function calling* : le LLM renvoie des actions exécutées par le
  mod (mine, craft, suit-le-joueur…). Cela exige une extension côté mod.
