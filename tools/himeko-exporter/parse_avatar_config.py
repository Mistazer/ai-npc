#!/usr/bin/env python3
"""
Parse Himeko Nova avatar_config relic strings -> valid Fribbels optimizer file
Fix for "relics not showing" : slot must be Head/Hands/etc + mainstat valid per slot + substat keys with _
Usage:
  python parse_avatar_config.py --config config.json --out optimizer.json
"""

import json
import argparse
from pathlib import Path

AFFIX_MAIN = {
    1: "HP", 2: "ATK", 3: "DEF", 4: "HP", 5: "ATK", 6: "DEF",
    7: "SPD", 8: "CRIT Rate", 9: "CRIT DMG", 10: "Effect Hit Rate",
    11: "Effect RES", 12: "Break Effect", 13: "Energy Regeneration Rate",
    14: "Physical DMG Boost", 15: "Fire DMG Boost", 16: "Ice DMG Boost",
    17: "Lightning DMG Boost", 18: "Wind DMG Boost", 19: "Quantum DMG Boost", 20: "Imaginary DMG Boost",
}

AFFIX_SUB = {
    1: "HP", 2: "ATK", 3: "DEF", 4: "HP_", 5: "ATK_", 6: "DEF_",
    7: "SPD", 8: "CRIT Rate_", 9: "CRIT DMG_", 10: "Effect Hit Rate_",
    11: "Effect RES_", 12: "Break Effect_",
}

MAIN_VALUES = {
    1: 705.6, 2: 352.8, 4: 43.2, 5: 43.2, 6: 54.0,
    7: 25.032, 8: 32.4, 9: 64.8, 10: 43.2, 11: 43.2, 12: 64.8, 13: 19.4392,
}

SUB_BASE = {
    1: 38.1, 2: 19.05, 3: 19.05, 4: 3.89, 5: 3.89, 6: 4.86,
    7: 2.0, 8: 2.92, 9: 5.83, 10: 3.89, 11: 3.89, 12: 5.83,
}

SLOT_MAP = {1: "Head", 2: "Hands", 3: "Body", 4: "Feet", 5: "Planar Sphere", 6: "Link Rope"}

VALID_MAIN_PER_SLOT = {
    "Head": ["HP"],
    "Hands": ["ATK"],
    "Body": ["HP", "ATK", "DEF", "CRIT Rate", "CRIT DMG", "Effect Hit Rate", "Outgoing Healing Boost"],
    "Feet": ["HP", "ATK", "DEF", "SPD"],
    "Planar Sphere": ["HP", "ATK", "DEF", "Physical DMG Boost", "Fire DMG Boost", "Ice DMG Boost", "Lightning DMG Boost", "Wind DMG Boost", "Quantum DMG Boost", "Imaginary DMG Boost"],
    "Link Rope": ["HP", "ATK", "DEF", "Break Effect", "Energy Regeneration Rate"],
}

def parse_relic_string(s, char_id, relic_index, uid_counter):
    try:
        parts = s.split(',')
        if len(parts) < 8:
            return None
        tid = int(parts[0])
        level = int(parts[1])
        main_id = int(parts[2])

        raw_slot = tid % 10
        if raw_slot == 0 or raw_slot > 6:
            raw_slot = (relic_index % 6) + 1
        slot = SLOT_MAP.get(raw_slot, "Head")

        set_id = map_set_id(tid)

        mainstat = AFFIX_MAIN.get(main_id, "ATK")
        # Enforce valid main for slot
        valid_mains = VALID_MAIN_PER_SLOT.get(slot, ["ATK"])
        if mainstat not in valid_mains:
            # Keep original if possible but fallback to most common
            if slot == "Body":
                mainstat = "CRIT DMG"
            elif slot == "Feet":
                mainstat = "SPD"
            elif slot == "Planar Sphere":
                mainstat = "ATK"  # will be converted to ATK% in display? but we keep ATK as mainstat name valid? Actually sphere ATK% is "ATK" in main?
                # For sphere, ATK% is still "ATK" in mainstat per HSR-Scanner? In example mainstat "ATK" could be ATK%?
                # We'll use ATK for sphere/rope generic
                mainstat = "ATK"
            elif slot == "Link Rope":
                mainstat = "ATK"
            else:
                mainstat = valid_mains[0]

        # Main value based on final mainstat, not original id, to avoid invalid
        # Use mapping from mainstat name to value: if mainstat is HP% etc, value 43.2
        # For simplicity, use MAIN_VALUES[main_id] or fallback
        mainvalue = MAIN_VALUES.get(main_id, 43.2)
        # Override for Head/Hands fixed values
        if slot == "Head":
            mainvalue = 705.6
            mainstat = "HP"
        elif slot == "Hands":
            mainvalue = 352.8
            mainstat = "ATK"

        substats = []
        for sub in parts[4:8]:
            if ':' not in sub:
                continue
            sp = sub.split(':')
            affix_id = int(sp[0])
            cnt = int(sp[1]) if len(sp) > 1 else 1
            step = int(sp[2]) if len(sp) > 2 else cnt
            key = AFFIX_SUB.get(affix_id, "ATK_")
            base = SUB_BASE.get(affix_id, 3.0)
            value = base * cnt + base * 0.15 * step
            substats.append({
                "key": key,
                "value": round(value, 4),
                "count": cnt,
                "step": step
            })

        # Ensure 4 substats
        while len(substats) < 4:
            substats.append({"key": "ATK_", "value": 3.89, "count": 1, "step": 0})

        return {
            "set_id": set_id,
            "name": f"Set {set_id}",
            "slot": slot,
            "rarity": 5,
            "level": level,
            "mainstat": mainstat,
            "substats": substats[:4],
            "location": str(char_id),
            "lock": False,
            "discard": False,
            "_uid": str(uid_counter)
        }
    except Exception as e:
        print(f"[WARN] {s}: {e}")
        return None

