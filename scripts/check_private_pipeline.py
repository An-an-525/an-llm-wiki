#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, local_index_cache_dir
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, local_index_cache_dir

LOCAL_DISCOVERY_DIR = LEGACY_LOCAL_DISCOVERY_DIR
ARCHIVE_EXCEPTION_FILE = Path("manifests/private_pipeline_archive_exceptions.csv")
REQUIRED_AUTOMATIONS = [
    "llm-wiki-local-source-intake",
    "llm-wiki-github-best-practice-watch",
    "llm-wiki-lifecycle-package-builder",
    "llm-wiki-acceptance-gate",
    "llm-wiki-workflow-retrospective",
]
CRITICAL_FILES = [
    "roots.csv",
    "local_roots.csv",
    "local_source_inventory.csv",
    "local_sensitive_findings.csv",
    "local_timeline_index.csv",
    "local_discovery_summary.json",
    "local_archive_inventory.csv",
    "local_archive_summary.json",
    "local_archive_failures.csv",
    "local_archive_truncations.csv",
    "local_finding_disposition.csv",
    "private_intake_runs.jsonl",
]


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                rows.append({"status": "invalid-json", "raw": line[:200]})
    return rows


def csv_count(path: Path) -> int:
    if not path.exists():
        return 0
    with path.open("r", encoding="utf-8", newline="") as f:
        return max(sum(1 for _ in f) - 1, 0)


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def age_hours(path: Path) -> float | None:
    if not path.exists():
        return None
    mtime = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc)
    return (datetime.now(timezone.utc) - mtime).total_seconds() / 3600


def automation_status(automation_home: Path, automation_id: str) -> str:
    path = automation_home / automation_id / "automation.toml"
    if not path.exists():
        return "missing"
    text = path.read_text(encoding="utf-8", errors="replace")
    if 'status = "ACTIVE"' in text:
        return "active"
    if 'status = "PAUSED"' in text:
        return "paused"
    return "present-unknown-status"


def latest_run_status(path: Path) -> tuple[str, str]:
    rows = read_jsonl(path)
    if not rows:
        return "missing", ""
    latest = rows[-1]
    return str(latest.get("status", "unknown")), str(latest.get("run_id", ""))


def normalize_archive_key_part(value: str) -> str:
    return value.replace("\\", "/").strip().lower()


def archive_issue_key(issue_type: str, row: dict[str, str]) -> tuple[str, str, str, str]:
    detail = row.get("detail") or row.get("error") or row.get("reason") or ""
    return (
        normalize_archive_key_part(issue_type),
        normalize_archive_key_part(str(row.get("root_id", ""))),
        normalize_archive_key_part(str(row.get("archive_relative_path", ""))),
        normalize_archive_key_part(str(detail)),
    )


def archive_issue_hash_from_key(key: tuple[str, str, str, str]) -> str:
    raw = "::".join(key).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def archive_issue_hash(issue_type: str, row: dict[str, str]) -> str:
    return archive_issue_hash_from_key(archive_issue_key(issue_type, row))


def load_archive_exceptions(root: Path) -> list[dict[str, str]]:
    path = root / ARCHIVE_EXCEPTION_FILE
    rows = []
    for row in read_csv_rows(path):
        status = str(row.get("status", "")).strip().lower()
        if status in {"disabled", "inactive", "ignore"}:
            continue
        rows.append(row)
    return rows


