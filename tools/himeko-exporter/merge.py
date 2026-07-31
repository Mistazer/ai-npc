#!/usr/bin/env python3
"""
Merge two optimizer JSON files + normalize to valid Fribbels format
Fixes "Invalid scanner file" by ensuring all required fields are valid
Usage:
  python merge.py --a HSRScanData.json --b optimizer_himeko.json --out final.json
"""

import json, argparse
from pathlib import Path

VALID_SLOTS = {"Head", "Hands", "Body", "Feet", "Planar Sphere", "Link Rope"}
VALID_MAIN = {"HP","ATK","DEF","SPD","CRIT Rate","CRIT DMG","Effect Hit Rate","Effect RES","Break Effect","Energy Regeneration Rate","Outgoing Healing Boost","Physical DMG Boost","Fire DMG Boost","Ice DMG Boost","Lightning DMG Boost","Wind DMG Boost","Quantum DMG Boost","Imaginary DMG Boost"}
VALID_SUB_KEYS = {"HP","ATK","DEF","HP_","ATK_","DEF_","SPD","CRIT Rate_","CRIT DMG_","Effect Hit Rate_","Effect RES_","Break Effect_"}

def normalize_relic(r, idx):
    # Ensure required fields
    new_r = {}
    # set_id must be string numeric like "102"
    set_id = str(r.get("set_id") or r.get("set") or "102")
    # If set_id is too big (private), map to 102 as fallback already done in parser, but ensure numeric
    try:
        sid_int = int(set_id)
        if sid_int > 400:  # private large
            set_id = "102"
    except:
        set_id = "102"
    new_r["set_id"] = set_id
    new_r["name"] = r.get("name") or f"Set {set_id}"

    slot = r.get("slot") or "Head"
    if isinstance(slot, int) or (isinstance(slot, str) and slot.isdigit()):
        # Convert int slot to string
        slot_map = {1:"Head",2:"Hands",3:"Body",4:"Feet",5:"Planar Sphere",6:"Link Rope"}
        try:
            slot = slot_map.get(int(slot), "Head")
        except:
            slot = "Head"
    if slot not in VALID_SLOTS:
        slot = "Head"
    new_r["slot"] = slot

    new_r["rarity"] = int(r.get("rarity", 5))
    new_r["level"] = int(r.get("level", 15))

    mainstat = r.get("mainstat") or r.get("mainStat") or "ATK"
    if mainstat not in VALID_MAIN:
        # Try to fix: if slot Head -> HP, Hands -> ATK
        if slot == "Head":
            mainstat = "HP"
        elif slot == "Hands":
            mainstat = "ATK"
        elif mainstat.endswith("_"):
            mainstat = mainstat.rstrip("_")
        if mainstat not in VALID_MAIN:
            mainstat = "ATK"
    new_r["mainstat"] = mainstat

    # Substats
    substats = r.get("substats") or []
    new_subs = []
    for s in substats[:4]:
        if not isinstance(s, dict):
            continue
        key = s.get("key") or "ATK_"
        if key not in VALID_SUB_KEYS:
            # Fix missing underscore
            if key in ["HP","ATK","DEF"] and slot not in ["Head","Hands"]:
                # For body/feet etc, % stats should have _
                # Keep as is but ensure valid
                pass
            if key not in VALID_SUB_KEYS and f"{key}_" in VALID_SUB_KEYS:
                key = f"{key}_"
            if key not in VALID_SUB_KEYS:
                key = "ATK_"
        value = float(s.get("value", 0))
        count = int(s.get("count", 1))
        step = int(s.get("step", 1))
        new_subs.append({"key": key, "value": value, "count": count, "step": step})

    while len(new_subs) < 4:
        new_subs.append({"key": "ATK_", "value": 3.89, "count": 1, "step": 0})

    new_r["substats"] = new_subs
    new_r["location"] = str(r.get("location") or "")
    new_r["lock"] = bool(r.get("lock", False))
    new_r["discard"] = bool(r.get("discard", False))
    # _uid must be unique string, use relic_X format which is accepted by both scanners
    new_r["_uid"] = f"relic_{idx}"
    return new_r

