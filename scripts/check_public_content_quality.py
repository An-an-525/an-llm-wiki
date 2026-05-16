#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

REPORT_CSV = Path("manifests/public_content_quality_report.csv")
REPORT_JSON = Path("manifests/public_content_quality_report.json")

FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
HAN_RE = re.compile(r"[\u4e00-\u9fff]")
LATIN_RE = re.compile(r"[A-Za-z0-9_+-]+")
UNIX_USER_PREFIXES = ("/" + "Users/", "/" + "home/")
LOCAL_PATH_RE = re.compile(
    rf"(?i)((?<![A-Za-z])[A-Z]:[\\/][^\s)\]\"']+|{re.escape(UNIX_USER_PREFIXES[0])}[^\s)\]\"']+|{re.escape(UNIX_USER_PREFIXES[1])}[^\s)\]\"']+)"
)
INTERNAL_DISPLAY_RE = re.compile(r"(?i)(?:wiki|private-wiki|_raw|_archives|inbox(?:/private)?|site-data|manifests|scripts|docs)/")
CONTENT_ROUTE_RE = re.compile(r"(?i)^/?content/[A-Za-z0-9_-]+$")
BACKSTAGE_READER_TERMS = [
    "本地资料库",
    "本地黑曜石",
    "黑曜石资料库",
    "黑曜石仓库",
    "黑曜石原始目录",
    "Obsidian vault",
    "Markdown 资料库",
    "公开资料层",
    "原始资料层",
    "网站数据层",
    "网站内容包",
    "非公开整理层",
    "整理前材料",
    "资料整理库",
    "后台文档",
    "后台材料",
    "后台痕迹",
    "后台 wiki",
    "内部字段",
    "内部文档",
    "内部整理页",
    "维护文档",
    "原始库",
    "私有目录",
    "private-wiki",
    "_raw",
    "_archives",
    "inbox/private",
]
BACKSTAGE_ALLOWED_PATH_RE = re.compile(r"(?i)(?:sourcePath|target|id|slug|href|url|links?\[\d+\]\.url|related.*Ids?)$")

REQUIRED_FRONTMATTER = {
    "title",
    "tags",
    "category",
    "type",
    "status",
    "created",
    "updated",
    "sources",
    "summary",
}
STRICT_STATUSES = {"featured", "verified", "recommended"}
STRICT_TAGS = {"featured", "curated", "showcase", "beginner-friendly"}
STRICT_PUBLISH_VALUES = {"curated", "showcase", "public", "true", "yes", "1"}
LEGACY_STATUSES = {"migrated-needs-source-review", "archived", "outdated"}
LEGACY_TAGS = {"migrated", "legacy", "archive-only"}
LEARNING_TYPES = {"tutorial", "learning-path", "template", "workflow", "route", "roadmap"}
LEARNING_TAGS = {"beginner-friendly", "learning", "lifecycle", "replication"}

BEGINNER_GROUPS = {
    "audience": ["小白", "读者", "适合谁", "谁适合", "入门", "who this is for", "beginner", "someone"],
    "replication": ["复刻", "步骤", "做出", "操作", "练习", "任务", "tutorial", "practice task", "what you will build", "replication", "adapt locally", "flow"],
    "validation": ["验收", "检查点", "完成标准", "验证", "测试", "检查", "acceptance", "validation", "gate", "checked", "check", "verify", "measurement", "baseline"],
    "failure": ["失败", "踩坑", "风险", "边界", "不能", "failed", "failure", "risk", "boundary", "omissions"],
    "source": ["来源", "参考", "证据", "官方", "公开", "相关", "sources", "related", "reference"],
}


@dataclass(frozen=True)
class Finding:
    path: str
    gate: str
    severity: str
    rule: str
    message: str
    recommendation: str


def parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return []
    if value in {"[]", "{}"}:
        return [] if value == "[]" else {}
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [item.strip().strip("\"'") for item in inner.split(",") if item.strip()]
    return value.strip("\"'")


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    block = match.group(1)
    body = text[match.end() :]
    data: dict[str, Any] = {}
    current_key: str | None = None
    for raw_line in block.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        if line.startswith((" ", "\t")) and current_key and line.strip().startswith("- "):
            data.setdefault(current_key, [])
            if not isinstance(data[current_key], list):
                data[current_key] = [data[current_key]]
            data[current_key].append(line.strip()[2:].strip().strip("\"'"))
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        current_key = key.strip()
        data[current_key] = parse_scalar(value)
    return data, body


def as_list(value: Any) -> list[str]:
    if value in (None, "", []):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()]


def as_text(value: Any) -> str:
    if value in (None, [], {}):
        return ""
    if isinstance(value, list):
        return " ".join(as_list(value))
    return str(value).strip()


def list_has_chinese(values: Any) -> bool:
    return any(has_han(item) for item in as_list(values))