def triage_archive_issues(root: Path, local_dir: Path) -> dict[str, object]:
    failures = read_csv_rows(local_dir / "local_archive_failures.csv")
    truncations = read_csv_rows(local_dir / "local_archive_truncations.csv")
    exception_rows = load_archive_exceptions(root)
    exception_hashes = {}
    for row in exception_rows:
        key_hash = str(row.get("issue_key_hash", "")).strip().lower()
        if not key_hash:
            key_hash = archive_issue_hash(str(row.get("issue_type", "")), row)
        exception_hashes[key_hash] = row

    resolved_failures = [row for row in failures if archive_issue_hash("failure", row) in exception_hashes]
    unresolved_failures = [row for row in failures if archive_issue_hash("failure", row) not in exception_hashes]
    resolved_truncations = [row for row in truncations if archive_issue_hash("truncation", row) in exception_hashes]
    unresolved_truncations = [row for row in truncations if archive_issue_hash("truncation", row) not in exception_hashes]

    active_hashes = {archive_issue_hash("failure", row) for row in failures} | {
        archive_issue_hash("truncation", row) for row in truncations
    }
    unused_exceptions = [row for key_hash, row in exception_hashes.items() if key_hash not in active_hashes]

    return {
        "failures": failures,
        "truncations": truncations,
        "resolved_failures": resolved_failures,
        "resolved_truncations": resolved_truncations,
        "unresolved_failures": unresolved_failures,
        "unresolved_truncations": unresolved_truncations,
        "unused_exceptions": unused_exceptions,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Check the private wiki intake pipeline health.")
    parser.add_argument("root", nargs="?", default=".", help="Obsidian vault root")
    parser.add_argument("--max-age-hours", type=float, default=24.0, help="Maximum acceptable age for generated local reports")
    parser.add_argument("--automation-home", default=str(Path.home() / ".codex" / "automations"), help="Codex automation directory")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    local_dir = local_index_cache_dir(root)
    automation_home = Path(args.automation_home)
    errors: list[str] = []
    warnings: list[str] = []

    for name in CRITICAL_FILES:
        path = local_dir / name
        if not path.exists():
            errors.append(f"missing local discovery file: {name}")

    for name in ["local_source_inventory.csv", "local_sensitive_findings.csv", "local_timeline_index.csv", "local_discovery_summary.json"]:
        path = local_dir / name
        file_age = age_hours(path)
        if file_age is not None and file_age > args.max_age_hours:
            warnings.append(f"stale local discovery file: {name} age_hours={file_age:.1f}")

    for automation_id in REQUIRED_AUTOMATIONS:
        status = automation_status(automation_home, automation_id)
        if status != "active":
            errors.append(f"automation {automation_id} is {status}")

    latest_status, latest_run_id = latest_run_status(local_dir / "private_intake_runs.jsonl")
    if latest_status == "missing":
        errors.append("private intake run log is missing")
    elif latest_status != "success":
        errors.append(f"latest private intake run is {latest_status} run_id={latest_run_id}")

    discovery = read_json(local_dir / "local_discovery_summary.json")
    archive = read_json(local_dir / "local_archive_summary.json")
    archive_triage = triage_archive_issues(root, local_dir)
    if int(discovery.get("files", 0) or 0) == 0:
        errors.append("local source inventory has zero files")
    if int(discovery.get("high_findings", 0) or 0) > 0 and csv_count(local_dir / "local_finding_disposition.csv") == 0:
        errors.append("high-risk findings exist but disposition table is empty")
    if archive_triage["unresolved_failures"]:
        warnings.append(f"untriaged archive failures remain: {len(archive_triage['unresolved_failures'])}")
    if archive_triage["unresolved_truncations"]:
        warnings.append(f"untriaged archive member truncations remain: {len(archive_triage['unresolved_truncations'])}")
    if archive_triage["unused_exceptions"]:
        warnings.append(f"stale archive exceptions remain: {len(archive_triage['unused_exceptions'])}")

    roots_rows = csv_count(local_dir / "local_roots.csv")
    source_rows = csv_count(local_dir / "local_source_inventory.csv")
    finding_rows = csv_count(local_dir / "local_sensitive_findings.csv")
    disposition_rows = csv_count(local_dir / "local_finding_disposition.csv")
    run_rows = len(read_jsonl(local_dir / "private_intake_runs.jsonl"))

    print(f"private_pipeline_roots: {roots_rows}")
    print(f"private_pipeline_source_rows: {source_rows}")
    print(f"private_pipeline_finding_rows: {finding_rows}")
    print(f"private_pipeline_disposition_rows: {disposition_rows}")
    print(f"private_pipeline_run_log_rows: {run_rows}")
    print(f"private_pipeline_latest_run: {latest_run_id or '-'} {latest_status}")
    print(f"private_pipeline_archive_failures: {archive.get('archive_failures', 0)}")
    print(f"private_pipeline_archive_truncations: {archive.get('archive_files_truncated', 0)}")
    print(f"private_pipeline_archive_failure_exceptions: {len(archive_triage['resolved_failures'])}")
    print(f"private_pipeline_archive_truncation_exceptions: {len(archive_triage['resolved_truncations'])}")
    print(f"private_pipeline_archive_untriaged_failures: {len(archive_triage['unresolved_failures'])}")
    print(f"private_pipeline_archive_untriaged_truncations: {len(archive_triage['unresolved_truncations'])}")
    print(f"private_pipeline_archive_stale_exceptions: {len(archive_triage['unused_exceptions'])}")
    print(f"private_pipeline_cache: external")
    print(f"private_pipeline_errors: {len(errors)}")
    print(f"private_pipeline_warnings: {len(warnings)}")
    for error in errors:
        print(f"ERROR {error}")
    for warning in warnings:
        print(f"WARNING {warning}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
