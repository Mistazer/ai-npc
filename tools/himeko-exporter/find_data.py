#!/usr/bin/env python3
"""
Diagnostic: trouve où Himeko Nova stocke ses données joueur
Usage: python find_data.py --server-dir ../himeko-nova-sr
"""
import argparse
from pathlib import Path
import json

def scan(root: Path):
    print(f"[SCAN] {root}")
    for p in root.rglob("*"):
        if p.is_file():
            try:
                size = p.stat().st_size
                if size > 10_000_000:
                    continue
                if p.suffix.lower() not in ['.json', '.db', '.sqlite', '.sqlite3', '.dat']:
                    continue
                # lit début
                with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                    txt = f.read(5000)
                    low = txt.lower()
                    hits = []
                    if "relic" in low:
                        hits.append("relic")
                    if "avatar" in low:
                        hits.append("avatar")
                    if "equipment" in low or "light_cone" in low:
                        hits.append("equip/lc")
                    if "uid" in low or "player" in low:
                        hits.append("uid/player")
                    if hits:
                        print(f"[HIT] {p} ({size//1024}Ko) -> {', '.join(hits)}")
            except:
                continue

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--server-dir", required=True)
    args = parser.parse_args()
    scan(Path(args.server_dir))
