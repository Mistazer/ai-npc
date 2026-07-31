#!/usr/bin/env python3
"""
Parse le config.json de himeko-nova-sr où sont les lightcones/relics par défaut
Usage:
  python parse_config_json.py --config C:/himeko-nova-sr/config.json --out optimizer.json
"""

import argparse, json, re
from pathlib import Path

def find_relic_lc_in_config(data):
    relics = []
    lcs = []
    chars = []

    # patterns possibles dans config.json de Himeko
    # souvent : "defaultAvatar": { "avatarId": 1001, "equipment": {...}, "relics": [...] }
    # ou "characters": { "1001": { "lightcone": 23000, "relics": [{"set":210, "main":...}] } }

    def recurse(obj, depth=0):
        if depth > 8:
            return
        if isinstance(obj, dict):
            # si objet a set + slot => relic
            if "set" in obj and "slot" in obj:
                relics.append(obj)
            if "setId" in obj and ("mainAffix" in obj or "main_affix" in obj):
                relics.append(obj)
            # lightcone
            if "equipmentId" in obj or ("tid" in obj and obj.get("tid",0) >= 20000 and obj.get("tid",0) < 30000):
                # Heuristique LC : tid 20000-23000+
                if obj.get("tid",0) >= 20000:
                    lcs.append(obj)
            if "lightcone" in obj or "lightCone" in obj or "equipment" in obj:
                lc = obj.get("lightcone") or obj.get("lightCone") or obj.get("equipment")
                if isinstance(lc, dict):
                    lcs.append(lc)
                elif isinstance(lc, int):
                    lcs.append({"tid": lc, "level": 80, "rank": 1})
            # avatar
            if "avatarId" in obj and "level" in obj:
                chars.append(obj)
            for v in obj.values():
                recurse(v, depth+1)
        elif isinstance(obj, list):
            for item in obj:
                recurse(item, depth+1)

    recurse(data)
    return relics, lcs, chars

def to_fribbels_relic(r):
    try:
        tid = r.get("tid") or r.get("id") or r.get("relicId") or 0
        set_id = r.get("set") or r.get("setId") or (int(tid)//100 if int(tid)>0 else 121)
        slot = r.get("slot") or 1
        main = r.get("mainAffix") or r.get("main_affix") or {}
        subs = r.get("subAffix") or r.get("sub_affix") or []
        return {
            "set": str(set_id),
            "slot": int(slot),
            "rarity": 5,
            "level": int(r.get("level", 15)),
            "mainstat": str(main.get("type") or "ATK"),
            "mainvalue": 0,
            "substats": [{"key": str(s.get("type") or "ATK"), "value": 0} for s in subs[:4]],
            "_uid": str(r.get("id") or f"{set_id}_{slot}_{len(str(r))}")
        }
    except:
        return None

def to_fribbels_lc(e):
    try:
        tid = e.get("tid") or e.get("equipmentId") or e.get("id") or e.get("lightcone") or 20000
        return {
            "id": str(tid),
            "level": 80,
            "superimposition": 1,
            "_uid": str(e.get("id") or tid)
        }
    except:
        return None

def to_char(a):
    try:
        return {
            "id": str(a.get("avatarId") or a.get("id") or 1001),
            "level": 80,
            "eidolon": 0
        }
    except:
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Chemin vers config.json de himeko")
    parser.add_argument("--out", default="optimizer_from_config.json")
    args = parser.parse_args()
    p = Path(args.config)
    data = json.loads(p.read_text(encoding='utf-8', errors='ignore'))
    relics, lcs, chars = find_relic_lc_in_config(data)
    print(f"[FOUND] {len(relics)} relics, {len(lcs)} LC, {len(chars)} chars dans config.json")

    # Si config.json contient une section par personnage, on duplique
    # Ex: "avatars": {"1001": {"relics": [...], "lc": 23000}, "1002": {...}}
    # On va créer un perso par entrée trouvée
    if len(chars) == 0 and isinstance(data, dict):
        # Cherche dictionnaire dont les clés sont des IDs numériques 1000-2000
        for k,v in data.items():
            if isinstance(v, dict) and k.isdigit() and 1000 <= int(k) <= 2000:
                if "relics" in v or "lightcone" in v:
                    chars.append({"avatarId": int(k), "level": 80})
                    if "relics" in v:
                        relics.extend(v["relics"] if isinstance(v["relics"], list) else [v["relics"]])
                    if "lightcone" in v:
                        lc = v["lightcone"]
                        if isinstance(lc, int):
                            lcs.append({"tid": lc})
                        else:
                            lcs.append(lc)

    out = {
        "source": "himeko_config_json",
        "version": 4,
        "metadata": {"uid": 10001, "trailblazer": "Stelle"},
        "relics": [r for r in (to_fribbels_relic(x) for x in relics) if r],
        "light_cones": [r for r in (to_fribbels_lc(x) for x in lcs) if r],
        "characters": [r for r in (to_char(x) for x in chars) if r],
        "materials": []
    }
    Path(args.out).write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] -> {args.out}")
    print("Importable dans https://fribbels.github.io/hsr-optimizer/")

if __name__ == "__main__":
    main()
