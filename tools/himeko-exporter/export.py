#!/usr/bin/env python3
"""
Himeko Nova SR – Direct Exporter V2 (sans UID)
Scanne tout le dossier himeko-nova pour trouver des reliques, même sans UID.

Usage:
  python export.py --server-dir ../himeko-nova-sr --out optimizer.json
  python export.py --server-dir ../himeko-nova-sr --scan-all
  python export.py --file C:/himeko/gameserver/data/player.json
"""

import argparse
import json
import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime
import re

def load_json(p: Path):
    try:
        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
            txt = f.read()
            # supprime BOM
            if txt.startswith('\ufeff'):
                txt = txt[1:]
            return json.loads(txt)
    except:
        return None

def is_relic_like(d):
    if not isinstance(d, dict):
        return False
    # Heuristique: a tid + level + mainAffix ou subAffix
    keys = set(d.keys())
    return ("tid" in keys or "relicId" in keys) and ("level" in keys or "mainAffix" in keys or "main_affix" in keys)

def is_avatar_like(d):
    if not isinstance(d, dict):
        return False
    keys = set(d.keys())
    return ("avatarId" in keys or "baseAvatarId" in keys) and ("level" in keys or "promotion" in keys)

def is_lc_like(d):
    if not isinstance(d, dict):
        return False
    keys = set(d.keys())
    return ("equipmentId" in keys or ("tid" in keys and "rank" in keys)) and "level" in keys

def recursive_find(data, collector, depth=0):
    if depth > 12:
        return
    if isinstance(data, dict):
        # Direct lists
        for k in ["relic_list", "relics", "relic", "RelicList"]:
            if k in data and isinstance(data[k], list):
                for item in data[k]:
                    if isinstance(item, dict):
                        collector['relics'].append(item)
        for k in ["equipment_list", "equipments", "light_cones", "EquipmentList", "equipment"]:
            if k in data and isinstance(data[k], list):
                for item in data[k]:
                    if isinstance(item, dict):
                        collector['lcs'].append(item)
        for k in ["avatar_list", "avatars", "AvatarList", "characters"]:
            if k in data and isinstance(data[k], list):
                for item in data[k]:
                    if isinstance(item, dict):
                        collector['chars'].append(item)
        # Heuristique single object
        if is_relic_like(data):
            collector['relics'].append(data)
        if is_lc_like(data):
            collector['lcs'].append(data)
        if is_avatar_like(data):
            collector['chars'].append(data)
        # Recurse
        for v in data.values():
            recursive_find(v, collector, depth+1)
    elif isinstance(data, list):
        for item in data:
            recursive_find(item, collector, depth+1)

def scan_directory(root: Path):
    exts = {'.json', '.db', '.sqlite', '.sqlite3', '.dat', '.bin'}
    candidates = []
    # brute walk
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts:
            # skip resources (gros fichiers)
            if any(x in str(p).lower() for x in ["resources", "excel", "textmap", "config", "hotfix"]):
                # mais on garde si petit (<2MB) et json
                try:
                    if p.stat().st_size > 5_000_000:
                        continue
                except:
                    continue
            candidates.append(p)
    return candidates

def load_sqlite_all_tables(db_path: Path):
    collector = {'relics': [], 'lcs': [], 'chars': []}
    try:
        conn = sqlite3.connect(str(db_path))
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]
        for t in tables:
            if any(k in t.lower() for k in ["relic", "equip", "avatar", "player", "item"]):
                try:
                    cur.execute(f"SELECT * FROM {t}")
                    cols = [d[0] for d in cur.description]
                    rows = cur.fetchall()
                    for row in rows:
                        d = dict(zip(cols, row))
                        # Heuristique contenu
                        if is_relic_like(d) or "relic" in t.lower():
                            collector['relics'].append(d)
                        elif is_lc_like(d) or "equip" in t.lower():
                            collector['lcs'].append(d)
                        elif is_avatar_like(d) or "avatar" in t.lower():
                            collector['chars'].append(d)
                        else:
                            # tente recursive
                            recursive_find(d, collector)
                except Exception as e:
                    continue
        conn.close()
    except Exception as e:
        pass
    return collector

