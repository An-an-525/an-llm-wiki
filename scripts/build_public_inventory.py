#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import subprocess
import sys
from pathlib import Path

IGNORE_DIRS = {
    ".git",
    ".obsidian",
    ".gradle",
    ".trash",
    ".claude",
    ".claudian",
    ".serena",
    "_raw",
    "_archives",
    "inbox",
    "private-wiki",
    ".local_private",
    ".logs",
    "build",
    "downloads",
    "gen",
    "node_modules",
    "dist",
    "dist-ssr",
    ".vite",
    "target",
    "updates",
    "__pycache__",
}
IGNORE_FILES = {"hot.md"}
IGNORE_SUFFIXES = {".log"}


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    out = root / "manifests" / "public_inventory.csv"
    rows = []
    out_resolved = out.resolve()
    git = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=root,
        text=True,
        capture_output=True,
        check=False,
    )
    if git.returncode == 0 and git.stdout:
        for rel in git.stdout.split("\0"):
            if not rel.strip():
                continue
            path = root / rel
            if not path.exists() or path.is_dir():
                continue
            if path.resolve() == out_resolved:
                continue
            if path.name in IGNORE_FILES or any(path.name.endswith(suffix) for suffix in IGNORE_SUFFIXES):
                continue
            rows.append({"path": rel, "bytes": path.stat().st_size})
    else:
        for current, dirs, names in os.walk(root, followlinks=False):
            rel_current = Path(current).resolve().relative_to(root).as_posix()
            dirs[:] = [
                d
                for d in dirs
                if d not in IGNORE_DIRS
                and not d.startswith("00 - ")
                and not d.startswith("01 - ")
                and f"{rel_current}/{d}".lstrip("./") != "site/public/site-data"
                and f"{rel_current}/{d}".lstrip("./") != "manifests/private"
                and not (rel_current == "site/public" and d in {"downloads", "updates"})
                and not (rel_current.startswith("site/src-tauri") and d in {"gen", "target"})
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
