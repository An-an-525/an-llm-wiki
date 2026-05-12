#!/usr/bin/env python3
from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

PRIVATE_OUT = Path("inbox/private/local-recovery-2026-05-12/local-discovery")
ROOTS_FILE = PRIVATE_OUT / "roots.csv"

MAX_TEXT_SCAN_BYTES = 2_000_000
MAX_HASH_BYTES = 2_000_000
MAX_FINDINGS_PER_FILE = 80
MAX_DATES_PER_FILE = 40

TEXT_EXTS = {
    ".bat",
    ".cmd",
    ".conf",
    ".cfg",
    ".css",
    ".csv",
    ".env",
    ".html",
    ".ini",
    ".ipynb",
    ".js",
    ".json",
    ".jsonl",
    ".log",
    ".md",
    ".mdx",
    ".ps1",
    ".py",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
    "",
}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".heic", ".svg"}
DOCUMENT_EXTS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".epub"}
DATABASE_EXTS = {".sqlite", ".sqlite3", ".db", ".duckdb", ".mdb"}
ARCHIVE_EXTS = {".zip", ".7z", ".rar", ".tar", ".gz", ".bz2", ".xz"}

EXCLUDE_DIRS = {
    "$Recycle.Bin",
    ".cache",
    ".git",
    ".gradle",
    ".idea",
    ".next",
    ".nuxt",
    ".pnpm-store",
    ".pytest_cache",
    ".ruff_cache",
    ".svn",
    ".tox",
    ".turbo",
    ".venv",
    ".vscode",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "env",
    "node_modules",
    "out",
    "target",
    "vendor",
    "venv",
}

SENSITIVE_PATH_TERMS = re.compile(
    r"(?i)(\.ssh|\.aws|\.azure|\.gnupg|\.kube|auth|credential|credentials|cookie|cookies|secret|secrets|session|token|key|password|passwd|\.env)"
)
PERSONAL_PATH_TERMS = re.compile(
    r"(?i)(personal|profile|memory|memories|private|wechat|weixin|wxwork|tencent|个人|私密|私聊|微信|简历|档案)"
)
AGENT_PATH_TERMS = re.compile(r"(?i)(codex|claude|agents?|cursor|gemini|qwen|openclaw|hermes|serena|mcp|skills?)")
PROJECT_PATH_TERMS = re.compile(r"(?i)(github|projects?|repo|workspace|src|app|one-hub|runtime|evidence|项目|工程)")


@dataclass(frozen=True)
class PatternRule:
    name: str
    severity: str
    group: str
    regex: re.Pattern[str]