def to_fribbels_relic(r):
    try:
        tid = r.get("tid") or r.get("relicId") or r.get("id") or r.get("relic_id") or 0
        try:
            tid_int = int(tid)
        except:
            tid_int = 0
        set_id = tid_int // 100 if tid_int > 1000 else (r.get("setId") or r.get("set_id") or 121)
        slot = r.get("slot") or (tid_int % 10 if tid_int else 1)
        if slot == 0:
            slot = 1
        main_affix = r.get("mainAffix") or r.get("main_affix") or r.get("main_affix_id") or {}
        if isinstance(main_affix, int):
            main_affix = {"type": main_affix, "value": 0}
        sub_affix = r.get("subAffix") or r.get("sub_affix") or r.get("sub_affixes") or []
        if not isinstance(sub_affix, list):
            sub_affix = [sub_affix] if sub_affix else []
        return {
            "set": str(set_id),
            "slot": int(slot),
            "rarity": int(r.get("rarity", 5)),
            "level": int(r.get("level", 15)),
            "mainstat": str(main_affix.get("type") or main_affix.get("affixId") or "ATK"),
            "mainvalue": main_affix.get("value") or main_affix.get("cnt") or 0,
            "substats": [
                {"key": str(s.get("type") or s.get("affixId") or s.get("id") or "ATK"), "value": s.get("value") or s.get("cnt") or 0}
                for s in sub_affix if isinstance(s, dict)
            ][:4],
            "_uid": str(r.get("uniqueId") or r.get("id") or r.get("internalId") or f"{tid_int}_{r.get('level',0)}_{len(str(r))}")
        }
    except Exception as e:
        return None

def to_fribbels_lc(e):
    try:
        return {
            "id": str(e.get("tid") or e.get("equipmentId") or e.get("id") or e.get("equipment_id") or 20000),
            "level": int(e.get("level", 80)),
            "ascension": int(e.get("promotion", 6)),
            "superimposition": int(e.get("rank", 1)),
            "location": None,
            "lock": False,
            "_uid": str(e.get("uniqueId") or e.get("id") or e.get("internalId") or f"lc_{e.get('tid',0)}")
        }
    except:
        return None

def to_fribbels_char(a):
    try:
        avatar_id = a.get("avatarId") or a.get("baseAvatarId") or a.get("id") or a.get("avatar_id") or 1001
        return {
            "id": str(avatar_id),
            "level": int(a.get("level", 80)),
            "ascension": int(a.get("promotion", 6)),
            "eidolon": int(a.get("rank", 0)),
            "name": a.get("name") or f"Avatar_{avatar_id}"
        }
    except:
        return None

def dedup(lst, key="_uid"):
    seen = {}
    out = []
    for item in lst:
        k = str(item.get(key) or item.get("id") or len(seen))
        if k not in seen:
            seen[k] = True
            out.append(item)
    return out

