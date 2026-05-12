#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

LOCAL_DISCOVERY_DIR = Path("inbox/private/local-recovery-2026-05-12/local-discovery")
MAX_MEMBERS_PER_ARCHIVE = 2000

SENSITIVE_TERMS = re.compile(r"(?i)(credential|cookie|secret|session|token|password|passwd|key|\.env|auth)")
PERSONAL_TERMS = re.compile(r"(?i)(personal|private|wechat|weixin|wxid|简历|个人|私密|聊天|微信)")
PROJECT_TERMS = re.compile(r"(?i)(coze|扣子|小安|xiaoan|agent|codex|claude|openclaw|mcp|project|repo|app|项目|智能体)")


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


def file_kind(name: str) -> str:
    ext = Path(name).suffix.lower()
    if ext in {".md", ".txt", ".json", ".jsonl", ".csv", ".ts", ".tsx", ".js", ".jsx", ".py", ".html", ".css", ".wxml", ".wxss", ".yml", ".yaml"}:
        return "text"
    if ext in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"}:
        return "image"
    if ext in {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"}:
        return "document"
    if ext in {".zip", ".7z", ".rar", ".tar", ".gz"}:
        return "archive"
    return "binary"


def risk_flags(text: str) -> str:
    flags = []
    if SENSITIVE_TERMS.search(text):
        flags.append("sensitive-name")
    if PERSONAL_TERMS.search(text):
        flags.append("personal-name")
    if PROJECT_TERMS.search(text):
        flags.append("project-agent-name")
    return ";".join(flags)


def zip_modified(info: zipfile.ZipInfo) -> str:
    try:
        dt = datetime(*info.date_time, tzinfo=timezone.utc)
        return dt.isoformat(timespec="seconds")
    except (TypeError, ValueError):
        return ""


def build(root: Path) -> int:
    local_dir = root / LOCAL_DISCOVERY_DIR
    inventory = read_csv(local_dir / "local_source_inventory.csv")
    archive_rows = [row for row in inventory if row.get("kind") == "archive" and row.get("extension", "").lower() == ".zip"]
    member_rows: list[dict[str, str]] = []
    failures: list[dict[str, str]] = []
    archive_counter: Counter = Counter()

    for archive in archive_rows:
        archive_path = Path(archive.get("absolute_path", ""))
        if not archive_path.exists():
            failures.append({"root_id": archive.get("root_id", ""), "archive_relative_path": archive.get("relative_path", ""), "error": "missing"})
            continue
        try:
            with zipfile.ZipFile(archive_path) as zf:
                infos = zf.infolist()
                archive_counter["archives_scanned"] += 1
                archive_counter["members_total_seen"] += len(infos)
                for info in infos[:MAX_MEMBERS_PER_ARCHIVE]:
                    if info.is_dir():
                        continue
                    name = info.filename.replace("\\", "/")
                    text = f"{archive.get('root_id', '')}/{archive.get('relative_path', '')}/{name}"
                    member_rows.append(
                        {
                            "root_id": archive.get("root_id", ""),
                            "archive_relative_path": archive.get("relative_path", ""),
                            "member_path": name,
                            "name": Path(name).name,
                            "extension": Path(name).suffix.lower(),
                            "kind": file_kind(name),
                            "size_bytes": str(info.file_size),
                            "compressed_size": str(info.compress_size),
                            "modified_at": zip_modified(info),
                            "risk_flags": risk_flags(text),
                        }
                    )
                if len(infos) > MAX_MEMBERS_PER_ARCHIVE:
                    archive_counter["archives_truncated"] += 1
        except (OSError, zipfile.BadZipFile, zipfile.LargeZipFile, RuntimeError) as exc:
            failures.append({"root_id": archive.get("root_id", ""), "archive_relative_path": archive.get("relative_path", ""), "error": type(exc).__name__})

    write_csv(
        local_dir / "local_archive_inventory.csv",
        ["root_id", "archive_relative_path", "member_path", "name", "extension", "kind", "size_bytes", "compressed_size", "modified_at", "risk_flags"],
        member_rows,
    )
    write_csv(local_dir / "local_archive_failures.csv", ["root_id", "archive_relative_path", "error"], failures)
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "archive_files_indexed": len(archive_rows),
        "archive_files_scanned": archive_counter["archives_scanned"],
        "archive_members_indexed": len(member_rows),
        "archive_members_total_seen": archive_counter["members_total_seen"],
        "archive_files_truncated": archive_counter["archives_truncated"],
        "archive_failures": len(failures),
        "member_kind_counts": dict(Counter(row["kind"] for row in member_rows)),
        "member_risk_counts": dict(Counter(row["risk_flags"] or "-" for row in member_rows)),
    }
    (local_dir / "local_archive_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"archive_files_indexed: {len(archive_rows)}")
    print(f"archive_members_indexed: {len(member_rows)}")
    print(f"archive_failures: {len(failures)}")
    print(f"archive_inventory: {local_dir / 'local_archive_inventory.csv'}")
    return 0


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    return build(root)


if __name__ == "__main__":
    raise SystemExit(main())
