#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import re
import subprocess
import sys
from pathlib import Path

PRIVATE_DIR = "private-wiki"
REQUIRED_KEYS = {"title", "aliases", "tags", "category", "type", "status", "created", "updated", "sources", "summary"}
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
SECRET_VALUE_PATTERNS = [
    re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
    re.compile(r"-----BEGIN (?:OPENSSH|RSA|DSA|EC|PRIVATE) PRIVATE KEY-----"),
]


def frontmatter(text: str) -> str:
    match = FRONTMATTER_RE.search(text)
    return match.group(1) if match else ""


def frontmatter_keys(block: str) -> set[str]:
    keys = set()
    for line in block.splitlines():
        if ":" in line and not line.startswith((" ", "-")):
            keys.add(line.split(":", 1)[0].strip())
    return keys


def has_private_visibility(block: str) -> bool:
    return "visibility/internal" in block or "visibility/private" in block


def git_lines(root: Path, args: list[str]) -> list[str]:
    result = subprocess.run(["git", *args], cwd=root, text=True, capture_output=True, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return [line for line in result.stdout.splitlines() if line.strip()]


def private_inventory_forbidden(root: Path) -> list[str]:
    inventory = root / "manifests" / "public_inventory.csv"
    if not inventory.exists():
        return []
    rows = []
    with inventory.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            path = row.get("path", "")
            if path == PRIVATE_DIR or path.startswith(PRIVATE_DIR + "/"):
                rows.append(path)
    return rows


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    private = root / PRIVATE_DIR
    errors: list[str] = []
    if not private.exists():
        errors.append(f"missing {PRIVATE_DIR}/")
    tracked = git_lines(root, ["ls-files", PRIVATE_DIR])
    if tracked:
        errors.append(f"{PRIVATE_DIR}/ is tracked by Git: {len(tracked)} files")
    if private.exists():
        probe = private / "index.md"
        ignored = subprocess.run(["git", "check-ignore", "-q", "--", str(probe.relative_to(root))], cwd=root, check=False)
        if ignored.returncode != 0:
            errors.append(f"{PRIVATE_DIR}/ is not ignored by Git")
    forbidden_inventory = private_inventory_forbidden(root)
    if forbidden_inventory:
        errors.append(f"public inventory contains {PRIVATE_DIR}: {len(forbidden_inventory)} rows")

    markdown_files = sorted(private.rglob("*.md")) if private.exists() else []
    for path in markdown_files:
        text = path.read_text(encoding="utf-8", errors="replace")
        block = frontmatter(text)
        if not block:
            errors.append(f"{path.relative_to(root).as_posix()} missing frontmatter")
            continue
        missing = REQUIRED_KEYS - frontmatter_keys(block)
        if missing:
            errors.append(f"{path.relative_to(root).as_posix()} missing keys: {','.join(sorted(missing))}")
        if not has_private_visibility(block):
            errors.append(f"{path.relative_to(root).as_posix()} missing visibility/internal or visibility/private tag")
        for pattern in SECRET_VALUE_PATTERNS:
            if pattern.search(text):
                errors.append(f"{path.relative_to(root).as_posix()} contains a secret-shaped value")
                break

    print(f"private_wiki_pages_checked: {len(markdown_files)}")
    print(f"private_wiki_tracked_files: {len(tracked)}")
    print(f"private_wiki_inventory_findings: {len(forbidden_inventory)}")
    print(f"private_wiki_errors: {len(errors)}")
    for error in errors[:80]:
        print(f"ERROR {error}")
    if len(errors) > 80:
        print(f"ERROR truncated {len(errors) - 80} additional errors")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
