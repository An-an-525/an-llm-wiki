#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, local_index_cache_dir
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, local_index_cache_dir

LOCAL_DISCOVERY_DIR = LEGACY_LOCAL_DISCOVERY_DIR
RUN_LOG_NAME = "private_intake_runs.jsonl"
LOCK_FILE_NAME = "private_intake.lock"
DISPOSITION_FILE_NAME = "local_finding_disposition.csv"

DISPOSITION_FIELDS = [
    "finding_key",
    "root_id",
    "relative_path",
    "severity",
    "group",
    "rule",
    "line",
    "excerpt_hash",
    "review_status",
    "disposition",
    "last_reviewed",
    "notes",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def append_jsonl(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n")


def finding_key(row: dict[str, str]) -> str:
    raw = "|".join(
        [
            row.get("root_id", ""),
            row.get("relative_path", ""),
            row.get("severity", ""),
            row.get("group", ""),
            row.get("rule", ""),
            row.get("line", ""),
            row.get("excerpt_hash", ""),
        ]
    )
    return hashlib.sha256(raw.encode("utf-8", errors="replace")).hexdigest()[:24]


def ensure_disposition_table(root: Path) -> dict[str, int]:
    local_dir = local_index_cache_dir(root)
    findings_path = local_dir / "local_sensitive_findings.csv"
    existing_rows = read_csv(local_dir / DISPOSITION_FILE_NAME)
    existing_by_key = {row.get("finding_key", ""): row for row in existing_rows if row.get("finding_key")}

    rows: list[dict[str, str]] = []
    selected = 0
    preserved = 0
    for finding in read_csv(findings_path):
        if finding.get("severity") != "high" and finding.get("group") != "credential":
            continue
        selected += 1
        key = finding_key(finding)
        existing = existing_by_key.get(key, {})
        if existing:
            preserved += 1
        rows.append(
            {
                "finding_key": key,
                "root_id": finding.get("root_id", ""),
                "relative_path": finding.get("relative_path", ""),
                "severity": finding.get("severity", ""),
                "group": finding.get("group", ""),
                "rule": finding.get("rule", ""),
                "line": finding.get("line", ""),
                "excerpt_hash": finding.get("excerpt_hash", ""),
                "review_status": existing.get("review_status", "unreviewed"),
                "disposition": existing.get("disposition", ""),
                "last_reviewed": existing.get("last_reviewed", ""),
                "notes": existing.get("notes", ""),
            }
        )

    rows.sort(key=lambda row: (row["review_status"] != "unreviewed", row["severity"] != "high", row["group"], row["rule"], row["root_id"], row["relative_path"]))
    write_csv(local_dir / DISPOSITION_FILE_NAME, DISPOSITION_FIELDS, rows)
    return {
        "disposition_rows": len(rows),
        "selected_findings": selected,
        "preserved_rows": preserved,
        "new_rows": len(rows) - preserved,
    }


def run_step(root: Path, name: str, command: list[str]) -> dict:
    started = time.monotonic()
    result = subprocess.run(command, cwd=root, text=True, capture_output=True, check=False)
    elapsed = round(time.monotonic() - started, 3)
    stdout = result.stdout.strip()
    stderr = result.stderr.strip()
    return {
        "name": name,
        "returncode": result.returncode,
        "seconds": elapsed,
        "stdout_tail": stdout[-4000:],
        "stderr_tail": stderr[-4000:],
    }


def summarize_outputs(root: Path) -> dict:
    local_dir = local_index_cache_dir(root, migrate=False)
    discovery = read_json(local_dir / "local_discovery_summary.json")
    archive = read_json(local_dir / "local_archive_summary.json")
    manifest = read_json(root / "private-wiki" / ".private_wiki_manifest.json")
    disposition_rows = read_csv(local_dir / DISPOSITION_FILE_NAME)
    return {
        "local_files": discovery.get("files", 0),
        "local_findings": discovery.get("findings", 0),
        "local_high_findings": discovery.get("high_findings", 0),
        "archive_members": archive.get("archive_members_indexed", 0),
        "archive_failures": archive.get("archive_failures", 0),
        "private_wiki_pages": manifest.get("pages", 0),
        "disposition_rows": len(disposition_rows),
        "disposition_unreviewed": sum(1 for row in disposition_rows if row.get("review_status") == "unreviewed"),
    }


def acquire_lock(root: Path) -> Path:
    lock = local_index_cache_dir(root) / LOCK_FILE_NAME
    lock.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(str(lock), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError as exc:
        raise RuntimeError(f"private intake lock exists: {lock}") from exc
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(json.dumps({"pid": os.getpid(), "started_at": utc_now()}, ensure_ascii=False))
    return lock


def build_command(args: argparse.Namespace, root: Path, script: str) -> list[str]:
    return [sys.executable, str(root / "scripts" / script), str(root)]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the local private wiki intake pipeline with logging.")
    parser.add_argument("root", nargs="?", default=".", help="Obsidian vault root")
    parser.add_argument("--skip-source-scan", action="store_true", help="Do not run local source inventory")
    parser.add_argument("--skip-archive-scan", action="store_true", help="Do not run local archive inventory")
    parser.add_argument("--skip-private-build", action="store_true", help="Do not rebuild private-wiki")
    parser.add_argument("--skip-private-check", action="store_true", help="Do not run private wiki check")
    parser.add_argument("--reset", action="store_true", help="Pass --reset to source inventory")
    parser.add_argument("--root-id", action="append", default=[], help="Pass a root id to source inventory")
    parser.add_argument("--fail-fast", action="store_true", help="Stop after the first failed step")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    record: dict = {
        "run_id": run_id,
        "started_at": utc_now(),
        "root": str(root),
        "steps": [],
        "status": "running",
    }
    lock: Path | None = None
    exit_code = 0

    try:
        lock = acquire_lock(root)
        if not args.skip_source_scan:
            command = build_command(args, root, "build_local_source_inventory.py")
            if args.reset:
                command.append("--reset")
            for root_id in args.root_id:
                command.extend(["--root-id", root_id])
            step = run_step(root, "local_source_inventory", command)
            record["steps"].append(step)
            if step["returncode"] != 0:
                exit_code = step["returncode"]
                if args.fail_fast:
                    raise RuntimeError("local source inventory failed")

        if not args.skip_archive_scan:
            step = run_step(root, "local_archive_inventory", build_command(args, root, "build_local_archive_inventory.py"))
            record["steps"].append(step)
            if step["returncode"] != 0:
                exit_code = step["returncode"]
                if args.fail_fast:
                    raise RuntimeError("local archive inventory failed")

        disposition_summary = ensure_disposition_table(root)
        record["disposition"] = disposition_summary

        if not args.skip_private_build:
            step = run_step(root, "build_private_wiki", build_command(args, root, "build_private_wiki.py"))
            record["steps"].append(step)
            if step["returncode"] != 0:
                exit_code = step["returncode"]
                if args.fail_fast:
                    raise RuntimeError("private wiki build failed")

        if not args.skip_private_check:
            step = run_step(root, "check_private_wiki", build_command(args, root, "check_private_wiki.py"))
            record["steps"].append(step)
            if step["returncode"] != 0:
                exit_code = step["returncode"]
                if args.fail_fast:
                    raise RuntimeError("private wiki check failed")

        record["outputs"] = summarize_outputs(root)
        record["status"] = "success" if exit_code == 0 else "failed"
    except Exception as exc:
        record["status"] = "failed"
        record["error"] = str(exc)
        exit_code = exit_code or 1
    finally:
        record["finished_at"] = utc_now()
        append_jsonl(local_index_cache_dir(root) / RUN_LOG_NAME, record)
        if not args.skip_private_build:
            refresh = run_step(root, "refresh_private_wiki_after_log", build_command(args, root, "build_private_wiki.py"))
            if refresh["returncode"] != 0:
                print("post_log_private_wiki_refresh: failed")
                print(refresh.get("stderr_tail") or refresh.get("stdout_tail") or "unknown refresh failure")
                exit_code = exit_code or refresh["returncode"]
            else:
                print("post_log_private_wiki_refresh: success")
        if lock and lock.exists():
            lock.unlink()

    print(f"private_intake_run_id: {run_id}")
    print(f"private_intake_status: {record['status']}")
    for key, value in record.get("outputs", {}).items():
        print(f"{key}: {value}")
    print(f"private_intake_log: {local_index_cache_dir(root, migrate=False) / RUN_LOG_NAME}")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