PATTERNS = [
    PatternRule("openai_token", "high", "credential", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b")),
    PatternRule("github_token", "high", "credential", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b")),
    PatternRule("anthropic_token", "high", "credential", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    PatternRule("google_api_key", "high", "credential", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    PatternRule("aws_access_key", "high", "credential", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    PatternRule("azure_connection_string", "high", "credential", re.compile(r"(?i)\b(AccountKey|SharedAccessKey|SharedAccessSignature)=['\"]?[^'\"\s;]{16,}")),
    PatternRule("jwt", "high", "credential", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    PatternRule("ssh_private_key", "high", "credential", re.compile(r"-----BEGIN (?:OPENSSH|RSA|DSA|EC|PRIVATE) PRIVATE KEY-----")),
    PatternRule("private_key_block", "high", "credential", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    PatternRule(
        "secret_assignment",
        "high",
        "credential",
        re.compile(r"(?i)\b(api[_-]?key|secret|token|password|passwd|cookie|session)\b\s*[:=]\s*['\"]?[A-Za-z0-9_./+%=-]{8,}"),
    ),
    PatternRule("cookie_session_term", "medium", "credential", re.compile(r"(?i)\b(cookie|sessionid|csrf|xsrf|refresh[_-]?token|access[_-]?token)\b")),
    PatternRule("local_path", "medium", "local-path", re.compile(r"(?i)((?<![A-Za-z])[A-Z]:[\\/][^\s)\]\"']+|/Users/[^\s)\]\"']+|/home/[^\s)\]\"']+)")),
    PatternRule("email", "medium", "personal", re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")),
    PatternRule("phone_cn", "medium", "personal", re.compile(r"\b1[3-9]\d{9}\b")),
    PatternRule("china_id", "high", "personal", re.compile(r"\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b")),
    PatternRule("bank_card_like", "high", "personal", re.compile(r"\b(?:\d[ -]*?){16,19}\b")),
    PatternRule("wechat_marker", "medium", "personal", re.compile(r"(?i)(wechat|weixin|wxid|微信|企业微信|私聊)")),
    PatternRule("personal_memory_marker", "medium", "personal", re.compile(r"(?i)(personal memory|profile|private memory|个人档案|个人资料|记忆|隐私)")),
]

DATE_PATTERNS = [
    re.compile(r"(?<!\d)((?:19|20)\d{2})[-_/年.]([01]\d)[-_/月.]([0-3]\d)(?:日)?(?!\d)"),
    re.compile(r"(?<!\d)((?:19|20)\d{2})([01]\d)([0-3]\d)(?!\d)"),
]


def iso_mtime(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(timespec="seconds")


def safe_rel(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def path_id(path: Path) -> str:
    raw = path.as_posix().strip("/").replace(":", "")
    parts = [p for p in raw.split("/") if p]
    label = "-".join(parts[-3:]) if len(parts) >= 3 else "-".join(parts)
    label = re.sub(r"[^0-9A-Za-z._\-\u4e00-\u9fff]+", "-", label).strip("-").lower()
    digest = hashlib.sha256(path.as_posix().encode("utf-8", errors="replace")).hexdigest()[:8]
    return f"{label or 'root'}-{digest}"


def discover_roots(vault_root: Path) -> list[Path]:
    home = Path.home()
    candidates: list[Path] = []
    for name in [
        ".codex",
        ".agents",
        ".claude",
        ".cursor",
        ".gemini",
        ".qwen",
        ".openclaw",
        ".mempalace",
        ".ssh",
        ".aws",
        ".azure",
    ]:
        candidates.append(home / name)
    documents = home / "Documents"
    for name in ["Codex", "xwechat_files", "Tencent Files", "WXWork"]:
        candidates.append(documents / name)
    fake_desktop = home / "假桌面"
    candidates.extend([fake_desktop / "AI_Commander_Docs", fake_desktop])

    for drive in ["D:/"]:
        drive_path = Path(drive)
        if not drive_path.exists():
            continue
        for child in drive_path.iterdir():
            if not child.is_dir():
                continue
            name = child.name.lower()
            if child.resolve() == vault_root.resolve():
                continue
            if (
                "github" in name
                or "project" in name
                or "runtime" in name
                or "evidence" in name
                or "backup" in name
                or "mempalace" in name
                or "codex" in name
                or "wechat" in name
                or "xwechat" in name
                or "微信" in child.name
                or "项目" in child.name
            ):
                candidates.append(child)

    seen: set[Path] = set()
    roots: list[Path] = []
    for candidate in candidates:
        if not candidate.exists() or not candidate.is_dir():
            continue
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        roots.append(resolved)
    return roots


def ensure_roots_file(vault_root: Path) -> None:
    roots_path = vault_root / ROOTS_FILE
    if roots_path.exists():
        return
    roots_path.parent.mkdir(parents=True, exist_ok=True)
    roots = discover_roots(vault_root)
    with roots_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["root_id", "path", "profile", "enabled"])
        writer.writeheader()
        for root in roots:
            writer.writerow({"root_id": path_id(root), "path": str(root), "profile": "default", "enabled": "1"})


def read_roots(vault_root: Path) -> list[dict[str, str]]:
    ensure_roots_file(vault_root)
    with (vault_root / ROOTS_FILE).open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    results = []
    for row in rows:
        if row.get("enabled", "1").strip() in {"0", "false", "False", "no"}:
            continue
        path = Path(row.get("path", "")).expanduser()
        if path.exists() and path.is_dir():
            root_id = row.get("root_id") or path_id(path)
            results.append({"root_id": root_id, "path": str(path.resolve()), "profile": row.get("profile", "default")})
    return results


def should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS or name.endswith(".egg-info")


def iter_files(root: Path):
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]
        for name in names:
            yield Path(current) / name


def file_kind(path: Path) -> str:
    ext = path.suffix.lower()
    name = path.name.lower()
    if name in {".env", ".gitignore"}:
        return "text"
    if ext in TEXT_EXTS:
        return "text"
    if ext in IMAGE_EXTS:
        return "image"
    if ext in DOCUMENT_EXTS:
        return "document"
    if ext in DATABASE_EXTS:
        return "database"
    if ext in ARCHIVE_EXTS:
        return "archive"
    return "binary"


def category_for(root_id: str, rel: str, path: Path) -> str:
    haystack = f"{root_id}/{rel}/{path.name}"
    if SENSITIVE_PATH_TERMS.search(haystack):
        return "security-and-credentials"
    if AGENT_PATH_TERMS.search(haystack):
        return "agent-context"
    if PERSONAL_PATH_TERMS.search(haystack):
        return "personal-and-chat-context"
    if PROJECT_PATH_TERMS.search(haystack):
        return "project-roots"
    return "local-assets"


def path_risk_flags(path: Path, rel: str) -> list[str]:
    text = f"{path.as_posix()}/{rel}"
    flags = []
    if SENSITIVE_PATH_TERMS.search(text):
        flags.append("sensitive-path")
    if PERSONAL_PATH_TERMS.search(text):
        flags.append("personal-path")
    return flags


def sha256_file(path: Path, size: int, kind: str, risk_flags: list[str]) -> tuple[str, str]:
    if kind != "text" and "sensitive-path" not in risk_flags:
        return "", "metadata-only"
    if size > MAX_HASH_BYTES:
        return "", "skipped-large"
    digest = hashlib.sha256()
    try:
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest(), "complete"
    except OSError:
        return "", "read-error"


def read_text_sample(path: Path, size: int) -> tuple[str, str]:
    try:
        if size <= MAX_TEXT_SCAN_BYTES:
            return path.read_text(encoding="utf-8", errors="replace"), "complete"
        half = MAX_TEXT_SCAN_BYTES // 2
        with path.open("rb") as f:
            head = f.read(half)
            f.seek(max(size - half, 0))
            tail = f.read(half)
        text = head.decode("utf-8", errors="replace") + "\n\n[...sample gap...]\n\n" + tail.decode("utf-8", errors="replace")
        return text, "sampled"
    except OSError:
        return "", "read-error"


def hash_excerpt(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8", errors="replace")).hexdigest()[:16]


def find_dates(text: str) -> list[str]:
    dates: set[str] = set()
    for pattern in DATE_PATTERNS:
        for match in pattern.finditer(text):
            year, month, day = match.group(1), match.group(2), match.group(3)
            try:
                parsed = datetime(int(year), int(month), int(day))
            except ValueError:
                continue
            dates.add(parsed.strftime("%Y-%m-%d"))
            if len(dates) >= MAX_DATES_PER_FILE:
                return sorted(dates)
    return sorted(dates)


def scan_text(root_id: str, rel: str, text: str) -> tuple[list[dict[str, str]], list[dict[str, str]], Counter]:
    findings: list[dict[str, str]] = []
    timeline: list[dict[str, str]] = []
    groups: Counter = Counter()
    for line_number, line in enumerate(text.splitlines(), start=1):
        for rule in PATTERNS:
            if rule.regex.search(line):
                findings.append(
                    {
                        "root_id": root_id,
                        "relative_path": rel,
                        "severity": rule.severity,
                        "group": rule.group,
                        "rule": rule.name,
                        "line": str(line_number),
                        "excerpt_hash": hash_excerpt(line),
                    }
                )
                groups[rule.group] += 1
                break
        if len(findings) >= MAX_FINDINGS_PER_FILE:
            break
    for date_value in find_dates(text):
        timeline.append({"root_id": root_id, "relative_path": rel, "date": date_value, "source": "content", "context_hash": hash_excerpt(rel + date_value)})
    return findings, timeline, groups


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hydrate_stats(inventory_rows: list[dict[str, str]]) -> tuple[dict[str, Counter], dict[str, str]]:
    root_stats: dict[str, Counter] = defaultdict(Counter)
    root_latest: dict[str, str] = {}
    for row in inventory_rows:
        root_id = row.get("root_id", "")
        size = int(row.get("size_bytes") or 0)
        modified_at = row.get("modified_at", "")
        root_stats[root_id]["files"] += 1
        root_stats[root_id][f"kind:{row.get('kind', '')}"] += 1
        root_stats[root_id][f"category:{row.get('category', '')}"] += 1
        root_stats[root_id]["bytes"] += size
        if modified_at and (not root_latest.get(root_id) or modified_at > root_latest[root_id]):
            root_latest[root_id] = modified_at
    return root_stats, root_latest


def write_reports(
    out: Path,
    roots: list[dict[str, str]],
    root_paths: dict[str, str],
    root_stats: dict[str, Counter],
    root_latest: dict[str, str],
    inventory_rows: list[dict[str, str]],
    finding_rows: list[dict[str, str]],
    timeline_rows: list[dict[str, str]],
) -> None:
    root_rows: list[dict[str, str]] = []
    findings_by_root = Counter(row["root_id"] for row in finding_rows)
    timeline_by_root = Counter(row["root_id"] for row in timeline_rows)
    for root in roots:
        root_id = root["root_id"]
        stats = root_stats[root_id]
        root_rows.append(
            {
                "root_id": root_id,
                "path": root_paths[root_id],
                "profile": root.get("profile", "default"),
                "files": str(stats["files"]),
                "bytes": str(stats["bytes"]),
                "latest_modified_at": root_latest.get(root_id, ""),
                "findings": str(findings_by_root[root_id]),
                "timeline_rows": str(timeline_by_root[root_id]),
                "kind_counts": json.dumps({k[5:]: v for k, v in stats.items() if k.startswith("kind:")}, ensure_ascii=False, sort_keys=True),
                "category_counts": json.dumps({k[9:]: v for k, v in stats.items() if k.startswith("category:")}, ensure_ascii=False, sort_keys=True),
            }
        )

    write_csv(
        out / "local_roots.csv",
        ["root_id", "path", "profile", "files", "bytes", "latest_modified_at", "findings", "timeline_rows", "kind_counts", "category_counts"],
        root_rows,
    )
    write_csv(
        out / "local_source_inventory.csv",
        ["root_id", "absolute_path", "relative_path", "name", "extension", "kind", "category", "size_bytes", "modified_at", "sha256", "hash_status", "content_scan", "risk_flags"],
        inventory_rows,
    )
    write_csv(
        out / "local_sensitive_findings.csv",
        ["root_id", "relative_path", "severity", "group", "rule", "line", "excerpt_hash"],
        finding_rows,
    )
    write_csv(
        out / "local_timeline_index.csv",
        ["root_id", "relative_path", "date", "source", "context_hash"],
        timeline_rows,
    )

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "roots": len(roots),
        "roots_with_files": sum(1 for root in roots if root_stats[root["root_id"]]["files"]),
        "files": len(inventory_rows),
        "bytes": sum(int(r["size_bytes"]) for r in inventory_rows),
        "findings": len(finding_rows),
        "high_findings": sum(1 for r in finding_rows if r["severity"] == "high"),
        "timeline_rows": len(timeline_rows),
        "kind_counts": Counter(r["kind"] for r in inventory_rows),
        "category_counts": Counter(r["category"] for r in inventory_rows),
        "finding_rule_counts": Counter(r["rule"] for r in finding_rows),
        "finding_group_counts": Counter(r["group"] for r in finding_rows),
    }
    serializable = {
        key: (dict(value) if isinstance(value, Counter) else value)
        for key, value in summary.items()
    }
    (out / "local_discovery_summary.json").write_text(json.dumps(serializable, ensure_ascii=False, indent=2), encoding="utf-8")


def build(vault_root: Path, reset: bool = False) -> int:
    out = vault_root / PRIVATE_OUT
    out.mkdir(parents=True, exist_ok=True)
    roots = read_roots(vault_root)

    inventory_rows: list[dict[str, str]] = [] if reset else read_csv(out / "local_source_inventory.csv")
    finding_rows: list[dict[str, str]] = [] if reset else read_csv(out / "local_sensitive_findings.csv")
    timeline_rows: list[dict[str, str]] = [] if reset else read_csv(out / "local_timeline_index.csv")
    root_stats, root_latest = hydrate_stats(inventory_rows)
    root_paths = {row["root_id"]: row["path"] for row in roots}
    indexed_files = {(row.get("root_id", ""), row.get("relative_path", "")) for row in inventory_rows}

    for root_row in roots:
        root_id = root_row["root_id"]
        root_path = Path(root_row["path"])
        root_new_files = 0
        for path in iter_files(root_path):
            try:
                stat = path.stat()
            except OSError:
                continue
            size = int(stat.st_size)
            rel = safe_rel(path, root_path)
            if (root_id, rel) in indexed_files:
                continue
            kind = file_kind(path)
            category = category_for(root_id, rel, path)
            modified_at = iso_mtime(path)
            risk_flags = path_risk_flags(path, rel)
            sha256, hash_status = sha256_file(path, size, kind, risk_flags)
            content_scan = "not-text"
            content_groups: Counter = Counter()

            if kind == "text":
                text, content_scan = read_text_sample(path, size)
                if text:
                    text_findings, text_timeline, content_groups = scan_text(root_id, rel, text)
                    finding_rows.extend(text_findings)
                    timeline_rows.extend(text_timeline[:MAX_DATES_PER_FILE])
                    if content_scan == "sampled":
                        risk_flags.append("large-text-sampled")
                elif content_scan == "read-error":
                    risk_flags.append("text-read-error")
            elif kind in {"database", "archive"}:
                risk_flags.append(f"{kind}-metadata-only")

            if content_groups:
                risk_flags.extend(sorted({f"{group}-content" for group in content_groups}))

            mtime_date = modified_at[:10]
            timeline_rows.append({"root_id": root_id, "relative_path": rel, "date": mtime_date, "source": "mtime", "context_hash": hash_excerpt(rel + modified_at)})

            row = {
                "root_id": root_id,
                "absolute_path": str(path),
                "relative_path": rel,
                "name": path.name,
                "extension": path.suffix.lower(),
                "kind": kind,
                "category": category,
                "size_bytes": str(size),
                "modified_at": modified_at,
                "sha256": sha256,
                "hash_status": hash_status,
                "content_scan": content_scan,
                "risk_flags": ";".join(sorted(set(risk_flags))),
            }
            inventory_rows.append(row)
            indexed_files.add((root_id, rel))
            root_new_files += 1
            root_stats[root_id]["files"] += 1
            root_stats[root_id][f"kind:{kind}"] += 1
            root_stats[root_id][f"category:{category}"] += 1
            root_stats[root_id]["bytes"] += size
            if not root_latest.get(root_id) or modified_at > root_latest[root_id]:
                root_latest[root_id] = modified_at
            if root_new_files % 1000 == 0:
                write_reports(out, roots, root_paths, root_stats, root_latest, inventory_rows, finding_rows, timeline_rows)
                print(f"checkpoint_root: {root_id} new_files={root_new_files} total_files={root_stats[root_id]['files']}")
        write_reports(out, roots, root_paths, root_stats, root_latest, inventory_rows, finding_rows, timeline_rows)
        print(f"scanned_root: {root_id} new_files={root_new_files} total_files={root_stats[root_id]['files']} findings={sum(1 for row in finding_rows if row['root_id'] == root_id)}")

    write_reports(out, roots, root_paths, root_stats, root_latest, inventory_rows, finding_rows, timeline_rows)
    (out / "README.md").write_text(
        "# Local Discovery Reports\n\n"
        "These reports are local-only and ignored by Git. They index source locations, file metadata, privacy findings, credential candidates, and timeline dates without copying secret values into Markdown.\n",
        encoding="utf-8",
    )

    summary = json.loads((out / "local_discovery_summary.json").read_text(encoding="utf-8"))
    print(f"local_discovery_roots: {len(roots)}")
    print(f"local_discovery_files: {len(inventory_rows)}")
    print(f"local_discovery_findings: {len(finding_rows)}")
    print(f"local_discovery_high_findings: {summary.get('high_findings', 0)}")
    print(f"local_discovery_timeline_rows: {len(timeline_rows)}")
    print(f"local_discovery_dir: {out}")
    return 0


def main() -> int:
    args = [arg for arg in sys.argv[1:] if arg != "--reset"]
    reset = "--reset" in sys.argv[1:]
    root = Path(args[0]).resolve() if args else Path.cwd().resolve()
    return build(root, reset=reset)


if __name__ == "__main__":
    raise SystemExit(main())
