"""FastAPI server emulating the Player2 desktop-app local API (127.0.0.1:4315).

It implements two API surfaces observed in the wild:

* Legacy "chat completions" API used by mods such as ChatClef/AltoClef:
    GET  /v1/health
    GET  /v1/selected_characters
    POST /v1/selected_characters      (switch active personality)
    POST /v1/chat/completions         (OpenAI-shaped)
    POST /v1/tts/speak                (stub)
    POST /v1/stt/start                (stub)
    POST /v1/stt/stop                 (stub)

* Newer "NPC" API used by Player2NPC 1.4.x:
    POST /npc/games/{game_id}/npcs/spawn
    POST /npc/games/{game_id}/npcs/{npc_id}/chat
    GET  /npc/games/{game_id}/npcs/responses   (Server-Sent Events)
    POST /npc/games/{game_id}/npcs/{npc_id}/kill

All LLM work is forwarded to a local Ollama instance (or a canned reply in
mock mode). See docs/protocol.md for the reverse-engineering notes.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from collections import deque
from typing import Any, AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

from .config import Config
from .memory import MemoryStore
from .ollama_client import (
    ollama_chat_full,
    ollama_chat_stream,
    ollama_summarize,
)
from .personalities import PERSONALITIES, as_player2_characters, get_personality

config = Config.load()
store = MemoryStore(config)
channels: dict[str, "GameChannel"] = {}
selected_personality_key = (
    config.default_personality if config.default_personality in PERSONALITIES else "companion"
)
DEFAULT_PERSONALITY = get_personality(selected_personality_key)


class GameChannel:
    """Per-game event bus for the SSE responses stream.

    Recent events are kept in a bounded ``buffer`` and replayed to late
    subscribers. Live events are delivered to each subscriber's own queue, so
    a new connection never re-receives an event it already got via the replay.
    """

    def __init__(self, buffer_size: int = 50) -> None:
        self.buffer: deque = deque(maxlen=buffer_size)
        self._subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    async def publish(self, event: dict) -> None:
        self.buffer.append(event)
        for q in list(self._subscribers):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
async def _safe_json(request: Request) -> dict:
    try:
        data = await request.json()
        return data if isinstance(data, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def _extract_user_text(body: dict) -> str:
    if not isinstance(body, dict):
        return ""
    text = (body.get("message") or body.get("text") or body.get("content") or "").strip()
    if not text and isinstance(body.get("messages"), list):
        for m in reversed(body["messages"]):  # type: ignore[union-attr]
            if isinstance(m, dict) and m.get("role") == "user":
                text = (m.get("content") or "").strip()
                break
    return text


def _sse(event: dict) -> str:
    return "data: " + json.dumps(event, ensure_ascii=False) + "\n\n"


async def _generate_for_npc(game_id: str, npc_id: str) -> None:
    mem = store.get(game_id, npc_id)
    if mem is None:
        return
    personality = get_personality(mem.personality)
    messages = [{"role": "system", "content": personality.system_prompt}] + mem.messages
    channel = channels.setdefault(game_id, GameChannel())
    try:
        if config.stream_tokens:
            collected: list[str] = []
            async for tok in ollama_chat_stream(config, messages):
                collected.append(tok)
                await channel.publish({"npc_id": npc_id, "text": tok, "done": False})
            full = "".join(collected)
        else:
            full = await ollama_chat_full(config, messages)

        mem.add("assistant", full)

        if config.summary_model and len(mem.messages) > config.max_history:
            half = mem.messages[: len(mem.messages) // 2]
            summary = await ollama_summarize(config, json.dumps(half, ensure_ascii=False))
            if summary:
                mem.facts.append(summary)
            mem.trim(config.max_history)

        if config.persist_memory:
            await asyncio.to_thread(mem.save, config.data_dir)

        await channel.publish({"npc_id": npc_id, "text": full, "done": True})
    except Exception as exc:  # noqa: BLE001
        await channel.publish(
            {"npc_id": npc_id, "text": f"[erreur LLM] {exc}", "done": True}
        )


async def _event_generator(game_id: str) -> AsyncGenerator[str, None]:
    channel = channels.setdefault(game_id, GameChannel())
    q = channel.subscribe()
    try:
        for ev in list(channel.buffer):
            yield _sse(ev)
        while True:
            try:
                ev = await asyncio.wait_for(q.get(), timeout=15.0)
                yield _sse(ev)
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"
    finally:
        channel.unsubscribe(q)


# --------------------------------------------------------------------------- #
# App
# --------------------------------------------------------------------------- #
app = FastAPI(
    title="Player2 Local",
    description="Drop-in local replacement for the Player2 App, backed by Ollama.",
    version=config.client_version,
)


@app.get("/")
async def root():
    return {
        "name": "Player2 Local (ai-npc bridge)",
        "version": config.client_version,
        "ollama": config.ollama_base_url,
        "model": config.ollama_model,
        "mock_llm": config.mock_llm,
        "docs": "/docs",
    }


# --- Legacy API ------------------------------------------------------------- #
@app.get("/v1/health")
async def health():
    return {
        "client_version": config.client_version,
        "status": "ok",
        "logged_in": True,
        "mock_llm": config.mock_llm,
    }


@app.get("/v1/selected_characters")
async def get_selected():
    return {"characters": as_player2_characters(), "selected": selected_personality_key}


@app.post("/v1/selected_characters")
async def set_selected(request: Request):
    global selected_personality_key
    body = await _safe_json(request)
    key = body.get("character") or body.get("personality") or body.get("key")
    if key and key in PERSONALITIES:
        selected_personality_key = key
    return {"characters": as_player2_characters(), "selected": selected_personality_key}


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await _safe_json(request)
    messages = body.get("messages", [])
    if not isinstance(messages, list):
        messages = []
    text = await ollama_chat_full(config, messages)
    return {
        "id": "chatcmpl-local",
        "object": "chat.completion",
        "model": config.ollama_model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": text},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


@app.post("/v1/tts/speak")
async def tts_speak(request: Request):
    # Stub: wire a local TTS backend here when P2L_ENABLE_TTS=true.
    return JSONResponse({})


@app.post("/v1/stt/start")
async def stt_start():
    return JSONResponse({})


@app.post("/v1/stt/stop")
async def stt_stop():
    return JSONResponse({"text": ""})


# --- NPC API (Player2NPC 1.4.x) --------------------------------------------- #
@app.post("/npc/games/{game_id}/npcs/spawn")
async def npc_spawn(game_id: str, request: Request):
    body = await _safe_json(request)
    character_key = (
        body.get("character") or body.get("personality") or selected_personality_key
    )
    personality = get_personality(character_key)
    npc_id = uuid.uuid4().hex[:12]
    store.get_or_create(game_id, npc_id, personality.key)
    channels.setdefault(game_id, GameChannel())

    await channels[game_id].publish(
        {"npc_id": npc_id, "type": "spawn", "text": personality.greeting, "done": True}
    )
    return JSONResponse(
        {
            "npc_id": npc_id,
            "character": personality.name,
            "greeting": personality.greeting,
            "status": "spawned",
        }
    )


@app.post("/npc/games/{game_id}/npcs/{npc_id}/chat")
async def npc_chat(game_id: str, npc_id: str, request: Request):
    body = await _safe_json(request)
    user_text = _extract_user_text(body)
    if not user_text:
        return JSONResponse({"status": "ignored", "reason": "empty"})
    mem = store.get_or_create(game_id, npc_id, selected_personality_key)
    mem.add("user", user_text)
    mem.trim(config.max_history)
    asyncio.create_task(_generate_for_npc(game_id, npc_id))
    return JSONResponse({"status": "queued"})


@app.get("/npc/games/{game_id}/npcs/responses")
async def npc_responses(game_id: str):
    return StreamingResponse(
        _event_generator(game_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/npc/games/{game_id}/npcs/{npc_id}/kill")
async def npc_kill(game_id: str, npc_id: str):
    store.remove(game_id, npc_id)
    channel = channels.get(game_id)
    if channel is not None:
        await channel.publish(
            {"npc_id": npc_id, "type": "despawn", "text": "", "done": True}
        )
    return JSONResponse({"status": "killed", "npc_id": npc_id})