def has_truthy_publish(value: Any) -> bool:
    return as_text(value).strip().lower() in STRICT_PUBLISH_VALUES


def has_han(value: str) -> bool:
    return bool(HAN_RE.search(value))


def chinese_summary_ready(value: str) -> bool:
    han_count = len(HAN_RE.findall(value))
    latin_count = len(LATIN_RE.findall(value))
    return han_count >= 12 and latin_count <= max(18, int(han_count * 0.55))


def chinese_title_ready(value: str) -> bool:
    han_count = len(HAN_RE.findall(value))
    latin_count = len(LATIN_RE.findall(value))
    return han_count >= 2 and latin_count <= max(8, int(han_count * 1.8))


def markdown_files(root: Path) -> list[Path]:
    wiki_root = root / "wiki"
    if not wiki_root.exists():
        return []
    return sorted(wiki_root.rglob("*.md"), key=lambda path: path.relative_to(root).as_posix())


def page_profile(frontmatter: dict[str, Any], body: str) -> dict[str, Any]:
    tags = set(as_list(frontmatter.get("tags")))
    statuses = set(as_list(frontmatter.get("status")))
    category = as_text(frontmatter.get("category"))
    page_type = as_text(frontmatter.get("type"))
    legacy = bool(statuses & LEGACY_STATUSES) or bool(tags & LEGACY_TAGS)
    source_record = category == "source" or page_type == "source"
    curated = (
        has_truthy_publish(frontmatter.get("publish"))
        or bool(statuses & STRICT_STATUSES)
        or bool(tags & STRICT_TAGS)
    )
    featured = "featured" in statuses or "featured" in tags
    learning = (
        not source_record
        and (
            page_type in LEARNING_TYPES
            or category == "project"
            or bool(tags & LEARNING_TAGS)
            or "复刻" in body
            or "lifecycle" in body.lower()
        )
    )
    learning_package = (
        learning
        and (
            page_type in {"tutorial", "learning-path", "template"}
            or "beginner-friendly" in tags
            or "learning" in tags
            or "学习包" in body
            or "lifecycle package" in as_text(frontmatter.get("title")).lower()
            or "复刻" in body
        )
    )
    strict = (
        featured
        or rel_like_lifecycle_project(frontmatter, body)
        or (curated and page_type in {"tutorial", "learning-path"} and not source_record)
    )
    return {
        "tags": tags,
        "statuses": statuses,
        "category": category,
        "type": page_type,
        "legacy": legacy,
        "curated": curated,
        "featured": featured,
        "strict": strict,
        "source_record": source_record,
        "learning": learning,
        "learning_package": learning_package,
    }


def rel_like_lifecycle_project(frontmatter: dict[str, Any], body: str) -> bool:
    title = as_text(frontmatter.get("title")).lower()
    return (
        as_text(frontmatter.get("category")) == "project"
        and (
            "lifecycle" in title
            or "学习包" in body
            or "lifecycle package" in body.lower()
        )
    )


def severity_for(profile: dict[str, Any], default: str = "warning") -> str:
    if profile["legacy"]:
        return "legacy-warning"
    if profile["strict"]:
        return "error"
    return default


def finding(path: str, gate: str, severity: str, rule: str, message: str, recommendation: str) -> Finding:
    return Finding(path, gate, severity, rule, message, recommendation)


def iter_public_adapter_strings(node: Any, path: str = ""):
    if isinstance(node, dict):
        for key, value in node.items():
            if key in {"id", "url", "link", "generatedAt", "sourceGeneratedAt"}:
                continue
            next_path = f"{path}.{key}" if path else key
            yield from iter_public_adapter_strings(value, next_path)
        return
    if isinstance(node, list):
        for index, value in enumerate(node):
            next_path = f"{path}[{index}]"
            yield from iter_public_adapter_strings(value, next_path)
        return
    if isinstance(node, str):
        yield path, node


