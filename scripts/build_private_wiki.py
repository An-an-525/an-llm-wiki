#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
import shutil
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

try:
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, cache_label, local_index_cache_dir
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from local_index_cache import LEGACY_LOCAL_DISCOVERY_DIR, cache_label, local_index_cache_dir

ARCHIVE_ID = "pre-karpathy-rebuild-20260512-143127"
PRIVATE_MANIFEST_DIR = Path("inbox/private/local-recovery-2026-05-12/manifests")
PRIVATE_CAPTURES_DIR = Path("inbox/private/local-recovery-2026-05-12/captures")
LOCAL_DISCOVERY_DIR = LEGACY_LOCAL_DISCOVERY_DIR
OUT_DIR = Path("private-wiki")
TODAY = date.today().isoformat()

SECRET_TEXT_PATTERNS = [
    re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
    re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
]
LOCAL_PATH_TEXT_PATTERN = re.compile(r"(?i)(?<![A-Za-z])[A-Z]:[\\/][^\s)\]\"'|]+")

SECRET_RULES = {
    "openai_token",
    "github_token",
    "anthropic_token",
    "google_api_key",
    "aws_access_key",
    "azure_connection_string",
    "jwt",
    "ssh_private_key",
    "secret_assignment",
    "credential_term",
}
HIGH_SECRET_RULES = {
    "openai_token",
    "github_token",
    "anthropic_token",
    "google_api_key",
    "aws_access_key",
    "azure_connection_string",
    "jwt",
    "ssh_private_key",
    "secret_assignment",
}
PERSONAL_RULES = {
    "email",
    "phone_cn",
    "china_id",
    "bank_card_like",
    "wechat_marker",
    "personal_memory_marker",
}
LOCAL_CONTEXT_RULES = {"local_path"}


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


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


def yaml_list(items: list[str]) -> str:
    if not items:
        return "[]"
    quoted = [json.dumps(item, ensure_ascii=False) for item in items]
    return "[" + ", ".join(quoted) + "]"


def frontmatter(title: str, aliases: list[str], tags: list[str], category: str, page_type: str, summary: str, risk: str = "internal") -> str:
    return (
        "---\n"
        f"title: {title}\n"
        f"aliases: {yaml_list(aliases)}\n"
        f"tags: {yaml_list(tags + ['visibility/internal'])}\n"
        f"category: {category}\n"
        f"type: {page_type}\n"
        "status: active\n"
        f"created: {TODAY}\n"
        f"updated: {TODAY}\n"
        f"sources: {yaml_list([ARCHIVE_ID])}\n"
        f"risk_level: {risk}\n"
        "publication_status: private-only\n"
        f"summary: {json.dumps(summary, ensure_ascii=False)}\n"
        "---\n\n"
    )


def write_page(path: Path, title: str, aliases: list[str], tags: list[str], category: str, page_type: str, summary: str, body: str, risk: str = "internal") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = frontmatter(title, aliases, tags, category, page_type, summary, risk) + f"# {title}\n\n" + body.rstrip() + "\n"
    path.write_text(text, encoding="utf-8")


def md_link(label: str, vault_path: str, current_depth: int = 1) -> str:
    safe = label.replace("|", "-").strip() or "source"
    prefix = "../" * current_depth
    return f"[{safe}]({prefix}{vault_path})"


def private_report_link(label: str, manifest_name: str, current_depth: int = 1) -> str:
    prefix = "../" * current_depth
    return f"[{label}]({prefix}{PRIVATE_MANIFEST_DIR.as_posix()}/{manifest_name})"


def local_report_link(label: str, manifest_name: str, current_depth: int = 1) -> str:
    return f"{cache_label(manifest_name)} ({label})"


def redact_sensitive_text(text: str) -> str:
    clean = text or ""
    for pattern in SECRET_TEXT_PATTERNS:
        clean = pattern.sub("[secret-redacted]", clean)
    clean = LOCAL_PATH_TEXT_PATTERN.sub("[local-path-redacted]", clean)
    return clean


def md_cell(text: str, limit: int = 160) -> str:
    clean = redact_sensitive_text(text).replace("|", "-").replace("\n", " ").strip()
    if len(clean) > limit:
        return clean[: limit - 3] + "..."
    return clean


def row_label(row: dict[str, str]) -> str:
    return redact_sensitive_text(row.get("title") or Path(row.get("relative_path", "source")).stem)[:90].replace("|", "-")


def group_sensitive(rows: list[dict[str, str]], rules: set[str]) -> list[dict[str, str]]:
    return [r for r in rows if r.get("rule") in rules]


