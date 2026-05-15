#!/usr/bin/env python3
from __future__ import annotations

import os
import shutil
from pathlib import Path

ENV_LOCAL_INDEX_CACHE = "AN_LLM_WIKI_LOCAL_INDEX_CACHE"
ENV_DEFAULT_CACHE_DRIVE = "AN_LLM_WIKI_DEFAULT_CACHE_DRIVE"
DEFAULT_CACHE_DRIVE = os.environ.get(ENV_DEFAULT_CACHE_DRIVE, "D:")
DEFAULT_LOCAL_INDEX_CACHE = Path(f"{DEFAULT_CACHE_DRIVE}/") / "Obsidian-External-Backups" / "an-llm-wiki-local-index-cache"
LEGACY_LOCAL_DISCOVERY_DIR = Path("inbox/private/local-recovery-2026-05-12/local-discovery")


def local_index_cache_dir(vault_root: Path, *, create: bool = True, migrate: bool = True) -> Path:
    configured = os.environ.get(ENV_LOCAL_INDEX_CACHE, "").strip()
    cache_dir = Path(configured).expanduser() if configured else DEFAULT_LOCAL_INDEX_CACHE
    if not cache_dir.is_absolute():
        cache_dir = vault_root / cache_dir
    cache_dir = cache_dir.resolve()
    if create:
        cache_dir.mkdir(parents=True, exist_ok=True)
    if migrate:
        migrate_legacy_local_discovery(vault_root, cache_dir)
    return cache_dir


def legacy_local_discovery_dir(vault_root: Path) -> Path:
    return (vault_root / LEGACY_LOCAL_DISCOVERY_DIR).resolve()


def migrate_legacy_local_discovery(vault_root: Path, cache_dir: Path) -> int:
    legacy_dir = legacy_local_discovery_dir(vault_root)
    if not legacy_dir.exists() or not legacy_dir.is_dir():
        return 0
    cache_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for source in legacy_dir.iterdir():
        target = cache_dir / source.name
        if target.exists():
            continue
        if source.is_file():
            shutil.copy2(source, target)
            copied += 1
        elif source.is_dir():
            shutil.copytree(source, target)
            copied += 1
    return copied


def cache_label(name: str) -> str:
    return f"`external-index-cache/{name}`"
