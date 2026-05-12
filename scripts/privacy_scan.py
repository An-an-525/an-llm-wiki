#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import re
import sys
from pathlib import Path

IGNORE_DIRS = {".git", ".obsidian", ".trash", ".claude", ".claudian", "_raw", "_archives", "node_modules"}
TEXT_EXTS = {".md", ".txt", ".csv", ".json", ".yml", ".yaml", ".py", ".js", ".ts", ".toml", ".gitignore", ""}
ALLOW_MARKER_FILES = {
    ".gitignore",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "wiki/sources-and-data-policy.md",
    "scripts/privacy_scan.py",
}
PATTERNS = [
    ("secret_assignment", "high", re.compile(r"(?i)\b(api[_-]?key|secret|token|password|passwd|cookie|session)\b\s*[:=]\s*['\"]?[A-Za-z0-9_./+%=-]{8,}")),
    ("local_path", "high", re.compile(r"(?i)((?<![A-Za-z])[A-Z]:[\\/]|/Users/|/home/)")),
    ("email", "high", re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")),
    ("phone_cn", "high", re.compile(r"\b1[3-9]\d{9}\b")),
    ("private_marker", "high", re.compile(r"(?i)(local_private|archived_sessions|cookie|session|个人档案|私聊|凭据|密钥|身份证|银行卡)")),
]


def iter_files(root: Path):
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for name in names:
            path = Path(current) / name
            if path.suffix.lower() in TEXT_EXTS or name.startswith(".gitignore"):
                yield path


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    rows = []
    for path in iter_files(root):
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        for name, severity, pattern in PATTERNS:
            if name == "local_path" and rel == "scripts/privacy_scan.py":
                continue
            if name == "private_marker" and rel in ALLOW_MARKER_FILES:
                continue
            if pattern.search(text):
                rows.append({"path": rel, "severity": severity, "rule": name})
                break
    report = root / "manifests" / "privacy_scan_report.csv"
    report.parent.mkdir(parents=True, exist_ok=True)
    with report.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["path", "severity", "rule"])
        writer.writeheader()
        writer.writerows(rows)
    high = [r for r in rows if r["severity"] == "high"]
    print(f"files_with_findings: {len(rows)}")
    print(f"high_risk_findings: {len(high)}")
    print(f"report: {report}")
    for row in high[:80]:
        print(f"HIGH {row['path']} {row['rule']}")
    if len(high) > 80:
        print(f"HIGH truncated {len(high) - 80} additional findings")
    return 1 if high else 0


if __name__ == "__main__":
    raise SystemExit(main())