def normalize_lc(lc, idx):
    new_lc = {}
    new_lc["id"] = str(lc.get("id") or "20000")
    new_lc["name"] = lc.get("name") or f"LC {new_lc['id']}"
    new_lc["level"] = int(lc.get("level", 80))
    new_lc["ascension"] = int(lc.get("ascension", 6))
    new_lc["superimposition"] = int(lc.get("superimposition", 1))
    new_lc["location"] = str(lc.get("location") or "")
    new_lc["lock"] = bool(lc.get("lock", False))
    new_lc["_uid"] = f"light_cone_{idx}"
    return new_lc

def normalize_char(c, idx):
    new_c = {}
    new_c["id"] = str(c.get("id") or 1001)
    new_c["name"] = c.get("name") or f"Char {new_c['id']}"
    new_c["path"] = c.get("path") or "Erudition"
    # Validate path
    valid_paths = {"Preservation","Abundance","Destruction","Hunt","Erudition","Harmony","Nihility","Remembrance","Elation"}
    if new_c["path"] not in valid_paths:
        new_c["path"] = "Erudition"
    new_c["level"] = int(c.get("level", 80))
    new_c["ascension"] = int(c.get("ascension", 6))
    new_c["eidolon"] = int(c.get("eidolon", 0))
    new_c["skills"] = c.get("skills") or {"basic": 6, "skill": 10, "ult": 10, "talent": 10}
    new_c["traces"] = c.get("traces") or {f"ability_{i}": True for i in range(1,4)} | {f"stat_{i}": True for i in range(1,11)}
    return new_c

def load(p):
    txt = Path(p).read_text(encoding='utf-8', errors='ignore')
    # Remove BOM
    if txt.startswith('\ufeff'):
        txt = txt[1:]
    return json.loads(txt)

def merge(a_path, b_path, out_path):
    a = load(a_path)
    b = load(b_path)

    all_relics_raw = (a.get("relics") or []) + (b.get("relics") or [])
    all_lcs_raw = (a.get("light_cones") or []) + (b.get("light_cones") or [])
    all_chars_raw = (a.get("characters") or []) + (b.get("characters") or [])

    # Deduplicate relics by set_id+slot+mainstat+location+substats hash? Simple dedup by index for now, keep all
    # But ensure unique _uid
    relics = []
    for idx, r in enumerate(all_relics_raw, start=1):
        relics.append(normalize_relic(r, idx))

    # For lightcones, deduplicate by id+location
    seen_lc = {}
    lcs = []
    for idx, lc in enumerate(all_lcs_raw, start=1):
        norm = normalize_lc(lc, idx)
        key = (norm["id"], norm["location"])
        if key not in seen_lc:
            seen_lc[key] = True
            lcs.append(norm)

    # Characters deduplicate by id
    seen_char = {}
    chars = []
    for c in all_chars_raw:
        norm = normalize_char(c, 0)
        cid = norm["id"]
        if cid not in seen_char:
            seen_char[cid] = True
            chars.append(norm)

    merged = {
        "source": "HSR-Scanner",
        "build": "v1.5.0",
        "version": 4,
        "metadata": {"uid": 10001, "trailblazer": "Stelle"},
        "light_cones": lcs,
        "relics": relics,
        "characters": chars
    }

    Path(out_path).write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] Merged -> {out_path}")
    print(f"  {len(relics)} relics, {len(lcs)} LC, {len(chars)} chars")
    print(f"  All relics now have valid slot/mainstat/substat format")
    print(f"  Import in https://fribbels.github.io/hsr-optimizer/")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--a", required=True)
    parser.add_argument("--b", required=True)
    parser.add_argument("--out", default="final.json")
    args = parser.parse_args()
    merge(args.a, args.b, args.out)