def main():
    parser = argparse.ArgumentParser(description="Himeko Nova Exporter V2 - sans UID")
    parser.add_argument("--server-dir", type=str, help="Dossier racine himeko-nova-sr")
    parser.add_argument("--file", type=str, help="Fichier unique .json/.db à parser")
    parser.add_argument("--scan-all", action="store_true", help="Scan brute de tout le dossier (sans filtre)")
    parser.add_argument("--out", type=str, default=None, help="Fichier sortie")
    parser.add_argument("--uid", type=int, default=10001, help="UID fictif pour le fichier final (default 10001)")
    args = parser.parse_args()

    collector = {'relics': [], 'lcs': [], 'chars': []}

    targets = []
    if args.file:
        targets.append(Path(args.file))
    if args.server_dir:
        root = Path(args.server_dir)
        if not root.exists():
            print(f"[ERR] Dossier introuvable: {root}", file=sys.stderr)
            sys.exit(1)
        print(f"[SCAN] Parcours de {root} ...")
        # Si scan-all, on prend tout, sinon on filtre un peu
        if args.scan_all:
            targets = scan_directory(root)
        else:
            # Cherche patterns probables
            patterns = ["**/players/*.json", "**/player/*.json", "**/accounts/*.json", "**/*.db", "**/*.sqlite", "**/data/**/*.json"]
            for pat in patterns:
                targets.extend(root.glob(pat))
            # Ajoute aussi tous les json <2MB dans gameserver/
            gs = root / "gameserver"
            if gs.exists():
                for p in gs.rglob("*.json"):
                    try:
                        if p.stat().st_size < 2_000_000:
                            targets.append(p)
                    except:
                        pass
        targets = list(set(targets))
        print(f"[INFO] {len(targets)} fichiers candidats trouvés")
        for t in targets[:20]:
            print(f"  - {t} ({t.stat().st_size//1024} Ko)")

    if not targets:
        print("[ERR] Aucun fichier trouvé. Utilise --server-dir ou --file")
        print("Exemple: python export.py --server-dir C:/himeko-nova-sr --scan-all")
        sys.exit(1)

    for p in targets:
        if not p.exists():
            continue
        if p.suffix.lower() in ['.db', '.sqlite', '.sqlite3']:
            c = load_sqlite_all_tables(p)
            collector['relics'].extend(c['relics'])
            collector['lcs'].extend(c['lcs'])
            collector['chars'].extend(c['chars'])
        elif p.suffix.lower() == '.json':
            j = load_json(p)
            if not j:
                continue
            # quick check: contient relic_list ?
            txt = str(p).lower()
            if any(k in str(j)[:2000].lower() for k in ["relic", "avatar", "equipment", "tid"]):
                recursive_find(j, collector)

    print(f"[FOUND] Brut: {len(collector['relics'])} relics, {len(collector['lcs'])} LC, {len(collector['chars'])} chars")

    # Conversion
    relics = [r for r in (to_fribbels_relic(x) for x in collector['relics']) if r]
    lcs = [r for r in (to_fribbels_lc(x) for x in collector['lcs']) if r]
    chars = [r for r in (to_fribbels_char(x) for x in collector['chars']) if r]

    relics = dedup(relics)
    lcs = dedup(lcs)
    chars = dedup(chars, "id")

    print(f"[CONVERTED] {len(relics)} relics, {len(lcs)} LC, {len(chars)} chars après dédup")

    if len(relics) == 0 and len(lcs) == 0 and len(chars) == 0:
        print("\n[WARN] Toujours 0 ! Ça veut dire que ton serveur ne stocke pas en JSON clair.")
        print("Solutions:")
        print("1. Vérifie s'il y a un dossier 'storage' ou 'save' avec des .json binaires")
        print("2. Dans himeko-nova-sr, ouvre gameserver/src/*.zig et cherche 'SaveData' - tu verras le chemin")
        print("3. Alternative ultime: patch le gameserver pour dumper un optimizer.json (voir README)")
        print("4. Envoie moi un exemple de fichier de ton dossier gameserver/data (même petit) pour que je l'adapte")

    out = {
        "source": "himeko_nova_direct_v2",
        "build": "4.4.53-patched-v2",
        "version": 4,
        "metadata": {"uid": args.uid, "trailblazer": "Stelle"},
        "relics": relics,
        "light_cones": lcs,
        "characters": chars,
        "materials": []
    }

    out_path = args.out or f"archive_output-{datetime.now().strftime('%Y-%m-%dT%H-%M-%S')}.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Export -> {out_path}")
    print(f"Tu peux l'importer dans https://fribbels.github.io/hsr-optimizer/ -> Import")

if __name__ == "__main__":
    main()