def check_public_adapter(root: Path) -> list[Finding]:
    adapter_path = root / "site-data" / "adapter.json"
    if not adapter_path.exists():
        return []

    try:
        payload = json.loads(adapter_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return [
            finding(
                adapter_path.relative_to(root).as_posix(),
                "frontend-data",
                "error",
                "invalid-adapter-json",
                "site-data/adapter.json is not valid JSON.",
                "Regenerate the adapter before publishing the frontend.",
            )
        ]

    findings: list[Finding] = []
    rel = adapter_path.relative_to(root).as_posix()
    for value_path, text in iter_public_adapter_strings(payload):
        if BACKSTAGE_ALLOWED_PATH_RE.search(value_path):
            continue
        if INTERNAL_DISPLAY_RE.search(text):
            findings.append(
                finding(
                    rel,
                    "frontend-data",
                    "error",
                    "internal-path-shape-in-reader-text",
                    f"Reader-facing adapter text still exposes an internal path shape at {value_path}.",
                    "Replace raw wiki or pipeline path text with a human Chinese title before syncing site data.",
                )
            )
        if CONTENT_ROUTE_RE.match(text.strip()):
            findings.append(
                finding(
                    rel,
                    "frontend-data",
                    "error",
                    "content-route-in-reader-text",
                    f"Reader-facing adapter text still exposes a raw content route at {value_path}.",
                    "Show a readable Chinese label and keep the route only in the hidden navigation field.",
                )
            )
        if LOCAL_PATH_RE.search(text):
            findings.append(
                finding(
                    rel,
                    "frontend-data",
                    "error",
                    "local-path-shaped-text",
                    f"Reader-facing adapter text still exposes local-path-shaped text at {value_path}.",
                    "Replace it with a public-safe description before syncing the frontend.",
                )
            )
        for term in BACKSTAGE_READER_TERMS:
            if term.lower() in text.lower():
                findings.append(
                    finding(
                        rel,
                        "frontend-data",
                        "error",
                        "backstage-term-in-reader-text",
                        f"Reader-facing adapter text still exposes backstage wording {term!r} at {value_path}.",
                        "Rewrite backend, vault, and pipeline language into reader-facing Chinese before syncing the frontend.",
                    )
                )
                break
    return findings


def check_page(root: Path, path: Path) -> tuple[dict[str, Any], list[Finding]]:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, body = parse_frontmatter(text)
    profile = page_profile(frontmatter, body)
    findings: list[Finding] = []

    if not frontmatter:
        return profile, [
            finding(rel, "frontmatter", "error", "missing-frontmatter", "Public wiki pages need Obsidian properties.", "Add YAML frontmatter before the body.")
        ]

    missing = sorted(REQUIRED_FRONTMATTER - set(frontmatter))
    if missing:
        findings.append(
            finding(
                rel,
                "frontmatter",
                severity_for(profile),
                "missing-required-properties",
                f"Missing required properties: {', '.join(missing)}.",
                "Add the standard title, tags, category, type, status, dates, sources, and summary fields.",
            )
        )

    title = as_text(frontmatter.get("title"))
    summary = as_text(frontmatter.get("summary"))
    sources = as_list(frontmatter.get("sources"))
    source_labels = as_list(frontmatter.get("sourceLabels")) + as_list(frontmatter.get("source_labels"))
    reference_types = as_list(frontmatter.get("referenceTypes")) + as_list(frontmatter.get("reference_types"))
    review_status = as_text(frontmatter.get("reviewStatus") or frontmatter.get("review_status"))
    evidence_level = as_text(frontmatter.get("evidenceLevel") or frontmatter.get("evidence_level"))
    public_safety = as_text(frontmatter.get("publicSafety") or frontmatter.get("public_safety"))
    action_text = as_text(frontmatter.get("actionText") or frontmatter.get("action_text"))

    if profile["curated"] or profile["featured"]:
        strict_publication_severity = "error" if profile["strict"] else "warning"
        if public_safety != "public-safe":
            findings.append(
                finding(rel, "publication", strict_publication_severity, "public-safety-not-confirmed", "Curated pages must explicitly declare publicSafety: public-safe.", "Redact or demote the page until it can be marked public-safe.")
            )
        if not sources:
            findings.append(
                finding(rel, "provenance", strict_publication_severity, "missing-sources", "Curated pages need at least one source.", "Add public source notes or a sanitized local-compile source note.")
            )
        if not (source_labels or reference_types):
            findings.append(
                finding(rel, "provenance", strict_publication_severity, "missing-source-labels", "Curated pages need sourceLabels or referenceTypes.", "State whether the page is backed by official docs, public projects, personal evidence, review, or local compile.")
            )
        if not (review_status or evidence_level or as_text(frontmatter.get("reviewNotes"))):
            findings.append(
                finding(rel, "review", "warning", "missing-review-marker", "Curated pages should record reviewStatus, evidenceLevel, or reviewNotes.", "Add a short challenge/review marker before promoting this page further.")
            )
        if not profile["source_record"] and not chinese_summary_ready(summary):
            findings.append(
                finding(rel, "readability", "error" if profile["strict"] else "warning", "summary-not-chinese-reader-ready", "Curated summaries should be Chinese and directly useful to a beginner.", "Rewrite summary in clear Chinese with the page value and next context.")
            )
        if title and not profile["source_record"] and not chinese_title_ready(title) and not list_has_chinese(frontmatter.get("aliases")):
            findings.append(
                finding(rel, "readability", "warning", "title-not-mainly-chinese", "Public-facing pages should use Chinese titles unless they are source records.", "Add a Chinese title or a Chinese display title before featuring it on the site.")
            )
        if profile["curated"] and not action_text and profile["type"] not in {"source", "moc"}:
            findings.append(
                finding(rel, "frontend", "warning", "missing-action-text", "Curated reader-facing pages should tell the reader what to do next.", "Add actionText for frontend cards and detail pages.")
            )

    if profile["learning_package"] and (profile["strict"] or profile["featured"]):
        body_haystack = "\n".join(
            [
                body,
                as_text(frontmatter.get("summary")),
                as_text(frontmatter.get("actionText")),
                as_text(frontmatter.get("whyItMattered")),
                as_text(frontmatter.get("operationStory")),
                as_text(frontmatter.get("replicationSteps")),
                as_text(frontmatter.get("failureModes")),
                as_text(frontmatter.get("sources")),
            ]
        ).lower()
        missing_groups = [
            group
            for group, keywords in BEGINNER_GROUPS.items()
            if not any(keyword.lower() in body_haystack for keyword in keywords)
        ]
        if missing_groups:
            findings.append(
                finding(
                    rel,
                    "learning-package",
                    "error",
                    "missing-beginner-learning-sections",
                    f"Missing beginner learning signals: {', '.join(missing_groups)}.",
                    "Add audience, repeatable steps, validation, failure/boundary, and source/evidence language.",
                )
            )
        for field_name in ["whyItMattered", "replicationSteps", "failureModes"]:
            if not as_text(frontmatter.get(field_name)):
                findings.append(
                    finding(
                        rel,
                        "learning-package",
                        "warning",
                        f"missing-{field_name}",
                        f"Learning packages should include {field_name}.",
                        "Add the field or keep this page out of featured routes.",
                    )
                )

    if profile["legacy"] and (profile["curated"] or profile["featured"]):
        findings.append(
            finding(rel, "promotion", "error", "legacy-page-promoted", "Legacy or migrated pages must not be curated before source review.", "Demote it or rewrite it as a public-safe curated page.")
        )

    if LOCAL_PATH_RE.search(text):
        findings.append(
            finding(rel, "privacy-shape", "error", "local-path-shaped-text", "Public wiki page contains local-path-shaped text.", "Replace it with a generic public-safe description.")
        )

    return profile, findings


def write_reports(root: Path, findings: list[Finding], summary: dict[str, Any]) -> None:
    csv_path = root / REPORT_CSV
    json_path = root / REPORT_JSON
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["path", "gate", "severity", "rule", "message", "recommendation"])
        writer.writeheader()
        for item in findings:
            writer.writerow(item.__dict__)
    json_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    all_findings: list[Finding] = []
    pages = markdown_files(root)
    strict_pages = 0
    legacy_pages = 0
    learning_pages = 0

    for path in pages:
        profile, findings = check_page(root, path)
        if profile.get("curated") or profile.get("featured"):
            strict_pages += 1
        if profile.get("legacy"):
            legacy_pages += 1
        if profile.get("learning"):
            learning_pages += 1
        all_findings.extend(findings)

    all_findings.extend(check_public_adapter(root))

    blocking = [item for item in all_findings if item.severity == "error"]
    warnings = [item for item in all_findings if item.severity == "warning"]
    legacy_warnings = [item for item in all_findings if item.severity == "legacy-warning"]
    summary = {
        "vault": ".",
        "pages_checked": len(pages),
        "strict_pages": strict_pages,
        "legacy_pages": legacy_pages,
        "learning_pages": learning_pages,
        "frontend_data_checks": 1 if (root / "site-data" / "adapter.json").exists() else 0,
        "blocking_findings": len(blocking),
        "warnings": len(warnings),
        "legacy_warnings": len(legacy_warnings),
        "report_csv": REPORT_CSV.as_posix(),
        "report_json": REPORT_JSON.as_posix(),
    }
    write_reports(root, all_findings, summary)

    print(f"vault: {root}")
    print(f"pages_checked: {len(pages)}")
    print(f"strict_pages: {strict_pages}")
    print(f"legacy_pages: {legacy_pages}")
    print(f"learning_pages: {learning_pages}")
    print(f"blocking_findings: {len(blocking)}")
    print(f"warnings: {len(warnings)}")
    print(f"legacy_warnings: {len(legacy_warnings)}")
    for item in blocking[:80]:
        print(f"ERROR {item.path} {item.rule}: {item.message}")
    if len(blocking) > 80:
        print(f"ERROR truncated {len(blocking) - 80} additional blocking findings")
    for item in warnings[:80]:
        print(f"WARN {item.path} {item.rule}: {item.message}")
    if len(warnings) > 80:
        print(f"WARN truncated {len(warnings) - 80} additional warnings")
    print(f"report_csv: {root / REPORT_CSV}")
    print(f"report_json: {root / REPORT_JSON}")
    return 1 if blocking else 0


if __name__ == "__main__":
    raise SystemExit(main())
