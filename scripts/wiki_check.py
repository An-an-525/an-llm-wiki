#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

IGNORE_DIRS = {".git", ".obsidian", ".trash", ".claude", ".claudian", "_raw", "_archives", "node_modules"}
REQUIRED_FILES = ["AGENTS.md", "CLAUDE.md", "README.md", "index.md", "log.md", "wiki/index.md", "manifests/raw_sources.csv", "manifests/publication_review.csv"]
REQUIRED_WIKI_FRONTMATTER = {"title", "tags", "category", "type", "status", "created", "updated", "sources", "summary"}
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")


def iter_markdown(root: Path):
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for name in names:
            if name.endswith(".md"):
                yield Path(current) / name


def has_frontmatter(text: str) -> bool:
    return text.startswith("---\n") and "\n---\n" in text[4:]


def frontmatter_keys(text: str) -> set[str]:
    if not has_frontmatter(text):
        return set()
    block = text.split("\n---\n", 1)[0].strip("-\n")
    keys = set()
    for line in block.splitlines():
        if ":" in line and not line.startswith((" ", "-")):
            keys.add(line.split(":", 1)[0].strip())
    return keys


def normalize_target(raw: str) -> str:
    raw = raw.replace("\\|", "|")
    target = raw.split("|", 1)[0].split("#", 1)[0].strip()
    if target.endswith(".md"):
        target = target[:-3]
    return target.replace("\\", "/")


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    errors, warnings = [], []
    for rel in REQUIRED_FILES:
        if not (root / rel).exists():
            errors.append(f"missing required file: {rel}")
    files = sorted(iter_markdown(root))
    target_paths = {p.relative_to(root).with_suffix("").as_posix() for p in files}
    target_names = {p.stem for p in files}
    for path in files:
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        if rel.startswith("wiki/"):
            if not has_frontmatter(text):
                errors.append(f"missing frontmatter: {rel}")
            else:
                missing = REQUIRED_WIKI_FRONTMATTER - frontmatter_keys(text)
                if missing:
                    warnings.append(f"incomplete frontmatter: {rel} missing {', '.join(sorted(missing))}")
        for match in WIKILINK_RE.finditer(text):
            target = normalize_target(match.group(1))
            if target and target not in target_paths and Path(target).name not in target_names:
                warnings.append(f"possible broken wikilink: {rel} -> [[{match.group(1)}]]")
    print(f"vault: {root}")
    print(f"markdown_files_checked: {len(files)}")
    print(f"errors: {len(errors)}")
    for error in errors:
        print(f"ERROR {error}")
    print(f"warnings: {len(warnings)}")
    for warning in warnings[:200]:
        print(f"WARN {warning}")
    if len(warnings) > 200:
        print(f"WARN truncated {len(warnings) - 200} additional warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