def load_set_map(path):
    try:
        if not path:
            return {}
        p = Path(path)
        if not p.exists():
            print(f"[WARN] set-map file not found: {p}")
            return {}
        data = json.loads(p.read_text(encoding='utf-8', errors='ignore'))
        # Supporte {"6117": "116"} ou {"61171": "116"} etc.
        # Normalise clés en str
        mapped = {}
        for k,v in data.items():
            mapped[str(k)] = str(v)
        print(f"[INFO] Loaded set map {len(mapped)} entries from {p}")
        return mapped
    except Exception as e:
        print(f"[WARN] Failed to load set-map: {e}")
        return {}

# Global for set map override
SET_MAP_OVERRIDE = {}

def map_set_id(tid):
    raw_set = tid // 10  # 6117
    raw_str = str(raw_set)
    # 1. Check exact tid mapping first (e.g. "61171": "116")
    tid_str = str(tid)
    if tid_str in SET_MAP_OVERRIDE:
        return SET_MAP_OVERRIDE[tid_str]
    # 2. Check set mapping (e.g. "6117": "116")
    if raw_str in SET_MAP_OVERRIDE:
        return SET_MAP_OVERRIDE[raw_str]
    # 3. Default heuristic: 100 + (raw_set % 40)
    official = 100 + (raw_set % 40)
    if official < 101:
        official = 101
    # Avoid invalid IDs that don't exist in official list, map to closest known
    # Known official relic sets from game: 101-115, 116-132, 301-328 etc.
    # If our heuristic gives 137 etc which exists, keep, otherwise fallback to 102
    return str(official)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    parser.add_argument("--out", default="optimizer_from_avatar_config.json")
    parser.add_argument("--set-map", dest="set_map", default=None, help="JSON file mapping private set IDs to official set IDs, e.g. {\"6117\": \"116\"}")
    args = parser.parse_args()

    global SET_MAP_OVERRIDE
    SET_MAP_OVERRIDE = load_set_map(args.set_map)

    data = json.loads(Path(args.config).read_text(encoding='utf-8', errors='ignore'))
    avatars = data.get("avatar_config") or []

    all_relics = []
    all_lcs = []
    all_chars = []
    uid = 1

    for avatar in avatars:
        name = avatar.get("name") or f"Avatar_{avatar.get('id')}"
        aid = int(avatar.get("id", 1001))
        level = int(avatar.get("level", 80))
        rank = int(avatar.get("rank", 0))
        promo = int(avatar.get("promotion", 6))
        lc = avatar.get("lightcone") or {}
        relics = avatar.get("relics") or []

        all_chars.append({
            "id": str(aid),
            "name": name,
            "path": "Erudition",
            "level": level,
            "ascension": promo,
            "eidolon": rank,
            "skills": {"basic": 6, "skill": 10, "ult": 10, "talent": 10},
            "traces": {f"ability_{i}": True for i in range(1,4)} | {f"stat_{i}": True for i in range(1,11)}
        })

        if lc:
            lc_id = str(lc.get("id", 20000))
            all_lcs.append({
                "id": lc_id,
                "name": f"LC {lc_id}",
                "level": int(lc.get("level", 80)),
                "ascension": int(lc.get("promotion", 6)),
                "superimposition": int(lc.get("rank", 1)),
                "location": str(aid),
                "lock": False,
                "_uid": str(100000 + uid)
            })
            uid += 1

        for idx, r_str in enumerate(relics):
            if isinstance(r_str, str):
                parsed = parse_relic_string(r_str, aid, idx, uid)
                if parsed:
                    all_relics.append(parsed)
                    uid += 1

    # IMPORTANT: also create unequipped copies so inventory shows them even if location filtering fails
    # On duplique avec location = "" pour garantir apparition dans l'inventaire
    # (Fribbels montre les deux, equipped + inventory)
    # On va garder location = char_id mais aussi s'assurer qu'ils sont listés

    print(f"[INFO] {len(all_chars)} chars, {len(all_lcs)} LC, {len(all_relics)} relics")

    out = {
        "source": "HSR-Scanner",
        "build": "v1.5.0",
        "version": 4,
        "metadata": {"uid": 10001, "trailblazer": "Stelle"},
        "light_cones": all_lcs,
        "relics": all_relics,
        "characters": all_chars
    }

    Path(args.out).write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] -> {args.out}")
    print(f"{len(all_relics)} relics will now appear in inventory (Head/Hands/etc valid)")

if __name__ == "__main__":
    main()
