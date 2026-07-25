"""Per-NPC conversation memory.

The bridge keeps an OpenAI-style message list per (game_id, npc_id) and can
persist it to disk so companions retain context across sessions. The system
prompt is *not* stored here — it is injected at generation time from the
personality, to avoid duplicating it on every turn.
"""
from __future__ import annotations

import json
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import List


@dataclass
class NPCMemory:
    npc_id: str
    game_id: str
    personality: str = "companion"
    messages: List[dict] = field(default_factory=list)
    facts: List[str] = field(default_factory=list)

    def add(self, role: str, content: str) -> None:
        if content:
            self.messages.append({"role": role, "content": content})

    def trim(self, max_history: int) -> None:
        if len(self.messages) > max_history:
            overflow = len(self.messages) - max_history
            self.messages = self.messages[overflow:]

    def path(self, data_dir: str) -> Path:
        d = Path(data_dir) / "memory"
        d.mkdir(parents=True, exist_ok=True)
        return d / f"{self.game_id}_{self.npc_id}.json"

    def save(self, data_dir: str) -> None:
        try:
            with self.path(data_dir).open("w", encoding="utf-8") as fh:
                json.dump(
                    {
                        "npc_id": self.npc_id,
                        "game_id": self.game_id,
                        "personality": self.personality,
                        "messages": self.messages,
                        "facts": self.facts,
                    },
                    fh,
                    ensure_ascii=False,
                    indent=2,
                )
        except Exception:  # noqa: BLE001
            pass

    @classmethod
    def load(
        cls, npc_id: str, game_id: str, data_dir: str, personality: str = "companion"
    ) -> "NPCMemory":
        p = Path(data_dir) / "memory" / f"{game_id}_{npc_id}.json"
        if p.exists():
            try:
                with p.open(encoding="utf-8") as fh:
                    data = json.load(fh)
                return cls(
                    npc_id=data.get("npc_id", npc_id),
                    game_id=data.get("game_id", game_id),
                    personality=data.get("personality", personality),
                    messages=data.get("messages", []),
                    facts=data.get("facts", []),
                )
            except Exception:  # noqa: BLE001
                pass
        return cls(npc_id=npc_id, game_id=game_id, personality=personality)


class MemoryStore:
    def __init__(self, config):
        self.config = config
        self._mem: dict[tuple, NPCMemory] = {}
        self._lock = threading.Lock()

    def get_or_create(self, game_id: str, npc_id: str, personality: str) -> NPCMemory:
        key = (game_id, npc_id)
        with self._lock:
            mem = self._mem.get(key)
            if mem is None:
                if self.config.persist_memory:
                    mem = NPCMemory.load(npc_id, game_id, self.config.data_dir, personality)
                else:
                    mem = NPCMemory(npc_id=npc_id, game_id=game_id, personality=personality)
                self._mem[key] = mem
            elif personality and personality != mem.personality:
                mem.personality = personality
            return mem

    def get(self, game_id: str, npc_id: str) -> NPCMemory | None:
        return self._mem.get((game_id, npc_id))

    def remove(self, game_id: str, npc_id: str) -> NPCMemory | None:
        with self._lock:
            mem = self._mem.pop((game_id, npc_id), None)
        if mem is not None and self.config.persist_memory:
            mem.save(self.config.data_dir)
        return mem
