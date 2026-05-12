#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import shutil
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

ARCHIVE_ID = "pre-karpathy-rebuild-20260512-143127"
PRIVATE_MANIFEST_DIR = Path("inbox/private/local-recovery-2026-05-12/manifests")
PRIVATE_CAPTURES_DIR = Path("inbox/private/local-recovery-2026-05-12/captures")
OUT_DIR = Path("private-wiki")
TODAY = "2026-05-12"

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


def row_label(row: dict[str, str]) -> str:
    return (row.get("title") or Path(row.get("relative_path", "source")).stem)[:90].replace("|", "-")


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


def build(root: Path) -> int:
    manifest_dir = root / PRIVATE_MANIFEST_DIR
    out = root / OUT_DIR
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    sensitive_rows = read_csv(manifest_dir / "sensitive_local_scan.csv")
    timeline_rows = read_csv(manifest_dir / "timeline_index.csv")
    review_rows = read_csv(manifest_dir / "review_queue.csv")
    recovery_summary = read_json(manifest_dir / "recovery_summary.json")
    sensitive_summary = read_json(manifest_dir / "sensitive_timeline_summary.json")

    secret_rows = group_sensitive(sensitive_rows, SECRET_RULES)
    high_secret_rows = group_sensitive(sensitive_rows, HIGH_SECRET_RULES)
    personal_rows = group_sensitive(sensitive_rows, PERSONAL_RULES)
    local_path_rows = group_sensitive(sensitive_rows, LOCAL_CONTEXT_RULES)
    status_counts = Counter(status_for_review(row) for row in review_rows)

    index_body = (
        "This is the local-only compiled wiki layer for recovered private context. It follows the raw -> private compiled wiki -> public wiki split.\n\n"
        "## Start Here\n\n"
        "- [[security/index]] - credential, personal information, and local path triage\n"
        "- [[timeline/index]] - recovered timeline by month\n"
        "- [[projects/index]] - project and action-item context\n"
        "- [[agents/index]] - agent memory, rules, prompts, and skills context\n"
        "- [[personal/index]] - private memory and session context\n"
        "- [[assets/index]] - local asset and environment context\n"
        "- [[synthesis/index]] - recovery synthesis and next passes\n"
        "- [[publication-candidates]] - candidates for future public-safe rewrite\n\n"
        "## Current Counts\n\n"
        f"- Recovered files: `{recovery_summary.get('total_files', 'unknown')}`\n"
        f"- Recovered Markdown files: `{recovery_summary.get('markdown_files', 'unknown')}`\n"
        f"- Sensitive/context rows: `{sensitive_summary.get('sensitive_rows', 'unknown')}`\n"
        f"- Timeline rows: `{sensitive_summary.get('timeline_rows', 'unknown')}`\n"
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
        "publication_status_counts": dict(status_counts),
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
