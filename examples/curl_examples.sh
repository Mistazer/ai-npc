#!/usr/bin/env bash
# Exemples de requêtes contre le pont Player2 Local.
# Lance d'abord le pont :  P2L_MOCK_LLM=true python -m player2_local
set -euo pipefail
B="http://127.0.0.1:4315"

echo "== Health =="
curl -s $B/v1/health | python3 -m json.tool

echo "== Personnages disponibles =="
curl -s $B/v1/selected_characters | python3 -m json.tool

echo "== Changer la personnalité active (mineur) =="
curl -s -X POST $B/v1/selected_characters -H 'Content-Type: application/json' \
     -d '{"character":"miner"}' | python3 -m json.tool

echo "== Chat legacy (OpenAI-like) =="
curl -s -X POST $B/v1/chat/completions -H 'Content-Type: application/json' \
     -d '{"messages":[{"role":"user","content":"Où trouver du fer ?"}]}' \
     | python3 -m json.tool

echo "== Spawn d'un NPC =="
SPAWN=$(curl -s -X POST $B/npc/games/demo/npcs/spawn \
        -H 'Content-Type: application/json' -d '{"character":"builder"}')
echo "$SPAWN" | python3 -m json.tool
NPC_ID=$(echo "$SPAWN" | python3 -c 'import sys,json;print(json.load(sys.stdin)["npc_id"])')

echo "== Écoute des réponses SSE (10s) en arrière-plan =="
( curl -sN $B/npc/games/demo/npcs/responses & echo $! > /tmp/sse.pid ) > /tmp/sse.txt &
sleep 1

echo "== Envoie un message au NPC =="
curl -s -X POST $B/npc/games/demo/npcs/$NPC_ID/chat \
     -H 'Content-Type: application/json' \
     -d '{"message":"Construis-moi une petite maison."}'
echo

sleep 4
echo "== Réponses reçues =="
cat /tmp/sse.txt
kill "$(cat /tmp/sse.pid)" 2>/dev/null || true

echo "== Kill du NPC =="
curl -s -X POST $B/npc/games/demo/npcs/$NPC_ID/kill | python3 -m json.tool
