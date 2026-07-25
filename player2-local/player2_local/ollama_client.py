"""Async client for a local Ollama instance (http://localhost:11434/api/chat)."""
from __future__ import annotations

import json

import httpx

from .config import Config

_MOCK_REPLY = (
    "Salut ! (Mode démo : Ollama n'est pas connecté — lance Ollama et retire "
    "P2L_MOCK_LLM pour de vraies réponses.) "
)


def _chat_url(config: Config) -> str:
    return f"{config.ollama_base_url.rstrip('/')}/api/chat"


def _last_user_text(messages: list) -> str:
    for m in reversed(messages):
        if m.get("role") == "user":
            return m.get("content", "")
    return ""


async def ollama_chat_full(
    config: Config, messages: list, model: str | None = None, temperature: float | None = None
) -> str:
    """Non-streaming chat completion. Returns the assistant text content."""
    if config.mock_llm:
        return _MOCK_REPLY + _last_user_text(messages)[-140:]

    model = model or config.ollama_model
    temperature = config.ollama_temperature if temperature is None else temperature
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature},
    }
    async with httpx.AsyncClient(timeout=config.ollama_timeout) as client:
        resp = await client.post(_chat_url(config), json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", "")


async def ollama_chat_stream(
    config: Config, messages: list, model: str | None = None, temperature: float | None = None
):
    """Streaming chat completion. Yields content chunks (str)."""
    if config.mock_llm:
        full = _MOCK_REPLY + _last_user_text(messages)[-140:]
        for ch in full:
            yield ch
        return

    model = model or config.ollama_model
    temperature = config.ollama_temperature if temperature is None else temperature
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {"temperature": temperature},
    }
    async with httpx.AsyncClient(timeout=config.ollama_timeout) as client:
        async with client.stream("POST", _chat_url(config), json=payload) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except Exception:  # noqa: BLE001
                    continue
                delta = obj.get("message", {}).get("content", "")
                if delta:
                    yield delta


async def ollama_summarize(config: Config, text: str, model: str | None = None) -> str:
    model = model or config.summary_model
    if not model:
        return ""
    prompt = (
        "Résume brièvement cette conversation Minecraft en 2-3 phrases "
        "factuelles (personnes, lieux, objectifs, décisions) :\n" + text
    )
    try:
        return await ollama_chat_full(
            config, [{"role": "user", "content": prompt}], model=model, temperature=0.2
        )
    except Exception:  # noqa: BLE001
        return ""
