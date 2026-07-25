"""Configuration for the Player2 Local bridge.

Precedence (lowest -> highest):
    built-in defaults  <  config.toml  <  environment variables
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.toml"


def _bool(name: str, default: bool) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    val = os.environ.get(name)
    if val is None:
        return default
    try:
        return int(val)
    except ValueError:
        return default


def _float(name: str, default: float) -> float:
    val = os.environ.get(name)
    if val is None:
        return default
    try:
        return float(val)
    except ValueError:
        return default


@dataclass
class Config:
    # --- Bridge listener (the fake "Player2 App" on 127.0.0.1:4315) ---
    host: str = "127.0.0.1"
    port: int = 4315

    # --- Ollama ---
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2"
    ollama_temperature: float = 0.8
    ollama_timeout: float = 120.0

    # When True, never call Ollama: return a canned reply. Great for testing
    # on machines without a GPU / Ollama installed.
    mock_llm: bool = False

    # If set, old conversation turns are summarized into long-term "facts".
    summary_model: str | None = None
    max_history: int = 64

    # Default NPC personality used when the mod does not pick one.
    default_personality: str = "companion"

    # Persist per-NPC memory to disk so companions "remember" across sessions.
    persist_memory: bool = True
    data_dir: str = str(Path(__file__).resolve().parent.parent / "data")

    # Identity reported to the mod (mimics a real Player2 App version string).
    game_key: str = "ai-npc-local"
    client_version: str = "1.4.0-local"

    # Emit assistant replies token-by-token over SSE (opt-in; off by default
    # because the exact schema the mod expects is still being verified).
    stream_tokens: bool = False

    # TTS / STT are stubbed (no-op) unless a real backend is wired in.
    enable_tts: bool = False
    tts_voice: str = "fr-FR"

    @classmethod
    def load(cls) -> "Config":
        cfg = cls()

        # 1) optional config.toml
        toml_path = Path(os.environ.get("P2L_CONFIG", str(DEFAULT_CONFIG_PATH)))
        if toml_path.exists():
            try:
                import tomllib

                with toml_path.open("rb") as fh:
                    data = tomllib.load(fh)
                for key, val in data.items():
                    if hasattr(cfg, key):
                        setattr(cfg, key, val)
            except Exception as exc:  # noqa: BLE001
                print(f"[config] could not read {toml_path}: {exc}")

        # 2) environment variables always win
        cfg.host = os.environ.get("P2L_HOST", cfg.host)
        cfg.port = _int("P2L_PORT", cfg.port)
        cfg.ollama_base_url = os.environ.get("OLLAMA_BASE_URL", cfg.ollama_base_url)
        cfg.ollama_model = os.environ.get("OLLAMA_MODEL", cfg.ollama_model)
        cfg.ollama_temperature = _float("OLLAMA_TEMPERATURE", cfg.ollama_temperature)
        cfg.ollama_timeout = _float("OLLAMA_TIMEOUT", cfg.ollama_timeout)
        cfg.mock_llm = _bool("P2L_MOCK_LLM", cfg.mock_llm)
        cfg.summary_model = os.environ.get("OLLAMA_SUMMARY_MODEL", cfg.summary_model)
        cfg.max_history = _int("P2L_MAX_HISTORY", cfg.max_history)
        cfg.default_personality = os.environ.get(
            "P2L_DEFAULT_PERSONALITY", cfg.default_personality
        )
        cfg.persist_memory = _bool("P2L_PERSIST_MEMORY", cfg.persist_memory)
        cfg.data_dir = os.environ.get("P2L_DATA_DIR", cfg.data_dir)
        cfg.game_key = os.environ.get("P2L_GAME_KEY", cfg.game_key)
        cfg.client_version = os.environ.get("P2L_CLIENT_VERSION", cfg.client_version)
        cfg.stream_tokens = _bool("P2L_STREAM_TOKENS", cfg.stream_tokens)
        cfg.enable_tts = _bool("P2L_ENABLE_TTS", cfg.enable_tts)
        cfg.tts_voice = os.environ.get("P2L_TTS_VOICE", cfg.tts_voice)

        return cfg
