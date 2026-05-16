#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import os
import sys
from pathlib import Path

try:
    from local_index_cache import local_index_cache_dir
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from local_index_cache import local_index_cache_dir

RAW_WAREHOUSE_PRIVATE_DIR = Path("inbox/private/local-recovery-2026-05-12/raw-warehouse")
RAW_WAREHOUSE_CONFIG = RAW_WAREHOUSE_PRIVATE_DIR / "config.json"
RAW_WAREHOUSE_PLAN = RAW_WAREHOUSE_PRIVATE_DIR / "raw_warehouse_plan.csv"
RAW_WAREHOUSE_SUMMARY = RAW_WAREHOUSE_PRIVATE_DIR / "raw_warehouse_summary.json"
RAW_WAREHOUSE_MARKER = ".raw_warehouse_root.json"

ENV_RAW_WAREHOUSE_ROOT = "AN_LLM_WIKI_RAW_WAREHOUSE_ROOT"


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def write_csv_rows(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def private_path(vault_root: Path, relative: Path) -> Path:
    return (vault_root / relative).resolve()


def raw_warehouse_config_path(vault_root: Path) -> Path:
    return private_path(vault_root, RAW_WAREHOUSE_CONFIG)


def raw_warehouse_plan_path(vault_root: Path) -> Path:
    return private_path(vault_root, RAW_WAREHOUSE_PLAN)


def raw_warehouse_summary_path(vault_root: Path) -> Path:
    return private_path(vault_root, RAW_WAREHOUSE_SUMMARY)


def root_marker_path(root: Path) -> Path:
    return root / RAW_WAREHOUSE_MARKER


def load_raw_warehouse_config(vault_root: Path) -> dict:
    config = load_json(raw_warehouse_config_path(vault_root))
    override = os.environ.get(ENV_RAW_WAREHOUSE_ROOT, "").strip()
    if override:
        config["warehouse_root"] = override
    return config


def load_local_root_rows(vault_root: Path) -> list[dict[str, str]]:
    cache_dir = local_index_cache_dir(vault_root)
    return read_csv_rows(cache_dir / "local_roots.csv")


def row_int(row: dict[str, str], key: str) -> int:
    try:
        return int(str(row.get(key, "") or 0))
    except ValueError:
        return 0


def normalize_path_text(value: str) -> str:
    return value.replace("\\", "/").strip().lower()


def target_relative_dir(policy: str, root_id: str) -> str:
    mapping = {
        "mirror-project-root": "mirrors/projects",
        "mirror-personal-chat-root": "mirrors/personal-chat",
        "mirror-download-root": "incoming/downloads",
        "mirror-local-asset-root": "mirrors/local-assets",
        "dedupe-backup-root": "mirrors/backups",
    }
    base = mapping.get(policy, "")
    return f"{base}/{root_id}" if base else ""


def classify_root(row: dict[str, str]) -> dict[str, str]:
    path = normalize_path_text(row.get("path", ""))
    files = row_int(row, "files")

    if files == 0:
        return {
            "warehouse_policy": "skip-empty-root",
            "migration_priority": "P3",
            "justification": "No current files; keep as indexed placeholder only.",
        }

    if any(token in path for token in ["/.ssh", "/.aws", "/.azure"]):
        return {
            "warehouse_policy": "index-only-sensitive-root",
            "migration_priority": "P0",
            "justification": "Credential or cloud config root should remain in place and be indexed only.",
        }

    if any(
        token in path
        for token in [
            "/.codex",
            "/.claude",
            "/.cursor",
            "/.agents",
            "/.gemini",
            "/.qwen",
            "/.openclaw",
            "/.mempalace",
            "/runtimestate",
            "/ai_runtime",
        ]
    ):
        return {
            "warehouse_policy": "index-only-live-root",
            "migration_priority": "P1",
            "justification": "Live runtime, session, or agent state should stay in place; warehouse stores only its index metadata.",
        }

    if any(token in path for token in ["/xwechat_files", "/tencent files", "微信聊天记录备份", "微信web开发者工具", "/wxwork"]):
        return {
            "warehouse_policy": "mirror-personal-chat-root",
            "migration_priority": "P0",
            "justification": "Personal or chat-derived evidence should be mirrored into the raw warehouse before any cleanup or redaction.",
        }

    if any(token in path for token in ["obsidian-external-backups", "e-drive-backup", "backup"]):
        return {
            "warehouse_policy": "dedupe-backup-root",
            "migration_priority": "P2",
            "justification": "Backup roots should be mirrored and deduplicated, not treated as the single source of current truth.",
        }

    if "下载" in row.get("path", "") or "/downloads" in path:
        return {
            "warehouse_policy": "mirror-download-root",
            "migration_priority": "P1",
            "justification": "Download roots are high-yield intake sources and should gain a stable landing area in the warehouse.",
        }

    if any(token in path for token in ["/projects", "/github", "/oh-workspace", "ai_evidence_archive", "codex集成项目集成树"]):
        return {
            "warehouse_policy": "mirror-project-root",
            "migration_priority": "P1",
            "justification": "Project and repo roots are primary source material for lifecycle pages, skills, and public-safe rewrites.",
        }

    return {
        "warehouse_policy": "mirror-local-asset-root",
        "migration_priority": "P2",
        "justification": "Local assets are worth centralizing, but after higher-signal project and chat sources.",
    }


def ensure_warehouse_root(root: Path, subdirs: list[str], vault_name: str) -> None:
    root.mkdir(parents=True, exist_ok=True)
    for subdir in subdirs:
        (root / subdir).mkdir(parents=True, exist_ok=True)
    marker = {
        "vault": vault_name,
        "purpose": "single raw warehouse root for local-only source consolidation",
        "managed_subdirs": subdirs,
    }
    write_json(root_marker_path(root), marker)
