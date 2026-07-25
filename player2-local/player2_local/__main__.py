"""Entry point: ``python -m player2_local``."""
from __future__ import annotations

import uvicorn

from .config import Config


def main() -> None:
    cfg = Config.load()
    print(
        f"Player2 Local écoute sur http://{cfg.host}:{cfg.port} "
        f"(Ollama: {cfg.ollama_base_url}, modèle: {cfg.ollama_model}, "
        f"mock_llm={cfg.mock_llm})"
    )
    uvicorn.run(
        "player2_local.server:app",
        host=cfg.host,
        port=cfg.port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