def aggregate_by_file(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    grouped: dict[str, dict[str, str | Counter]] = {}
    for row in rows:
        key = row.get("relative_path", "")
        if key not in grouped:
            grouped[key] = {
                "relative_path": key,
                "vault_copy_path": row.get("vault_copy_path", ""),
                "title": row_label(row),
                "severity": row.get("severity", ""),
                "rules": Counter(),
                "lines": [],
                "hashes": [],
            }
        grouped[key]["rules"][row.get("rule", "")] += 1  # type: ignore[index]
        grouped[key]["lines"].append(row.get("line", ""))  # type: ignore[index]
        grouped[key]["hashes"].append(row.get("excerpt_hash", ""))  # type: ignore[index]
    results = []
    for item in grouped.values():
        rules_counter: Counter = item["rules"]  # type: ignore[assignment]
        lines: list[str] = item["lines"]  # type: ignore[assignment]
        hashes: list[str] = item["hashes"]  # type: ignore[assignment]
        results.append(
            {
                "relative_path": str(item["relative_path"]),
                "vault_copy_path": str(item["vault_copy_path"]),
                "title": str(item["title"]),
                "severity": str(item["severity"]),
                "rules": ";".join(f"{rule}:{count}" for rule, count in rules_counter.most_common()),
                "line_samples": ";".join(lines[:8]),
                "hash_samples": ";".join(h for h in hashes[:6] if h),
                "finding_count": str(sum(rules_counter.values())),
            }
        )
    return sorted(results, key=lambda r: (-int(r["finding_count"]), r["relative_path"].lower()))


def table_for_findings(rows: list[dict[str, str]], limit: int = 120, current_depth: int = 1) -> str:
    lines = ["| Findings | Rules | Lines | Source | Hash samples |", "|---:|---|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row["title"], row["vault_copy_path"], current_depth)
        lines.append(f"| {row['finding_count']} | `{row['rules']}` | `{row['line_samples']}` | {link} | `{row['hash_samples']}` |")
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | {len(rows) - limit} more source files in the CSV report | ... |")
    if len(lines) == 2:
        lines.append("| 0 | - | - | No matching findings | - |")
    return "\n".join(lines)


def status_for_review(row: dict[str, str]) -> str:
    category = row.get("category", "")
    risks = row.get("risk_flags", "")
    if category == "private-memory-and-sessions":
        return "private-only"
    if risks:
        return "needs-redaction"
    if category == "public-knowledge-candidates":
        return "public-safe-candidate"
    return "needs-redaction"


def review_table(rows: list[dict[str, str]], limit: int = 180, current_depth: int = 1) -> str:
    lines = ["| Status | Score | Category | Risk flags | Source |", "|---|---:|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row_label(row), row.get("vault_copy_path", ""), current_depth)
        lines.append(f"| `{status_for_review(row)}` | {row.get('review_score', '')} | `{row.get('category', '')}` | `{row.get('risk_flags', '') or '-'}` | {link} |")
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(rows) - limit} more rows in review_queue.csv |")
    return "\n".join(lines)


def manual_capture_lines(root: Path, current_depth: int = 2) -> list[str]:
    captures = root / PRIVATE_CAPTURES_DIR
    if not captures.exists():
        return ["- No manual private captures found."]
    lines = []
    for path in sorted(captures.glob("*.md")):
        rel = path.relative_to(root).as_posix()
        lines.append(f"- {md_link(path.stem, rel, current_depth)}")
    return lines or ["- No manual private captures found."]


def context_page(rows: list[dict[str, str]], category: str, title: str, summary: str, output: Path, extra_body: str = "") -> None:
    filtered = [r for r in rows if r.get("category") == category]
    body = (
        f"Source category: `{category}`\n\n"
        f"- Candidate rows: `{len(filtered)}`\n"
        f"- Full queue: {private_report_link('review_queue.csv', 'review_queue.csv', 2)}\n\n"
        "## Priority Sources\n\n"
        + review_table(filtered, 160, 2)
        + "\n\n## Handling\n\n"
        "- Keep raw source material in `_raw/recovered/`.\n"
        "- Rewrite any public candidate before moving it to `wiki/`.\n"
        "- Do not copy local paths, private memory, chat logs, or credential values into public pages.\n"
        + extra_body
    )
    write_page(output, title, [title], ["local-recovery", "private-wiki"], "private-context", "moc", summary, body)


def local_root_table(rows: list[dict[str, str]], limit: int = 80) -> str:
    lines = ["| Root | Files | Findings | Missing | Latest modified | Categories |", "|---|---:|---:|---:|---|---|"]
    for row in rows[:limit]:
        categories = row.get("category_counts", "{}")
        lines.append(
            f"| `{md_cell(row.get('root_id', ''), 90)}` | "
            f"{row.get('files', '0')} | {row.get('findings', '0')} | {row.get('missing_files', '0')} | "
            f"`{row.get('latest_modified_at', '')}` | `{md_cell(categories, 220)}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | ... | {len(rows) - limit} more roots in external-index-cache/roots.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | 0 | 0 | - | - |")
    return "\n".join(lines)


def local_finding_table(rows: list[dict[str, str]], limit: int = 220) -> str:
    lines = ["| Severity | Group | Rule | Line | Source | Hash |", "|---|---|---|---:|---|---|"]
    for row in rows[:limit]:
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        lines.append(
            f"| `{row.get('severity', '')}` | `{row.get('group', '')}` | `{row.get('rule', '')}` | "
            f"{row.get('line', '')} | `{md_cell(source, 190)}` | `{row.get('excerpt_hash', '')}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | {len(rows) - limit} more rows in local_sensitive_findings.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | - | 0 | No matching findings | - |")
    return "\n".join(lines)


def local_inventory_table(rows: list[dict[str, str]], limit: int = 180) -> str:
    lines = ["| 类别 | 文件类型 | 大小 | 来源线索 | 风险标记 |", "|---|---|---:|---|---|"]
    for row in rows[:limit]:
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        lines.append(
            f"| `{row.get('category', '')}` | `{row.get('kind', '')}` | {row.get('size_bytes', '0')} | "
            f"`{md_cell(source, 190)}` | `{md_cell(row.get('risk_flags', '') or '-', 180)}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | local_source_inventory.csv 还有 {len(rows) - limit} 行 | ... |")
    if len(lines) == 2:
        lines.append("| - | - | 0 | 没有匹配来源 | - |")
    return "\n".join(lines)


def root_by_fragments(rows: list[dict[str, str]], fragments: list[str]) -> dict[str, str] | None:
    wanted = [fragment.casefold() for fragment in fragments]
    for row in rows:
        text = f"{row.get('root_id', '')} {row.get('path', '')}".casefold()
        if all(fragment in text for fragment in wanted):
            return row
    return None


def inventory_for_root(rows: list[dict[str, str]], root_row: dict[str, str] | None) -> list[dict[str, str]]:
    if not root_row:
        return []
    root_id = root_row.get("root_id", "")
    return [row for row in rows if row.get("root_id") == root_id]


def archive_package_table(rows: list[dict[str, str]], limit: int = 60) -> str:
    grouped: dict[str, Counter] = defaultdict(Counter)
    for row in rows:
        archive = row.get("archive_relative_path", "") or "unknown-archive"
        grouped[archive]["members"] += 1
        grouped[archive][f"kind:{row.get('kind', '')}"] += 1
        if row.get("risk_flags"):
            grouped[archive]["risk_named"] += 1
    ranked = sorted(grouped.items(), key=lambda item: (-item[1]["members"], item[0].casefold()))
    lines = ["| Archive | Members | Text | Documents | Images | Nested packages | Risk-named |", "|---|---:|---:|---:|---:|---:|---:|"]
    for archive, counts in ranked[:limit]:
        lines.append(
            f"| `{md_cell(archive, 170)}` | {counts['members']} | {counts['kind:text']} | "
            f"{counts['kind:document']} | {counts['kind:image']} | {counts['kind:archive']} | {counts['risk_named']} |"
        )
    if len(ranked) > limit:
        lines.append(f"| `...` | ... | ... | ... | ... | ... | {len(ranked) - limit} more archives in local_archive_inventory.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | 0 | 0 | 0 | 0 | 0 |")
    return "\n".join(lines)


def archive_member_table(rows: list[dict[str, str]], limit: int = 140) -> str:
    lines = ["| 压缩包 | 成员 | 类型 | 大小 | 风险标记 |", "|---|---|---|---:|---|"]
    for row in rows[:limit]:
        lines.append(
            f"| `{md_cell(row.get('archive_relative_path', ''), 130)}` | "
            f"`{md_cell(row.get('member_path', ''), 170)}` | `{row.get('kind', '')}` | "
            f"{row.get('size_bytes', '0')} | `{md_cell(row.get('risk_flags', '') or '-', 120)}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | local_archive_inventory.csv 还有 {len(rows) - limit} 个成员 | ... | ... | ... |")
    if len(lines) == 2:
        lines.append("| - | 没有匹配压缩包成员 | - | 0 | - |")
    return "\n".join(lines)


def contains_any(text: str, terms: list[str]) -> bool:
    haystack = text.casefold()
    return any(term.casefold() in haystack for term in terms)


def row_text(row: dict[str, str], fields: list[str] | None = None) -> str:
    fields = fields or ["relative_path", "vault_copy_path", "title", "tags", "summary", "root_id", "name", "category", "risk_flags"]
    return " ".join(row.get(field, "") for field in fields)


def score_terms(row: dict[str, str], terms: list[str]) -> int:
    text = row_text(row).casefold()
    score = 0
    for term in terms:
        if term.casefold() in text:
            score += 1
    if row.get("summary"):
        score += 1
    if row.get("title"):
        score += 1
    return score


def select_recovered_rows(rows: list[dict[str, str]], terms: list[str], categories: set[str] | None = None, limit: int = 180) -> list[dict[str, str]]:
    selected = []
    for row in rows:
        if categories and row.get("category") not in categories:
            continue
        score = score_terms(row, terms)
        if score:
            selected.append((score, int(row.get("size_bytes") or 0), row))
    selected.sort(key=lambda item: (-item[0], -item[1], row_label(item[2]).casefold()))
    return [row for _, _, row in selected[:limit]]


def select_local_rows(rows: list[dict[str, str]], terms: list[str], categories: set[str] | None = None, limit: int = 180) -> list[dict[str, str]]:
    selected = []
    for row in rows:
        if categories and row.get("category") not in categories:
            continue
        score = score_terms(row, terms)
        if score:
            selected.append((score, int(row.get("size_bytes") or 0), row))
    selected.sort(key=lambda item: (-item[0], -item[1], row_text(item[2], ["root_id", "relative_path"]).casefold()))
    return [row for _, _, row in selected[:limit]]


def recovered_source_table(rows: list[dict[str, str]], limit: int = 120, current_depth: int = 2) -> str:
    lines = ["| Category | Risk | Source | Summary |", "|---|---|---|---|"]
    for row in rows[:limit]:
        link = md_link(row_label(row), row.get("vault_copy_path", ""), current_depth)
        lines.append(
            f"| `{row.get('category', '')}` | `{row.get('risk_flags', '') or '-'}` | {link} | {md_cell(row.get('summary', '') or row.get('tags', ''), 180)} |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | {len(rows) - limit} more rows in recovered_file_inventory.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | No matching recovered sources | - |")
    return "\n".join(lines)


def root_summary_table(rows: list[dict[str, str]], terms: list[str] | None = None, limit: int = 80) -> str:
    filtered = rows
    if terms:
        filtered = [row for row in rows if contains_any(row_text(row, ["root_id", "category_counts"]), terms)]
    filtered = sorted(filtered, key=lambda row: -int(row.get("files") or 0))
    lines = ["| Root | Files | Findings | Timeline rows | Missing | Categories |", "|---|---:|---:|---:|---:|---|"]
    for row in filtered[:limit]:
        lines.append(
            f"| `{md_cell(row.get('root_id', ''), 100)}` | "
            f"{row.get('files', '0')} | {row.get('findings', '0')} | {row.get('timeline_rows', '0')} | {row.get('missing_files', '0')} | "
            f"`{md_cell(row.get('category_counts', '{}'), 220)}` |"
        )
    if len(filtered) > limit:
        lines.append(f"| ... | ... | ... | ... | ... | {len(filtered) - limit} more roots in external-index-cache/roots.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | 0 | 0 | 0 | - |")
    return "\n".join(lines)


def finding_summary_table(rows: list[dict[str, str]], limit: int = 80) -> str:
    grouped: dict[tuple[str, str, str], Counter] = defaultdict(Counter)
    for row in rows:
        key = (row.get("root_id", ""), row.get("group", ""), row.get("rule", ""))
        grouped[key]["findings"] += 1
        if row.get("severity") == "high":
            grouped[key]["high"] += 1
    ranked = sorted(grouped.items(), key=lambda item: (-item[1]["high"], -item[1]["findings"], item[0]))
    lines = ["| Root | Group | Rule | Findings | High |", "|---|---|---|---:|---:|"]
    for (root_id, group, rule), counts in ranked[:limit]:
        lines.append(f"| `{md_cell(root_id, 80)}` | `{group}` | `{rule}` | {counts['findings']} | {counts['high']} |")
    if len(ranked) > limit:
        lines.append(f"| ... | ... | ... | {len(ranked) - limit} more grouped rows in local_sensitive_findings.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | - | 0 | 0 |")
    return "\n".join(lines)


def timeline_month_table(rows: list[dict[str, str]], terms: list[str], limit: int = 120) -> str:
    by_month: Counter = Counter()
    samples: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        if not contains_any(row_text(row, ["root_id", "relative_path"]), terms):
            continue
        date_value = row.get("date", "")
        if len(date_value) < 7:
            continue
        month = date_value[:7]
        source = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        by_month[month] += 1
        if len(samples[month]) < 3:
            samples[month].append(md_cell(source, 120))
    lines = ["| Month | Evidence rows | Sample sources |", "|---|---:|---|"]
    for month, count in sorted(by_month.items(), reverse=True)[:limit]:
        lines.append(f"| `{month}` | {count} | " + "<br>".join(f"`{sample}`" for sample in samples[month]) + " |")
    if len(by_month) > limit:
        lines.append(f"| ... | ... | {len(by_month) - limit} more months in local_timeline_index.csv |")
    if len(lines) == 2:
        lines.append("| - | 0 | No matching timeline evidence |")
    return "\n".join(lines)


def cluster_counts(rows: list[dict[str, str]], clusters: list[tuple[str, list[str]]]) -> Counter:
    counts: Counter = Counter()
    for row in rows:
        text = row_text(row)
        matched = False
        for label, terms in clusters:
            if contains_any(text, terms):
                counts[label] += 1
                matched = True
        if not matched:
            counts["未归类"] += 1
    return counts


def cluster_table(title: str, counts: Counter, descriptions: dict[str, str], limit: int = 12) -> str:
    lines = [f"## {title}", "", "| 主题 | 证据数 | 含义 |", "|---|---:|---|"]
    for label, count in counts.most_common(limit):
        lines.append(f"| {label} | {count} | {descriptions.get(label, '需要后续人工归并和命名。')} |")
    if not counts:
        lines.append("| - | 0 | 暂无匹配证据。 |")
    return "\n".join(lines)


def clean_source_name(row: dict[str, str]) -> str:
    value = row.get("title") or row.get("name") or Path(row.get("relative_path", "")).stem or "source"
    value = redact_sensitive_text(value).replace("|", "-").strip()
    if len(value) > 80:
        value = value[:77] + "..."
    return value


def source_bullets(rows: list[dict[str, str]], limit: int = 24) -> str:
    lines = []
    seen: set[str] = set()
    for row in rows:
        name = clean_source_name(row)
        if name in {"-", ">-", "..."} or len(name) < 3:
            continue
        if name in seen:
            continue
        seen.add(name)
        risk = row.get("risk_flags") or "-"
        category = row.get("category") or "source"
        lines.append(f"- {name} — `{category}`, risk `{risk}`")
        if len(lines) >= limit:
            break
    return "\n".join(lines) if lines else "- 暂无候选。"


def source_status_table(rows: list[dict[str, str]], limit: int = 24) -> str:
    lines = ["| 候选 | 分类 | 风险 | 建议状态 |", "|---|---|---|---|"]
    seen: set[str] = set()
    for row in rows:
        name = clean_source_name(row)
        if name in {"-", ">-", "..."} or len(name) < 3:
            continue
        if name in seen:
            continue
        seen.add(name)
        risk = row.get("risk_flags") or "-"
        status = "先留私有"
        if risk == "-":
            status = "可人工改写为公开候选"
        elif "credential" in risk or "private" in risk:
            status = "仅作私有证据"
        elif "local-path" in risk:
            status = "脱敏后再评估"
        lines.append(f"| {name} | `{row.get('category', '')}` | `{risk}` | {status} |")
        if len(lines) - 2 >= limit:
            break
    if len(lines) == 2:
        lines.append("| - | - | - | 暂无候选 |")
    return "\n".join(lines)


def counter_table(title: str, counter: Counter, label_name: str = "类别", limit: int = 16) -> str:
    lines = [f"## {title}", "", f"| {label_name} | 数量 |", "|---|---:|"]
    for label, count in counter.most_common(limit):
        lines.append(f"| `{md_cell(str(label), 120)}` | {count} |")
    if len(counter) > limit:
        lines.append(f"| `...` | {len(counter) - limit} more categories |")
    if not counter:
        lines.append("| `-` | 0 |")
    return "\n".join(lines)


def root_signal_table(rows: list[dict[str, str]], limit: int = 18) -> str:
    ranked = sorted(
        rows,
        key=lambda row: (
            -int(row.get("timeline_rows") or 0),
            -int(row.get("findings") or 0),
            -int(row.get("files") or 0),
        ),
    )
    lines = ["| 来源根 | 文件 | 线索 | 时间线 | 上下文含义 |", "|---|---:|---:|---:|---|"]
    for row in ranked[:limit]:
        try:
            categories = json.loads(row.get("category_counts", "{}"))
        except json.JSONDecodeError:
            categories = {}
        root_id = row.get("root_id", "")
        dominant = max(categories.items(), key=lambda item: item[1])[0] if categories else ""
        meaning = "综合本地上下文"
        if "projects" in root_id or "github" in root_id or "workspace" in root_id or dominant == "project-roots":
            meaning = "项目与作品上下文"
        elif dominant == "agent-context" or any(term in root_id for term in ["codex", "claude", "cursor", "agents", "gemini", "qwen", "openclaw"]):
            meaning = "Agent/会话/规则上下文"
        elif dominant == "personal-and-chat-context" or any(term in root_id for term in ["wechat", "tencent"]):
            meaning = "个人/聊天上下文，需要私有处理"
        elif dominant == "security-and-credentials":
            meaning = "凭据/安全上下文，只做复核"
        elif dominant == "local-assets":
            meaning = "本地资产/备份上下文，需要去重"
        lines.append(
            f"| `{md_cell(row.get('root_id', ''), 90)}` | {row.get('files', '0')} | {row.get('findings', '0')} | "
            f"{row.get('timeline_rows', '0')} | {meaning} |"
        )
    if len(ranked) > limit:
        lines.append(f"| `...` | ... | ... | ... | {len(ranked) - limit} more roots in local_roots.csv |")
    return "\n".join(lines)


def write_deep_context_pages(
    out: Path,
    recovered_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    local_timeline_rows: list[dict[str, str]],
    archive_rows: list[dict[str, str]],
) -> int:
    session_terms = ["conversation", "conversations", "chat", "session", "history", "transcript", "memory", "memories", "微信", "wechat", "会话", "记忆", "画像", "summary", "codex", "claude"]
    project_terms = ["project", "repo", "github", "workspace", "项目", "作品", "平台", "系统", "小程序", "frontend", "backend", "openhanako", "hanako", "airi", "mcc", "gitnexus"]
    agent_terms = ["agent", "codex", "claude", "cursor", "gemini", "qwen", "openclaw", "mcp", "skill", "prompt", "hook", "rules", "serena", "mempalace", "config", "settings"]
    publish_terms = ["public", "site-data", "showcase", "portfolio", "README", "index", "资料库", "展示", "公开", "网站", "frontend"]
    coze_xiaoan_terms = ["coze", "扣子", "小安", "xiaoan", "bot", "智能体", "workflow", "dify", "n8n"]
    wechat_terms = ["wechat", "weixin", "wxid", "tencent", "微信", "msg/file", "msg\\file"]

    recovered_session = select_recovered_rows(
        recovered_rows,
        session_terms,
        {"private-memory-and-sessions", "agent-governance-and-skills", "projects-and-action-items"},
        260,
    )
    local_session = select_local_rows(local_rows, session_terms, {"personal-and-chat-context", "agent-context"}, 260)
    local_project_context = select_local_rows(local_rows, project_terms, {"project-roots", "agent-context", "local-assets"}, 260)
    recovered_project_context = select_recovered_rows(
        recovered_rows,
        project_terms,
        {"projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"},
        260,
    )
    local_agent_context = select_local_rows(local_rows, agent_terms, {"agent-context", "security-and-credentials"}, 260)
    recovered_agent_context = select_recovered_rows(recovered_rows, agent_terms, {"agent-governance-and-skills", "private-memory-and-sessions"}, 260)
    publish_candidates = select_recovered_rows(
        recovered_rows,
        publish_terms,
        {"public-knowledge-candidates", "projects-and-action-items", "agent-governance-and-skills"},
        220,
    ) + select_local_rows(local_rows, publish_terms, {"project-roots", "agent-context", "local-assets"}, 180)

    recovered_categories = Counter(row.get("category", "") for row in recovered_rows)
    local_categories = Counter(row.get("category", "") for row in local_rows)
    finding_groups = Counter(row.get("group", "") for row in local_finding_rows)
    finding_rules = Counter(row.get("rule", "") for row in local_finding_rows)
    timeline_sources = Counter(row.get("source", "") for row in local_timeline_rows)
    archive_kind_counts = Counter(row.get("kind", "") for row in archive_rows)
    archive_risk_counts = Counter(row.get("risk_flags", "") or "-" for row in archive_rows)

    download_root = root_by_fragments(local_root_rows, ["下载"])
    wechat_file_root = root_by_fragments(local_root_rows, ["wxid", "msg", "file"])
    oh_workspace_root = root_by_fragments(local_root_rows, ["oh-workspace"])
    download_rows = inventory_for_root(local_rows, download_root)
    wechat_file_rows = inventory_for_root(local_rows, wechat_file_root)
    oh_workspace_rows = inventory_for_root(local_rows, oh_workspace_root)
    coze_xiaoan_rows = select_local_rows(local_rows, coze_xiaoan_terms, None, 260)
    coze_xiaoan_archive_rows = [
        row
        for row in archive_rows
        if contains_any(
            " ".join(
                [
                    row.get("root_id", ""),
                    row.get("archive_relative_path", ""),
                    row.get("member_path", ""),
                    row.get("name", ""),
                ]
            ),
            coze_xiaoan_terms,
        )
    ]
    wechat_archive_rows = [
        row
        for row in archive_rows
        if contains_any(
            " ".join(
                [
                    row.get("root_id", ""),
                    row.get("archive_relative_path", ""),
                    row.get("member_path", ""),
                    row.get("name", ""),
                ]
            ),
            wechat_terms,
        )
    ]

    index_body = (
        "这组页面回答“还有哪些信息和上下文在本地”。它把来源、会话、项目、Agent、公开候选和待办问题拆开，避免所有东西挤在一个索引表里。\n\n"
        "## 上下文入口\n\n"
        "- [[private-wiki/context/source-priority-map]] - 哪些本地来源最值得继续读\n"
        "- [[private-wiki/context/current-state-map]] - 当前事实、历史备份、待核实和私有风险分层\n"
        "- [[private-wiki/context/source-to-page-lineage]] - 来源到私有页、项目卡、学习包和公开候选的追踪关系\n"
        "- [[private-wiki/context/session-memory-map]] - 会话、记忆、个人画像和上下文线索\n"
        "- [[private-wiki/context/project-continuity-map]] - 项目连续性与交付上下文\n"
        "- [[private-wiki/context/agent-runtime-map]] - Agent 运行面、规则面、配置面\n"
        "- [[private-wiki/context/coze-xiaoan-source-map]] - Coze/小安、下载目录和前端资料库规格线索\n"
        "- [[private-wiki/context/wechat-file-attachments-map]] - WeChat 文件附件元数据地图\n"
        "- [[private-wiki/context/archive-package-map]] - 压缩包成员元数据地图\n"
        "- [[private-wiki/context/publication-context-map]] - 公开展示候选与脱敏队列\n"
        "- [[private-wiki/context/continuation-questions]] - 后续需要回答的问题\n\n"
        "## 现有规模\n\n"
        f"- 恢复档案来源：`{len(recovered_rows)}`\n"
        f"- 本地来源索引：`{len(local_rows)}`\n"
        f"- 本地时间线行：`{len(local_timeline_rows)}`\n"
        f"- 本地风险/隐私线索：`{len(local_finding_rows)}`\n\n"
        f"- 压缩包成员索引：`{len(archive_rows)}`\n\n"
        "## 使用方式\n\n"
        "先从 source-priority 看来源，再从 session/project/agent 三条线决定要不要继续细化成单独页面。公开展示只走 publication-context，不直接从 context 页复制原文。\n"
    )
    write_page(out / "context" / "index.md", "更多本地信息与上下文地图", ["上下文地图", "更多信息"], ["personal-archive", "context"], "private-context", "moc", "把本地来源、会话、项目、Agent 和公开候选拆成可继续深挖的上下文地图。", index_body, "sensitive")

    source_body = (
        "这页用于决定下一轮该读哪些本地材料。它按来源根、类别、时间线和风险信号排序，不复制原始内容。\n\n"
        "## 高信号来源根\n\n"
        + root_signal_table(local_root_rows, 24)
        + "\n\n"
        + counter_table("恢复档案类别", recovered_categories, "类别")
        + "\n\n"
        + counter_table("本地来源类别", local_categories, "类别")
        + "\n\n"
        + counter_table("时间线来源类型", timeline_sources, "来源类型")
        + "\n\n## 下一步\n\n"
        "- 优先读项目根、Agent 会话、个人记忆三个方向。\n"
        "- 不要把备份目录当成当前事实，需要核对是否为重复副本。\n"
        "- 对公开展示，优先选择风险为 `-` 或只需脱敏的候选。\n"
    )
    write_page(out / "context" / "source-priority-map.md", "本地来源优先级地图", ["来源优先级", "Source Priority"], ["personal-archive", "context", "sources"], "private-context", "map", "按来源根、类别、风险和时间线信号整理的本地资料优先级。", source_body, "sensitive")

    session_body = (
        "这页整理会话、记忆、个人画像、聊天上下文和连续接手线索。它是理解“为什么项目这样演进”的上下文层。\n\n"
        "## 恢复档案里的会话/记忆候选\n\n"
        + source_status_table(recovered_session, 48)
        + "\n\n## 本地会话/记忆候选\n\n"
        + source_status_table(local_session, 48)
        + "\n\n"
        + counter_table("个人/隐私规则分布", Counter(row.get("rule", "") for row in local_finding_rows if row.get("group") == "personal"), "规则", 18)
        + "\n\n## 处理规则\n\n"
        "- 会话只作为事实和决策来源，不把整段对话复制进展示层。\n"
        "- 个人画像、微信、记忆、私聊默认 `private-only`。\n"
        "- 能公开的是经过改写的项目背景、能力证明和非敏感经验。\n"
    )
    write_page(out / "context" / "session-memory-map.md", "会话记忆与个人上下文地图", ["会话上下文", "记忆地图"], ["personal-archive", "context", "memory"], "private-context", "map", "本地会话、记忆、个人画像和聊天上下文的私有地图。", session_body, "sensitive")

    project_body = (
        "这页关注项目连续性：项目从哪里来、当前证据在哪里、哪些可以变成作品集条目。\n\n"
        "## 恢复档案项目上下文\n\n"
        + source_status_table(recovered_project_context, 54)
        + "\n\n## 本地项目上下文\n\n"
        + source_status_table(local_project_context, 54)
        + "\n\n## 项目连续性判断\n\n"
        "- 同时出现在项目根、会话记录和展示草稿里的项目，优先提升成单独项目页。\n"
        "- 只出现在备份或导入包里的项目，先确认是不是废弃材料。\n"
        "- 带密钥、支付、部署、账号、学校信息的项目，先留私有。\n"
    )
    write_page(out / "context" / "project-continuity-map.md", "项目连续性上下文地图", ["项目上下文", "项目连续性"], ["personal-archive", "context", "projects"], "private-context", "map", "把恢复档案和本地项目根连接起来的项目连续性地图。", project_body, "internal")

    agent_body = (
        "这页整理 Agent 运行面：Codex、Claude、Cursor、Gemini/Qwen、OpenClaw、MCP、技能、hooks、rules 和 memory/context。\n\n"
        "## 恢复档案 Agent 上下文\n\n"
        + source_status_table(recovered_agent_context, 54)
        + "\n\n## 本地 Agent 上下文\n\n"
        + source_status_table(local_agent_context, 54)
        + "\n\n"
        + counter_table("本地风险规则分布", finding_rules, "规则", 18)
        + "\n\n## 当前规则\n\n"
        "- 旧规则是历史材料，不自动成为当前行为规范。\n"
        "- 配置、hooks、memory、prompt、token 线索默认不公开。\n"
        "- 对外可写的是 Agent 架构、工具链经验和安全边界。\n"
    )
    write_page(out / "context" / "agent-runtime-map.md", "Agent 运行面上下文地图", ["Agent运行面", "Agent上下文"], ["personal-archive", "context", "agents"], "private-context", "map", "Codex、Claude、Cursor、OpenClaw、MCP、技能和规则的本地上下文地图。", agent_body, "sensitive")

    coze_body = (
        "这页把 Coze/扣子/小安、下载目录、资料库前端规格和相关 Agent 项目线索放在一起。它只做私有元数据地图，不抽取压缩包或聊天原文。\n\n"
        "## 下载与工作区根\n\n"
        + local_root_table([row for row in [download_root, oh_workspace_root] if row], 20)
        + "\n\n## 下载目录重点文件\n\n"
        + local_inventory_table(sorted(download_rows, key=lambda row: (row.get("category", ""), row.get("relative_path", ""))), 120)
        + "\n\n## OH-WorkSpace 与资料库前端规格\n\n"
        + local_inventory_table(sorted(oh_workspace_rows, key=lambda row: (row.get("relative_path", ""))), 120)
        + "\n\n## Coze/小安/自动化候选\n\n"
        + source_status_table(coze_xiaoan_rows, 80)
        + "\n\n## 压缩包内相关成员\n\n"
        + archive_member_table(sorted(coze_xiaoan_archive_rows, key=lambda row: (not row.get("risk_flags"), row.get("archive_relative_path", ""), row.get("member_path", ""))), 120)
        + "\n\n## 后续处理\n\n"
        "- Coze/小安资料先归到私有项目线，不直接进入公开 `wiki/`。\n"
        "- 如果要给前端展示，只公开项目目标、能力证明、非敏感截图和脱敏后的架构说明。\n"
        "- 压缩包只在确认无密钥和隐私后再按需解包；默认仅索引成员名、类型、大小和风险标记。\n"
    )
    write_page(out / "context" / "coze-xiaoan-source-map.md", "Coze 小安与下载资料地图", ["Coze资料地图", "小安资料地图", "下载资料地图"], ["personal-archive", "context", "coze", "xiaoan"], "private-context", "map", "Coze/小安、下载目录和个人资料库前端规格的私有来源地图。", coze_body, "sensitive")

    wechat_body = (
        "这页专门整理 WeChat 文件附件目录。它不解析聊天数据库，不复制附件正文，只把文件、类型、时间线和风险标记编译成可检索地图。\n\n"
        "## 文件附件根\n\n"
        + local_root_table([wechat_file_root] if wechat_file_root else [], 20)
        + "\n\n## 附件分类分布\n\n"
        + counter_table("WeChat 附件类别", Counter(row.get("category", "") for row in wechat_file_rows), "类别", 12)
        + "\n\n"
        + counter_table("WeChat 附件类型", Counter(row.get("kind", "") for row in wechat_file_rows), "类型", 12)
        + "\n\n## 重点附件清单\n\n"
        + local_inventory_table(sorted(wechat_file_rows, key=lambda row: (not row.get("risk_flags"), row.get("category", ""), row.get("relative_path", ""))), 180)
        + "\n\n## 压缩包内 WeChat 相关成员\n\n"
        + archive_member_table(sorted(wechat_archive_rows, key=lambda row: (not row.get("risk_flags"), row.get("archive_relative_path", ""), row.get("member_path", ""))), 140)
        + "\n\n## 处理规则\n\n"
        "- WeChat 附件默认 `private-only`，特别是学校材料、简历、聊天导出、合同、账号和截图。\n"
        "- 对项目有价值的附件，先改写成私有项目页；公开前再做二次脱敏。\n"
        "- 图片、音频和文档后续需要单独的多模态/文档读取批次，不在这一步展开。\n"
    )
    write_page(out / "context" / "wechat-file-attachments-map.md", "WeChat 文件附件地图", ["微信附件地图", "WeChat附件地图"], ["personal-archive", "context", "wechat"], "private-context", "map", "WeChat 文件附件目录的私有元数据地图。", wechat_body, "sensitive")

    archive_body = (
        "这页是本地压缩包成员索引。脚本只读取 ZIP 目录，不抽取、不执行、不复制压缩包内容。\n\n"
        "## 成员类型\n\n"
        + counter_table("压缩包成员类型", archive_kind_counts, "类型", 12)
        + "\n\n"
        + counter_table("成员风险标记", archive_risk_counts, "风险标记", 12)
        + "\n\n## 压缩包分布\n\n"
        + archive_package_table(archive_rows, 80)
        + "\n\n## 成员样本\n\n"
        + archive_member_table(sorted(archive_rows, key=lambda row: (not row.get("risk_flags"), row.get("archive_relative_path", ""), row.get("member_path", ""))), 160)
        + "\n\n## 解包门槛\n\n"
        "- 默认不解包；成员名已经足够支持搜索、排序和人工复核。\n"
        "- 只有明确需要提取某个项目/资料包时，才在临时目录解包并重新跑私有扫描。\n"
        "- 含 `sensitive-name`、`personal-name`、`.env`、`token`、`cookie`、`session` 的包先做安全复核。\n"
    )
    write_page(out / "context" / "archive-package-map.md", "本地压缩包成员地图", ["压缩包成员索引", "Archive Package Map"], ["personal-archive", "context", "archives"], "private-context", "map", "本地 ZIP 压缩包成员名、类型和风险标记的私有地图。", archive_body, "sensitive")

    publication_body = (
        "这页把更多本地上下文接到未来网站展示：什么可以写成公开资料，什么必须留私有。\n\n"
        "## 展示候选\n\n"
        + source_status_table(publish_candidates, 64)
        + "\n\n## 展示边界\n\n"
        "- 公开页面只讲项目目标、技术选择、成果、经验和公开链接。\n"
        "- 不展示本地路径、账号、密钥、私聊、个人识别信息、未确认学校/组织细节。\n"
        "- 前端只读 `site-data` 生成物，不读私有 Obsidian 目录。\n"
    )
    write_page(out / "context" / "publication-context-map.md", "公开展示上下文地图", ["公开候选上下文", "展示上下文"], ["personal-archive", "context", "publication"], "private-context", "map", "从私有上下文筛选公开展示候选的边界和队列。", publication_body, "internal")

    questions_body = (
        "这页是继续完善本地知识库的复核问题队列。\n\n"
        "## P0 安全\n\n"
        f"- 高风险凭据线索是否需要轮换：`{sum(1 for row in local_finding_rows if row.get('severity') == 'high')}` 条。\n"
        f"- 凭据/会话类上下文是否有废弃配置需要清理：`{finding_groups.get('credential', 0)}` 条。\n\n"
        "## P1 个人资料\n\n"
        "- 哪些个人身份、学校、经历可以公开，哪些永远只留本地。\n"
        "- 成长时间线里哪些是真实事件，哪些只是文件时间或引用日期。\n\n"
        "## P2 项目与能力\n\n"
        "- 哪 10 个项目最适合作为网站第一批展示条目。\n"
        "- 每个能力要绑定哪个项目证据，避免空泛技能清单。\n\n"
        "## P3 Agent 上下文\n\n"
        "- 哪些 Agent 规则是当前有效，哪些只是旧系统遗留。\n"
        "- 哪些配置可以抽象成公开方法论，哪些必须留私有。\n"
    )
    write_page(out / "context" / "continuation-questions.md", "继续完善问题队列", ["上下文待办", "复核问题"], ["personal-archive", "context", "todo"], "private-context", "queue", "继续完善本地知识库时需要人工复核和决策的问题队列。", questions_body, "sensitive")

    return 10


def write_readable_knowledge_pages(
    out: Path,
    recovered_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    local_timeline_rows: list[dict[str, str]],
    archive_rows: list[dict[str, str]],
    recovered_growth: list[dict[str, str]],
    recovered_projects: list[dict[str, str]],
    recovered_skills: list[dict[str, str]],
    recovered_agents: list[dict[str, str]],
    local_growth: list[dict[str, str]],
    local_projects: list[dict[str, str]],
    local_skills: list[dict[str, str]],
    local_agents: list[dict[str, str]],
) -> int:
    project_clusters = [
        ("AI Agent 与多智能体系统", ["agent", "mcp", "codex", "claude", "openclaw", "mcc", "gitnexus", "mempalace", "小安"]),
        ("个人资料库与知识库展示", ["资料库", "知识库", "archive", "wiki", "obsidian", "site-data", "展示", "前端"]),
        ("前端与全栈应用", ["frontend", "react", "vite", "next", "backend", "api", "server", "web", "网页"]),
        ("微信与校园项目", ["微信", "小程序", "校园", "学校", "竞赛", "问答助手"]),
        ("模型与本地 AI", ["ollama", "qwen", "finetune", "微调", "模型", "llm", "airi"]),
        ("自动化与工作流", ["n8n", "dify", "workflow", "自动化", "采集", "pipeline"]),
    ]
    skill_clusters = [
        ("知识管理与资料编译", ["obsidian", "wiki", "知识库", "资料库", "lint", "privacy", "ingest"]),
        ("Agent 工程", ["agent", "mcp", "prompt", "skill", "hook", "codex", "claude"]),
        ("前端产品实现", ["frontend", "react", "vite", "ui", "site", "web", "组件"]),
        ("后端与接口", ["backend", "api", "server", "database", "postgres", "supabase"]),
        ("自动化与数据处理", ["python", "powershell", "csv", "json", "script", "workflow", "自动化"]),
        ("测试与验收", ["test", "unittest", "playwright", "验收", "lint", "scan"]),
    ]
    agent_clusters = [
        ("Codex 工作流", ["codex"]),
        ("Claude/Claude Code", ["claude"]),
        ("Cursor", ["cursor"]),
        ("Gemini/Qwen", ["gemini", "qwen"]),
        ("OpenClaw/ClawX", ["openclaw", "clawx"]),
        ("MCP 与技能系统", ["mcp", "skill", "plugin", "hook"]),
        ("记忆与上下文", ["memory", "mempalace", "context", "记忆"]),
    ]
    descriptions = {
        "AI Agent 与多智能体系统": "Agent 编排、上下文、工具调用、规则与技能配置，是当前资料库的主轴。",
        "个人资料库与知识库展示": "面向未来网站展示的资料编译层，必须从私有证据改写成公开叙事。",
        "前端与全栈应用": "可沉淀为作品集条目的 Web、API、前后端项目。",
        "微信与校园项目": "包含校园、竞赛、小程序等更贴近真实场景的项目线。",
        "模型与本地 AI": "本地模型、微调、Ollama/Qwen/AIRI 等 AI 实验线。",
        "自动化与工作流": "资料采集、发布、脚本、n8n/Dify 等流程资产。",
        "知识管理与资料编译": "把散乱本地材料转为可维护 wiki 的核心能力。",
        "Agent 工程": "提示词、技能、工具、MCP、规则、上下文管理。",
        "前端产品实现": "个人资料馆、展示站、组件和交互实现。",
        "后端与接口": "为前端提供安全 JSON 数据边界和服务端能力。",
        "自动化与数据处理": "扫描、清洗、索引、报表和批处理脚本。",
        "测试与验收": "结构检查、隐私扫描、单测、发布门禁。",
        "Codex 工作流": "Codex 的本地会话、规则、技能与工程化使用。",
        "Claude/Claude Code": "Claude/Claude Code 相关项目状态、会话、配置与规则。",
        "Cursor": "Cursor 本地状态、规则和开发上下文。",
        "Gemini/Qwen": "其他模型客户端与本地模型使用痕迹。",
        "OpenClaw/ClawX": "自建 Agent/控制台相关项目和历史规则。",
        "MCP 与技能系统": "插件、技能、MCP 服务与工具协议。",
        "记忆与上下文": "长期记忆、上下文提取、跨会话连续性。",
    }

    all_project_rows = recovered_projects + local_projects
    all_skill_rows = recovered_skills + local_skills
    all_agent_rows = recovered_agents + local_agents
    credential_rows = [row for row in local_finding_rows if row.get("group") == "credential"]
    personal_rows = [row for row in local_finding_rows if row.get("group") == "personal"]
    high_credential_rows = [row for row in credential_rows if row.get("severity") == "high"]

    start_body = (
        "这是本地 Karpathy-style 知识库的阅读入口。原始材料保持不动，`private-wiki/` 是私有编译层，`wiki/` 和 `site-data/` 才是公开候选层。\n\n"
        "## 新手只走这 3 步\n\n"
        "1. 先读 [[private-wiki/learning/glossary-for-beginners]]，弄清 raw、private-wiki、wiki、site-data 四个词。\n"
        "2. 再读 [[private-wiki/synthesis/local-karpathy-wiki-operating-model]]，理解为什么不能从原始材料直接公开。\n"
        "3. 最后打开 [[private-wiki/guide/workflow-and-learning-hub]]，选择“补资料、写学习包、公开晋升”其中一条线。\n\n"
        "## 按场景进入\n\n"
        "| 现在要做什么 | 先打开 | 目标 |\n"
        "|---|---|---|\n"
        "| 3 分钟了解现状 | [[private-wiki/guide/completeness-and-readiness-dashboard]] | 看完整度、缺口和下一步 |\n"
        "| 小白从头理解 | [[private-wiki/learning/beginner-learning-path]] | 按顺序读概念、项目、学习包和自动化 |\n"
        "| 工作流和学习文件 | [[private-wiki/guide/workflow-and-learning-hub]] | 直接进入流程、模板和输出目录 |\n"
        "| 整理一个项目 | [[private-wiki/projects/top-projects-decision-map]] | 选项目方向并补项目卡 |\n"
        "| 写中文学习资料 | [[private-wiki/learning/curated-package-digest]] | 选学习包主题和写作模板 |\n"
        "| 追踪新资料 | [[private-wiki/automation/local-source-incremental-watch]] | 找新增、修改、消失的来源 |\n"
        "| 看自动化做了什么 | [[private-wiki/automation/latest-cycle-digest]] | 判断本轮是否成功和下一步 |\n"
        "| 判断能否公开 | [[private-wiki/context/source-to-page-lineage]] | 检查来源、私有页、项目卡、公开候选链路 |\n"
        "| 排查隐私密钥 | [[private-wiki/security/finding-disposition]] | 只看定位、规则、哈希和状态 |\n\n"
        "## 进阶地图：再读这 11 页\n\n"
        "- [[private-wiki/guide/local-knowledge-map]] - 本地资料库总地图\n"
        "- [[private-wiki/context/current-state-map]] - 当前事实、历史备份和待核实状态\n"
        "- [[private-wiki/guide/daily-operating-workflow]] - 每天怎么用、怎么补、怎么验收\n"
        "- [[private-wiki/guide/source-intake-protocol]] - 新资料进入知识库的标准流程\n"
        "- [[private-wiki/guide/workflow-and-learning-hub]] - 工作流和学习文件总入口\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/projects/top-projects-decision-map]] - 第一批项目整理优先级\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/synthesis/local-karpathy-wiki-operating-model]] - 本地知识库运行模型\n\n"
        "## 工作流入口\n\n"
        "- [[private-wiki/guide/workflow-and-learning-hub]] - 工作流、学习文件和模板总入口\n"
        "- [[private-wiki/guide/critique-research-optimization-loop]] - 挑刺、调研、分析和优化闭环\n"
        "- [[private-wiki/guide/skill-extraction-workflow]] - 把本地资料提炼成 Codex 可复用技能\n"
        "- [[private-wiki/skills/skill-extraction-backlog]] - Codex 技能提取候选池\n"
        "- [[private-wiki/learning/lifecycle-replication-standard]] - 面向小白的生命周期复刻学习资料标准\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 学习包正文模板\n"
        "- [[private-wiki/learning/beginner-learning-package-workbench]] - 中文学习包工作台\n"
        "- [[private-wiki/automation/lifecycle-loop-operating-procedure]] - 两小时异步自动化循环 SOP\n"
        "- [[private-wiki/automation/latest-cycle-digest]] - 最近一轮自动化摘要\n"
        "- [[private-wiki/publication/top-candidates-by-theme]] - 公开候选按主题摘要\n"
        "- [[private-wiki/todos/next-seven-actions]] - 下一批 7 个具体动作\n\n"
        "## 深挖上下文\n\n"
        "- [[private-wiki/context/index]] - 更多本地信息与上下文地图\n"
        "- [[private-wiki/context/source-priority-map]] - 来源优先级\n"
        "- [[private-wiki/context/session-memory-map]] - 会话和记忆上下文\n"
        "- [[private-wiki/context/project-continuity-map]] - 项目连续性上下文\n"
        "- [[private-wiki/context/agent-runtime-map]] - Agent 运行面上下文\n\n"
        "## 日常流程\n\n"
        "1. 新资料先进入原始层或本地来源索引。\n"
        "2. 私有编译层只做提炼、链接、计数和证据定位，不复制密钥明文。\n"
        "3. 公开展示必须从私有页人工改写，脱敏后再进入 `wiki/`。\n"
        "4. 前端只读 `site-data/*.json`，不读 Obsidian 原文和私有目录。\n\n"
        "## 判断标准\n\n"
        "- 能回答“我做过什么、会什么、有哪些 Agent 配置、哪些内容不能公开”。\n"
        "- 每个结论能回到来源索引或原始材料。\n"
        "- 不确定内容留在私有层，不直接发布。\n"
    )
    write_page(out / "guide" / "start-here.md", "本地 Karpathy 知识库入口", ["本地知识库入口", "Start Here"], ["personal-archive", "karpathy-wiki", "guide"], "private-guide", "moc", "本地 Karpathy-style 私有知识库的阅读入口和维护流程。", start_body, "internal")

    local_category_counts = Counter(row.get("category", "unknown") for row in local_rows)
    local_finding_group_counts = Counter(row.get("group", "unknown") for row in local_finding_rows)
    recovered_category_counts = Counter(row.get("category", "unknown") for row in recovered_rows)
    project_cluster_counts = cluster_counts(all_project_rows, project_clusters)
    skill_cluster_counts = cluster_counts(all_skill_rows, skill_clusters)
    agent_cluster_counts = cluster_counts(all_agent_rows, agent_clusters)

    knowledge_map_body = (
        "这页是本地资料库总地图。它把“我是谁、做过什么、会什么、配过哪些 Agent、哪些不能公开、时间线在哪里”放到一个入口里。\n\n"
        "## 问题到页面\n\n"
        "| 你要问的问题 | 先看哪里 | 判断方式 |\n"
        "|---|---|---|\n"
        "| 我当前的成长主线是什么？ | [[private-wiki/profile/personal-brief]] 和 [[private-wiki/profile/growth-timeline]] | 看是否能提炼成公开自序、阶段复盘和未来路线。 |\n"
        "| 我做过哪些项目？ | [[private-wiki/projects/showcase-draft]] 和 [[private-wiki/projects/portfolio-map]] | 每个项目要能说明目标、角色、成果、证据和可公开边界。 |\n"
        "| 我会哪些东西？ | [[private-wiki/skills/capability-brief]] 和 [[private-wiki/guide/skill-extraction-workflow]] | 能力必须绑定项目证据或可复用流程。 |\n"
        "| 我配置过哪些 Agent？ | [[private-wiki/agents/agent-ecosystem-brief]] 和 [[private-wiki/agents/configuration-map]] | 旧规则是历史证据，当前规则要单独确认。 |\n"
        "| 本地信息还有多少？ | [[private-wiki/local-sources/index]] 和 [[private-wiki/context/index]] | 看来源根、时间线、风险线索和上下文主题。 |\n"
        "| 密钥和隐私在哪里复核？ | [[private-wiki/security/review-priority]] | 只看规则、位置、哈希和状态，不展示明文。 |\n"
        "| 新资料怎么补进去？ | [[private-wiki/guide/source-intake-protocol]] | 先登记来源，再索引，再编译私有页。 |\n"
        "| 哪些能变成公开资料？ | [[private-wiki/publication/top-candidates-by-theme]] 和 [[private-wiki/publication-candidates]] | 先脱敏改写，再进入公开 wiki 和 site-data。 |\n\n"
        "## 当前覆盖快照\n\n"
        f"- 恢复档案文件：`{len(recovered_rows)}`\n"
        f"- 本地来源索引：`{len(local_rows)}`\n"
        f"- 本地来源根：`{len(local_root_rows)}`\n"
        f"- 本地时间线行：`{len(local_timeline_rows)}`\n"
        f"- 压缩包成员索引：`{len(archive_rows)}`\n"
        f"- 本地风险/隐私线索：`{len(local_finding_rows)}`\n\n"
        + counter_table("本地来源类型", local_category_counts, "类型")
        + "\n\n"
        + counter_table("本地风险线索类型", local_finding_group_counts, "线索")
        + "\n\n"
        "## 使用原则\n\n"
        "- 资料先完整进入私有层，不急着公开。\n"
        "- 私有页写结论、来源、状态和风险，不复制秘密值和大段聊天原文。\n"
        "- 公开页要中文优先、适合小白、能复刻、能验收。\n"
    )
    write_page(out / "guide" / "local-knowledge-map.md", "本地资料库总地图", ["本地知识地图", "Local Knowledge Map"], ["personal-archive", "karpathy-wiki", "guide"], "private-guide", "moc", "把本地成长、项目、技能、Agent、来源、安全和公开候选连接成总地图。", knowledge_map_body, "internal")

    daily_workflow_body = (
        "这页定义每天怎么使用本地知识库。目标是让资料持续进入 Obsidian，而不是散在下载、微信、Agent 会话和项目目录里。\n\n"
        "## 每天 15 分钟\n\n"
        "1. 打开 [[private-wiki/guide/start-here]]，看 [[private-wiki/todos/next-seven-actions]]。\n"
        "2. 看 [[private-wiki/automation/recent-activity]]，确认最近两小时有没有新资料、App 活动或项目变化。\n"
        "3. 如果有新资料，按 [[private-wiki/guide/source-intake-protocol]] 登记和编译。\n"
        "4. 如果是可复用经验，按 [[private-wiki/guide/skill-extraction-workflow]] 写成技能候选。\n"
        "5. 如果是适合展示的学习成果，按 [[private-wiki/learning/lifecycle-replication-standard]] 写成生命周期学习包。\n\n"
        "## 每次补资料时\n\n"
        "| 阶段 | 做什么 | 输出 |\n"
        "|---|---|---|\n"
        "| 发现 | 找到新文件、项目、会话、截图、安装包、学习资料 | 来源根或来源条目 |\n"
        "| 索引 | 记录文件类型、时间、大小、风险、来源类别 | 本地来源 CSV 和 [[private-wiki/local-sources/index]] |\n"
        "| 编译 | 只写摘要、证据定位、状态和下一步 | `private-wiki/` 主题页 |\n"
        "| 提炼 | 把重复方法变成技能或学习包 | 技能候选或生命周期包 |\n"
        "| 公开 | 中文改写、脱敏、验收后进入 `wiki/` | 安的书房可展示资料 |\n\n"
        "## 直接去哪里写\n\n"
        "- 学习包草稿从 [[private-wiki/learning/lifecycle-learning-package-template]] 开始。\n"
        "- 学习包选题先看 [[private-wiki/guide/workflow-and-learning-hub]] 和 [[private-wiki/learning/curated-package-digest]]。\n"
        "- 工作用的流程文档继续写在 [[private-wiki/guide/daily-operating-workflow]]、[[private-wiki/guide/source-intake-protocol]] 和 [[private-wiki/automation/lifecycle-loop-operating-procedure]]。\n\n"
        "## 验收口径\n\n"
        "- 能从入口页找到资料，而不是靠记忆找文件。\n"
        "- 新资料有来源、有时间、有风险等级、有下一步。\n"
        "- 公开资料不是隐私页删几行，而是重新写给读者看的中文材料。\n"
    )
    write_page(out / "guide" / "daily-operating-workflow.md", "本地知识库日常工作流", ["Daily Operating Workflow", "每天怎么用知识库"], ["personal-archive", "workflow", "guide"], "private-guide", "workflow", "定义每天补录、复核、提炼和公开本地资料的私有工作流。", daily_workflow_body, "internal")

    workflow_hub_body = (
        "这页是工作流和学习文件的总入口。它回答两个问题：现在该做什么，以及该把内容写成哪一种学习文件。\n\n"
        "## 一句话流程\n\n"
        "原始材料只保存和索引；私有层只写摘要、证据、风险和下一步；公开层必须重新写给读者；site-data 只从公开层生成。\n\n"
        "## 三条工作线\n\n"
        "| 现在手上有什么 | 写到哪里 | 完成标准 |\n"
        "|---|---|---|\n"
        "| 一个新文件或新来源 | [[private-wiki/guide/source-intake-protocol]] | 有来源、风险、下一步，不直接公开 |\n"
        "| 一个可教的项目/经验 | [[private-wiki/learning/lifecycle-learning-package-template]] | 有背景、步骤、错误、验收、私有省略 |\n"
        "| 一个准备公开的主题 | [[private-wiki/context/source-to-page-lineage]] | 能追溯来源，已脱敏，能生成 wiki/site-data |\n\n"
        "## 先看什么\n\n"
        "| 任务 | 先打开 | 作用 |\n"
        "|---|---|---|\n"
        "| 每天补资料 | [[private-wiki/guide/daily-operating-workflow]] | 处理新增、复核、提炼和公开候选 |\n"
        "| 新文件进入库 | [[private-wiki/guide/source-intake-protocol]] | 先登记来源，再编译主题页 |\n"
        "| 把经验变成技能 | [[private-wiki/guide/skill-extraction-workflow]] | 把稳定流程写成可复用技能 |\n"
        "| 挑刺和优化内容 | [[private-wiki/guide/critique-research-optimization-loop]] | 先找漏洞，再补调研和验收 |\n"
        "| 跑两小时循环 | [[private-wiki/automation/lifecycle-loop-operating-procedure]] | 自动化持续发现、验收和复盘 |\n"
        "| 写学习包正文 | [[private-wiki/learning/lifecycle-learning-package-template]] | 直接填模板，不用临时想结构 |\n"
        "| 看完整示例 | [[private-wiki/learning/first-learning-package-walkthrough]] | 学一个来源怎样变成学习包 |\n"
        "| 选学习主题 | [[private-wiki/learning/curated-package-digest]] | 先挑值得写成中文资料的题目 |\n"
        "| 找学习候选 | [[private-wiki/learning/lifecycle-package-queue]] | 先看少量可写候选 |\n"
        "| 查全量证据 | [[private-wiki/learning/learning-evidence-inventory]] | 只在需要定位来源时打开 |\n"
        "| 检查学习包合格不合格 | [[private-wiki/learning/lifecycle-replication-standard]] | 确认背景、步骤、验收、隐私边界 |\n\n"
        "## 工作流骨架\n\n"
        "1. 发现：来自下载、微信、Hanako、Trae、Coze、小安、项目目录和新 App。\n"
        "2. 索引：先进入来源索引，不直接写公开页。\n"
        "3. 编译：进 `private-wiki/` 的主题页，只写摘要、证据、风险和下一步。\n"
        "4. 提炼：把重复流程写成技能，把可教内容写成学习包。\n"
        "5. 验收：跑结构检查、隐私扫描和前端数据检查。\n"
        "6. 发布：只有脱敏重写后才进 `wiki/` 和 `site-data/`。\n\n"
        "## 学习文件目录\n\n"
        "| 文件 | 用途 | 适合什么时候写 |\n"
        "|---|---|---|\n"
        "| [[private-wiki/learning/lifecycle-learning-package-template]] | 学习包正文模板 | 主题已经选好，开始写正文时 |\n"
        "| [[private-wiki/learning/first-learning-package-walkthrough]] | 第一份学习包示例 | 不知道怎么从来源写成资料时 |\n"
        "| [[private-wiki/learning/lifecycle-replication-standard]] | 学习包合格标准 | 要判断一份包是否完成时 |\n"
        "| [[private-wiki/learning/beginner-learning-package-workbench]] | 学习包工作台 | 正在对照证据改写时 |\n"
        "| [[private-wiki/learning/curated-package-digest]] | 学习包选题摘要 | 还在挑主题时 |\n"
        "| [[private-wiki/learning/lifecycle-package-queue]] | 学习候选队列 | 还在找素材时 |\n"
        "| [[private-wiki/learning/learning-evidence-inventory]] | 学习证据索引 | 需要查全量文件级证据时 |\n"
        "| [[private-wiki/learning/beginner-learning-path]] | 小白阅读路线 | 想先让新人看懂结构时 |\n"
        "| [[private-wiki/learning/glossary-for-beginners]] | 小白术语表 | 术语太多、需要统一语言时 |\n\n"
        "## 写作顺序\n\n"
        "- 先看这个总入口，再开模板。\n"
        "- 先写私有版，再决定要不要公开改写。\n"
        "- 任何含密钥、路径、账号、聊天原文、个人隐私的东西，都只留在私有层。\n"
    )
    write_page(out / "guide" / "workflow-and-learning-hub.md", "工作流和学习文件总入口", ["Workflow And Learning Hub", "工作流学习总入口"], ["personal-archive", "guide", "workflow", "learning"], "private-guide", "hub", "把工作流、学习包模板、候选队列和验收标准集中到一个入口。", workflow_hub_body, "internal")

    critique_loop_body = (
        "这页定义“挑刺 -> 调研 -> 分析 -> 完善 -> 验收”的闭环。它用于避免知识库只变大、不变清楚。\n\n"
        "## 一次挑刺怎么跑\n\n"
        "| 步骤 | 问题 | 输出 |\n"
        "|---|---|---|\n"
        "| 挑刺 | 哪句话没证据、哪一步小白看不懂、哪处可能泄露隐私？ | 问题清单 |\n"
        "| 调研 | 官方文档、公开项目或成熟框架怎么处理同类问题？ | 来源笔记或引用入口 |\n"
        "| 分析 | 哪些做法适合安的书房，哪些不适合？ | 取舍说明 |\n"
        "| 完善 | 改页面、模板、脚本、待办或自动化规则。 | 可读内容或工具改进 |\n"
        "| 验收 | 结构、隐私、测试、站点数据和小白可读性是否通过？ | 验收结果或阻塞项 |\n\n"
        "## 挑刺清单\n\n"
        "- 来源：有没有官方文档、公开项目或本地证据，还是只靠感觉。\n"
        "- 小白：是否先解释人话，再放术语。\n"
        "- 复刻：读者是否能做出一个最小作品。\n"
        "- 隐私：是否出现路径、账号、密钥、聊天原文、私有 app 状态。\n"
        "- 前端：卡片和详情页是否自包含，不要求读者知道后台目录。\n"
        "- 自动化：失败有没有记录，输出有没有落到 Obsidian。\n"
        "- 维护：这次改进是否能进入模板、脚本或待办，而不是只停在聊天里。\n\n"
        "## 调研来源优先级\n\n"
        "1. 官方文档或标准：例如 [[wiki/sources/obsidian-properties]]、[[wiki/sources/github-actions-scheduled-workflows]]。\n"
        "2. 成熟框架：例如 [[wiki/sources/diataxis-framework]]。\n"
        "3. 公开项目或 GitHub 示例：只吸收可验证做法，不复制私有实现。\n"
        "4. 本地私有证据：只作为经历依据，公开前必须脱敏重写。\n\n"
        "## 学习资料质量线\n\n"
        "- 教程：让小白第一次做成一个小东西。\n"
        "- 操作指南：解决一个具体任务。\n"
        "- 参考：列字段、状态、命令、检查项。\n"
        "- 解释：说明为什么这样设计、哪里会失败。\n\n"
        "## 完成定义\n\n"
        "- 页面能说清：这是什么、适合谁、怎么做、怎么验收、哪里会失败。\n"
        "- 如果要公开，必须通过公开结构检查、隐私扫描和站点数据生成。\n"
        "- 如果只是私有材料，也必须有来源、风险等级和下一步。\n"
    )
    write_page(out / "guide" / "critique-research-optimization-loop.md", "挑刺调研分析优化闭环", ["Critique Research Optimization Loop", "挑刺优化闭环"], ["personal-archive", "guide", "review", "research"], "private-guide", "workflow", "把挑刺、外部调研、分析、页面优化和验收连接成可重复流程。", critique_loop_body, "internal")

    source_protocol_body = (
        "这页定义新资料进入本地知识库的标准流程。适用来源包括下载目录、微信文件、Hanako、Trae、Coze/小安、Codex/Claude/Cursor 会话、项目目录和未知新 App。\n\n"
        "## 标准流程\n\n"
        "1. 判断来源类别：学习资料、项目证据、Agent 配置、聊天/个人材料、安全/凭据线索、本地资产。\n"
        "2. 先进入来源索引，不直接写公开页。\n"
        "3. 只记录元数据、摘要、风险和证据定位；密钥、cookie、session、聊天原文不复制进编译页。\n"
        "4. 编译后从 [[private-wiki/local-sources/index]]、[[private-wiki/context/index]] 或主题页进入后续处理。\n\n"
        "## Codex 执行清单\n\n"
        "```powershell\n"
        "python scripts/build_local_source_inventory.py . --root-id <root-id>\n"
        "python scripts/build_local_archive_inventory.py .\n"
        "python scripts/build_private_wiki.py .\n"
        "python scripts/check_private_wiki.py .\n"
        "```\n\n"
        "## 来源优先级\n\n"
        "- P0：凭据、会话、账号、密钥、个人身份和聊天上下文，只进入安全复核。\n"
        "- P1：项目、学习资料、Agent 规则、工作流、规格文档，优先编译成主题页。\n"
        "- P2：安装包、二进制、重复备份和依赖目录，只保留元数据，除非能解释项目背景。\n\n"
        "## 当前高信号来源根\n\n"
        + root_signal_table(local_root_rows, 18)
        + "\n\n## 输出位置\n\n"
        "- 来源覆盖：[[private-wiki/local-sources/index]]\n"
        "- 最近活动：[[private-wiki/automation/recent-activity]]\n"
        "- 上下文地图：[[private-wiki/context/index]]\n"
        "- 安全复核：[[private-wiki/security/review-priority]]\n"
        "- 后续动作：[[private-wiki/todos/next-seven-actions]]\n"
    )
    write_page(out / "guide" / "source-intake-protocol.md", "本地资料补录协议", ["Source Intake Protocol", "新资料进入流程"], ["personal-archive", "source-intake", "guide"], "private-guide", "protocol", "定义下载、微信、Agent、项目和未知 App 资料进入私有 wiki 的标准流程。", source_protocol_body, "sensitive")

    skill_workflow_body = (
        "这页定义如何把本地经验提炼成 Codex 以后能用的技能。不是所有笔记都要变成技能；只有重复出现、能稳定指导行动的流程才值得固化。\n\n"
        "## 什么值得变成技能\n\n"
        "| 候选 | 进入条件 | 不进入条件 |\n"
        "|---|---|---|\n"
        "| 工具操作 | 多次重复、步骤明确、有验收办法 | 只是一条临时命令 |\n"
        "| 项目工作流 | 能跨项目复用，能减少返工 | 只适合单个旧项目 |\n"
        "| 安全流程 | 能阻止隐私泄露或发布事故 | 需要暴露密钥明文 |\n"
        "| 学习方法 | 能让小白按步骤复刻 | 只是收藏链接 |\n"
        "| Agent 协作 | 能明确何时用、怎么用、怎么验收 | 只是旧控制器口号 |\n\n"
        "## 提取步骤\n\n"
        "1. 从 [[private-wiki/skills/capability-brief]] 或 [[private-wiki/learning/lifecycle-package-queue]] 选一个高频主题。\n"
        "2. 写私有技能草稿：触发条件、输入、步骤、输出、验收、风险。\n"
        "3. 对照真实项目证据补充边界，避免空泛规则。\n"
        "4. 如果要成为 Codex 技能，再写成 `SKILL.md` 形式，并只放通用规则，不放私人资料。\n"
        "5. 用一次实际任务验证，失败就回到私有草稿改流程。\n\n"
        "## 能力主题分布\n\n"
        + cluster_table("技能证据主题", skill_cluster_counts, descriptions)
        + "\n\n## 交付模板\n\n"
        "- 技能名称：一句话说明用途。\n"
        "- 触发条件：用户说什么、任务出现什么信号时使用。\n"
        "- 输入材料：需要哪些文件、上下文或检查结果。\n"
        "- 操作步骤：不超过 7 步，能重复执行。\n"
        "- 验收标准：怎么判断结果完成。\n"
        "- 安全边界：哪些资料只能留私有。\n"
    )
    write_page(out / "guide" / "skill-extraction-workflow.md", "本地经验到 Codex 技能提取流程", ["技能提取流程", "Codex Skill Extraction"], ["personal-archive", "skills", "workflow"], "private-guide", "workflow", "把本地项目、学习和 Agent 经验提炼成可复用 Codex 技能的流程。", skill_workflow_body, "internal")

    lifecycle_standard_body = (
        "这页定义“生命周期复刻学习资料”的标准。目标是让小白也能看懂：从为什么学、准备什么、怎么做、怎么验收，到如何继续扩展。\n\n"
        "## 一份合格学习包必须包含\n\n"
        "| 模块 | 内容 | 验收 |\n"
        "|---|---|---|\n"
        "| 背景 | 这个主题解决什么问题，适合谁 | 读者能判断要不要学 |\n"
        "| 前置知识 | 需要会什么，不会怎么办 | 小白知道先补哪一块 |\n"
        "| 材料 | 来源、项目、工具、版本、隐私省略说明 | 来源可追溯，隐私不泄露 |\n"
        "| 步骤 | 从 0 到 1 的可复制流程 | 每步有产出物 |\n"
        "| 常见错误 | 本地踩过的坑和修复方式 | 能减少重复试错 |\n"
        "| 验收 | 命令、页面、截图、功能或清单 | 结果可检查 |\n"
        "| 延伸 | 下一步项目化或公开展示方式 | 能继续成长为作品 |\n\n"
        "## 私有到公开的写法\n\n"
        "- 私有版可以保留来源定位、风险、状态和内部判断。\n"
        "- 公开版必须中文重写，删除本地路径、账号、密钥、聊天原文和未确认身份信息。\n"
        "- 公开版要解释概念，不假设读者懂 Agent、Obsidian、前端、后端或自动化。\n"
        "- 每份学习包至少链接一个来源说明、一个项目页、一个验收页。\n\n"
        "## 当前候选入口\n\n"
        "- [[private-wiki/learning/lifecycle-package-queue]] - 本地候选池\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 正式正文模板\n"
        "- [[wiki/synthesis/lifecycle-package-backlog]] - 公开学习包 backlog\n"
        "- [[wiki/concepts/lifecycle-replication-package-template]] - 公开模板\n"
    )
    write_page(out / "learning" / "lifecycle-replication-standard.md", "生命周期复刻学习资料标准", ["学习包标准", "Lifecycle Replication Standard"], ["personal-archive", "learning", "standard"], "private-learning", "standard", "定义面向小白的可复制生命周期学习资料结构、验收和隐私边界。", lifecycle_standard_body, "internal")

    learning_template_body = (
        "这页是学习包正文模板。主题选好以后，直接按这份结构填内容，不要临时重想章节。\n\n"
        "## 怎么用\n\n"
        "1. 先写主题和一句话目标。\n"
        "2. 再补背景、前置知识、材料和步骤。\n"
        "3. 最后补常见错误、验收和延伸方向。\n"
        "4. 所有私有证据只写来源入口，不复制明文。\n\n"
        "## 正文模板\n\n"
        "```markdown\n"
        "# 主题名\n\n"
        "## 这是什么\n"
        "一句话说明这个主题是什么、解决什么问题。\n\n"
        "## 为什么学\n"
        "说明它为什么值得学，适合谁。\n\n"
        "## 前置知识\n"
        "- 先懂什么\n"
        "- 不会怎么办\n\n"
        "## 材料\n"
        "- 来源说明\n"
        "- 项目证据\n"
        "- 工具和环境\n\n"
        "## 怎么做\n"
        "1. 第一步\n"
        "2. 第二步\n"
        "3. 第三步\n\n"
        "## 常见错误\n"
        "- 本地常踩坑 1\n"
        "- 本地常踩坑 2\n\n"
        "## 怎么验收\n"
        "- 可以检查什么结果\n"
        "- 哪个页面或命令算通过\n\n"
        "## 下一步\n"
        "- 还能扩展成什么项目\n"
        "- 能不能再写成公开资料\n\n"
        "## 私有证据\n"
        "- 来源入口\n"
        "- 风险说明\n"
        "```\n\n"
        "## 填写原则\n\n"
        "- 一页只写一个主题。\n"
        "- 句子尽量短，让小白能直接照着做。\n"
        "- 看见密钥、账号、路径、聊天原文，就只记定位，不记明文。\n"
    )
    write_page(out / "learning" / "lifecycle-learning-package-template.md", "生命周期学习包正文模板", ["学习包模板", "Lifecycle Learning Package Template"], ["personal-archive", "learning", "template"], "private-learning", "template", "给小白学习包写作使用的正文模板，先写私有版再考虑公开改写。", learning_template_body, "internal")

    readiness_rows = [
        {
            "area": "本地来源覆盖",
            "current": f"{len(local_root_rows)} roots / {len(local_rows)} files",
            "ready": "已建索引，仍需持续处理 modified/missing 状态。",
            "next": "[[private-wiki/automation/local-source-incremental-watch]]",
        },
        {
            "area": "个人成长线",
            "current": f"{len(recovered_growth) + len(local_growth)} candidates",
            "ready": "候选充足，但真实事件需要人工确认。",
            "next": "[[private-wiki/profile/growth-milestones]]",
        },
        {
            "area": "项目和作品",
            "current": f"{len(all_project_rows)} candidates",
            "ready": "已聚类，下一步是补项目卡和公开角度。",
            "next": "[[private-wiki/projects/project-card-template]]",
        },
        {
            "area": "技能和能力",
            "current": f"{len(all_skill_rows)} candidates",
            "ready": "需要绑定项目证据和可复刻步骤。",
            "next": "[[private-wiki/skills/skill-extraction-backlog]]",
        },
        {
            "area": "Agent 配置和规则",
            "current": f"{len(all_agent_rows)} candidates",
            "ready": "已区分当前/历史规则，配置原文默认私有。",
            "next": "[[private-wiki/agents/active-rule-surfaces]]",
        },
        {
            "area": "隐私和密钥",
            "current": f"{len(credential_rows)} credential rows / {len(personal_rows)} personal rows",
            "ready": "只可作为复核队列，不可当公开内容。",
            "next": "[[private-wiki/security/finding-disposition]]",
        },
    ]
    readiness_table = ["| 领域 | 当前规模 | 完整度判断 | 下一步入口 |", "|---|---:|---|---|"]
    for row in readiness_rows:
        readiness_table.append(f"| {row['area']} | `{row['current']}` | {row['ready']} | {row['next']} |")
    dashboard_body = (
        "这页回答“本地知识库是否完整”。结论：来源覆盖已经成型，但语义整理要按安全、项目、学习包和公开候选四条线继续推进。\n\n"
        "## 完整度仪表盘\n\n"
        + "\n".join(readiness_table)
        + "\n\n## 当前不是最终完成的原因\n\n"
        "- 很多条目还是文件级、来源级或风险级元数据，不是已经写完的主题文章。\n"
        "- 时间线里混有文件修改时间、资料引用日期和真实事件，不能直接当个人成长史。\n"
        "- Agent 规则里有当前规则、项目局部规则、历史规则和废弃规则，必须先分层。\n"
        "- 密钥、账号、会话、微信和本地路径只能进入私有复核，不允许直接公开。\n\n"
        "## 下一批完成定义\n\n"
        "- 每周至少完成 1 个项目卡、1 个技能候选、1 个学习包提纲和 1 组安全复核。\n"
        "- 每个公开候选必须有来源、中文说明、复刻步骤、验收和隐私省略说明。\n"
        "- 每次自动化运行都要能解释：新资料在哪里、是否安全、要不要进入待办。\n"
    )
    write_page(out / "guide" / "completeness-and-readiness-dashboard.md", "本地知识库完整度仪表盘", ["Completeness Dashboard", "是否完整"], ["personal-archive", "guide", "readiness"], "private-guide", "dashboard", "用来源覆盖、项目、技能、Agent、时间线和安全队列判断本地知识库完整度。", dashboard_body, "sensitive")

    beginner_package_body = (
        "这页是把本地资料写成“安的书房”中文学习资料前的私有工作台。它面向小白读者设计，但这里只保存私有草稿和证据定位。\n\n"
        "## 选题顺序\n\n"
        "1. 先选一个能代表成长或项目成果的主题。\n"
        "2. 找到私有证据：项目页、能力矩阵、来源地图和验收记录。\n"
        "3. 对照官方文档或 GitHub 最佳实践，只吸收能解决当前主题的问题。\n"
        "4. 按背景、前置知识、材料、步骤、常见错误、验收、延伸写成中文。\n"
        "5. 删除本地路径、账号、密钥、私聊、未确认身份和私有配置原文。\n\n"
        "## 优先可写主题\n\n"
        + cluster_table("项目候选主题", project_cluster_counts, descriptions)
        + "\n\n"
        + cluster_table("能力候选主题", skill_cluster_counts, descriptions)
        + "\n\n## 学习包写作模板\n\n"
        "| 模块 | 小白读者要看到什么 | 私有证据从哪里来 |\n"
        "|---|---|---|\n"
        "| 这是什么 | 一句话说明主题和用途 | 项目卡或来源说明 |\n"
        "| 为什么学 | 解决的真实问题 | 成长节点或项目背景 |\n"
        "| 准备什么 | 工具、概念、账号前提；敏感配置只写“认证配置” | 私有来源地图 |\n"
        "| 怎么做 | 5-9 个步骤，每步有产出 | 项目证据和验收记录 |\n"
        "| 怎么检查 | 页面、命令、清单或功能结果 | 自动化/测试结果 |\n"
        "| 常见错误 | 本地踩坑的抽象经验 | 私有对话或项目记录的改写 |\n"
        "| 下一步 | 怎么变成作品或能力证明 | 公开候选队列 |\n\n"
        "## 入口\n\n"
        "- [[private-wiki/guide/workflow-and-learning-hub]] - 工作流和学习文件总入口\n"
        "- [[private-wiki/learning/lifecycle-replication-standard]] - 标准\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 正文模板\n"
        "- [[private-wiki/learning/lifecycle-package-queue]] - 候选池\n"
        "- [[private-wiki/projects/project-card-template]] - 项目卡模板\n"
        "- [[private-wiki/publication/top-candidates-by-theme]] - 中文公开候选\n"
    )
    write_page(out / "learning" / "beginner-learning-package-workbench.md", "小白可读学习包工作台", ["Beginner Package Workbench", "中文学习资料工作台"], ["personal-archive", "learning", "publication"], "private-learning", "workbench", "把本地资料改写成小白可读中文生命周期学习包的私有工作台。", beginner_package_body, "internal")

    skill_backlog_body = (
        "这页把本地经验整理成 Codex 后续可复用技能的候选池。技能不是收藏夹，必须能触发、执行、产出和验收。\n\n"
        "## 技能候选主题\n\n"
        + cluster_table("能力主题", skill_cluster_counts, descriptions)
        + "\n\n"
        + cluster_table("Agent 主题", agent_cluster_counts, descriptions)
        + "\n\n## 第一批建议提炼的技能\n\n"
        "| 技能方向 | 适用场景 | 私有证据入口 | 验收方式 |\n"
        "|---|---|---|---|\n"
        "| 本地私有 wiki 编译 | 新下载、微信、Agent 会话、项目资料进入知识库 | [[private-wiki/guide/source-intake-protocol]] | private-wiki 页面和检查脚本通过 |\n"
        "| 生命周期学习包写作 | 把一个项目或工具学习过程写成小白教程 | [[private-wiki/learning/beginner-learning-package-workbench]] | 包含步骤、常见错误和验收 |\n"
        "| Agent 规则面整理 | 区分当前规则、历史规则和废弃规则 | [[private-wiki/agents/active-rule-surfaces]] | 规则能写回当前规范面 |\n"
        "| 公开前隐私复核 | 从私有证据改写公开中文页 | [[private-wiki/security/review-priority]] | 公开扫描 high risk 为 0 |\n"
        "| 前端站点数据边界 | 后端 Obsidian 只输出公开 JSON 给网页 | [[wiki/concepts/public-site-data-boundary]] | site-data 不含私有层 |\n\n"
        "## 候选明细\n\n"
        + source_status_table(all_skill_rows + all_agent_rows, 80)
        + "\n\n## 提炼规则\n\n"
        "- 触发条件必须明确：什么时候用这个技能。\n"
        "- 步骤必须可执行：不能只是愿景或口号。\n"
        "- 输出必须落地：页面、脚本、清单、报告或验收记录。\n"
        "- 私有素材只能做证据，不进公开技能正文。\n"
    )
    write_page(out / "skills" / "skill-extraction-backlog.md", "Codex 技能提取候选池", ["Skill Extraction Backlog", "技能候选池"], ["personal-archive", "skills", "codex"], "private-skills", "backlog", "从本地项目、Agent、学习和安全流程中提取可复用 Codex 技能的候选池。", skill_backlog_body, "sensitive")

    automation_sop_body = (
        "这页定义两小时异步自动化循环怎么运行、产出写到哪里、什么时候需要人工介入。\n\n"
        "## 异步循环\n\n"
        "| 时间偏移 | 任务 | 主要问题 | 输出 |\n"
        "|---|---|---|---|\n"
        "| +05 | 本地来源 intake | 电脑里最近多了什么？ | [[private-wiki/automation/recent-activity]] 和来源索引 |\n"
        "| +25 | GitHub/官方最佳实践学习 | 当前流程有没有更好的做法？ | 来源说明、流程修订或 backlog |\n"
        "| +40 | 生命周期学习包构建 | 哪个主题可以变成小白可读资料？ | 私有草稿或公开安全页 |\n"
        "| +55 | 验收门禁 | 有没有断链、隐私、构建或测试问题？ | 验收记录和阻塞项 |\n"
        "| +58 | 流程复盘 | 自动化本身哪里要改？ | 更新待办、协议和模板 |\n\n"
        "## 人工介入条件\n\n"
        "- 出现高风险凭据线索：进入 [[private-wiki/security/review-priority]]，不自动公开。\n"
        "- 新来源无法分类：先放 [[private-wiki/context/continuation-questions]]，等人工决定。\n"
        "- 学习包缺来源或验收：只留私有草稿，不进入 `wiki/`。\n"
        "- 自动化失败：写入待办，不隐藏失败。\n\n"
        "## 输出必须落地到 Obsidian\n\n"
        "- 新资料：[[private-wiki/local-sources/index]]\n"
        "- 上下文：[[private-wiki/context/index]]\n"
        "- 学习包：[[private-wiki/learning/lifecycle-package-queue]]\n"
        "- 待办：[[private-wiki/todos/lifecycle-workflow-todo]] 和 [[private-wiki/todos/next-seven-actions]]\n"
        "- 公开候选：[[private-wiki/publication/top-candidates-by-theme]]\n"
    )
    write_page(out / "automation" / "lifecycle-loop-operating-procedure.md", "两小时生命周期自动化 SOP", ["自动化 SOP", "Lifecycle Loop SOP"], ["automation", "workflow", "lifecycle"], "private-automation", "sop", "定义两小时异步知识库自动化循环、输出位置和人工介入条件。", automation_sop_body, "internal")

    publication_theme_body = (
        "这页把公开候选从巨大的明细表压缩成主题视图。它不是发布许可，只是帮助选择下一批中文资料。\n\n"
        "## 优先公开主题\n\n"
        + cluster_table("项目候选主题", project_cluster_counts, descriptions)
        + "\n\n"
        + cluster_table("能力候选主题", skill_cluster_counts, descriptions)
        + "\n\n"
        + cluster_table("Agent 候选主题", agent_cluster_counts, descriptions)
        + "\n\n## 选择规则\n\n"
        "- 先选能解释成长路线和项目成果的主题。\n"
        "- 再选能给读者复刻的学习包。\n"
        "- 任何涉及凭据、会话、个人身份、本地路径和聊天原文的材料，只能作为私有证据。\n"
        "- 公开中文页必须能回答：这是什么、为什么重要、怎么做、怎么验收、哪些内容被隐私省略。\n\n"
        "## 下一步\n\n"
        "- 从每个高频主题挑 1 个代表项目，补成私有摘要。\n"
        "- 再从私有摘要改写成公开页，不直接搬运原文。\n"
        "- 公开前跑结构、隐私、清单和站点数据生成验收。\n"
    )
    write_page(out / "publication" / "top-candidates-by-theme.md", "公开候选主题摘要", ["Top Publication Candidates", "公开主题候选"], ["personal-archive", "publication", "showcase"], "private-publication", "summary", "把公开候选按项目、能力和 Agent 主题聚合，辅助选择下一批中文展示资料。", publication_theme_body, "internal")

    capability_matrix_body = (
        "这页把“会什么”绑定到“做过什么”。它用于防止能力页变成工具名堆叠，也用于后续写公开项目卡和学习包。\n\n"
        "## 能力到项目矩阵\n\n"
        "| 能力主题 | 能力证据 | 项目证据 | 公开可写角度 | 风险处理 |\n"
        "|---|---:|---:|---|---|\n"
        f"| 知识管理与资料编译 | {skill_cluster_counts.get('知识管理与资料编译', 0)} | {project_cluster_counts.get('个人资料库与知识库展示', 0)} | 如何把本地资料编译成可维护知识库 | 删除本地路径、原始聊天和密钥线索 |\n"
        f"| Agent 工程 | {skill_cluster_counts.get('Agent 工程', 0)} | {project_cluster_counts.get('AI Agent 与多智能体系统', 0)} | 如何设计 Agent、技能、上下文和验收 | 不公开 prompt、memory、token 和私有规则原文 |\n"
        f"| 前端产品实现 | {skill_cluster_counts.get('前端产品实现', 0)} | {project_cluster_counts.get('前端与全栈应用', 0)} | 如何把资料库做成可读网站 | 只展示公开截图和安全 JSON 数据 |\n"
        f"| 后端与接口 | {skill_cluster_counts.get('后端与接口', 0)} | {project_cluster_counts.get('前端与全栈应用', 0)} | 如何给前端提供受控数据边界 | 不公开服务端密钥、代理配置和真实环境变量 |\n"
        f"| 自动化与数据处理 | {skill_cluster_counts.get('自动化与数据处理', 0)} | {project_cluster_counts.get('自动化与工作流', 0)} | 如何持续扫描、编译、验收和复盘 | 自动化只落私有元数据，公开只写方法 |\n"
        f"| 测试与验收 | {skill_cluster_counts.get('测试与验收', 0)} | {project_cluster_counts.get('自动化与工作流', 0)} | 如何建立发布前门禁 | 验收记录不带本地敏感路径和 secret 值 |\n\n"
        "## 下一批项目证据候选\n\n"
        + source_status_table(all_project_rows, 28)
        + "\n\n## 使用规则\n\n"
        "- 每个公开能力页至少绑定一个项目证据和一个可复刻流程。\n"
        "- 只有工具名、没有交付结果的条目先留在私有能力池。\n"
        "- 风险为 credential、private-memory、local-path 的条目只能作为私有证据，公开时重写成抽象经验。\n"
    )
    write_page(out / "projects" / "project-capability-matrix.md", "项目能力证据矩阵", ["Project Capability Matrix", "能力项目矩阵"], ["personal-archive", "projects", "skills"], "private-projects", "matrix", "把能力主题绑定到项目证据、公开角度和风险处理方式。", capability_matrix_body, "internal")

    project_card_template_body = (
        "这页是私有项目卡模板。每个重要项目先按这个模板补齐，再决定是否改写成公开中文作品页。\n\n"
        "## 项目卡模板\n\n"
        "```markdown\n"
        "## 项目名称\n\n"
        "- 状态：private-draft / needs-redaction / public-safe-candidate / published\n"
        "- 一句话：这个项目解决什么问题。\n"
        "- 我的角色：我负责的部分。\n"
        "- 时间线：开始、关键节点、当前状态。\n"
        "- 技术栈：只写可公开技术，不写密钥、账号和私有部署细节。\n"
        "- 关键产出：页面、脚本、模型、文档、自动化、验收结果。\n"
        "- 能力证据：链接到 [[private-wiki/projects/project-capability-matrix]] 中的能力。\n"
        "- 来源证据：链接到私有来源或公开 source note。\n"
        "- 风险：local-path / credential / personal / private-memory / none。\n"
        "- 公开写法：准备给读者看的中文角度。\n"
        "- 下一步：补证据、脱敏、截图、验收或发布。\n"
        "```\n\n"
        "## 第一批建议建卡主题\n\n"
        + source_status_table(all_project_rows, 16)
        + "\n\n## 验收\n\n"
        "- 项目卡能回答“是什么、为什么做、我做了什么、结果是什么、怎么证明”。\n"
        "- 项目卡不需要暴露本地路径、真实账号、密钥、聊天原文和未确认个人身份。\n"
        "- 公开项目页必须从项目卡重写，不能直接搬私有证据表。\n"
    )
    write_page(out / "projects" / "project-card-template.md", "私有项目卡模板", ["Project Card Template", "项目卡模板"], ["personal-archive", "projects", "template"], "private-projects", "template", "用于把本地项目证据整理成可复核、可改写、可公开的私有项目卡。", project_card_template_body, "internal")

    growth_milestones_body = (
        "这页只收敛候选成长里程碑，不把文件时间线直接当成人生事件。所有未人工确认的条目都保留为 candidate。\n\n"
        "## 里程碑候选\n\n"
        "| 日期 | 事件类型 | 置信度 | 候选事件 | 证据入口 | 公开处理 |\n"
        "|---|---|---|---|---|---|\n"
        "| 2026-05 | current-work | high | 本地 Karpathy-style 知识库、私有编译层、公开中文资料库和站点数据边界集中成型。 | [[private-wiki/guide/local-knowledge-map]] | 可公开为“安的书房”建设日志。 |\n"
        "| 2026-05 | learning-workflow | medium | Hanako、Trae、Coze/小安、下载资料和微信附件进入持续学习资料池。 | [[private-wiki/learning/lifecycle-package-queue]] | 只公开工具学习方法，不公开私有文件。 |\n"
        "| 2026-04 | agent-workflow | medium | Codex、Claude、Agent 技能、规则和多 Agent 协作资料大量沉淀。 | [[private-wiki/agents/agent-ecosystem-brief]] | 可公开为 Agent 工程方法论。 |\n"
        "| 2026-04 | project-delivery | medium | 前端、后端、校园/竞赛、小程序和自动化项目证据集中出现。 | [[private-wiki/projects/showcase-draft]] | 按项目卡逐个脱敏。 |\n"
        "| earlier | historical-context | low | 更早的成长、学习、项目和个人资料仍在时间线中，需要人工确认。 | [[private-wiki/timeline/index]] | 未确认前不公开。 |\n\n"
        "## 事件类型说明\n\n"
        "- `current-work`：当前正在做的明确工作。\n"
        "- `learning-workflow`：学习和资料复刻流程。\n"
        "- `agent-workflow`：Agent、技能、规则和自动化协作。\n"
        "- `project-delivery`：有交付痕迹的项目。\n"
        "- `historical-context`：旧资料、备份或引用日期，需要人工复核。\n\n"
        "## 下一步\n\n"
        "- 每次只把 3-5 个高置信节点补成正式成长条目。\n"
        "- 文件修改时间、资料引用日期、压缩包成员日期不能直接当真实事件。\n"
        "- 公开成长线只讲愿意展示的阶段和作品，不公开个人隐私细节。\n"
    )
    write_page(out / "profile" / "growth-milestones.md", "成长里程碑候选", ["Growth Milestones", "成长节点"], ["personal-archive", "growth", "timeline"], "private-profile", "milestones", "把大量时间线压缩成待人工确认的成长里程碑候选。", growth_milestones_body, "sensitive")

    source_authority_body = (
        "这页用于区分当前来源、备份来源、重复来源和只做参考的来源，避免把同一份资料反复当成新信息。\n\n"
        "## 来源等级\n\n"
        "| 等级 | 含义 | 典型来源 | 处理方式 |\n"
        "|---|---|---|---|\n"
        "| A 当前工作源 | 最近还会变化、最接近真实状态 | 当前项目、当前 Agent 配置、当前下载和微信附件 | 优先索引，增量编译。 |\n"
        "| B 恢复档案 | 重建前 vault 和外部 archive | pre-rebuild archive、恢复演练副本 | 作为证据和历史，不覆盖当前判断。 |\n"
        "| C 备份/重复源 | 旧备份、重复项目、复制目录 | 外部备份、旧导入、重复 workspace | 去重后只保留代表来源。 |\n"
        "| D 参考/依赖源 | node_modules、安装包、第三方源码、模板 | 依赖目录、exe、压缩包成员 | 默认只保留元数据，除非能解释学习主题。 |\n\n"
        "## 当前来源信号\n\n"
        + root_signal_table(local_root_rows, 24)
        + "\n\n## 去重规则\n\n"
        "- 同名同大小同时间的文件只算一个证据族。\n"
        "- 当前项目优先于备份项目，手写文档优先于依赖生成文件。\n"
        "- 微信/下载附件先按来源时间和主题归档，不直接公开。\n"
        "- 压缩包只索引成员；需要展开时必须在临时私有目录做。\n\n"
        "## 输出\n\n"
        "- 需要继续读：进入 [[private-wiki/context/source-priority-map]]。\n"
        "- 只是备份：留在来源索引，不生成公开候选。\n"
        "- 有安全风险：进入 [[private-wiki/security/review-priority]]。\n"
    )
    write_page(out / "context" / "source-authority-and-dedupe.md", "来源权威度与去重规则", ["Source Authority And Dedupe", "来源去重"], ["personal-archive", "context", "source-quality"], "private-context", "policy", "区分当前来源、备份来源、重复来源和参考来源，防止资料重复膨胀。", source_authority_body, "internal")

    current_state_body = (
        "这页回答：哪些可以当当前事实，哪些只是历史备份，哪些还需要人工确认。它是防止旧规则、旧项目和重复备份污染当前判断的总闸门。\n\n"
        "## 状态分层\n\n"
        "| 状态 | 含义 | 典型证据 | 下一步 |\n"
        "|---|---|---|---|\n"
        "| current-active | 当前还在使用或正在推进 | 最近本地活动、当前项目、当前规则面 | 可进入项目卡、学习包或自动化待办 |\n"
        "| historical-reference | 重建前、备份、旧控制器、旧导入 | 恢复档案、外部备份、旧规则文件 | 只作历史证据，不自动继承 |\n"
        "| needs-confirmation | 文件时间或候选线索，未确认真实事件 | 时间线、压缩包成员、导入附件 | 先写候选，不写成确定经历 |\n"
        "| private-security | 密钥、账号、会话、个人身份、微信/私聊 | 安全扫描、路径风险、聊天附件 | 只进安全复核，不公开 |\n"
        "| public-candidate | 已有公开价值但尚未脱敏改写 | 项目卡、学习包草稿、公开候选 | 走隐私扫描和结构验收 |\n\n"
        "## 当前规模判断\n\n"
        f"- 本地来源根：`{len(local_root_rows)}`，其中很多是当前工作源和备份源混合。\n"
        f"- 恢复档案行：`{len(recovered_rows)}`，默认是 historical-reference。\n"
        f"- 本地来源行：`{len(local_rows)}`，需要通过 scan_status 和来源等级判断是否当前。\n"
        f"- 时间线行：`{len(local_timeline_rows)}`，不能直接等同于真实成长事件。\n"
        f"- 本地风险线索：`{len(local_finding_rows)}`，默认 private-security。\n\n"
        "## 规则\n\n"
        "- 当前事实优先看当前来源和最近活动，不从旧 archive 直接推断。\n"
        "- 历史规则除非被写回当前规则面，否则只是历史背景。\n"
        "- 公开页只能使用 public-candidate 且通过验收的内容。\n"
        "- 不确定内容留 `needs-confirmation`，不要为了完整而写成确定事实。\n\n"
        "## 相关入口\n\n"
        "- [[private-wiki/context/source-authority-and-dedupe]] - 来源等级和去重\n"
        "- [[private-wiki/agents/active-rule-surfaces]] - 当前/历史/废弃规则\n"
        "- [[private-wiki/profile/growth-milestones]] - 成长事件候选\n"
        "- [[private-wiki/automation/local-source-incremental-watch]] - 最近新增和修改来源\n"
    )
    write_page(out / "context" / "current-state-map.md", "当前状态事实地图", ["Current State Map", "当前事实地图"], ["personal-archive", "context", "state"], "private-context", "map", "区分当前事实、历史备份、待确认线索、私有风险和公开候选的判断页。", current_state_body, "sensitive")

    lineage_body = (
        "这页把 Karpathy-style 的 raw -> private compiled wiki -> public wiki/site-data 串成可追踪链路。以后每个公开资料都应该能回到这张图。\n\n"
        "## 来源到页面链路\n\n"
        "| 来源组 | 私有编译页 | 下一层产物 | 公开条件 |\n"
        "|---|---|---|---|\n"
        "| 本地来源根和文件元数据 | [[private-wiki/local-sources/index]]、[[private-wiki/context/source-priority-map]] | 项目卡、学习包候选、安全复核 | 只公开脱敏后的主题结论 |\n"
        "| 恢复档案和旧 vault | [[private-wiki/profile/source-coverage]]、[[private-wiki/context/source-authority-and-dedupe]] | 历史证据、待复核条目 | 不能直接作为当前事实 |\n"
        "| 密钥/账号/会话/个人线索 | [[private-wiki/security/review-priority]]、[[private-wiki/security/finding-disposition]] | 处置状态和风险边界 | 不公开明文，只公开安全方法论 |\n"
        "| 项目和作品线索 | [[private-wiki/projects/top-projects-decision-map]]、[[private-wiki/projects/project-card-template]] | 私有项目卡、公开项目页 | 项目卡完成且隐私扫描通过 |\n"
        "| 技能和 Agent 经验 | [[private-wiki/skills/skill-extraction-backlog]]、[[private-wiki/agents/active-rule-surfaces]] | Codex 技能候选、方法论页 | 不公开 prompt、memory、token 和私有规则原文 |\n"
        "| 学习资料和 GitHub 参考 | [[private-wiki/learning/curated-package-digest]]、[[private-wiki/learning/beginner-learning-package-workbench]] | 生命周期学习包 | 中文改写、来源可追溯、验收明确 |\n"
        "| 公开安全内容 | `wiki/`、`site-data/` | 安的书房前端展示 | 结构、隐私、清单和站点数据门禁通过 |\n\n"
        "## Lineage 验收\n\n"
        "- 一个公开页至少能指回一个私有项目卡或学习包草稿。\n"
        "- 一个私有项目卡至少能指回来源组和能力矩阵。\n"
        "- 一个学习包至少有来源、步骤、验收和隐私省略说明。\n"
        "- 任何没有来源链路的公开候选先退回私有层。\n\n"
        "## 当前总量\n\n"
        f"- 本地来源：`{len(local_rows)}`\n"
        f"- 恢复来源：`{len(recovered_rows)}`\n"
        f"- 项目候选：`{len(all_project_rows)}`\n"
        f"- 技能候选：`{len(all_skill_rows)}`\n"
        f"- Agent 候选：`{len(all_agent_rows)}`\n"
    )
    write_page(out / "context" / "source-to-page-lineage.md", "来源到页面追踪关系", ["Source To Page Lineage", "来源链路"], ["personal-archive", "context", "lineage"], "private-context", "lineage", "把本地来源、私有编译页、项目卡、学习包和公开候选串成可追踪链路。", lineage_body, "internal")

    project_card_specs = [
        {
            "slug": "local-karpathy-wiki-rebuild",
            "title": "项目卡：本地 Karpathy 知识库重建",
            "terms": ["obsidian", "wiki", "资料库", "知识库", "site-data", "privacy"],
            "summary": "把散乱本地资料整理成 raw、private-wiki、wiki/site-data 三层知识库。",
            "capability": "知识管理与资料编译、隐私边界、自动化验收",
            "public_angle": "如何从本地资料开始搭建可维护、可发布的中文知识库。",
        },
        {
            "slug": "agent-workflow-governance",
            "title": "项目卡：Agent 工作流治理",
            "terms": ["agent", "codex", "claude", "mcp", "skill", "rules", "hook"],
            "summary": "把 Codex、Claude、MCP、技能、规则和多代理协作整理成可执行工作流。",
            "capability": "Agent 工程、规则治理、工具调用、验收闭环",
            "public_angle": "如何让 AI Agent 协作不靠聊天记忆，而靠规则、技能和验收。",
        },
        {
            "slug": "an-study-room-frontend",
            "title": "项目卡：安的书房前端展示",
            "terms": ["frontend", "react", "vite", "archive", "site", "网页", "展示"],
            "summary": "把公开安全的 Obsidian 内容转成网站前端可以读取的结构化资料。",
            "capability": "前端产品实现、公开数据契约、内容展示",
            "public_angle": "如何把个人资料库做成小白能读懂的公开中文资料站。",
        },
        {
            "slug": "local-model-learning-loop",
            "title": "项目卡：本地模型学习闭环",
            "terms": ["ollama", "qwen", "model", "llm", "airi", "微调", "本地"],
            "summary": "整理本地模型、工具链、学习资料和项目证据，形成可复刻学习路径。",
            "capability": "本地 AI、模型工具链、学习资料整理",
            "public_angle": "如何从工具安装、资料阅读、实验验证到项目化展示。",
        },
        {
            "slug": "automation-intake-pipeline",
            "title": "项目卡：两小时资料补录自动化",
            "terms": ["automation", "workflow", "pipeline", "scan", "intake", "自动化"],
            "summary": "用周期性流程持续发现本地新资料、更新私有 wiki、运行验收并生成待办。",
            "capability": "自动化与数据处理、测试验收、流程复盘",
            "public_angle": "如何设计一个不断学习、不断补资料、不断验收的资料库生命周期。",
        },
        {
            "slug": "coze-xiaoan-agent-materials",
            "title": "项目卡：Coze 小安与智能体资料",
            "terms": ["coze", "扣子", "小安", "xiaoan", "bot", "智能体"],
            "summary": "把 Coze/小安、下载资料、工作流和智能体项目线索放进私有编译层。",
            "capability": "智能体产品理解、工作流设计、资料编译",
            "public_angle": "如何把一个智能体项目从素材、设定、工作流整理成可复用资料。",
        },
    ]
    top_project_lines = ["| 项目方向 | 证据样本 | 公开角度 | 私有项目卡 |", "|---|---:|---|---|"]
    for spec in project_card_specs:
        rows = [
            row
            for row in all_project_rows
            if contains_any(row_text(row), spec["terms"])
        ][:80]
        top_project_lines.append(
            f"| {spec['title'].replace('项目卡：', '')} | `{len(rows)}` | {spec['public_angle']} | "
            f"[[private-wiki/projects/cards/{spec['slug']}]] |"
        )
        card_body = (
            f"{spec['summary']}\n\n"
            "## 项目判断\n\n"
            f"- 项目方向：{spec['title'].replace('项目卡：', '')}\n"
            f"- 能力主题：{spec['capability']}\n"
            f"- 公开写法：{spec['public_angle']}\n"
            f"- 当前状态：private-draft，需要继续补证据、截图、验收和脱敏说明。\n"
            f"- 证据样本数：`{len(rows)}`\n\n"
            "## 证据候选\n\n"
            + source_status_table(rows, 32)
            + "\n\n## 可公开叙事模板\n\n"
            "- 这是什么：用一句话讲清项目解决的问题。\n"
            "- 我做了什么：只讲角色、设计、实现、验证和复盘。\n"
            "- 读者能学什么：抽象成步骤和常见错误。\n"
            "- 怎么验收：页面、数据、脚本、清单或流程是否跑通。\n"
            "- 隐私省略：不公开本地路径、账号、密钥、私聊、会话原文和私有配置。\n\n"
            "## 下一步\n\n"
            "- 从证据候选中选择 3-5 个最可靠条目补成项目事实。\n"
            "- 按 [[private-wiki/projects/project-card-template]] 补时间线、角色、成果和验收。\n"
            "- 如果要公开，先转成中文公开页，再跑隐私和结构检查。\n"
        )
        write_page(out / "projects" / "cards" / f"{spec['slug']}.md", spec["title"], [spec["title"].replace("项目卡：", ""), spec["slug"]], ["personal-archive", "projects", "project-card"], "private-projects", "project-card", f"{spec['title']}的私有项目卡草稿，连接证据、能力、公开角度和下一步。", card_body, "sensitive")

    top_projects_body = (
        "这页回答：第一批最值得整理成项目卡和公开资料的方向是什么。它不是最终作品集，而是决策地图。\n\n"
        "## 第一批项目方向\n\n"
        + "\n".join(top_project_lines)
        + "\n\n## 选择标准\n\n"
        "- 能代表成长主线，而不是单个临时文件。\n"
        "- 能绑定能力证据和学习包，读者能复刻。\n"
        "- 风险可控：能删除本地路径、账号、密钥、聊天和私有配置。\n"
        "- 能支持“安的书房”中文资料展示。\n\n"
        "## 项目卡验收\n\n"
        "- 能回答：是什么、为什么做、我做了什么、结果是什么、证据在哪里。\n"
        "- 有至少 3 条私有证据候选，且风险状态明确。\n"
        "- 有公开写法和隐私省略说明。\n"
        "- 能链接到一个学习包或技能候选。\n"
    )
    write_page(out / "projects" / "top-projects-decision-map.md", "第一批项目整理决策地图", ["Top Projects Decision Map", "项目整理优先级"], ["personal-archive", "projects", "decision"], "private-projects", "decision-map", "筛选第一批最值得整理成项目卡、学习包和公开中文资料的项目方向。", top_projects_body, "internal")

    beginner_path_body = (
        "这页给完全不了解这个系统的人一条顺序阅读路线。目标是让小白先理解概念，再理解项目，再能复刻一个小流程。\n\n"
        "## 0 到 1 阅读路线\n\n"
        "| 顺序 | 读什么 | 读完应该明白什么 | 下一步产出 |\n"
        "|---:|---|---|---|\n"
        "| 1 | [[private-wiki/learning/glossary-for-beginners]] | 基础术语是什么意思 | 能看懂后续页面 |\n"
        "| 2 | [[private-wiki/synthesis/local-karpathy-wiki-operating-model]] | 为什么分 raw、private-wiki、wiki/site-data | 能解释三层结构 |\n"
        "| 3 | [[private-wiki/context/current-state-map]] | 哪些是当前事实，哪些只是历史材料 | 能避免误读旧规则 |\n"
        "| 4 | [[private-wiki/projects/top-projects-decision-map]] | 第一批项目方向有哪些 | 选一个项目卡 |\n"
        "| 5 | [[private-wiki/learning/curated-package-digest]] | 哪些主题适合做成学习包 | 选一个学习包 |\n"
        "| 6 | [[private-wiki/guide/source-intake-protocol]] | 新资料怎么进入知识库 | 能补一个来源 |\n"
        "| 7 | [[private-wiki/automation/latest-cycle-digest]] | 自动化最近做了什么 | 能判断下一步 |\n\n"
        "## 小白学习原则\n\n"
        "- 先看概念和路线，不直接看大表。\n"
        "- 每次只做一个小产出：一个来源、一张项目卡、一个学习包提纲。\n"
        "- 遇到密钥、账号、聊天、个人信息，只看复核状态，不复制内容。\n"
        "- 能公开的不是原文，而是重新写给读者看的中文经验。\n"
    )
    write_page(out / "learning" / "beginner-learning-path.md", "小白阅读路线", ["Beginner Learning Path", "新手路线"], ["personal-archive", "learning", "beginner"], "private-learning", "path", "让小白按顺序理解本地 Karpathy 知识库、项目卡、学习包和自动化闭环。", beginner_path_body, "internal")

    glossary_body = (
        "这页解释本地知识库里反复出现的术语，方便小白读者理解后续资料。\n\n"
        "## 术语表\n\n"
        "| 术语 | 简单解释 | 在本库里对应哪里 |\n"
        "|---|---|---|\n"
        "| Raw sources | 原始材料，像文件、聊天、项目、截图、压缩包；不直接改写、不直接发布 | `_raw/`、本地来源索引 |\n"
        "| Private wiki | 私有编译层，把原始材料整理成可搜索页面，但仍不公开 | `private-wiki/` |\n"
        "| Public wiki | 公开编译层，只放脱敏、中文改写、可发布的内容 | `wiki/` |\n"
        "| Site-data | 给网页前端读取的公开 JSON 数据 | `site-data/` |\n"
        "| Source note | 来源说明，告诉读者内容从哪里来 | `wiki/sources/` 或私有来源地图 |\n"
        "| Lineage | 从来源到页面再到公开展示的追踪关系 | [[private-wiki/context/source-to-page-lineage]] |\n"
        "| Project card | 一个项目的私有资料卡，写目标、角色、证据、风险和公开角度 | [[private-wiki/projects/project-card-template]] |\n"
        "| Lifecycle learning package | 从背景、准备、步骤、错误、验收到延伸的一整套学习资料 | [[private-wiki/learning/lifecycle-replication-standard]] |\n"
        "| Privacy gate | 发布前检查密钥、路径、个人信息和私有内容的门禁 | [[private-wiki/security/review-priority]] |\n"
        "| Acceptance gate | 检查结构、隐私、清单、测试和前端数据是否通过 | [[private-wiki/automation/lifecycle-loop-operating-procedure]] |\n"
        "| Agent | 能调用工具、读写文件、执行任务的 AI 工作单元 | [[private-wiki/agents/agent-ecosystem-brief]] |\n"
        "| Skill | 可复用的工作流程说明，告诉 Agent 什么时候做、怎么做、怎么验收 | [[private-wiki/skills/skill-extraction-backlog]] |\n"
        "| Redaction | 脱敏，把不能公开的路径、账号、密钥、聊天、身份信息删除或改写 | [[private-wiki/security/finding-disposition]] |\n\n"
        "## 读法\n\n"
        "- 看不懂大表时先回到这页。\n"
        "- 不要把 private-wiki 当公开内容，它是本地工作台。\n"
        "- 公开资料要让没有本地上下文的人也能读懂。\n"
    )
    write_page(out / "learning" / "glossary-for-beginners.md", "小白术语表", ["Glossary For Beginners", "新手术语表"], ["personal-archive", "learning", "glossary"], "private-learning", "glossary", "解释本地知识库、Agent、项目卡、学习包、隐私门禁和公开展示相关基础术语。", glossary_body, "internal")

    package_candidate_rows = (all_project_rows + all_skill_rows + all_agent_rows)[:240]
    package_digest_body = (
        "这页从大候选池里先挑 5 个最适合做成中文学习包的主题。每个主题都应该能变成“背景 -> 准备 -> 步骤 -> 验收 -> 延伸”。\n\n"
        "## 第一批精选学习包\n\n"
        "| 学习包 | 适合谁 | 产出物 | 私有证据入口 | 公开风险 |\n"
        "|---|---|---|---|---|\n"
        "| 从 0 搭一个 Karpathy-style Obsidian 知识库 | 想整理本地资料的人 | 三层目录、索引、检查脚本 | [[private-wiki/projects/cards/local-karpathy-wiki-rebuild]] | 删除本地路径和私有来源 |\n"
        "| 用 Agent 管理复杂项目工作流 | 想让 Codex/Claude 协作的人 | 规则面、技能、验收清单 | [[private-wiki/projects/cards/agent-workflow-governance]] | 不公开 prompt 和配置原文 |\n"
        "| 把个人资料库做成中文展示网站 | 想做作品集或知识库前端的人 | 公开 JSON、页面结构、验收 | [[private-wiki/projects/cards/an-study-room-frontend]] | 只读 site-data，不读私有目录 |\n"
        "| 建立本地模型学习闭环 | 想系统学习本地 AI 的人 | 工具链、实验记录、项目化路线 | [[private-wiki/projects/cards/local-model-learning-loop]] | 不公开账号、路径和私有模型配置 |\n"
        "| 设计两小时资料补录自动化 | 想持续积累学习资料的人 | 自动化 SOP、摘要、待办、验收 | [[private-wiki/projects/cards/automation-intake-pipeline]] | 不公开高风险线索和本地活动细节 |\n\n"
        "## 写作时直接开这个\n\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 正文模板。\n\n"
        "## 每个学习包必须补齐\n\n"
        "- 一个小白能理解的开场例子。\n"
        "- 一组前置知识，不会也知道先学什么。\n"
        "- 5-9 个可执行步骤，每步有产出。\n"
        "- 常见错误和处理方式。\n"
        "- 验收方式和下一步扩展。\n"
        "- 隐私省略说明：哪些内容因为安全原因不展示。\n\n"
        "## 为什么先写这 5 个\n\n"
        "这 5 个主题优先，因为它们同时满足：有真实项目证据、能解释三层架构、能给小白做出一个小作品、公开风险可控。\n\n"
        "候选来源明细不要放在这页；需要查证据时去 [[private-wiki/learning/learning-evidence-inventory]]。\n"
    )
    write_page(out / "learning" / "curated-package-digest.md", "精选学习包摘要", ["Curated Package Digest", "精选学习资料"], ["personal-archive", "learning", "curation"], "private-learning", "digest", "从本地候选池筛出最适合写成小白可读中文生命周期学习包的主题。", package_digest_body, "internal")

    active_rules_body = (
        "这页区分当前有效规则、历史规则、项目局部规则和废弃规则。旧控制器、旧编排和强制多 Agent 流程默认不是当前规则。\n\n"
        "## 规则面分级\n\n"
        "| 规则面 | 状态 | 用法 | 公开处理 |\n"
        "|---|---|---|---|\n"
        "| 当前 Codex/AGENTS 指令 | active | 本次和后续本地 Codex 工作优先遵守。 | 可公开为抽象协作原则，不公开本地路径。 |\n"
        "| 当前 `private-wiki/` schema | active | 管理 raw、private-wiki、wiki、site-data 边界。 | 可公开为知识库方法论。 |\n"
        "| `.codex` 和 `.agents` 技能 | active-reference | 当前工具可用技能库，但具体配置默认私有。 | 只公开通用技能模式。 |\n"
        "| 项目内 `.claude`、`.agents`、`.cursor` 规则 | project-local | 只在对应项目上下文有效。 | 公开前要确认是否仍适用。 |\n"
        "| pre-rebuild archive 里的 99/旧控制器/AOS 规则 | historical | 作为历史证据，不自动变成当前规范。 | 只提炼经验，不公开原文。 |\n"
        "| 强制编排、强制多代理、旧主控语言 | deprecated-by-default | 除非当前任务确实需要，否则不作为默认流程。 | 可公开为反模式或演进记录。 |\n\n"
        "## Agent 规则证据入口\n\n"
        "- [[private-wiki/agents/configuration-map]] - 全量候选和根目录地图。\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - 聚类后的生态摘要。\n"
        "- [[private-wiki/guide/skill-extraction-workflow]] - 把稳定流程提炼成技能。\n\n"
        "## 当前执行原则\n\n"
        "- 简单任务走简单流程。\n"
        "- 多代理只在用户明确要求或任务确实适合并行时使用。\n"
        "- 规则变化要写回当前规则面，不依赖聊天记忆。\n"
        "- 涉及隐私、密钥、本地路径和会话的规则只能留私有。\n"
    )
    write_page(out / "agents" / "active-rule-surfaces.md", "当前有效 Agent 规则面", ["Active Rule Surfaces", "当前规则面"], ["personal-archive", "agents", "governance"], "private-agents", "policy", "区分当前有效、项目局部、历史和默认废弃的 Agent 规则面。", active_rules_body, "sensitive")

    personal_body = (
        "这页是从本地证据编译出来的个人成长与定位摘要，不是公开简历。它的作用是帮助后续写公开自序、项目页和能力页。\n\n"
        "## 当前定位\n\n"
        "- 主线是把 AI Agent、知识库、自动化、前后端产品和个人资料展示系统汇合成一个可持续维护的本地知识库。^[inferred]\n"
        "- 资料形态从会话、项目、规则、脚本、前端规格、Agent 配置逐步转成可审计的 Obsidian 页面。^[inferred]\n"
        "- 公开展示不应直接复用私有证据，而应抽取项目成果、能力证明和公开安全叙事。^[inferred]\n\n"
        "## 证据覆盖\n\n"
        f"- 成长/个人候选来源：`{len(recovered_growth) + len(local_growth)}`\n"
        f"- 项目候选来源：`{len(all_project_rows)}`\n"
        f"- 能力候选来源：`{len(all_skill_rows)}`\n"
        f"- Agent 候选来源：`{len(all_agent_rows)}`\n"
        f"- 个人/隐私线索：`{len(personal_rows)}`\n\n"
        "## 成长材料候选\n\n"
        + source_bullets(recovered_growth + local_growth, 24)
        + "\n\n## 下一步\n\n"
        "- 把真实成长节点拆成按年月的事件页。\n"
        "- 把文件修改时间和真实人生/项目事件分开。\n"
        "- 写一版公开自序草稿，只保留愿意公开的身份、方向和作品。\n"
    )
    write_page(out / "profile" / "personal-brief.md", "个人成长与定位摘要", ["个人画像草稿", "成长摘要"], ["personal-archive", "growth", "summary"], "private-profile", "brief", "从本地证据编译出的个人成长、方向和展示素材摘要。", personal_body, "sensitive")

    project_body = (
        "这页把项目证据整理成展示草稿池。它不是最终作品集，目标是筛出值得公开改写的项目线。\n\n"
        + cluster_table("项目主题分布", cluster_counts(all_project_rows, project_clusters), descriptions)
        + "\n\n## 展示候选清单\n\n"
        + source_status_table(all_project_rows, 36)
        + "\n\n## 公开改写规则\n\n"
        "- 一个公开项目页只讲目标、角色、技术栈、成果、截图/演示和可公开链接。\n"
        "- 删除本地路径、账号、密钥、部署细节、未公开学校/个人信息。\n"
        "- 每个项目页至少链接一个来源说明页和一个能力页。\n"
    )
    write_page(out / "projects" / "showcase-draft.md", "项目展示草稿池", ["作品集草稿", "项目展示候选"], ["personal-archive", "projects", "showcase"], "private-projects", "draft", "用于从私有项目证据筛选公开作品集条目的草稿池。", project_body, "internal")

    skill_body = (
        "这页把技能和能力从散乱来源中聚类，方便后续写公开能力页或简历式技能说明。\n\n"
        + cluster_table("能力主题分布", cluster_counts(all_skill_rows, skill_clusters), descriptions)
        + "\n\n## 能力证据候选\n\n"
        + source_status_table(all_skill_rows, 36)
        + "\n\n## 对外表达方式\n\n"
        "- 不写“会很多工具”，要写“能完成什么交付”。\n"
        "- 每个能力最好绑定一个项目证据和一个可复用流程。\n"
        "- 私有 Agent 规则和提示词只能作为证据，不能原文公开。\n"
    )
    write_page(out / "skills" / "capability-brief.md", "能力画像与证据", ["能力画像", "技能摘要"], ["personal-archive", "skills", "summary"], "private-skills", "brief", "把本地技能、工具和流程证据聚类成可展示能力画像。", skill_body, "internal")

    agent_body = (
        "这页整理配置过的 Agent、规则、技能、提示词、上下文和历史控制面。旧规则默认是历史材料，不自动变成当前规范。\n\n"
        + cluster_table("Agent 生态分布", cluster_counts(all_agent_rows, agent_clusters), descriptions)
        + "\n\n## Agent 资料候选\n\n"
        + source_status_table(all_agent_rows, 36)
        + "\n\n## 维护规则\n\n"
        "- 当前规范只看活动规则面；旧控制器、旧编排和旧强制流程只作历史参考。\n"
        "- Agent 配置页默认私有，公开时只讲架构思想和可复用模式。\n"
        "- 涉及 prompt、memory、hook、token、local path 的内容不直接发布。\n"
    )
    write_page(out / "agents" / "agent-ecosystem-brief.md", "Agent 生态与配置地图", ["Agent生态", "配置过的智能体"], ["personal-archive", "agents", "summary"], "private-agents", "brief", "配置过的 Agent、规则、技能、提示词、记忆和上下文系统摘要。", agent_body, "sensitive")

    security_body = (
        "这页把密钥和隐私审计变成行动队列。它不显示任何密钥值，只显示类别和优先级。\n\n"
        "## 优先级\n\n"
        f"- P0：高置信凭据线索 `{len(high_credential_rows)}`，优先人工打开原始来源确认并轮换。\n"
        f"- P1：全部凭据/会话/密钥上下文 `{len(credential_rows)}`，用于清理旧配置和误报归类。\n"
        f"- P2：个人/隐私上下文 `{len(personal_rows)}`，用于公开前脱敏。\n\n"
        "## 凭据规则分布\n\n"
        + finding_summary_table(credential_rows, 60)
        + "\n\n## 处理规则\n\n"
        "- 不在 Obsidian 编译页写明文密钥。\n"
        "- 不把本地路径、账号、cookie、session、token 作为公开展示内容。\n"
        "- 轮换动作需要单独确认；本页只负责定位和排序。\n"
    )
    write_page(out / "security" / "review-priority.md", "密钥与隐私复核优先级", ["密钥复核队列", "隐私复核优先级"], ["personal-archive", "security", "review"], "private-security", "queue", "把密钥、凭据和个人隐私线索整理成不含明文的复核优先级。", security_body, "sensitive")

    model_body = (
        "这页定义本地知识库的运行模型，避免未来继续把原文、扫描表和展示页混在一起。\n\n"
        "## 三层结构\n\n"
        "- 原始层：本地文件、恢复档案、会话、截图、项目目录。只读保存，不直接发布。\n"
        "- 私有编译层：`private-wiki/`，负责成长、项目、能力、Agent、密钥、时间线和来源覆盖。\n"
        "- 公开编译层：`wiki/` 与 `site-data/`，只接收人工改写、脱敏、可展示的内容。\n\n"
        "## 为什么这样做\n\n"
        "- Karpathy-style wiki 的价值在于把知识编译成可复用页面，而不是每次重新翻原始材料。^[inferred]\n"
        "- 个人资料库需要比普通 wiki 更严格的边界，因为项目、Agent 配置和成长记录天然混有隐私。^[inferred]\n"
        "- 前端展示层应该只消费精选 JSON，不应该接触原始 Obsidian 私有目录。^[inferred]\n\n"
        "## 晋升流程\n\n"
        "1. 从 [[private-wiki/projects/showcase-draft]] 或 [[private-wiki/skills/capability-brief]] 选候选。\n"
        "2. 按 [[private-wiki/learning/lifecycle-replication-standard]] 或 [[private-wiki/guide/skill-extraction-workflow]] 提炼成可复用材料。\n"
        "3. 写公开安全草稿，删除本地路径、密钥、账号和未确认身份信息。\n"
        "4. 跑结构检查、隐私扫描和站点数据构建。\n"
        "5. 只把通过检查的内容放进 `site-data/` 给前端。\n\n"
        "## 操作入口\n\n"
        "- [[private-wiki/guide/local-knowledge-map]] - 先判断资料属于哪条线。\n"
        "- [[private-wiki/guide/source-intake-protocol]] - 新资料先登记和索引。\n"
        "- [[private-wiki/automation/lifecycle-loop-operating-procedure]] - 自动化负责持续发现和验收。\n"
        "- [[private-wiki/todos/next-seven-actions]] - 人工每次只推进一小批。\n"
    )
    write_page(out / "synthesis" / "local-karpathy-wiki-operating-model.md", "本地 Karpathy 知识库运行模型", ["本地知识库运行模型", "Karpathy Wiki 本地模型"], ["personal-archive", "karpathy-wiki", "synthesis"], "private-synthesis", "model", "定义 raw、private-wiki、wiki/site-data 三层之间的职责和晋升流程。", model_body, "internal")

    context_pages = write_deep_context_pages(
        out,
        recovered_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        local_timeline_rows,
        archive_rows,
    )

    return 33 + context_pages


def write_personal_archive_pages(
    root: Path,
    out: Path,
    recovered_rows: list[dict[str, str]],
    sensitive_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    local_timeline_rows: list[dict[str, str]],
    archive_rows: list[dict[str, str]],
) -> dict[str, int]:
    growth_terms = [
        "成长",
        "目标",
        "待办",
        "复盘",
        "周期",
        "每日",
        "手记",
        "简历",
        "个人",
        "档案",
        "学习",
        "学校",
        "大学",
        "竞赛",
        "规划",
        "路线",
        "经历",
        "diary",
        "journal",
        "profile",
        "resume",
        "goal",
        "plan",
        "todo",
        "review",
        "timeline",
    ]
    project_terms = [
        "项目",
        "project",
        "repo",
        "github",
        "workspace",
        "app",
        "平台",
        "系统",
        "小程序",
        "frontend",
        "backend",
        "openhanako",
        "hanako",
        "airi",
        "mcc",
        "gitnexus",
        "zongmen",
        "coze",
        "dify",
        "n8n",
        "one-hub",
        "安心跃动",
        "竞赛",
        "校园",
    ]
    skill_terms = [
        "技能",
        "skill",
        "skills",
        "能力",
        "工具",
        "workflow",
        "playwright",
        "browser",
        "mcp",
        "agent",
        "prompt",
        "提示词",
        "最佳实践",
        "frontend",
        "react",
        "python",
        "powershell",
        "docker",
        "obsidian",
        "测试",
        "部署",
    ]
    agent_terms = ["agent", "agents", "codex", "claude", "cursor", "gemini", "qwen", "openclaw", "mcp", "skill", "prompt", "hook", "rules", "serena", "mempalace", "config", "settings", "小安"]
    security_terms = ["credential", "secret", "token", "key", "password", "session", "cookie", "密钥", "凭据", "安全"]

    recovered_growth = select_recovered_rows(
        recovered_rows,
        growth_terms,
        {"private-memory-and-sessions", "projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"},
        180,
    )
    recovered_projects = select_recovered_rows(recovered_rows, project_terms, {"projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"}, 220)
    recovered_skills = select_recovered_rows(recovered_rows, skill_terms, {"agent-governance-and-skills", "public-knowledge-candidates"}, 220)
    recovered_agents = select_recovered_rows(recovered_rows, agent_terms, {"agent-governance-and-skills"}, 220)

    local_growth = select_local_rows(local_rows, growth_terms, {"personal-and-chat-context", "project-roots", "agent-context"}, 180)
    local_projects = select_local_rows(local_rows, project_terms, {"project-roots", "local-assets", "agent-context"}, 220)
    local_skills = select_local_rows(local_rows, skill_terms, {"agent-context", "project-roots", "local-assets"}, 220)
    local_agents = select_local_rows(local_rows, agent_terms, {"agent-context", "security-and-credentials"}, 220)
    local_security = select_local_rows(local_rows, security_terms, {"security-and-credentials", "agent-context"}, 180)
    local_personal_findings = [row for row in local_finding_rows if row.get("group") == "personal"]
    local_credential_findings = [row for row in local_finding_rows if row.get("group") == "credential"]

    profile_body = (
        "This is the private personal archive layer for identity, growth evidence, project history, skills, configured agents, and sensitive material triage.\n\n"
        "## Core Maps\n\n"
        "- [[private-wiki/guide/start-here]] - 本地 Karpathy 知识库阅读入口\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/profile/growth-timeline]] - growth, learning, goals, reviews, personal records, and timeline evidence\n"
        "- [[private-wiki/projects/portfolio-map]] - projects, prototypes, repos, product ideas, and action-item history\n"
        "- [[private-wiki/projects/showcase-draft]] - 项目展示草稿池\n"
        "- [[private-wiki/skills/index]] - skills, reusable workflows, tools, and proof sources\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/agents/configuration-map]] - configured agents, rules, prompts, memories, and local assistant state\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/security/secret-material-map]] - credential and privacy evidence without secret values\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/profile/source-coverage]] - what local roots and source reports currently cover\n\n"
        "## Coverage Snapshot\n\n"
        f"- Recovered archive rows: `{len(recovered_rows)}`\n"
        f"- Local source inventory rows: `{len(local_rows)}`\n"
        f"- Local timeline rows: `{len(local_timeline_rows)}`\n"
        f"- Local personal/privacy findings: `{len(local_personal_findings)}`\n"
        f"- Local credential/security findings: `{len(local_credential_findings)}`\n\n"
        "## Rule\n\n"
        "This layer is the searchable private biography and work archive. It may point to raw sources, but it must not be copied into the public `wiki/` until each item is rewritten and reviewed.\n"
    )
    write_page(out / "profile" / "index.md", "Private Personal Archive", ["个人资料馆", "成长项目能力总览"], ["personal-archive", "profile"], "private-profile", "moc", "Private index for growth, projects, skills, configured agents, and sensitive local context.", profile_body, "sensitive")

    growth_body = (
        "This page turns scattered local notes into a private growth map. It keeps evidence links and counts instead of trying to publish a finished biography.\n\n"
        "## Evidence Sources\n\n"
        f"- Recovered growth/profile candidates: `{len(recovered_growth)}`\n"
        f"- Local growth/profile candidates: `{len(local_growth)}`\n"
        f"- Full recovered inventory: {private_report_link('recovered_file_inventory.csv', 'recovered_file_inventory.csv', 2)}\n"
        f"- Full local inventory: {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- Full local timeline: {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n\n"
        "## Recovered Personal/Growth Sources\n\n"
        + recovered_source_table(recovered_growth, 140, 2)
        + "\n\n## Local Personal/Growth Sources\n\n"
        + local_inventory_table(local_growth, 140)
        + "\n\n## Timeline Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, growth_terms, 140)
        + "\n\n## Next Compilation Pass\n\n"
        "- Promote recurring milestones into dated private biography entries.\n"
        "- Separate true life events from file modification dates and quoted dates.\n"
        "- Keep private names, contact details, and raw chats out of public pages.\n"
    )
    write_page(out / "profile" / "growth-timeline.md", "Growth Timeline And Profile Evidence", ["成长时间线", "个人成长证据"], ["personal-archive", "growth", "timeline"], "private-profile", "timeline-index", "Growth, learning, goals, reviews, and personal profile evidence gathered from local sources.", growth_body, "sensitive")

    coverage_body = (
        "This page records what the local archive currently covers. It is the control panel for adding more roots later.\n\n"
        "## Indexed Roots\n\n"
        + root_summary_table(local_root_rows, None, 120)
        + "\n\n## Complete Reports\n\n"
        f"- {local_report_link('local_roots.csv', 'local_roots.csv', 2)}\n"
        f"- {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n"
        f"- {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n"
        f"- {private_report_link('recovered_file_inventory.csv', 'recovered_file_inventory.csv', 2)}\n\n"
        "## Source Gap Rule\n\n"
        "If a folder contains personal growth, projects, skills, or agent configuration but is not listed here, add it to `external-index-cache/roots.csv` and rerun the local inventory before compiling pages.\n"
    )
    write_page(out / "profile" / "source-coverage.md", "Private Source Coverage", ["资料覆盖面"], ["personal-archive", "source-coverage"], "private-profile", "index", "Local roots and reports covered by the private personal archive pipeline.", coverage_body, "internal")

    project_body = (
        "This page is the private portfolio map: project roots, project notes, prototypes, product ideas, and action history.\n\n"
        "## Project Roots\n\n"
        + root_summary_table(local_root_rows, project_terms, 80)
        + "\n\n## Recovered Project Sources\n\n"
        + recovered_source_table(recovered_projects, 180, 2)
        + "\n\n## Local Project Sources\n\n"
        + local_inventory_table(local_projects, 180)
        + "\n\n## Timeline Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, project_terms, 120)
        + "\n\n## Compilation Rule\n\n"
        "Create one project page per durable project only after review. Keep throwaway logs and raw handoff notes as linked evidence rather than copying them into the portfolio narrative.\n"
    )
    write_page(out / "projects" / "portfolio-map.md", "Private Project Portfolio Map", ["项目作品地图", "项目资料馆"], ["personal-archive", "projects"], "private-projects", "portfolio", "Private map of projects, prototypes, repositories, product ideas, and action history.", project_body, "internal")

    skills_body = (
        "This page gathers evidence for skills and reusable workflows from notes, configs, project files, and skill libraries.\n\n"
        "## Recovered Skill Sources\n\n"
        + recovered_source_table(recovered_skills, 180, 2)
        + "\n\n## Local Skill Sources\n\n"
        + local_inventory_table(local_skills, 180)
        + "\n\n## Skill Evidence By Month\n\n"
        + timeline_month_table(local_timeline_rows, skill_terms, 120)
        + "\n\n## Use\n\n"
        "- Use this as the private evidence base for a public skills page.\n"
        "- Public claims should cite sanitized project pages or rewritten source notes, not raw local logs.\n"
    )
    write_page(out / "skills" / "index.md", "Private Skills And Capabilities Index", ["能力清单", "技能资料馆"], ["personal-archive", "skills"], "private-skills", "index", "Private inventory of skills, tools, workflows, and evidence sources.", skills_body, "internal")

    agent_body = (
        "This page gathers configured agents, assistant rules, prompts, memories, skills, hooks, and local agent state. Old rule files are historical unless promoted into active rule surfaces.\n\n"
        "## Agent Roots\n\n"
        + root_summary_table(local_root_rows, agent_terms, 80)
        + "\n\n## Recovered Agent Sources\n\n"
        + recovered_source_table(recovered_agents, 180, 2)
        + "\n\n## Local Agent Sources\n\n"
        + local_inventory_table(local_agents, 180)
        + "\n\n## Agent Timeline Evidence\n\n"
        + timeline_month_table(local_timeline_rows, agent_terms, 120)
        + "\n\n## Handling\n\n"
        "- Keep configured agent state private by default.\n"
        "- Review old controller and orchestration files before treating them as current behavior.\n"
        "- Never publish prompts, memory, hooks, or configs that expose local paths or credentials.\n"
    )
    write_page(out / "agents" / "configuration-map.md", "Configured Agents And Rules Map", ["Agent配置地图", "智能体配置"], ["personal-archive", "agents"], "private-agents", "index", "Private map of configured agents, rules, prompts, memories, hooks, and local assistant state.", agent_body, "sensitive")

    secret_body = (
        "This page is the private sensitive-material map. It intentionally does not reproduce credential values or personal identifiers.\n\n"
        "## Local Credential Findings By Rule\n\n"
        + finding_summary_table(local_credential_findings, 100)
        + "\n\n## Local Security-Related Sources\n\n"
        + local_inventory_table(local_security, 140)
        + "\n\n## Recovered Vault Credential Findings\n\n"
        + table_for_findings(aggregate_by_file(group_sensitive(sensitive_rows, SECRET_RULES)), 120, 2)
        + "\n\n## Review Policy\n\n"
        "- Treat high-confidence tokens, private keys, JWTs, cloud keys, and secret assignments as rotation candidates.\n"
        "- Store only rule names, line numbers, source locations, and excerpt hashes in compiled pages.\n"
        "- If a value must be inspected, open the raw local source directly and do not paste it into public notes or chat.\n"
    )
    write_page(out / "security" / "secret-material-map.md", "Secret Material And Credential Map", ["密钥资料地图", "敏感材料地图"], ["personal-archive", "security", "credentials"], "private-security", "review", "Private credential and sensitive-material map without secret values.", secret_body, "sensitive")

    readable_pages = write_readable_knowledge_pages(
        out,
        recovered_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        local_timeline_rows,
        archive_rows,
        recovered_growth,
        recovered_projects,
        recovered_skills,
        recovered_agents,
        local_growth,
        local_projects,
        local_skills,
        local_agents,
    )

    return {
        "personal_archive_pages": 7 + readable_pages,
        "personal_archive_recovered_growth": len(recovered_growth),
        "personal_archive_recovered_projects": len(recovered_projects),
        "personal_archive_recovered_skills": len(recovered_skills),
        "personal_archive_recovered_agents": len(recovered_agents),
        "personal_archive_local_growth": len(local_growth),
        "personal_archive_local_projects": len(local_projects),
        "personal_archive_local_skills": len(local_skills),
        "personal_archive_local_agents": len(local_agents),
    }


def append_sample(bucket: list[dict[str, str]], row: dict[str, str], limit: int) -> None:
    if len(bucket) < limit:
        bucket.append(row)


def iter_csv(path: Path):
    if not path.exists():
        return
    with path.open("r", encoding="utf-8", newline="") as f:
        yield from csv.DictReader(f)


def write_local_source_pages(root: Path, out: Path) -> dict[str, int]:
    local_dir = local_index_cache_dir(root)
    summary = read_json(local_dir / "local_discovery_summary.json")
    if not summary:
        return {}

    root_rows = read_csv(local_dir / "local_roots.csv")
    finding_samples: dict[str, list[dict[str, str]]] = defaultdict(list)
    inventory_by_category: dict[str, list[dict[str, str]]] = defaultdict(list)
    codex_inventory: list[dict[str, str]] = []
    wechat_inventory: list[dict[str, str]] = []
    legacy_rule_candidates: list[dict[str, str]] = []
    timeline_by_month: Counter = Counter()

    for row in iter_csv(local_dir / "local_sensitive_findings.csv") or []:
        append_sample(finding_samples[row.get("group", "")], row, 320)

    for row in iter_csv(local_dir / "local_source_inventory.csv") or []:
        category = row.get("category", "")
        append_sample(inventory_by_category[category], row, 520)
        source_text = (row.get("root_id", "") + row.get("absolute_path", "") + row.get("relative_path", "")).lower()
        if "codex" in source_text:
            append_sample(codex_inventory, row, 520)
        if any(term in source_text for term in ["wechat", "weixin", "tencent", "wxwork"]) or any(term in row.get("absolute_path", "") for term in ["微信", "企业微信"]):
            append_sample(wechat_inventory, row, 520)
        if (
            row.get("kind") == "text"
            and any(term in (row.get("relative_path", "") + row.get("name", "")).lower() for term in ["agent", "rule", "rules", "claude", "codex", "startup", "governance", "controller", "skill", "prompt"])
        ):
            append_sample(legacy_rule_candidates, row, 520)

    for row in iter_csv(local_dir / "local_timeline_index.csv") or []:
        date_value = row.get("date", "")
        if date_value:
            timeline_by_month[date_value[:7]] += 1

    finding_group_counts = summary.get("finding_group_counts", {})

    local_index_body = (
        "This section indexes local sources outside the recovered Obsidian archive. It is private-only and designed for search, security review, and later public-safe rewriting.\n\n"
        "## Workbench\n\n"
        "- [[security-and-credentials]] - local credential and secret-candidate findings\n"
        "- [[personal-info-review]] - personal information and private-chat markers\n"
        "- [[local-path-map]] - local path and environment references\n"
        "- [[timeline]] - file/content dates and modification timeline\n"
        "- [[codex-context]] - Codex sessions, logs, memories, and config metadata\n"
        "- [[agent-context]] - agent rules, skills, prompts, and local assistant state\n"
        "- [[legacy-rule-review]] - old rule-like files quarantined as historical references\n"
        "- [[project-roots]] - local repositories, projects, and runtime roots\n"
        "- [[wechat-sources]] - WeChat and Tencent source metadata\n\n"
        "## Counts\n\n"
        f"- Roots scanned: `{summary.get('roots', 0)}`\n"
        f"- Files indexed: `{summary.get('files', 0)}`\n"
        f"- Sensitive/privacy findings: `{summary.get('findings', 0)}`\n"
        f"- High-risk findings: `{summary.get('high_findings', 0)}`\n"
        f"- Timeline rows: `{summary.get('timeline_rows', 0)}`\n"
        f"- Category counts: `{summary.get('category_counts', {})}`\n"
        f"- Finding groups: `{summary.get('finding_group_counts', {})}`\n\n"
        "## Reports\n\n"
        f"- {local_report_link('local_roots.csv', 'local_roots.csv', 2)}\n"
        f"- {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n"
        f"- {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n"
        f"- {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n"
        f"- {local_report_link('local_discovery_summary.json', 'local_discovery_summary.json', 2)}\n\n"
        "## Roots\n\n"
        + local_root_table(root_rows, 80)
        + "\n\n## Safety Boundary\n\n"
        "- These pages do not contain secret values.\n"
        "- High-risk rows are review and rotation candidates, not public wiki material.\n"
        "- Use root IDs and report rows for lookup; promote only rewritten summaries to `wiki/`.\n"
    )
    write_page(out / "local-sources" / "index.md", "Local Sources Index", ["本地信息总索引"], ["local-discovery", "private-wiki"], "private-wiki", "moc", "Private local-source index for additional local context outside the recovered vault.", local_index_body, "sensitive")

    credential_rows = finding_samples.get("credential", [])
    credential_body = (
        "This page is the local credential workbench. It stores only rule names, file locations, line numbers, and excerpt hashes.\n\n"
        f"- Credential findings: `{finding_group_counts.get('credential', len(credential_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(credential_rows, 260)
        + "\n\n## Handling\n\n"
        "- Rotate or revoke confirmed live secrets outside Obsidian.\n"
        "- Do not paste secret values into notes, chats, commits, or issue trackers.\n"
        "- After rotation, mark disposition in a local private follow-up note rather than editing the raw source.\n"
    )
    write_page(out / "local-sources" / "security-and-credentials.md", "Local Security And Credentials", ["本地密钥索引"], ["local-discovery", "security", "credentials"], "private-security", "review", "Local credential and secret-candidate findings without secret values.", credential_body, "sensitive")

    personal_rows = finding_samples.get("personal", [])
    personal_body = (
        "This page tracks local personal information and private-chat markers. It does not reproduce the matched values.\n\n"
        f"- Personal/private findings: `{finding_group_counts.get('personal', len(personal_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(personal_rows, 260)
    )
    write_page(out / "local-sources" / "personal-info-review.md", "Local Personal Information Review", ["本地个人信息复核"], ["local-discovery", "personal-info"], "private-security", "review", "Local personal information and private context review without raw values.", personal_body, "sensitive")

    local_path_rows = finding_samples.get("local-path", [])
    path_body = (
        "This page tracks local path references discovered in local source text. Paths are private-only and should not be promoted to public pages.\n\n"
        f"- Local path findings: `{finding_group_counts.get('local-path', len(local_path_rows))}`\n"
        f"- Full report: {local_report_link('local_sensitive_findings.csv', 'local_sensitive_findings.csv', 2)}\n\n"
        "## Findings\n\n"
        + local_finding_table(local_path_rows, 220)
    )
    write_page(out / "local-sources" / "local-path-map.md", "Local Source Path Map", ["本地来源路径地图"], ["local-discovery", "local-paths"], "private-security", "review", "Local path references from additional local source discovery.", path_body, "sensitive")

    timeline_lines = ["| Month | Rows |", "|---|---:|"]
    for month, count in sorted(timeline_by_month.items()):
        timeline_lines.append(f"| `{month}` | {count} |")
    timeline_body = (
        "This page summarizes local timeline rows. Rows can come from file modification times or detected dates inside text samples.\n\n"
        f"- Timeline rows: `{summary.get('timeline_rows', 0)}`\n"
        f"- Full report: {local_report_link('local_timeline_index.csv', 'local_timeline_index.csv', 2)}\n\n"
        "## Months\n\n"
        + "\n".join(timeline_lines)
    )
    write_page(out / "local-sources" / "timeline.md", "Local Source Timeline", ["本地来源时间线"], ["local-discovery", "timeline"], "private-timeline", "timeline-index", "Local-source date and modification timeline summary.", timeline_body, "internal")

    codex_roots = [r for r in root_rows if "codex" in (r.get("root_id", "") + r.get("path", "")).lower()]
    codex_body = (
        "This page indexes Codex local state, sessions, history, memories, config, and logs at metadata level. SQLite databases remain metadata-only unless explicitly extracted later.\n\n"
        "## Roots\n\n"
        + local_root_table(codex_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(codex_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "codex-context.md", "Local Codex Context", ["本地 Codex 上下文"], ["local-discovery", "codex"], "private-context", "index", "Local Codex session, memory, config, and log metadata index.", codex_body, "sensitive")

    agent_roots = [
        r for r in root_rows
        if any(term in (r.get("root_id", "") + r.get("path", "")).lower() for term in ["agent", "claude", "cursor", "gemini", "qwen", "openclaw", "commander"])
    ]
    agent_inventory = inventory_by_category.get("agent-context", [])
    agent_body = (
        "This page indexes local assistant and agent operating context: rules, skills, prompts, memories, and tool state.\n\n"
        "Recovered or discovered rule files are historical references by default. They are not current operating policy unless they are copied into the active rule surfaces after review.\n\n"
        "## Roots\n\n"
        + local_root_table(agent_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(agent_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "agent-context.md", "Local Agent Context", ["本地 Agent 上下文"], ["local-discovery", "agents"], "private-context", "index", "Local agent rules, skills, prompts, and state metadata index.", agent_body, "sensitive")

    legacy_body = (
        "This page quarantines discovered rule-like files as historical references. They are useful for continuity search, but they do not automatically govern current work.\n\n"
        "## Current Authority Rule\n\n"
        "- Current user instructions override recovered historical process text.\n"
        "- Current `AGENTS.md` and `CLAUDE.md` define the live wiki schema.\n"
        "- Recovered controller, startup, delegation, or agent-rule documents are `historical-reference` until explicitly promoted.\n"
        "- Privacy and credential safety rules remain active even when an old workflow says otherwise.\n\n"
        "## Candidates\n\n"
        + local_inventory_table(sorted(legacy_rule_candidates, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 240)
    )
    write_page(out / "local-sources" / "legacy-rule-review.md", "Legacy Rule Review", ["旧规则复核"], ["local-discovery", "agents", "deprecated-rules"], "private-context", "review", "Historical rule-like files discovered locally, quarantined from current policy until reviewed.", legacy_body, "sensitive")

    project_inventory = inventory_by_category.get("project-roots", [])
    project_body = (
        "This page indexes local project and repository roots at metadata level. It is a map for later targeted distillation, not a raw code dump.\n\n"
        f"- Project-root files: `{summary.get('category_counts', {}).get('project-roots', len(project_inventory))}`\n"
        f"- Full inventory: {local_report_link('local_source_inventory.csv', 'local_source_inventory.csv', 2)}\n\n"
        "## Priority Inventory\n\n"
        + local_inventory_table(sorted(project_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 220)
    )
    write_page(out / "local-sources" / "project-roots.md", "Local Project Roots", ["本地项目根索引"], ["local-discovery", "projects"], "private-context", "index", "Local repository and project root metadata index.", project_body, "internal")

    wechat_roots = [
        r for r in root_rows
        if any(term in (r.get("root_id", "") + r.get("path", "")).lower() for term in ["wechat", "weixin", "tencent", "wxwork"])
        or any(term in r.get("path", "") for term in ["微信", "企业微信"])
    ]
    wechat_body = (
        "This page indexes WeChat/Tencent local sources as metadata only. Message databases and media archives require a separate extraction plan before content distillation.\n\n"
        "## Roots\n\n"
        + local_root_table(wechat_roots, 80)
        + "\n\n## Priority Inventory\n\n"
        + local_inventory_table(sorted(wechat_inventory, key=lambda r: (not r.get("risk_flags"), r.get("relative_path", ""))), 180)
    )
    write_page(out / "local-sources" / "wechat-sources.md", "Local WeChat Sources", ["本地微信来源"], ["local-discovery", "wechat"], "private-context", "index", "Local WeChat and Tencent source metadata index.", wechat_body, "sensitive")

    return {
        "local_roots": len(root_rows),
        "local_files": int(summary.get("files", 0)),
        "local_findings": int(summary.get("findings", 0)),
        "local_high_findings": int(summary.get("high_findings", 0)),
        "local_timeline_rows": int(summary.get("timeline_rows", 0)),
    }


def write_timeline_pages(timeline_rows: list[dict[str, str]]) -> None:
    by_month: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in timeline_rows:
        month = row.get("date", "")[:7]
        if month:
            by_month[month].append(row)
    index_lines = [
        "This is the private timeline workbench. Dates are extracted from filenames and note text; they can be real events, plans, references, or false positives.",
        "",
        "## Months",
        "",
        "| Month | Entries | Page |",
        "|---|---:|---|",
    ]
    for month in sorted(by_month):
        page_name = f"{month}.md"
        index_lines.append(f"| {month} | {len(by_month[month])} | [[{month}]] |")
        by_date: dict[str, list[dict[str, str]]] = defaultdict(list)
        for row in by_month[month]:
            by_date[row["date"]].append(row)
        month_lines = [
            f"- Entries: `{len(by_month[month])}`",
            f"- Full timeline CSV: {private_report_link('timeline_index.csv', 'timeline_index.csv', 2)}",
            "",
            "## Daily Entries",
            "",
        ]
        for day in sorted(by_date):
            entries = by_date[day]
            month_lines.append(f"### {day}")
            month_lines.append("")
            month_lines.append(f"- Entries: `{len(entries)}`")
            month_lines.append("")
            month_lines.append("| Source | Top folder |")
            month_lines.append("|---|---|")
            for row in entries[:50]:
                month_lines.append(f"| {md_link(row_label(row), row.get('vault_copy_path', ''), 2)} | `{row.get('top_folder', '')}` |")
            if len(entries) > 50:
                month_lines.append(f"| {len(entries) - 50} more entries in timeline_index.csv | - |")
            month_lines.append("")
        write_page(OUT_DIR / "timeline" / page_name, f"Timeline {month}", [f"时间线 {month}"], ["local-recovery", "timeline"], "private-timeline", "timeline-month", f"Private recovered timeline entries for {month}.", "\n".join(month_lines))
    index_lines.extend(
        [
            "",
            "## Reports",
            "",
            f"- {private_report_link('timeline_index.csv', 'timeline_index.csv', 2)}",
            f"- {private_report_link('sensitive_timeline_summary.json', 'sensitive_timeline_summary.json', 2)}",
        ]
    )
    write_page(OUT_DIR / "timeline" / "index.md", "Private Timeline Index", ["本地时间线索引"], ["local-recovery", "timeline"], "private-timeline", "moc", "Private recovered timeline index grouped by month.", "\n".join(index_lines))


def interesting_activity_score(row: dict[str, str]) -> int:
    text = " ".join(
        [
            row.get("root_id", ""),
            row.get("relative_path", ""),
            row.get("name", ""),
            row.get("category", ""),
            row.get("risk_flags", ""),
        ]
    ).lower()
    score = 0
    weighted_terms = {
        "hanako": 8,
        "openhanako": 8,
        "trae": 8,
        "coze": 7,
        "xiaoan": 7,
        "小安": 7,
        "agent": 5,
        "skill": 5,
        "mcp": 5,
        "codex": 5,
        "claude": 4,
        "github": 4,
        "project": 4,
        "workspace": 4,
        "wechat": 4,
        "微信": 4,
        "download": 4,
        "下载": 4,
        "learn": 3,
        "study": 3,
        "教程": 3,
        "学习": 3,
    }
    for term, weight in weighted_terms.items():
        if term in text:
            score += weight
    if row.get("category") in {"project-roots", "agent-context", "local-assets"}:
        score += 2
    if row.get("risk_flags"):
        score += 1
    return score


def write_automation_pages(
    out: Path,
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
) -> int:
    recent_rows = sorted(
        local_rows,
        key=lambda row: (row.get("modified_at", ""), interesting_activity_score(row)),
        reverse=True,
    )
    interesting_rows = [row for row in recent_rows if interesting_activity_score(row) > 0]
    app_terms = ["hanako", "openhanako", "trae", "coze", "xiaoan", "小安"]
    app_rows = [
        row
        for row in recent_rows
        if any(term in " ".join([row.get("root_id", ""), row.get("relative_path", ""), row.get("name", "")]).lower() for term in app_terms)
    ]
    root_by_id = {row.get("root_id", ""): row for row in local_root_rows}

    def activity_table(rows: list[dict[str, str]], limit: int = 80) -> str:
        lines = ["| Modified | Scan | Root | Kind | Category | Risk | Item |", "|---|---|---|---|---|---|---|"]
        for row in rows[:limit]:
            root_id = md_cell(row.get("root_id", ""), 80)
            rel = md_cell(row.get("relative_path", ""), 120)
            name = md_cell(row.get("name", ""), 80)
            risk = md_cell(row.get("risk_flags", "") or "-", 80)
            lines.append(
                f"| `{row.get('modified_at', '')[:19]}` | `{row.get('scan_status', '-') or '-'}` | `{root_id}` | "
                f"`{row.get('kind', '')}` | `{row.get('category', '')}` | `{risk}` | `{name}`<br>`{rel}` |"
            )
        if len(rows) > limit:
            lines.append(f"| ... | ... | ... | ... | ... | ... | `{len(rows) - limit}` more rows in local_source_inventory.csv |")
        if len(lines) == 2:
            lines.append("| - | - | - | - | - | - | No matching recent activity rows |")
        return "\n".join(lines)

    priority_root_ids = [
        "fkl26-desktop-oh-workspace-3570f9d4",
        "d-浮生安-下载-4679d7ad",
        "wxid_vgd06fyb2lkw22_d842-msg-file-1e7885f7",
        "d-github-0be849a0",
        "d-projects-d122ff74",
    ]
    root_lines = ["| Root ID | Files | Findings | Latest modified | Categories |", "|---|---:|---:|---|---|"]
    for root_id in priority_root_ids:
        row = root_by_id.get(root_id)
        if not row:
            continue
        root_lines.append(
            f"| `{root_id}` | {row.get('files', '0')} | {row.get('findings', '0')} | `{row.get('latest_modified_at', '')}` | `{md_cell(row.get('category_counts', ''), 120)}` |"
        )

    index_body = (
        "This is the private automation workbench for the Karpathy-style wiki lifecycle. It records where automation outputs land and how the two-hour asynchronous loop should be read.\n\n"
        "## Async Cycle\n\n"
        "| Offset | Automation | Role | Obsidian output |\n"
        "|---|---|---|---|\n"
        "| +05 min | LLM Wiki Local Source Intake | Update local metadata and private summaries | [[private-wiki/automation/recent-activity]] and local source maps |\n"
        "| +25 min | LLM Wiki GitHub Best Practice Watch | Compare current needs with official docs and GitHub projects | public source notes or backlog updates |\n"
        "| +40 min | LLM Wiki Lifecycle Package Builder | Improve one beginner learning package | `wiki/projects/` or `wiki/synthesis/` public-safe pages |\n"
        "| +55 min | LLM Wiki Acceptance Gate | Run checks and block unsafe publishing | acceptance notes and manifests |\n"
        "| +58 min | LLM Wiki Workflow Retrospective | Improve the process itself | workflow pages, checklist updates, prompt proposals |\n\n"
        "## Dedicated Output Pages\n\n"
        "- [[private-wiki/guide/workflow-and-learning-hub]] - workflow and learning-file entry point.\n"
        "- [[private-wiki/automation/recent-activity]] - recent local learning and app-activity signals.\n"
        "- [[private-wiki/automation/latest-cycle-digest]] - latest cycle summary in plain language.\n"
        "- [[private-wiki/automation/local-source-incremental-watch]] - scan status, missing-source, and freshness dashboard.\n"
        "- [[private-wiki/automation/lifecycle-loop-operating-procedure]] - two-hour lifecycle automation SOP.\n"
        "- [[private-wiki/automation/pipeline-health]] - private intake pipeline health and output counts.\n"
        "- [[private-wiki/automation/intake-run-log]] - readable run log for local intake runs.\n"
        "- [[private-wiki/automation/archive-index-gaps]] - archive scan failures and truncation gaps.\n"
        "- [[private-wiki/local-sources/index]] - local source coverage and reports.\n"
        "- [[private-wiki/security/review-priority]] - private security and credential review priority.\n"
        "- [[private-wiki/security/finding-disposition]] - review status for high-risk and credential findings.\n"
        "- [[private-wiki/publication-candidates]] - public-safe promotion queue.\n"
        "- [[private-wiki/context/publication-context-map]] - private-to-public context bridge.\n\n"
        "## Rule\n\n"
        "Automation may collect and summarize private metadata, but it must not publish raw private text, credential values, local app state, account/session material, WeChat details, or unreviewed private paths into the public wiki.\n"
    )
    write_page(out / "automation" / "index.md", "Private Automation Workbench", ["自动化产出地", "Automation Workbench"], ["automation", "private-wiki", "lifecycle"], "private-automation", "moc", "Private output map for the asynchronous wiki lifecycle automations.", index_body, "internal")

    recent_body = (
        "This page is for answering: what did the computer recently show that may become learning material?\n\n"
        "It is metadata-only. It does not quote file contents or secret values.\n\n"
        "## Priority Roots\n\n"
        + "\n".join(root_lines)
        + "\n\n## Recent Interesting Activity\n\n"
        + activity_table(interesting_rows, 100)
        + "\n\n## Hanako / Trae / Coze / Xiaoan Signals\n\n"
        + activity_table(app_rows, 80)
        + "\n\n## Security Reminder\n\n"
        f"- Local sensitive findings currently indexed: `{len(local_finding_rows)}`\n"
        "- Treat credential-like, account-like, and private-chat-like rows as private review material.\n"
        "- Promote only rewritten lessons to the public wiki.\n"
    )
    write_page(out / "automation" / "recent-activity.md", "Recent Local Activity Signals", ["最近活动线索", "App Activity Signals"], ["automation", "local-discovery", "recent-activity"], "private-automation", "activity", "Recent local app, project, and learning signals for the two-hour automation cycle.", recent_body, "sensitive")

    scan_status_counts = Counter(row.get("scan_status", "legacy") or "legacy" for row in local_rows)
    changed_rows = [
        row
        for row in recent_rows
        if row.get("scan_status") in {"new", "modified", "restored", "missing"}
    ]
    missing_rows = [row for row in local_rows if row.get("scan_status") == "missing"]
    root_freshness_lines = ["| Root ID | Files | Missing | Latest modified | Findings |", "|---|---:|---:|---|---:|"]
    for row in sorted(local_root_rows, key=lambda item: -int(item.get("files") or 0))[:40]:
        root_freshness_lines.append(
            f"| `{md_cell(row.get('root_id', ''), 90)}` | {row.get('files', '0')} | {row.get('missing_files', '0') or '0'} | "
            f"`{row.get('latest_modified_at', '')}` | {row.get('findings', '0')} |"
        )
    incremental_body = (
        "这页解释本地来源索引的增量状态。它让两小时循环能区分新增资料、被修改的旧资料、重新出现的资料和已经消失的资料。\n\n"
        "## 扫描状态\n\n"
        + counter_table("扫描状态分布", scan_status_counts, "状态", 12)
        + "\n\n## 最近新增/修改/恢复/消失的来源\n\n"
        + activity_table(changed_rows, 120)
        + "\n\n## 已消失但仍需保留审计状态的来源\n\n"
        + activity_table(sorted(missing_rows, key=lambda row: row.get("last_seen_at", ""), reverse=True), 80)
        + "\n\n## 来源根新鲜度\n\n"
        + "\n".join(root_freshness_lines)
        + "\n\n## 处理规则\n\n"
        "- `new`：第一次进入索引，优先判断属于学习、项目、Agent、安全还是资产。\n"
        "- `modified`：同一路径内容或元数据变了，需要重新判断是否影响项目、能力或安全队列。\n"
        "- `restored`：之前消失的来源重新出现，先核对是不是恢复副本。\n"
        "- `missing`：来源已不在当前位置；仍保留私有审计记录，避免误以为信息从未出现过。\n"
        "- `unchanged`：可作为背景证据，不占用当前批次。\n"
    )
    write_page(out / "automation" / "local-source-incremental-watch.md", "本地来源增量观察台", ["Local Source Incremental Watch", "本地增量观察"], ["automation", "local-discovery", "incremental"], "private-automation", "dashboard", "展示本地来源 new/modified/unchanged/missing 状态和两小时补录优先级。", incremental_body, "sensitive")
    return 3


def run_log_table(rows: list[dict], limit: int = 24) -> str:
    lines = ["| Run | Status | Started | Finished | Steps | Output snapshot |", "|---|---|---|---|---:|---|"]
    for row in list(reversed(rows))[:limit]:
        outputs = row.get("outputs", {}) if isinstance(row.get("outputs"), dict) else {}
        steps = row.get("steps", []) if isinstance(row.get("steps"), list) else []
        snapshot = "; ".join(
            f"{key}={outputs.get(key)}"
            for key in ["local_files", "local_high_findings", "archive_members", "private_wiki_pages", "disposition_unreviewed"]
            if key in outputs
        )
        lines.append(
            f"| `{md_cell(str(row.get('run_id', '-')), 40)}` | `{md_cell(str(row.get('status', 'unknown')), 40)}` | "
            f"`{md_cell(str(row.get('started_at', '')), 40)}` | `{md_cell(str(row.get('finished_at', '')), 40)}` | "
            f"{len(steps)} | {md_cell(snapshot or '-', 180)} |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | ... | {len(rows) - limit} older runs in private_intake_runs.jsonl |")
    if len(lines) == 2:
        lines.append("| - | missing | - | - | 0 | No intake run log yet |")
    return "\n".join(lines)


def disposition_tables(rows: list[dict[str, str]]) -> str:
    by_status = Counter(row.get("review_status", "unknown") or "unknown" for row in rows)
    by_disposition = Counter(row.get("disposition", "unset") or "unset" for row in rows)
    by_rule = Counter(row.get("rule", "unknown") or "unknown" for row in rows)
    body = (
        counter_table("复核状态分布", by_status, "状态")
        + "\n\n"
        + counter_table("处置结果分布", by_disposition, "处置")
        + "\n\n"
        + counter_table("高风险/凭据规则分布", by_rule, "规则")
    )
    return body


def disposition_sample_table(rows: list[dict[str, str]], limit: int = 80) -> str:
    lines = ["| Status | Severity | Group | Rule | Line | Locator | Hash |", "|---|---|---|---|---:|---|---|"]
    for row in rows[:limit]:
        locator = f"{row.get('root_id', '')}/{row.get('relative_path', '')}"
        lines.append(
            f"| `{row.get('review_status', '')}` | `{row.get('severity', '')}` | `{row.get('group', '')}` | "
            f"`{row.get('rule', '')}` | {row.get('line', '')} | `{md_cell(locator, 160)}` | `{row.get('excerpt_hash', '')}` |"
        )
    if len(rows) > limit:
        lines.append(f"| ... | ... | ... | ... | ... | {len(rows) - limit} more rows in local_finding_disposition.csv | ... |")
    if len(lines) == 2:
        lines.append("| - | - | - | - | 0 | No disposition rows | - |")
    return "\n".join(lines)


def write_pipeline_state_pages(
    out: Path,
    local_discovery_summary: dict,
    archive_summary: dict,
    archive_failures: list[dict[str, str]],
    disposition_rows: list[dict[str, str]],
    run_rows: list[dict],
) -> int:
    latest_run = run_rows[-1] if run_rows else {}
    health_body = (
        "这页记录本地私有 intake 管道是否可审计。它不证明所有内容都已经语义整理完成，只证明来源索引、压缩包索引、私有编译和检查有可追踪记录。\n\n"
        "## 当前状态\n\n"
        f"- 最近运行：`{latest_run.get('run_id', '-')}` / `{latest_run.get('status', 'missing')}`\n"
        f"- 本地来源文件：`{local_discovery_summary.get('files', 0)}`\n"
        f"- 本地风险线索：`{local_discovery_summary.get('findings', 0)}`\n"
        f"- 高风险线索：`{local_discovery_summary.get('high_findings', 0)}`\n"
        f"- 压缩包成员：`{archive_summary.get('archive_members_indexed', 0)}`\n"
        f"- 压缩包失败：`{archive_summary.get('archive_failures', 0)}`\n"
        f"- 压缩包截断：`{archive_summary.get('archive_files_truncated', 0)}`\n"
        f"- 复核处置表行数：`{len(disposition_rows)}`\n\n"
        "## 检查命令\n\n"
        "```powershell\n"
        "python scripts/run_private_intake.py .\n"
        "python scripts/check_private_pipeline.py .\n"
        "python scripts/check_private_wiki.py .\n"
        "```\n\n"
        "## 运行台账\n\n"
        + run_log_table(run_rows)
        + "\n\n## 已知非阻塞风险\n\n"
        "- 压缩包失败或截断表示仍有盲区，需要后续 adapter 或人工处理。\n"
        "- 微信、数据库、图片、视频、Office/PDF 当前默认是元数据级，不自动抽正文。\n"
        "- 高风险线索进入处置表，不代表已经轮换或清理完成。\n"
    )
    write_page(out / "automation" / "pipeline-health.md", "私有 intake 管道健康", ["Private Pipeline Health", "私有管道健康"], ["automation", "local-discovery", "pipeline"], "private-automation", "health", "记录本地私有 intake 管道的运行台账、输出计数和已知盲区。", health_body, "sensitive")

    run_log_body = (
        "这页是 `run_private_intake.py` 的可读运行台账。完整机器记录在 local discovery 私有目录的 JSONL 文件里。\n\n"
        "## 最近运行\n\n"
        + run_log_table(run_rows, 60)
        + "\n\n## 解释\n\n"
        "- `success` 表示脚本步骤返回成功，不表示所有高风险线索已经处置。\n"
        "- `failed` 表示需要查看对应步骤的尾部输出和阻塞原因。\n"
        "- 这页只展示计数和状态，不展示密钥、聊天正文或账号材料。\n"
    )
    write_page(out / "automation" / "intake-run-log.md", "私有 intake 运行台账", ["Intake Run Log", "运行台账"], ["automation", "local-discovery", "run-log"], "private-automation", "log", "本地私有 intake 管道的运行记录摘要。", run_log_body, "sensitive")

    disposition_body = (
        "这页是高风险和凭据线索的复核处置总览。处置表只存定位、规则、行号、哈希和状态，不存明文密钥。\n\n"
        "## 状态总览\n\n"
        + disposition_tables(disposition_rows)
        + "\n\n## 下一批待复核样例\n\n"
        + disposition_sample_table([row for row in disposition_rows if row.get("review_status") == "unreviewed"], 80)
        + "\n\n## 处置状态建议\n\n"
        "- `unreviewed`：还没人工打开原始来源确认。\n"
        "- `false-positive`：误报，保留哈希以便以后不重复判断。\n"
        "- `rotated`：确认是活跃密钥且已经轮换。\n"
        "- `revoked`：确认无效或已撤销。\n"
        "- `archived-private`：只保留私有证据，不进入公开资料。\n\n"
        "## 完整私有表\n\n"
        f"- {local_report_link('local_finding_disposition.csv', 'local_finding_disposition.csv', 2)}\n"
    )
    write_page(out / "security" / "finding-disposition.md", "高风险线索处置闭环", ["Finding Disposition", "风险处置表"], ["personal-archive", "security", "review"], "private-security", "review", "高风险和凭据线索的私有复核处置总览，不含明文密钥。", disposition_body, "sensitive")

    archive_body = (
        "这页记录压缩包索引的盲区。压缩包默认只做成员元数据，不自动展开内容。\n\n"
        "## 摘要\n\n"
        f"- 已索引压缩包：`{archive_summary.get('archive_files_indexed', 0)}`\n"
        f"- 已扫描压缩包：`{archive_summary.get('archive_files_scanned', 0)}`\n"
        f"- 已索引成员：`{archive_summary.get('archive_members_indexed', 0)}`\n"
        f"- 总成员数：`{archive_summary.get('archive_members_total_seen', 0)}`\n"
        f"- 截断压缩包：`{archive_summary.get('archive_files_truncated', 0)}`\n"
        f"- 失败压缩包：`{archive_summary.get('archive_failures', 0)}`\n\n"
        "## 失败列表\n\n"
        + local_finding_table(
            [
                {
                    "root_id": row.get("root_id", ""),
                    "relative_path": row.get("archive_relative_path", ""),
                    "severity": "medium",
                    "group": "archive",
                    "rule": row.get("error", ""),
                    "line": "0",
                    "excerpt_hash": "",
                }
                for row in archive_failures
            ],
            80,
        )
        + "\n\n## 处理规则\n\n"
        "- ZIP 以外格式需要单独 adapter。\n"
        "- 大包被截断时，先看成员名是否高价值，再决定是否临时私有展开。\n"
        "- 展开动作不能写入公开层，也不能把 secret 值复制进 Markdown。\n"
    )
    write_page(out / "automation" / "archive-index-gaps.md", "压缩包索引盲区", ["Archive Index Gaps", "压缩包盲区"], ["automation", "local-discovery", "archives"], "private-automation", "review", "记录压缩包成员索引的失败、截断和后续处理规则。", archive_body, "sensitive")

    latest_outputs = latest_run.get("outputs", {}) if isinstance(latest_run.get("outputs"), dict) else {}
    latest_steps = latest_run.get("steps", []) if isinstance(latest_run.get("steps"), list) else []
    failed_steps = [step for step in latest_steps if int(step.get("returncode", 0) or 0) != 0]
    digest_step_lines = ["| Step | Result | Seconds | Meaning |", "|---|---|---:|---|"]
    for step in latest_steps:
        name = str(step.get("name", "unknown"))
        returncode = int(step.get("returncode", 0) or 0)
        meaning = "通过"
        if returncode != 0:
            meaning = "需要人工排障"
        elif name == "local_source_inventory":
            meaning = "本地来源元数据已更新"
        elif name == "local_archive_inventory":
            meaning = "压缩包成员索引已更新"
        elif name == "build_private_wiki":
            meaning = "私有 Obsidian 页面已重建"
        elif name == "check_private_wiki":
            meaning = "私有层结构和安全边界已检查"
        digest_step_lines.append(
            f"| `{md_cell(name, 60)}` | `{returncode}` | {step.get('seconds', 0)} | {meaning} |"
        )
    if len(digest_step_lines) == 2:
        digest_step_lines.append("| - | - | 0 | 尚无运行步骤记录 |")
    latest_digest_body = (
        "这页把最近一轮自动化运行翻译成人能读懂的摘要。它不是完整日志，完整机器记录仍在私有 JSONL 台账里。\n\n"
        "## 最近一轮\n\n"
        f"- 运行编号：`{latest_run.get('run_id', '-')}`\n"
        f"- 状态：`{latest_run.get('status', 'missing')}`\n"
        f"- 开始：`{latest_run.get('started_at', '')}`\n"
        f"- 结束：`{latest_run.get('finished_at', '')}`\n"
        f"- 失败步骤：`{len(failed_steps)}`\n\n"
        "## 输出快照\n\n"
        f"- 本地来源文件：`{latest_outputs.get('local_files', local_discovery_summary.get('files', 0))}`\n"
        f"- 高风险线索：`{latest_outputs.get('local_high_findings', local_discovery_summary.get('high_findings', 0))}`\n"
        f"- 压缩包成员：`{latest_outputs.get('archive_members', archive_summary.get('archive_members_indexed', 0))}`\n"
        f"- 私有 wiki 页面：`{latest_outputs.get('private_wiki_pages', '-')}`\n"
        f"- 未复核高风险/凭据线索：`{latest_outputs.get('disposition_unreviewed', '-')}`\n\n"
        "## 步骤解释\n\n"
        + "\n".join(digest_step_lines)
        + "\n\n## 下一步判断\n\n"
        "- 如果状态是 `success`，先看 [[private-wiki/automation/local-source-incremental-watch]] 找新增/修改来源。\n"
        "- 如果有失败步骤，先修失败，不要把失败后的页面当作完整结果。\n"
        "- 如果高风险线索增加，先进入 [[private-wiki/security/finding-disposition]]，不要推进公开发布。\n"
        "- 如果没有新增资料，把时间用在项目卡、学习包或公开候选改写上。\n"
    )
    write_page(out / "automation" / "latest-cycle-digest.md", "最近一轮自动化摘要", ["Latest Cycle Digest", "自动化最近摘要"], ["automation", "local-discovery", "digest"], "private-automation", "digest", "把最近一轮本地知识库自动化运行翻译成人能读懂的摘要和下一步判断。", latest_digest_body, "sensitive")
    return 5


def todo_table(rows: list[dict[str, str]]) -> str:
    lines = ["| Priority | Todo | Input | Output | Acceptance |", "|---|---|---|---|---|"]
    for row in rows:
        lines.append(
            f"| `{row['priority']}` | {row['todo']} | {row['input']} | {row['output']} | {row['acceptance']} |"
        )
    return "\n".join(lines)


def write_context_analysis_pages(
    out: Path,
    recovered_rows: list[dict[str, str]],
    local_rows: list[dict[str, str]],
    local_root_rows: list[dict[str, str]],
    local_finding_rows: list[dict[str, str]],
    local_timeline_rows: list[dict[str, str]],
    archive_rows: list[dict[str, str]],
) -> int:
    conversation_terms = [
        "conversation",
        "session",
        "rollout",
        "history",
        "memory",
        "chat",
        "message",
        "file-history",
        "对话",
        "会话",
        "聊天",
        "记忆",
        "codex",
        "claude",
        "wechat",
        "微信",
    ]
    learning_terms = [
        "learning",
        "study",
        "教程",
        "学习",
        "最佳实践",
        "deep-dive",
        "report",
        "课程",
        "github调研",
        "agentworld",
        "claude code",
        "claude_code",
        "antigravity",
        "hanako",
        "trae",
        "coze",
        "xiaoan",
        "小安",
    ]
    public_package_terms = [
        "archive",
        "wiki",
        "obsidian",
        "frontend",
        "backend",
        "agent",
        "skill",
        "workflow",
        "model",
        "coze",
        "xiaoan",
        "hanako",
        "github",
        "学习",
        "项目",
    ]

    recovered_conversations = select_recovered_rows(
        recovered_rows,
        conversation_terms,
        {"private-memory-and-sessions", "agent-governance-and-skills", "projects-and-action-items"},
        220,
    )
    local_conversations = select_local_rows(
        local_rows,
        conversation_terms,
        {"agent-context", "personal-and-chat-context", "security-and-credentials"},
        260,
    )
    local_learning = select_local_rows(
        local_rows,
        learning_terms,
        {"agent-context", "project-roots", "local-assets", "personal-and-chat-context"},
        260,
    )
    package_candidates = select_local_rows(
        local_rows,
        public_package_terms,
        {"agent-context", "project-roots", "local-assets"},
        260,
    ) + select_recovered_rows(
        recovered_rows,
        public_package_terms,
        {"projects-and-action-items", "agent-governance-and-skills", "public-knowledge-candidates"},
        180,
    )
    package_candidates = package_candidates[:320]

    high_findings = [row for row in local_finding_rows if row.get("severity") == "high"]
    credential_findings = [row for row in local_finding_rows if row.get("group") == "credential"]
    personal_findings = [row for row in local_finding_rows if row.get("group") == "personal"]

    conversation_body = (
        "这页回答：各种对话和上下文是否已经分析？答案是：已经进入私有索引和初步聚类，下一步要做主题级语义提炼。\n\n"
        "## 当前覆盖\n\n"
        f"- 恢复档案对话/记忆候选：`{len(recovered_conversations)}`\n"
        f"- 本地对话/会话候选：`{len(local_conversations)}`\n"
        f"- 本地学习资料候选：`{len(local_learning)}`\n"
        f"- 本地时间线行：`{len(local_timeline_rows)}`\n"
        f"- 本地敏感线索：`{len(local_finding_rows)}`\n\n"
        "## 来源根覆盖\n\n"
        + root_summary_table(local_root_rows, ["codex", "claude", "wechat", "tencent", "agent", "cursor", "openclaw", "gemini", "qwen"], 80)
        + "\n\n## 本地对话/会话候选\n\n"
        + local_inventory_table(local_conversations, 160)
        + "\n\n## 恢复档案对话/记忆候选\n\n"
        + recovered_source_table(recovered_conversations, 120, 2)
        + "\n\n## 月度线索\n\n"
        + timeline_month_table(local_timeline_rows, conversation_terms, 80)
        + "\n\n## 结论\n\n"
        "- 已完成：来源识别、风险标记、时间线标记、项目/能力/Agent 聚类。\n"
        "- 未完成：逐条长对话的全文语义精读、主题级摘要、可公开学习包改写。\n"
        "- 当前策略：先用自动化每 2 小时抓新线索，再按待办逐步抽取主题，不做一次性全文公开转储。\n"
    )
    write_page(out / "context" / "conversation-context-analysis.md", "对话上下文分析", ["Conversation Context Analysis", "上下文对话分析"], ["personal-archive", "context", "conversation"], "private-context", "analysis", "本地对话、会话、记忆和聊天上下文的私有分析入口。", conversation_body, "sensitive")

    archive_learning_rows = sorted(
        [
            row
            for row in archive_rows
            if contains_any(row_text(row, ["archive_relative_path", "member_path", "risk_flags"]), learning_terms + public_package_terms)
        ],
        key=lambda row: (not row.get("risk_flags"), row.get("archive_relative_path", ""), row.get("member_path", "")),
    )
    def learning_risk_rank(row: dict[str, str]) -> tuple[int, int, int, str]:
        risk = row.get("risk_flags") or ""
        kind = row.get("kind") or ""
        source = row_text(row, ["root_id", "relative_path"]).casefold()
        high_risk = int("credential" in risk or "personal" in risk or "private" in risk)
        backup_source = int("external-backups" in source or "restore-drills" in source or "vault_backup" in source)
        path_risk = int("local-path" in risk or "personal-path" in risk)
        generated_source = int("/dist" in source or "artifacts/" in source or "html-report" in source or "node_modules" in source)
        kind_rank = {"text": 0, "document": 1, "archive": 2, "image": 3, "binary": 4}.get(kind, 5)
        return (high_risk, backup_source, path_risk, generated_source, kind_rank, source)

    readable_local_learning = sorted(local_learning, key=learning_risk_rank)
    readable_package_candidates = sorted(package_candidates, key=learning_risk_rank)
    readable_archive_learning = sorted(
        archive_learning_rows,
        key=lambda row: (
            int(bool(row.get("risk_flags"))),
            row.get("archive_relative_path", "").casefold(),
            row.get("member_path", "").casefold(),
        ),
    )
    learning_body = (
        "这页不是教程正文，而是私有候选池。新手先看 [[private-wiki/learning/curated-package-digest]]；只有需要找证据时才回到本页。\n\n"
        "## 先看精选，不先看大表\n\n"
        "- 想马上写：去 [[private-wiki/learning/curated-package-digest]] 选 1 个学习包。\n"
        "- 想照着做：先看 [[private-wiki/learning/first-learning-package-walkthrough]]。\n"
        "- 想找证据：只看本页 Top 候选。\n"
        "- 想查全量文件：去 [[private-wiki/learning/learning-evidence-inventory]]。\n\n"
        "## Top 本地学习资料候选\n\n"
        + local_inventory_table(readable_local_learning, 20)
        + "\n\n## Top 学习包候选池\n\n"
        + source_status_table(readable_package_candidates, 30)
        + "\n\n## Top 压缩包学习资料线索\n\n"
        + archive_member_table(readable_archive_learning, 30)
        + "\n\n## 下一步规则\n\n"
        "- 每次只选一个候选生成学习包。\n"
        "- 写正文时直接打开 [[private-wiki/learning/lifecycle-learning-package-template]]。\n"
        "- 先写私有摘要，再对照 GitHub/官方资料，再公开改写。\n"
        "- 涉及账号、会话、个人身份、路径、密钥、聊天原文的候选先留私有。\n"
    )
    write_page(out / "learning" / "lifecycle-package-queue.md", "学习包候选队列", ["Lifecycle Learning Package Queue", "复刻学习资料队列"], ["personal-archive", "learning", "lifecycle"], "private-learning", "queue", "把本地学习材料按可写性、风险和下一步整理成私有候选池；全量文件索引另放高级证据页。", learning_body, "internal")

    evidence_inventory_body = (
        "这页是高级证据索引，不是新手入口。它保留文件级、压缩包级和候选级明细，方便查证据、做脱敏和回溯来源。\n\n"
        "## 使用边界\n\n"
        "- 只在需要找来源、查风险、确认证据时打开。\n"
        "- 不把本页表格复制到公开 wiki 或前端。\n"
        "- 任何带账号、路径、聊天、密钥、个人身份的条目，都只能作为私有证据。\n\n"
        "## 本地学习资料明细\n\n"
        + local_inventory_table(local_learning, 220)
        + "\n\n## 学习包候选明细\n\n"
        + source_status_table(package_candidates, 180)
        + "\n\n## 压缩包学习资料明细\n\n"
        + archive_member_table(archive_learning_rows, 220)
        + "\n\n## 回到写作入口\n\n"
        "- [[private-wiki/learning/lifecycle-package-queue]] - 只看 Top 候选。\n"
        "- [[private-wiki/learning/curated-package-digest]] - 只看精选主题。\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 开始写正文。\n"
    )
    write_page(out / "learning" / "learning-evidence-inventory.md", "学习资料证据索引", ["Learning Evidence Inventory", "学习证据明细"], ["personal-archive", "learning", "evidence"], "private-learning", "inventory", "保留学习资料文件级和压缩包级证据明细，作为高级查证页而不是小白入口。", evidence_inventory_body, "sensitive")

    walkthrough_body = (
        "这页给第一份学习包的完整走法。目标是让你看到：一个本地来源怎样一步步变成私有学习包，再变成公开中文资料和前端数据。\n\n"
        "## 示例主题\n\n"
        "从 0 搭一个 Karpathy-style Obsidian 知识库。\n\n"
        "## 1. 原始材料在哪里\n\n"
        "- 先只登记来源，不复制原文。\n"
        "- 来源入口看 [[private-wiki/local-sources/index]] 和 [[private-wiki/learning/learning-evidence-inventory]]。\n"
        "- 如果出现密钥、账号、聊天或本地路径，先进入 [[private-wiki/security/review-priority]]。\n\n"
        "## 2. 私有层写什么\n\n"
        "- 一句话说明主题：把本地资料整理成 raw、private-wiki、wiki/site-data 三层。\n"
        "- 证据入口：链接到项目卡、来源索引和安全复核。\n"
        "- 风险判断：哪些内容只能留私有，哪些可以抽象成公开方法。\n"
        "- 下一步：打开 [[private-wiki/learning/lifecycle-learning-package-template]] 写正文。\n\n"
        "## 3. 学习包正文怎么写\n\n"
        "| 模块 | 示例写法 |\n"
        "|---|---|\n"
        "| 这是什么 | 一个把本地资料编译成可维护知识库的流程。 |\n"
        "| 为什么学 | 小白资料越积越多，需要先学会分层和验收。 |\n"
        "| 前置知识 | 会打开 Obsidian，知道什么是文件和链接。 |\n"
        "| 怎么做 | 建三层目录，登记来源，写私有摘要，再公开改写。 |\n"
        "| 常见错误 | 直接把原文放公开页；把大表当教程；没有验收。 |\n"
        "| 怎么验收 | 私有层不进 Git；公开扫描为 0；site-data 能生成。 |\n\n"
        "## 4. 公开层怎么改写\n\n"
        "- 不说本地路径。\n"
        "- 不展示私有文件名细节。\n"
        "- 不复制聊天和配置原文。\n"
        "- 只写读者能复刻的方法、步骤、失败处理和验收。\n"
        "- 用 [[wiki/concepts/content-critique-and-review-rubric]] 做反向挑刺。\n\n"
        "## 5. 前端数据怎么验收\n\n"
        "- 公开 wiki 通过结构检查。\n"
        "- 隐私扫描没有高风险。\n"
        "- 站点数据能生成。\n"
        "- 详情页不要求读者知道 `private-wiki/` 或本地来源。\n\n"
        "## 下一步\n\n"
        "照这个例子，从 [[private-wiki/learning/curated-package-digest]] 选一个主题，复制 [[private-wiki/learning/lifecycle-learning-package-template]] 的结构，写第一版私有学习包。\n"
    )
    write_page(out / "learning" / "first-learning-package-walkthrough.md", "第一份学习包完整走法", ["First Learning Package Walkthrough", "学习包示例"], ["personal-archive", "learning", "walkthrough"], "private-learning", "walkthrough", "用一个主题演示来源如何进入私有学习包、公开 wiki 和站点数据。", walkthrough_body, "internal")

    todos = [
        {
            "priority": "P0",
            "todo": "复核高风险密钥和会话线索，只保留哈希与状态，不公开明文。",
            "input": f"`{len(high_findings)}` high findings, `{len(credential_findings)}` credential findings",
            "output": "[[private-wiki/security/review-priority]]",
            "acceptance": "无明文 secret；公开扫描仍为 0。",
        },
        {
            "priority": "P0",
            "todo": "持续抓取最近本地活动，包括 Hanako、Trae、Downloads、微信附件和项目根。",
            "input": "[[private-wiki/automation/recent-activity]]",
            "output": "更新后的 recent-activity 和 source maps",
            "acceptance": "每 2 小时有可解释的新增/无新增状态。",
        },
        {
            "priority": "P1",
            "todo": "把 Codex/Claude/Agent 对话按主题提炼成私有摘要。",
            "input": f"`{len(local_conversations)}` local conversation candidates",
            "output": "[[private-wiki/context/conversation-context-analysis]]",
            "acceptance": "至少形成 5 个主题摘要；不复制原始长对话。",
        },
        {
            "priority": "P1",
            "todo": "从下载和 OH-WorkSpace 学习资料中选择一个主题生成生命周期学习包。",
            "input": "[[private-wiki/learning/lifecycle-package-queue]]",
            "output": "`wiki/projects/` 或 `wiki/synthesis/` 的公开安全包",
            "acceptance": "有教程、步骤、验收、来源、隐私省略说明。",
        },
        {
            "priority": "P1",
            "todo": "为 Hanako/Trae/Coze/小安相关线索建立单独私有主题页。",
            "input": "recent activity and local source maps",
            "output": "private topic page, then public-safe candidate",
            "acceptance": "只输出通用项目经验，不泄露 app 私有状态。",
        },
        {
            "priority": "P2",
            "todo": "把项目候选连接到能力矩阵，避免只有工具名没有成果。",
            "input": "[[private-wiki/projects/showcase-draft]]",
            "output": "public project/capability pages",
            "acceptance": "每个能力至少有一个项目证据和一个可复刻流程。",
        },
        {
            "priority": "P2",
            "todo": "扩展 GitHub 最佳实践学习循环，只研究能解决当前待办的问题。",
            "input": "[[wiki/synthesis/github-best-practice-learning-loop]]",
            "output": "source note or workflow update",
            "acceptance": "每次研究都留下一个本地改进，不只留链接。",
        },
        {
            "priority": "P2",
            "todo": "把验收记录持续写入 Obsidian，而不是只停在命令输出。",
            "input": "acceptance automation",
            "output": "acceptance record or blocker note",
            "acceptance": "失败有 blocker；通过有日期记录。",
        },
    ]
    next_actions = [
        {
            "priority": "1",
            "todo": "从最近活动里选一个新增来源，确认它属于学习、项目、Agent、安全或资产哪一类。",
            "input": "[[private-wiki/automation/recent-activity]]",
            "output": "[[private-wiki/guide/source-intake-protocol]]",
            "acceptance": "来源有分类、有风险等级、有下一步。",
        },
        {
            "priority": "2",
            "todo": "挑一个 Hanako/Trae/Coze/小安相关主题，写成私有主题摘要。",
            "input": "[[private-wiki/context/coze-xiaoan-source-map]]",
            "output": "private topic page",
            "acceptance": "只写通用经验和证据定位，不复制私有 app 状态。",
        },
        {
            "priority": "3",
            "todo": "从学习包候选池选一个主题，按生命周期标准补成小白可读提纲。",
            "input": "[[private-wiki/learning/lifecycle-package-queue]]",
            "output": "[[private-wiki/learning/lifecycle-replication-standard]]",
            "acceptance": "包含背景、前置知识、步骤、常见错误和验收。",
        },
        {
            "priority": "4",
            "todo": "从能力画像里选一个高频能力，绑定一个项目证据。",
            "input": "[[private-wiki/skills/capability-brief]]",
            "output": "[[private-wiki/projects/showcase-draft]]",
            "acceptance": "能力不再只是工具名，而是能说明交付。",
        },
        {
            "priority": "5",
            "todo": "从 Agent 生态里选一个稳定流程，判断是否值得提炼成 Codex 技能。",
            "input": "[[private-wiki/agents/agent-ecosystem-brief]]",
            "output": "[[private-wiki/guide/skill-extraction-workflow]]",
            "acceptance": "有触发条件、步骤、输出和验收。",
        },
        {
            "priority": "6",
            "todo": "复核公开候选主题摘要，选下一批中文公开页。",
            "input": "[[private-wiki/publication/top-candidates-by-theme]]",
            "output": "[[private-wiki/publication-candidates]]",
            "acceptance": "候选明确是 private-only、needs-redaction 还是 public-safe-candidate。",
        },
        {
            "priority": "7",
            "todo": "跑一次私有层与公开层验收，把结果写回 Obsidian。",
            "input": "[[private-wiki/automation/lifecycle-loop-operating-procedure]]",
            "output": "acceptance note or blocker",
            "acceptance": "失败有阻塞原因，通过有日期记录。",
        },
    ]
    weekly_review_batches = [
        {
            "priority": "A",
            "todo": "挑 5 条高风险凭据或隐私线索做复核，只留状态、位置和哈希。",
            "input": "[[private-wiki/security/review-priority]]",
            "output": "updated private security note",
            "acceptance": "无明文；状态可追踪。",
        },
        {
            "priority": "B",
            "todo": "挑 5 条项目候选补项目卡，把能力、来源和公开角度写清楚。",
            "input": "[[private-wiki/projects/project-card-template]]",
            "output": "[[private-wiki/projects/showcase-draft]]",
            "acceptance": "项目卡可被小白读懂。",
        },
        {
            "priority": "C",
            "todo": "挑 1 个学习主题按生命周期标准写成完整学习包。",
            "input": "[[private-wiki/learning/lifecycle-replication-standard]]",
            "output": "private learning package draft",
            "acceptance": "有背景、步骤、验收、隐私省略说明。",
        },
        {
            "priority": "D",
            "todo": "从来源地图里新增一个真正有用的新来源根或新来源类别。",
            "input": "[[private-wiki/context/source-authority-and-dedupe]]",
            "output": "updated source coverage",
            "acceptance": "来源可被分类，且不会和旧备份混淆。",
        },
    ]
    todo_body = (
        "这页是当前生命周期工作流的私有待办总表。它把“全部都要”拆成能逐步完成的队列。\n\n"
        "## Current Todo Table\n\n"
        + todo_table(todos)
        + "\n\n## Next Seven Actions\n\n"
        + todo_table(next_actions)
        + "\n\n## Weekly Review Batches\n\n"
        + todo_table(weekly_review_batches)
        + "\n\n## Counts Behind The Queue\n\n"
        f"- Local conversation candidates: `{len(local_conversations)}`\n"
        f"- Local learning candidates: `{len(local_learning)}`\n"
        f"- Package candidates: `{len(package_candidates)}`\n"
        f"- Personal/privacy findings: `{len(personal_findings)}`\n"
        f"- Credential/security findings: `{len(credential_findings)}`\n\n"
        "## Workflow\n\n"
        "1. P0 安全先处理。\n"
        "2. P1 每次做一个主题摘要或学习包。\n"
        "3. P2 再补公开矩阵、GitHub 研究和长期验收。\n"
    )
    write_page(out / "todos" / "lifecycle-workflow-todo.md", "生命周期工作流待办", ["Lifecycle Workflow Todo", "知识库待办"], ["personal-archive", "todo", "lifecycle"], "private-todo", "todo", "Private todo list for step-by-step lifecycle wiki completion.", todo_body, "sensitive")

    next_actions_body = (
        "这页只保留下一批最具体的 7 个动作，方便每次打开知识库就能继续推进。\n\n"
        "## Actions\n\n"
        + todo_table(next_actions)
        + "\n\n## 使用规则\n\n"
        "- 每次只拿最上面的一个动作做完，不并行制造更多半成品。\n"
        "- 做完后重新编译私有 wiki，让下一批动作从最新来源生成。\n"
        "- 如果动作涉及密钥、账号、聊天或本地路径，只写状态和证据定位，不写明文内容。\n"
    )
    write_page(out / "todos" / "next-seven-actions.md", "下一批 7 个知识库动作", ["Next Seven Actions", "下一步动作"], ["personal-archive", "todo", "workflow"], "private-todo", "action-list", "把本地知识库下一批工作压缩成 7 个可执行动作。", next_actions_body, "sensitive")

    weekly_batches_body = (
        "这页把本地知识库工作拆成更适合一周一轮的批次。它用于避免每次只看到超大总表而不知道先做哪一小块。\n\n"
        "## Batches\n\n"
        + todo_table(weekly_review_batches)
        + "\n\n## 规则\n\n"
        "- 每周只推进一个批次到完成，不要在一周内堆太多半成品。\n"
        "- 每个批次都要回写到私有页，而不是只停在命令输出。\n"
        "- 若批次涉及密钥、账号、个人身份或聊天原文，先停在私有复核页。\n"
    )
    write_page(out / "todos" / "weekly-review-batches.md", "每周复核批次", ["Weekly Review Batches", "周复核批次"], ["personal-archive", "todo", "review"], "private-todo", "batches", "把安全、项目、学习包和来源工作拆成每周可完成的小批次。", weekly_batches_body, "sensitive")

    todo_index = (
        "This folder contains private work queues for the Karpathy-style archive. Public pages should only be created after the todo item has been rewritten and validated.\n\n"
        "## Queues\n\n"
        "- [[private-wiki/todos/lifecycle-workflow-todo]] - main step-by-step lifecycle queue.\n"
        "- [[private-wiki/todos/next-seven-actions]] - next concrete actions for the current batch.\n"
        "- [[private-wiki/todos/weekly-review-batches]] - weekly batches for security, projects, learning, and source work.\n"
        "- [[private-wiki/learning/lifecycle-package-queue]] - learning materials that may become copyable packages.\n"
        "- [[private-wiki/learning/learning-evidence-inventory]] - full private evidence inventory for learning materials.\n"
        "- [[private-wiki/learning/first-learning-package-walkthrough]] - example route from local source to learning package.\n"
        "- [[private-wiki/context/conversation-context-analysis]] - conversation and session context analysis.\n\n"
        "## Rule\n\n"
        "Do not treat a private todo as public content. It is an operating queue, not a showcase page.\n"
    )
    write_page(out / "todos" / "index.md", "Private Todo Index", ["私有待办索引"], ["personal-archive", "todo"], "private-todo", "moc", "Private todo index for lifecycle archive work.", todo_index, "internal")
    return 8


def build(root: Path) -> int:
    manifest_dir = root / PRIVATE_MANIFEST_DIR
    out = root / OUT_DIR
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    sensitive_rows = read_csv(manifest_dir / "sensitive_local_scan.csv")
    timeline_rows = read_csv(manifest_dir / "timeline_index.csv")
    review_rows = read_csv(manifest_dir / "review_queue.csv")
    recovered_rows = read_csv(manifest_dir / "recovered_file_inventory.csv")
    recovery_summary = read_json(manifest_dir / "recovery_summary.json")
    sensitive_summary = read_json(manifest_dir / "sensitive_timeline_summary.json")
    local_dir = local_index_cache_dir(root)
    local_discovery_summary = read_json(local_dir / "local_discovery_summary.json")
    local_rows = read_csv(local_dir / "local_source_inventory.csv")
    local_root_rows = read_csv(local_dir / "local_roots.csv")
    local_finding_rows = read_csv(local_dir / "local_sensitive_findings.csv")
    local_timeline_rows = read_csv(local_dir / "local_timeline_index.csv")
    archive_rows = read_csv(local_dir / "local_archive_inventory.csv")
    archive_failures = read_csv(local_dir / "local_archive_failures.csv")
    archive_summary = read_json(local_dir / "local_archive_summary.json")
    disposition_rows = read_csv(local_dir / "local_finding_disposition.csv")
    private_intake_runs = read_jsonl(local_dir / "private_intake_runs.jsonl")

    secret_rows = group_sensitive(sensitive_rows, SECRET_RULES)
    high_secret_rows = group_sensitive(sensitive_rows, HIGH_SECRET_RULES)
    personal_rows = group_sensitive(sensitive_rows, PERSONAL_RULES)
    local_path_rows = group_sensitive(sensitive_rows, LOCAL_CONTEXT_RULES)
    status_counts = Counter(status_for_review(row) for row in review_rows)

    index_body = (
        "This is the local-only compiled wiki layer for recovered private context. It follows the raw -> private compiled wiki -> public wiki split.\n\n"
        "## Start Here\n\n"
        "- [[private-wiki/guide/start-here]] - 本地 Karpathy 知识库阅读入口\n"
        "- [[private-wiki/guide/local-knowledge-map]] - 本地资料库总地图\n"
        "- [[private-wiki/guide/completeness-and-readiness-dashboard]] - 本地知识库完整度仪表盘\n"
        "- [[private-wiki/guide/daily-operating-workflow]] - 日常补录、复核和公开工作流\n"
        "- [[private-wiki/guide/source-intake-protocol]] - 下载、微信、Agent、项目和新 App 来源进入流程\n"
        "- [[private-wiki/guide/workflow-and-learning-hub]] - 工作流和学习文件总入口\n"
        "- [[private-wiki/guide/critique-research-optimization-loop]] - 挑刺、调研、分析和优化闭环\n"
        "- [[private-wiki/guide/skill-extraction-workflow]] - 本地经验到 Codex 技能的提取流程\n"
        "- [[private-wiki/learning/beginner-learning-path]] - 小白阅读路线\n"
        "- [[private-wiki/learning/glossary-for-beginners]] - 小白术语表\n"
        "- [[private-wiki/profile/index]] - private personal archive for growth, projects, skills, agents, and sensitive context\n"
        "- [[private-wiki/profile/personal-brief]] - 个人成长与定位摘要\n"
        "- [[private-wiki/security/index]] - credential, personal information, and local path triage\n"
        "- [[private-wiki/security/review-priority]] - 密钥与隐私复核优先级\n"
        "- [[private-wiki/security/finding-disposition]] - 高风险和凭据线索处置闭环\n"
        "- [[private-wiki/timeline/index]] - recovered timeline by month\n"
        "- [[private-wiki/projects/index]] - project and action-item context\n"
        "- [[private-wiki/projects/portfolio-map]] - private project portfolio and root map\n"
        "- [[private-wiki/projects/top-projects-decision-map]] - 第一批项目整理决策地图\n"
        "- [[private-wiki/projects/project-capability-matrix]] - 项目能力证据矩阵\n"
        "- [[private-wiki/projects/project-card-template]] - 私有项目卡模板\n"
        "- [[private-wiki/projects/showcase-draft]] - 项目展示草稿池\n"
        "- [[private-wiki/agents/index]] - agent memory, rules, prompts, and skills context\n"
        "- [[private-wiki/agents/configuration-map]] - configured agents and rule surfaces\n"
        "- [[private-wiki/agents/active-rule-surfaces]] - 当前有效、历史和废弃规则面\n"
        "- [[private-wiki/agents/agent-ecosystem-brief]] - Agent 生态与配置地图\n"
        "- [[private-wiki/skills/index]] - private skills and capabilities evidence\n"
        "- [[private-wiki/skills/capability-brief]] - 能力画像与证据\n"
        "- [[private-wiki/skills/skill-extraction-backlog]] - Codex 技能提取候选池\n"
        "- [[private-wiki/profile/growth-milestones]] - 成长里程碑候选\n"
        "- [[private-wiki/personal/index]] - private memory and session context\n"
        "- [[private-wiki/assets/index]] - local asset and environment context\n"
        "- [[private-wiki/local-sources/index]] - additional local source discovery outside the recovered vault\n"
        "- [[private-wiki/automation/index]] - asynchronous automation outputs and recent activity signals\n"
        "- [[private-wiki/automation/latest-cycle-digest]] - 最近一轮自动化摘要\n"
        "- [[private-wiki/automation/local-source-incremental-watch]] - 本地来源增量观察台\n"
        "- [[private-wiki/automation/lifecycle-loop-operating-procedure]] - 两小时自动化循环 SOP\n"
        "- [[private-wiki/automation/pipeline-health]] - 私有 intake 管道健康\n"
        "- [[private-wiki/automation/intake-run-log]] - 私有 intake 运行台账\n"
        "- [[private-wiki/automation/archive-index-gaps]] - 压缩包索引盲区\n"
        "- [[private-wiki/context/conversation-context-analysis]] - 对话、会话、记忆和聊天上下文分析\n"
        "- [[private-wiki/context/current-state-map]] - 当前事实、历史备份和待核实状态\n"
        "- [[private-wiki/context/source-to-page-lineage]] - 来源到页面追踪关系\n"
        "- [[private-wiki/context/source-authority-and-dedupe]] - 来源权威度与去重规则\n"
        "- [[private-wiki/learning/lifecycle-package-queue]] - 本地学习资料到生命周期学习包的候选队列\n"
        "- [[private-wiki/learning/curated-package-digest]] - 精选学习包摘要\n"
        "- [[private-wiki/learning/learning-evidence-inventory]] - 学习资料证据索引\n"
        "- [[private-wiki/learning/first-learning-package-walkthrough]] - 第一份学习包完整走法\n"
        "- [[private-wiki/learning/lifecycle-learning-package-template]] - 生命周期学习包正文模板\n"
        "- [[private-wiki/learning/beginner-learning-package-workbench]] - 小白可读学习包工作台\n"
        "- [[private-wiki/learning/lifecycle-replication-standard]] - 生命周期复刻学习资料标准\n"
        "- [[private-wiki/todos/lifecycle-workflow-todo]] - 分阶段待办与验收队列\n"
        "- [[private-wiki/todos/next-seven-actions]] - 下一批 7 个知识库动作\n"
        "- [[private-wiki/todos/weekly-review-batches]] - 每周复核批次\n"
        "- [[private-wiki/context/index]] - 更多本地信息与上下文地图\n"
        "- [[private-wiki/synthesis/index]] - recovery synthesis and next passes\n"
        "- [[private-wiki/synthesis/local-karpathy-wiki-operating-model]] - 本地 Karpathy 知识库运行模型\n"
        "- [[private-wiki/publication/top-candidates-by-theme]] - 公开候选主题摘要\n"
        "- [[private-wiki/publication-candidates]] - candidates for future public-safe rewrite\n\n"
        "## Current Counts\n\n"
        f"- Recovered files: `{recovery_summary.get('total_files', 'unknown')}`\n"
        f"- Recovered Markdown files: `{recovery_summary.get('markdown_files', 'unknown')}`\n"
        f"- Sensitive/context rows: `{sensitive_summary.get('sensitive_rows', 'unknown')}`\n"
        f"- Timeline rows: `{sensitive_summary.get('timeline_rows', 'unknown')}`\n"
        f"- Additional local-source files indexed: `{local_discovery_summary.get('files', 'not scanned')}`\n"
        f"- Additional local-source findings: `{local_discovery_summary.get('findings', 'not scanned')}`\n"
        f"- Private intake runs logged: `{len(private_intake_runs)}`\n"
        f"- High-risk disposition rows: `{len(disposition_rows)}`\n"
        f"- Publication candidate status counts: `{dict(status_counts)}`\n\n"
        "## Boundary\n\n"
        "- Do not publish this directory.\n"
        "- Do not copy raw private text, credentials, local paths, or chat logs into `wiki/`.\n"
        "- Public pages must be rewritten summaries with provenance and a clean privacy scan.\n"
    )
    write_page(out / "index.md", "Private Wiki Index", ["本地私有 Wiki", "Private Wiki"], ["local-recovery", "private-wiki"], "private-wiki", "moc", "Local-only compiled wiki index for recovered private context.", index_body)

    security_body = (
        "Security pages contain only rule names, paths, line numbers, counts, and hashes. They do not contain secret values.\n\n"
        "## Security Workbench\n\n"
        "- [[credential-review]] - exact and candidate credential findings\n"
        "- [[finding-disposition]] - review status and disposition loop for high-risk findings\n"
        "- [[secret-material-map]] - local and recovered credential material map without secret values\n"
        "- [[personal-info-review]] - personal information and private-memory markers\n"
        "- [[local-path-map]] - local filesystem and environment path markers\n\n"
        "## Counts\n\n"
        f"- High/candidate credential rows: `{len(secret_rows)}`\n"
        f"- High-confidence secret rows: `{len(high_secret_rows)}`\n"
        f"- Personal/private rows: `{len(personal_rows)}`\n"
        f"- Local path rows: `{len(local_path_rows)}`\n\n"
        "## Reports\n\n"
        f"- {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n"
        f"- {private_report_link('sensitive_timeline_summary.json', 'sensitive_timeline_summary.json', 2)}\n"
    )
    write_page(out / "security" / "index.md", "Private Security Index", ["本地安全复核索引"], ["local-recovery", "security"], "private-security", "moc", "Local-only security review index for recovered context.", security_body, "sensitive")

    credential_body = (
        "Review these entries first. Exact token patterns and candidate assignments require manual confirmation and possible rotation.\n\n"
        f"- High-confidence secret rows: `{len(high_secret_rows)}`\n"
        f"- Credential/context rows: `{len(secret_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(secret_rows), 180, 2)
    )
    write_page(out / "security" / "credential-review.md", "Credential Review", ["密钥复核"], ["local-recovery", "security", "credentials"], "private-security", "review", "Credential and secret-candidate review without secret values.", credential_body, "sensitive")

    personal_body = (
        "This page tracks personal information, private-memory markers, and chat-context markers. Values are not reproduced here.\n\n"
        f"- Personal/private rows: `{len(personal_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(personal_rows), 180, 2)
    )
    write_page(out / "security" / "personal-info-review.md", "Personal Information Review", ["个人信息复核"], ["local-recovery", "security", "personal-info"], "private-security", "review", "Personal information and private-memory review without raw values.", personal_body, "sensitive")

    local_path_body = (
        "This page tracks local path and environment references. Treat all rows as private-only until rewritten.\n\n"
        f"- Local path rows: `{len(local_path_rows)}`\n"
        f"- Full report: {private_report_link('sensitive_local_scan.csv', 'sensitive_local_scan.csv', 2)}\n\n"
        "## File-Level Findings\n\n"
        + table_for_findings(aggregate_by_file(local_path_rows), 180, 2)
    )
    write_page(out / "security" / "local-path-map.md", "Local Path Map", ["本地路径地图"], ["local-recovery", "security", "local-paths"], "private-security", "review", "Local path and environment reference map for private-only triage.", local_path_body, "sensitive")

    write_timeline_pages(timeline_rows)
    capture_body = "\n\n## Manual Private Captures\n\n" + "\n".join(manual_capture_lines(root, 2)) + "\n"
    context_page(review_rows, "projects-and-action-items", "Private Projects Index", "Recovered private project and action-item index.", out / "projects" / "index.md", capture_body)
    context_page(review_rows, "agent-governance-and-skills", "Private Agent Context Index", "Recovered private agent rules, skills, prompts, and memory index.", out / "agents" / "index.md")
    context_page(review_rows, "private-memory-and-sessions", "Private Personal Context Index", "Recovered private memory, session, and personal context index.", out / "personal" / "index.md")
    context_page(review_rows, "local-assets-and-environment", "Private Assets Index", "Recovered local assets, environment, and path-map context index.", out / "assets" / "index.md")
    context_page(review_rows, "public-knowledge-candidates", "Private Public-Knowledge Candidate Index", "Recovered public-knowledge candidates that still require review.", out / "synthesis" / "index.md")
    local_stats = write_local_source_pages(root, out)
    automation_pages = write_automation_pages(out, local_rows, local_root_rows, local_finding_rows)
    pipeline_state_pages = write_pipeline_state_pages(
        out,
        local_discovery_summary,
        archive_summary,
        archive_failures,
        disposition_rows,
        private_intake_runs,
    )
    context_analysis_pages = write_context_analysis_pages(
        out,
        recovered_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        local_timeline_rows,
        archive_rows,
    )
    personal_archive_stats = write_personal_archive_pages(
        root,
        out,
        recovered_rows,
        sensitive_rows,
        local_rows,
        local_root_rows,
        local_finding_rows,
        local_timeline_rows,
        archive_rows,
    )

    publication_body = (
        "Candidates here are not public pages. They are triage rows for future rewritten public-safe notes.\n\n"
        "## Status Counts\n\n"
        + "\n".join(f"- `{status}`: `{count}`" for status, count in status_counts.most_common())
        + "\n\n## Candidate Queue\n\n"
        + review_table(review_rows, 260, 1)
        + "\n\n## Promotion Rule\n\n"
        "- `private-only`: never promote without explicit review.\n"
        "- `needs-redaction`: rewrite and remove local/private material first.\n"
        "- `public-safe-candidate`: still run privacy and structure checks before moving to `wiki/`.\n"
        "- `published`: only after a public page exists and passes gates.\n"
    )
    write_page(out / "publication-candidates.md", "Publication Candidates", ["公开提升队列"], ["local-recovery", "publication"], "private-publication", "review", "Local-only queue for future public-safe wiki rewrites.", publication_body)

    manifest = {
        "archive_id": ARCHIVE_ID,
        "generated": TODAY,
        "pages": len(list(out.rglob("*.md"))),
        "sensitive_rows": len(sensitive_rows),
        "timeline_rows": len(timeline_rows),
        "review_rows": len(review_rows),
        "local_archive_members": len(archive_rows),
        "publication_status_counts": dict(status_counts),
        "automation_pages": automation_pages,
        "pipeline_state_pages": pipeline_state_pages,
        "private_intake_runs": len(private_intake_runs),
        "disposition_rows": len(disposition_rows),
        "context_analysis_pages": context_analysis_pages,
        **local_stats,
        **personal_archive_stats,
    }
    (out / ".private_wiki_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"private_wiki_pages: {manifest['pages']}")
    print(f"private_wiki: {out}")
    return 0


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    return build(root)


if __name__ == "__main__":
    raise SystemExit(main())
