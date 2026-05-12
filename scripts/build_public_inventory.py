#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import sys
from pathlib import Path

IGNORE_DIRS = {".git", ".obsidian", ".trash", ".claude", ".claudian", "_raw", "_archives", "node_modules"}


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    rows = []
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for name in names:
            path = Path(current) / name
            rows.append({"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size})
    out = root / "manifests" / "public_inventory.csv"
    with out.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["path", "bytes"])
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: r["path"]))
    print(f"files: {len(rows)}")
    print(f"inventory: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
