"""Personality Studio — local web UI to create & manage SecondBrain NPCs.

This is the "espace ou on cree nos propres personnalites" : a small Flask
app backed by a JSON store. Each personality carries its own:

* name            -> SecondBrain "Name of the NPC"
* prompt          -> SecondBrain "Characteristics" (llmCharacter)
* llm (ollama)  -> SecondBrain LLM config (Type / Model / URL)
* tts             -> SecondBrain "Text to Speech"
* skin (png + steve/alex + mojang_name)
                       SecondBrain has NO native per-NPC skin field today;
                       see FORK.md for the small fork that adds one, or use
                       `mojang_name` (name the NPC after a Minecraft account
                       whose skin you want).

Run:  python app.py   (http://127.0.0.1:5000)
"""
from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

BASE = Path(__file__).resolve().parent
STORE = BASE / "personalities.json"
SKINS = BASE / "skins"
SKINS.mkdir(exist_ok=True)

app = Flask(__name__)


# --------------------------------------------------------------------------- #
# Store helpers
# --------------------------------------------------------------------------- #
def _load() -> dict:
    if not STORE.exists():
        return {"personalities": []}
    try:
        return json.loads(STORE.read_text(encoding="utf-8"))
    except Exception:
        return {"personalities": []}


def _save(data: dict) -> None:
    STORE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _find(data: dict, pid: str):
    for p in data["personalities"]:
        if p["id"] == pid:
            return p
    return None


def _slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9_-]+", "-", text.lower().strip()).strip("-")
    return s or uuid.uuid4().hex[:8]


# --------------------------------------------------------------------------- #
# API
# --------------------------------------------------------------------------- #
@app.get("/")
def index():
    return send_from_directory(BASE / "templates", "index.html")


@app.get("/api/personalities")
def list_personalities():
    return jsonify(_load()["personalities"])


@app.post("/api/personalities")
def create_personality():
    body = request.get_json(force=True, silent=True) or {}
    pid = _slug(body.get("name") or body.get("id") or "")
    data = _load()
    if _find(data, pid):
        return jsonify({"error": f"id '{pid}' deja pris"}), 409
    p = {
        "id": pid,
        "name": body.get("name", pid),
        "prompt": body.get("prompt", ""),
        "skin": body.get("skin", {"png": "", "model": "steve", "mojang_name": ""}),
        "llm": body.get("llm", {"type": "ollama", "model": "llama3.2", "url": "http://localhost:11434"}),
        "tts": bool(body.get("tts", False)),
    }
    data["personalities"].append(p)
    _save(data)
    return jsonify(p), 201


@app.put("/api/personalities/<pid>")
def update_personality(pid: str):
    data = _load()
    p = _find(data, pid)
    if p is None:
        return jsonify({"error": "introuvable"}), 404
    body = request.get_json(force=True, silent=True) or {}
    for key in ("name", "prompt", "skin", "llm", "tts"):
        if key in body:
            p[key] = body[key]
    _save(data)
    return jsonify(p)


@app.delete("/api/personalities/<pid>")
def delete_personality(pid: str):
    data = _load()
    before = len(data["personalities"])
    data["personalities"] = [p for p in data["personalities"] if p["id"] != pid]
    if len(data["personalities"]) == before:
        return jsonify({"error": "introuvable"}), 404
    _save(data)
    return jsonify({"status": "deleted"})


@app.post("/api/personalities/<pid>/skin")
def upload_skin(pid: str):
    if "file" not in request.files:
        return jsonify({"error": "aucun fichier"}), 400
    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "nom vide"}), 400
    ext = Path(secure_filename(f.filename)).suffix or ".png"
    dest = SKINS / f"{pid}{ext}"
    f.save(str(dest))
    data = _load()
    p = _find(data, pid)
    if p is None:
        return jsonify({"error": "personnalite introuvable"}), 404
    p.setdefault("skin", {})["png"] = f"skins/{dest.name}"
    _save(data)
    return jsonify({"skin": p["skin"]})


@app.get("/api/personalities/<pid>/apply")
def apply_card(pid: str):
    """What to paste into the SecondBrain GUI for this personality."""
    data = _load()
    p = _find(data, pid)
    if p is None:
        return jsonify({"error": "introuvable"}), 404
    skin = p.get("skin", {})
    mojang = skin.get("mojang_name", "")
    name = mojang or p["name"]
    return jsonify(
        {
            "npc_name": name,
            "characteristics": p["prompt"],
            "llm_type": p.get("llm", {}).get("type", "ollama"),
            "model": p.get("llm", {}).get("model", "llama3.2"),
            "url": p.get("llm", {}).get("url", "http://localhost:11434"),
            "tts": p.get("tts", False),
            "skin_note": (
                "Skin via nom Mojang" if mojang
                else "Skin natif (.png+steve/alex) necessite la fourche — voir FORK.md"
            ),
        }
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
