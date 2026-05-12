#!/usr/bin/env python3
from __future__ import annotations

import csv
import hashlib
import os
import re
import sys
from dataclasses import dataclass
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
    "__pycache__",
}
IGNORE_FILES = {"hot.md"}
TEXT_EXTS = {".md", ".txt", ".csv", ".json", ".yml", ".yaml", ".py", ".js", ".ts", ".toml", ".gitignore", ""}
ALLOW_MARKER_FILES = {
    ".gitignore",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "scripts/build_private_wiki.py",
    "scripts/build_public_inventory.py",
    "scripts/check_private_wiki.py",
    "scripts/wiki_check.py",
    "wiki/sources-and-data-policy.md",
    "scripts/privacy_scan.py",
}


@dataclass(frozen=True)
class PatternRule:
    name: str
    severity: str
    regex: re.Pattern[str]


PATTERNS = [
    PatternRule("openai_token", "high", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b")),
    PatternRule("github_token", "high", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b")),
    PatternRule("anthropic_token", "high", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    PatternRule("google_api_key", "high", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    PatternRule("aws_access_key", "high", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    PatternRule("azure_connection_string", "high", re.compile(r"(?i)\b(AccountKey|SharedAccessKey|SharedAccessSignature)=['\"]?[^'\"\s;]{16,}")),
    PatternRule("jwt", "high", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    PatternRule("ssh_private_key", "high", re.compile(r"-----BEGIN (?:OPENSSH|RSA|DSA|EC|PRIVATE) PRIVATE KEY-----")),
    PatternRule(
        "secret_assignment",
        "high",
        re.compile(r"(?i)\b(api[_-]?key|secret|token|password|passwd|cookie|session)\b\s*[:=]\s*['\"]?[A-Za-z0-9_./+%=-]{8,}"),
    ),
    PatternRule("local_path", "high", re.compile(r"(?i)((?<![A-Za-z])[A-Z]:[\\/][^\s)\]\"']+|/Users/[^\s)\]\"']+|/home/[^\s)\]\"']+)")),
    PatternRule("email", "high", re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")),
    PatternRule("phone_cn", "high", re.compile(r"\b1[3-9]\d{9}\b")),
    PatternRule("china_id", "high", re.compile(r"\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b")),
    PatternRule("bank_card_like", "high", re.compile(r"\b(?:\d[ -]*?){16,19}\b")),
    PatternRule("private_marker", "high", re.compile(r"(?i)(local_private|archived_sessions|个人档案|私聊|凭据|密钥|身份证|银行卡)")),
]


def iter_files(root: Path):
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith("00 - ")]
        for name in names:
            if name in IGNORE_FILES:
                continue
            path = Path(current) / name
            if path.suffix.lower() in TEXT_EXTS or name.startswith(".gitignore"):
                yield path


def hash_excerpt(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8", errors="replace")).hexdigest()[:16]


def should_skip_rule(rel: str, rule_name: str) -> bool:
    if rel == "scripts/privacy_scan.py":
        return True
    if rel == "tests/test_wiki_tools.py":
        return True
    if rule_name == "private_marker" and rel in ALLOW_MARKER_FILES:
        return True
    return False


def scan_text(rel: str, text: str) -> list[dict[str, str | int]]:
    rows: list[dict[str, str | int]] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        for rule in PATTERNS:
            if should_skip_rule(rel, rule.name):
                continue
            if rule.regex.search(line):
                rows.append(
                    {
                        "path": rel,
                        "severity": rule.severity,
                        "rule": rule.name,
                        "line": line_number,
                        "excerpt_hash": hash_excerpt(line),
                    }
                )
                break
    return rows


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    rows: list[dict[str, str | int]] = []
    for path in iter_files(root):
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        rows.extend(scan_text(rel, text))

    report = root / "manifests" / "privacy_scan_report.csv"
    report.parent.mkdir(parents=True, exist_ok=True)
    with report.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["path", "severity", "rule", "line", "excerpt_hash"])
        writer.writeheader()
        writer.writerows(rows)

    high = [r for r in rows if r["severity"] == "high"]
    print(f"files_with_findings: {len({r['path'] for r in rows})}")
    print(f"high_risk_findings: {len(high)}")
    print(f"report: {report}")
    for row in high[:80]:
        print(f"HIGH {row['path']}:{row['line']} {row['rule']} {row['excerpt_hash']}")
    if len(high) > 80:
        print(f"HIGH truncated {len(high) - 80} additional findings")
    return 1 if high else 0


if __name__ == "__main__":
    raise SystemExit(main())
