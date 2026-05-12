#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import sys
from pathlib import Path

IGNORE_DIRS = {
    ".git",
    ".obsidian",
    ".trash",
    ".claude",
    ".claudian",
    ".serena",
    "_raw",
    "_archives",
    "inbox",
    "private-wiki",
    ".local_private",
    "node_modules",
    "dist",
    "dist-ssr",
    ".vite",
    "__pycache__",
}
IGNORE_FILES = {"hot.md"}
IGNORE_SUFFIXES = {".log"}


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    out = root / "manifests" / "public_inventory.csv"
    rows = []
    for current, dirs, names in os.walk(root, followlinks=False):
        rel_current = Path(current).resolve().relative_to(root).as_posix()
        dirs[:] = [
            d
            for d in dirs
            if d not in IGNORE_DIRS
            and not d.startswith("00 - ")
            and not d.startswith("01 - ")
            and f"{rel_current}/{d}".lstrip("./") != "site/public/site-data"
        ]
        for name in names:
            if name in IGNORE_FILES:
                continue
            if any(name.endswith(suffix) for suffix in IGNORE_SUFFIXES):
                continue
            path = Path(current) / name
            if path.resolve() == out.resolve():
                continue
            rows.append({"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size})
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["path", "bytes"])
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: r["path"]))
    print(f"files: {len(rows)}")
    print(f"inventory: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
