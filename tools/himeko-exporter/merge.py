#!/usr/bin/env python3
"""
Merge two optimizer JSON files (e.g., HSRScanData from scanner + avatar_config from private server)
Usage:
  python merge.py --a HSRScanData.json --b optimizer_from_avatar_config.json --out merged.json
"""

import json, argparse
from pathlib import Path

def load(p):
    return json.loads(Path(p).read_text(encoding='utf-8', errors='ignore'))

def merge(a_path, b_path, out_path):
    a = load(a_path)
    b = load(b_path)

    # Merge relics, lightcones, characters, deduplicate by _uid
    def merge_list(key):
        seen = {}
        out = []
        for src in [a, b]:
            for item in src.get(key, []):
                uid = item.get('_uid') or item.get('id') or str(len(out))
                if uid not in seen:
                    seen[uid] = True
                    out.append(item)
        return out

    merged = {
        "source": "merged",
        "build": "v1.5.0",
        "version": 4,
        "metadata": a.get("metadata") or b.get("metadata") or {"uid": 10001, "trailblazer": "Stelle"},
        "light_cones": merge_list("light_cones"),
        "relics": merge_list("relics"),
        "characters": merge_list("characters"),
    }

    Path(out_path).write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] Merged {len(merged['relics'])} relics, {len(merged['light_cones'])} LC, {len(merged['characters'])} chars -> {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--a", required=True, help="First JSON (e.g., HSRScanData)")
    parser.add_argument("--b", required=True, help="Second JSON (e.g., avatar_config)")
    parser.add_argument("--out", default="merged_optimizer.json")
    args = parser.parse_args()
    merge(args.a, args.b, args.out)
