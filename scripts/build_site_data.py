#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import shutil
import subprocess
import sys
import csv
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any

OUT_DIR = Path("site-data")
QUALITY_REVIEW_PATH = Path("manifests/site_data_quality_review.csv")
PUBLIC_MARKDOWN_ROOTS = [Path("wiki"), Path("README.md"), Path("index.md"), Path("log.md")]
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$", re.MULTILINE)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
DATE_RE = re.compile(r"(?<!\d)((?:19|20)\d{2})[-_/年.]([01]\d)[-_/月.]([0-3]\d)(?:日)?(?!\d)")
LATIN_WORD_RE = re.compile(r"[A-Za-z0-9_+-]+")
HAN_CHAR_RE = re.compile(r"[\u4e00-\u9fff]")

PROMOTION_STATUSES = {"featured", "recommended", "verified"}
PROMOTION_TAGS = {"featured", "recommended", "verified", "showcase", "curated", "beginner-friendly"}
ARCHIVE_SOURCE = "[[wiki/sources/pre-rebuild-vault-archive]]"
PUBLIC_SAFETY_VALUES = {"public-safe", "needs-redaction", "local-only-source"}
TEXT_DEPTH_FIELDS = {
    "whyItMattered": ["whyItMattered", "whyItMatters", "why_it_mattered", "why_it_matters"],
    "psychologicalLayer": ["psychologicalLayer", "psychological_layer"],
    "sociologicalLayer": ["sociologicalLayer", "sociological_layer"],
    "philosophicalLayer": ["philosophicalLayer", "philosophical_layer"],
}
LIST_DEPTH_FIELDS = {
    "operationStory": ["operationStory", "operation_story", "operations"],
    "replicationSteps": ["replicationSteps", "replication_steps"],
    "failureModes": ["failureModes", "failure_modes", "pitfalls"],
    "lessons": ["lessons", "lesson"],
}
CURATED_SOURCE_PATHS = {
    "README.md",
    "index.md",
    "wiki/index.md",
    "wiki/sources-and-data-policy.md",
    "wiki/topics/llm-wiki-moc.md",
    "wiki/topics/ai-agent-systems-moc.md",
    "wiki/topics/skills-and-tools-moc.md",
    "wiki/topics/publication-maintenance-moc.md",
    "wiki/sources/karpathy-llm-wiki-pattern.md",
    "wiki/sources/github-reference-projects.md",
    "wiki/sources/obsidian-llm-wiki-local.md",
    "wiki/sources/llm-wikid.md",
    "wiki/sources/pre-rebuild-vault-archive.md",
}
LOW_QUALITY_PATH_PATTERNS = [
    "07-技能库-原子技能-",
    "99-模板-",
    "项目同步_",
    "每小时检查_",
    "PROGRESS_SNAPSHOT",
    "断链检测报告",
    "每日整理报告",
    "自动采集",
    "wiki-_templates",
]
LOW_QUALITY_TITLE_PATTERNS = [
    "{{date}}",
    "{{year}}",
    "模板",
    "同步报告",
    "每小时检查",
    "PROGRESS_SNAPSHOT",
]


MODULES = [
    {
        "id": "library",
        "name": "藏馆",
        "key": "library",
        "description": "公开资源、工具、项目、资料与知识条目。",
        "href": "/library",
        "view": "card-grid",
        "visible": True,
        "order": 1,
    },
    {
        "id": "paths",
        "name": "谱系",
        "key": "paths",
        "description": "学习路径、复刻路线、知识库构建路线与主题地图。",
        "href": "/paths",
        "view": "route-map",
        "visible": True,
        "order": 2,
    },
    {
        "id": "feed",
        "name": "风信",
        "key": "feed",
        "description": "公开信息流、调研报告、情报日报与最近收录。",
        "href": "/feed",
        "view": "info-feed",
        "visible": True,
        "order": 3,
    },
    {
        "id": "works",
        "name": "工坊",
        "key": "works",
        "description": "公开项目、实验、系统原型与维护工作。",
        "href": "/works",
        "view": "card-grid",
        "visible": True,
        "order": 4,
    },
    {
        "id": "journal",
        "name": "手记",
        "key": "journal",
        "description": "公开维护日志、复盘、整理记录和开发过程。",
        "href": "/journal",
        "view": "article-list",
        "visible": True,
        "order": 5,
    },
    {
        "id": "timeline",
        "name": "年谱",
        "key": "timeline",
        "description": "资料库、项目和公开内容的阶段时间线。",
        "href": "/timeline",
        "view": "timeline",
        "visible": True,
        "order": 6,
    },
    {
        "id": "about",
        "name": "自序",
        "key": "about",
        "description": "关于这个公开资料库、组织方式和发布边界。",
        "href": "/about",
        "view": "markdown",
        "visible": True,
        "order": 7,
    },
]


def run_gate(root: Path, command: list[str]) -> None:
    result = subprocess.run(command, cwd=root, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        output = (result.stdout + "\n" + result.stderr).strip()
        raise SystemExit(f"site data gate failed: {' '.join(command)}\n{output}")


def run_public_gates(root: Path) -> None:
    run_gate(root, [sys.executable, "scripts/wiki_check.py", "."])
    run_gate(root, [sys.executable, "scripts/privacy_scan.py", "."])


def markdown_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for source in PUBLIC_MARKDOWN_ROOTS:
        target = root / source
        if target.is_dir():
            files.extend(sorted(target.rglob("*.md")))
        elif target.exists() and target.suffix.lower() == ".md":
            files.append(target)
    return sorted(set(files), key=lambda p: p.relative_to(root).as_posix())


def parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return []
    if value in {"[]", "{}"}:
        return [] if value == "[]" else {}
    if value.startswith("[") and value.endswith("]"):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            inner = value[1:-1].strip()
            return [clean_yaml_value(part) for part in inner.split(",") if part.strip()]
    return clean_yaml_value(value)


def clean_yaml_value(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


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
            data[current_key].append(clean_yaml_value(line.strip()[2:]))
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        current_key = key.strip()
        parsed = parse_scalar(value)
        data[current_key] = parsed
    return data, body


def as_list(value: Any) -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()]


def first_frontmatter_value(frontmatter: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        if key in frontmatter and frontmatter[key] not in (None, "", []):
            return frontmatter[key]
    return None


def optional_frontmatter_text(frontmatter: dict[str, Any], keys: list[str]) -> str | None:
    value = first_frontmatter_value(frontmatter, keys)
    if value is None or isinstance(value, (list, dict)):
        return None
    text = str(value).strip()
    return text or None


def optional_frontmatter_list(frontmatter: dict[str, Any], keys: list[str]) -> list[str]:
    return as_list(first_frontmatter_value(frontmatter, keys))


def public_safety(frontmatter: dict[str, Any]) -> str:
    raw = optional_frontmatter_text(frontmatter, ["publicSafety", "public_safety", "publication_safety"])
    return raw if raw in PUBLIC_SAFETY_VALUES else "public-safe"


def source_labels(frontmatter: dict[str, Any], sources: list[str]) -> list[str]:
    labels = optional_frontmatter_list(frontmatter, ["sourceLabels", "source_labels"])
    if labels:
        return labels
    labels = ["public wiki"]
    if source_only_archive(sources):
        labels.append("archive-derived")
    elif sources:
        labels.append("source-backed")
    return labels


def content_depth(frontmatter: dict[str, Any], sources: list[str]) -> dict[str, Any]:
    depth: dict[str, Any] = {
        "publicSafety": public_safety(frontmatter),
        "sourceLabels": source_labels(frontmatter, sources),
    }
    for field, keys in TEXT_DEPTH_FIELDS.items():
        value = optional_frontmatter_text(frontmatter, keys)
        if value:
            depth[field] = value
    for field, keys in LIST_DEPTH_FIELDS.items():
        values = optional_frontmatter_list(frontmatter, keys)
        if values:
            depth[field] = values
    next_plan = optional_frontmatter_text(frontmatter, ["nextPlan", "next_plan"])
    if next_plan:
        depth["nextPlan"] = next_plan
    return depth


def has_truthy_frontmatter(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"true", "yes", "1", "curated", "showcase", "public"}


def first_heading(body: str) -> str | None:
    match = HEADING_RE.search(body)
    if not match:
        return None
    return strip_markdown(match.group(2)).strip()


def strip_markdown(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = WIKILINK_RE.sub(lambda m: m.group(2) or m.group(1), text)
    return text.replace("#", "").strip()


def summary_from_body(body: str) -> str:
    for paragraph in re.split(r"\n\s*\n", body):
        clean = strip_markdown(paragraph)
        clean = re.sub(r"\s+", " ", clean).strip(" -\n\t")
        if clean and not clean.startswith("|"):
            return clean[:240]
    return ""


def slug_for(path: Path, root: Path) -> str:
    rel = path.relative_to(root).with_suffix("").as_posix()
    slug = rel.lower().replace("/", "--")
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"[^\w\-\u4e00-\u9fff]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or sha256(rel.encode("utf-8")).hexdigest()[:12]


def stable_id(rel: str) -> str:
    return "c_" + sha256(rel.encode("utf-8")).hexdigest()[:16]


def anchor_for(title: str) -> str:
    anchor = title.strip().lower()
    anchor = re.sub(r"\s+", "-", anchor)
    anchor = re.sub(r"[^\w\-\u4e00-\u9fff]+", "", anchor)
    return anchor.strip("-") or sha256(title.encode("utf-8")).hexdigest()[:8]


def item_status(frontmatter: dict[str, Any]) -> list[str]:
    raw = as_list(frontmatter.get("status"))
    statuses = [status for status in raw if status in {"draft", "public", "featured", "recommended", "verified", "pending", "archived", "outdated"}]
    if frontmatter.get("status") == "active":
        statuses.append("public")
    if frontmatter.get("type") == "moc":
        statuses.append("featured")
    return sorted(set(statuses or ["public"]))


def source_only_archive(sources: list[str]) -> bool:
    return len(sources) == 1 and sources[0] == ARCHIVE_SOURCE


def quality_review(item: dict[str, Any], frontmatter: dict[str, Any]) -> dict[str, Any]:
    rel = item["sourcePath"]
    title = item["title"]
    statuses = set(item["status"])
    declared_statuses = set(as_list(frontmatter.get("status")))
    tags = set(item["tags"])
    sources = item["sources"]
    reasons: list[str] = []

    explicitly_curated = (
        rel in CURATED_SOURCE_PATHS
        or bool(declared_statuses & PROMOTION_STATUSES)
        or bool(tags & PROMOTION_TAGS)
        or has_truthy_frontmatter(frontmatter.get("publish"))
        or has_truthy_frontmatter(frontmatter.get("site"))
    )

    if "migrated-needs-source-review" in statuses or "migrated-needs-source-review" in declared_statuses:
        reasons.append("status:migrated-needs-source-review")
    if "migrated" in tags:
        reasons.append("tag:migrated")
    if source_only_archive(sources):
        reasons.append("source:archive-only")
    for pattern in LOW_QUALITY_PATH_PATTERNS:
        if pattern.lower() in rel.lower():
            reasons.append(f"path-pattern:{pattern}")
    for pattern in LOW_QUALITY_TITLE_PATTERNS:
        if pattern.lower() in title.lower():
            reasons.append(f"title-pattern:{pattern}")
    if item["wordCount"] < 80 and item["module"] not in {"paths"} and rel not in CURATED_SOURCE_PATHS:
        reasons.append("content:too-thin")
    if not item["summary"] or item["summary"] == title:
        reasons.append("summary:missing-or-title-only")
    if item.get("publicSafety") != "public-safe":
        reasons.append(f"publicSafety:{item.get('publicSafety', 'unknown')}")

    blocking_reasons = [
        reason
        for reason in reasons
        if reason.startswith(("status:", "tag:", "source:", "path-pattern:", "title-pattern:", "content:", "publicSafety:"))
    ]

    score = 50
    if item["quality"]["hasSources"]:
        score += 15
    if item["quality"]["hasToc"]:
        score += 10
    if item["wordCount"] >= 250:
        score += 10
    if item["wordCount"] >= 800:
        score += 5
    if item["module"] == "paths":
        score += 8
    if explicitly_curated:
        score += 25
    score -= min(55, len(blocking_reasons) * 14)
    score = max(0, min(100, score))

    if explicitly_curated and not rel.endswith("log.md"):
        display_tier = "showcase" if score >= 75 else "starter"
    elif blocking_reasons:
        display_tier = "hidden"
    elif score >= 75:
        display_tier = "candidate"
    else:
        display_tier = "hidden"

    if display_tier == "candidate":
        reasons.append("needs-explicit-curation")

    return {
        "displayTier": display_tier,
        "qualityScore": score,
        "hiddenReasons": sorted(set(reasons)),
        "explicitlyCurated": explicitly_curated,
    }


def classify_module(rel: str, frontmatter: dict[str, Any], title: str) -> str:
    haystack = f"{rel} {title} {' '.join(as_list(frontmatter.get('tags')))} {frontmatter.get('type', '')}".lower()
    if rel.startswith("wiki/projects/") or frontmatter.get("type") == "project":
        return "works"
    if (
        "moc" in haystack
        or "路线" in haystack
        or "谱系" in haystack
        or re.search(r"(^|[^a-z])path(s)?([^a-z]|$)", haystack)
        or re.search(r"(^|[^a-z])route(s)?([^a-z]|$)", haystack)
    ):
        return "paths"
    if "情报日报" in haystack or "信息总汇" in haystack or "调研报告" in haystack or "feed" in haystack:
        return "feed"
    if "log" in haystack or "复盘" in haystack or "每日" in haystack or "维护" in haystack or "journal" in haystack:
        return "journal"
    return "library"


def content_type(rel: str, frontmatter: dict[str, Any], title: str) -> str:
    haystack = f"{rel} {title} {' '.join(as_list(frontmatter.get('tags')))}".lower()
    if rel.startswith("wiki/sources/") or frontmatter.get("category") == "source":
        return "source"
    if "github" in haystack:
        return "github"
    if "api" in haystack:
        return "api"
    if "工具" in haystack or "tool" in haystack:
        return "tool"
    if "模型" in haystack or "model" in haystack:
        return "model"
    if "教程" in haystack or "tutorial" in haystack:
        return "tutorial"
    if "视频" in haystack or "video" in haystack:
        return "video"
    if "案例" in haystack or "case" in haystack:
        return "case"
    return "article"


def extract_links(body: str) -> list[dict[str, str]]:
    links = []
    for match in WIKILINK_RE.finditer(body):
        target = match.group(1).strip()
        label = (match.group(2) or target).strip()
        links.append({"target": target, "label": label})
    return links


def extract_toc(body: str) -> list[dict[str, Any]]:
    toc = []
    for match in HEADING_RE.finditer(body):
        raw = strip_markdown(match.group(2)).strip()
        if not raw:
            continue
        toc.append(
            {
                "level": len(match.group(1)),
                "title": raw,
                "anchor": anchor_for(raw),
            }
        )
    return toc


def estimate_word_count(text: str) -> int:
    clean = strip_markdown(text)
    return len(HAN_CHAR_RE.findall(clean)) + len(LATIN_WORD_RE.findall(clean))


def reading_minutes(word_count: int) -> int:
    if word_count <= 0:
        return 1
    return max(1, math.ceil(word_count / 450))


def extract_dates(text: str) -> list[str]:
    dates = set()
    for match in DATE_RE.finditer(text):
        year, month, day = match.groups()
        try:
            dates.add(datetime(int(year), int(month), int(day)).strftime("%Y-%m-%d"))
        except ValueError:
            continue
    return sorted(dates)


def extract_steps(body: str) -> list[dict[str, Any]]:
    headings = [(m.group(1), strip_markdown(m.group(2)).strip()) for m in HEADING_RE.finditer(body)]
    steps = []
    for index, (_, heading) in enumerate(headings[:10], start=1):
        if not heading:
            continue
        steps.append(
            {
                "id": f"step-{index}",
                "title": heading,
                "goal": heading,
                "description": "从公开 wiki 页面章节生成的路线节点。",
                "resources": [],
                "completion": "读完本节并能连接到相关公开页面。",
                "optional": False,
            }
        )
    return steps


def is_displayable(item: dict[str, Any]) -> bool:
    return item.get("displayTier") in {"showcase", "starter"} and item.get("publicSafety") == "public-safe"


def write_quality_review(root: Path, all_items: list[dict[str, Any]]) -> None:
    path = root / QUALITY_REVIEW_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for item in sorted(all_items, key=lambda row: (row.get("displayTier", ""), row["sourcePath"])):
        rows.append(
            {
                "path": item["sourcePath"],
                "title": item["title"],
                "module": item["module"],
                "display_tier": item.get("displayTier", "hidden"),
                "quality_score": item.get("qualityScore", 0),
                "status": "|".join(item.get("status", [])),
                "tags": "|".join(item.get("tags", [])[:12]),
                "sources": "|".join(item.get("sources", [])[:4]),
                "hidden_reasons": "|".join(item.get("hiddenReasons", [])),
            }
        )
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "path",
                "title",
                "module",
                "display_tier",
                "quality_score",
                "status",
                "tags",
                "sources",
                "hidden_reasons",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def build_item(root: Path, path: Path) -> dict[str, Any]:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, body = parse_frontmatter(text)
    raw_statuses = as_list(frontmatter.get("status"))
    title = str(frontmatter.get("title") or first_heading(body) or path.stem).strip()
    summary = str(frontmatter.get("summary") or summary_from_body(body) or title).strip()
    tags = as_list(frontmatter.get("tags"))
    detected_dates = extract_dates(rel + "\n" + body)
    created = str(frontmatter.get("created") or (detected_dates[0] if detected_dates else "2026-05-12"))
    updated = str(frontmatter.get("updated") or created)
    slug = slug_for(path, root)
    module = classify_module(rel, frontmatter, title)
    links = extract_links(body)
    toc = extract_toc(body)
    body_lines = body.strip().splitlines()
    sources = as_list(frontmatter.get("sources"))
    word_count = estimate_word_count(body)
    statuses = item_status(frontmatter)
    item = {
        "id": stable_id(rel),
        "title": title,
        "slug": slug,
        "summary": summary,
        "tags": tags,
        "status": statuses,
        "createdAt": created,
        "updatedAt": updated,
        "sourcePath": rel,
        "module": module,
        "category": str(frontmatter.get("category") or path.parent.name),
        "type": str(frontmatter.get("type") or content_type(rel, frontmatter, title)),
        "contentType": content_type(rel, frontmatter, title),
        "href": f"/content/{slug}",
        "contentLines": body_lines,
        "links": links,
        "sources": sources,
        "toc": toc,
        "wordCount": word_count,
        "readingMinutes": reading_minutes(word_count),
        "metrics": {
            "lineCount": len(body_lines),
            "headingCount": len(toc),
            "linkCount": len(links),
            "sourceCount": len(sources),
        },
        "quality": {
            "hasSources": bool(sources),
            "hasToc": bool(toc),
            "summaryLength": len(summary),
            "needsSourceReview": "migrated-needs-source-review" in statuses
            or "migrated-needs-source-review" in raw_statuses,
        },
    }
    item.update(content_depth(frontmatter, sources))
    review = quality_review(item, frontmatter)
    item["displayTier"] = review["displayTier"]
    item["qualityScore"] = review["qualityScore"]
    item["hiddenReasons"] = review["hiddenReasons"]
    item["quality"].update(
        {
            "displayTier": review["displayTier"],
            "qualityScore": review["qualityScore"],
            "hiddenReasons": review["hiddenReasons"],
            "explicitlyCurated": review["explicitlyCurated"],
        }
    )
    if module == "paths":
        item.update(
            {
                "goal": summary,
                "audience": "希望沿着公开资料路线学习、复刻或维护知识库的读者。",
                "prerequisites": [],
                "estimatedTime": "按主题自定",
                "difficulty": "intermediate",
                "finalOutput": "形成一条可复用的公开学习或构建路径。",
                "steps": extract_steps(body),
            }
        )
    if module == "works":
        item.update(
            {
                "projectStatus": "maintaining" if "active" in str(frontmatter.get("status", "")) else "archived",
                "techStack": tags[:6],
                "nextPlan": item.get("nextPlan", ""),
            }
        )
    if module == "feed":
        item.update(
            {
                "source": "an-llm-wiki",
                "publishedAt": updated,
                "importance": "medium",
                "archivedToLibrary": True,
            }
        )
    if module == "journal":
        item.update({"date": updated, "visibility": "public", "bodyLines": body.strip().splitlines()})
    return item


def build_payload(root: Path) -> dict[str, Any]:
    all_items = [build_item(root, path) for path in markdown_files(root)]
    write_quality_review(root, all_items)
    items = [item for item in all_items if is_displayable(item)]
    hidden_items = [item for item in all_items if not is_displayable(item)]
    buckets: dict[str, list[dict[str, Any]]] = {module["key"]: [] for module in MODULES}
    for item in items:
        buckets.setdefault(item["module"], []).append(item)

    timeline = []
    for item in items:
        date_value = item.get("updatedAt") or item.get("createdAt")
        timeline.append(
            {
                "id": f"timeline-{item['id']}",
                "title": item["title"],
                "slug": item["slug"],
                "summary": item["summary"],
                "tags": item["tags"],
                "status": item["status"],
                "createdAt": item["createdAt"],
                "updatedAt": item["updatedAt"],
                "date": date_value,
                "phase": item["module"],
                "type": "migration" if "migrated" in item["status"] or "migrated" in item["tags"] else item["module"],
                "importance": "high" if "featured" in item["status"] else "medium",
                "relatedLibraryItems": [item["id"]],
                "href": item["href"],
                "publicSafety": item.get("publicSafety", "public-safe"),
                "sourceLabels": item.get("sourceLabels", []),
            }
        )
    timeline.sort(key=lambda row: row["date"], reverse=True)

    search = [
        {
            "id": item["id"],
            "title": item["title"],
            "summary": item["summary"],
            "tags": item["tags"],
            "module": item["module"],
            "type": item["contentType"],
            "href": item["href"],
            "sourcePath": item["sourcePath"],
        }
        for item in items
    ]
    tag_counts: dict[str, int] = {}
    type_counts: dict[str, int] = {}
    status_counts: dict[str, int] = {}
    module_counts: dict[str, int] = {}
    for item in items:
        module_counts[item["module"]] = module_counts.get(item["module"], 0) + 1
        type_counts[item["contentType"]] = type_counts.get(item["contentType"], 0) + 1
        for tag in item["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        for status in item["status"]:
            status_counts[status] = status_counts.get(status, 0) + 1

    def top_counts(values: dict[str, int], limit: int = 40) -> list[dict[str, Any]]:
        return [
            {"key": key, "count": count}
            for key, count in sorted(values.items(), key=lambda pair: (-pair[1], pair[0]))[:limit]
        ]

    featured_paths = [item for item in buckets.get("paths", []) if "featured" in item["status"]][:3]
    featured_works = [
        item
        for item in buckets.get("works", [])
        if "featured" in item["status"] or "recommended" in item["status"]
    ][:3]
    recent_library = sorted(buckets.get("library", []), key=lambda item: item["updatedAt"], reverse=True)[:6]
    recent_timeline = timeline[:6]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "an-llm-wiki public wiki",
        "schemaVersion": 1,
        "privacyBoundary": {
            "included": ["wiki/", "README.md", "index.md", "log.md"],
            "excluded": ["_raw/", "inbox/private/", "private-wiki/", ".obsidian/", ".claude/", ".claudian/", ".trash/"],
            "gate": "scripts/wiki_check.py and scripts/privacy_scan.py must pass before generation",
        },
        "modules": MODULES,
        "counts": {
            "content": len(items),
            "publicMarkdown": len(all_items),
            "reviewQueue": len(hidden_items),
            "library": len(buckets.get("library", [])),
            "paths": len(buckets.get("paths", [])),
            "feed": len(buckets.get("feed", [])),
            "works": len(buckets.get("works", [])),
            "journal": len(buckets.get("journal", [])),
            "timeline": len(timeline),
        },
        "curation": {
            "mode": "curated-public-showcase",
            "displayedContent": len(items),
            "reviewQueue": len(hidden_items),
            "allPublicMarkdown": len(all_items),
            "qualityManifest": QUALITY_REVIEW_PATH.as_posix(),
            "rules": [
                "Front-end payload includes only showcase/starter pages.",
                "Archive-only migrated pages stay in the review manifest until manually promoted.",
                "Templates, sync snapshots, raw skill fragments, progress reports, and thin pages are hidden by default.",
                "Private layers and raw sources are never included in site-data.",
            ],
            "nextImportWorkflow": [
                "Collect useful local material into private-wiki or wiki draft pages.",
                "Rewrite each item for beginner readers with a clear summary, use case, sources, and next step.",
                "Mark it with publish: curated or status: verified only after privacy and source review.",
                "Use skills/archive-content-curator/SKILL.md for project cards, tool cards, prompt patterns, routes, and timeline records.",
                "Regenerate site-data and verify the public frontend before publishing.",
            ],
        },
        "facets": {
            "tags": top_counts(tag_counts),
            "types": top_counts(type_counts),
            "statuses": top_counts(status_counts),
            "modules": top_counts(module_counts),
        },
        "homepage": {
            "headline": "给新手也能看懂的 AI 与知识库资料展柜",
            "summary": "前端只展示精选公开层；更多本地资料先进入复核队列，整理成可靠、有来源、能落地的条目后再上架。",
            "featuredPathSlugs": [item["slug"] for item in featured_paths],
            "featuredWorkSlugs": [item["slug"] for item in featured_works],
            "recentLibrarySlugs": [item["slug"] for item in recent_library],
            "recentTimelineSlugs": [item["slug"] for item in recent_timeline],
        },
        "content": items,
        "library": buckets.get("library", []),
        "paths": buckets.get("paths", []),
        "feed": sorted(buckets.get("feed", []), key=lambda item: item["updatedAt"], reverse=True),
        "works": buckets.get("works", []),
        "journal": sorted(buckets.get("journal", []), key=lambda item: item["updatedAt"], reverse=True),
        "timeline": timeline,
        "about": {
            "title": "关于 an-llm-wiki",
            "summary": "一个从 Obsidian public wiki 编译出的精选公开资料库后端。",
            "body": "这里展示已经整理过的资料、路径、项目、手记和年谱。私有资料、密钥线索、本地路径、raw dump、模板和机械迁移稿不会进入前端数据包。",
        },
        "search": search,
    }


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_payload(root: Path, payload: dict[str, Any]) -> None:
    out = root / OUT_DIR
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)
    write_json(out / "index.json", payload)
    for key in ["modules", "content", "library", "paths", "feed", "works", "journal", "timeline", "about", "search"]:
        write_json(out / f"{key}.json", payload[key])
    (out / "README.md").write_text(
        "# Site Data\n\n"
        "Generated curated public content data for the archive frontend. Regenerate with `python scripts/build_site_data.py .`.\n"
        "This directory must contain only public-safe showcase data compiled from `wiki/`, `README.md`, `index.md`, and `log.md`.\n"
        "Review excluded public-safe candidates in `manifests/site_data_quality_review.csv`.\n",
        encoding="utf-8",
    )


def build(root: Path, run_gates: bool = True) -> dict[str, Any]:
    out = root / OUT_DIR
    if run_gates and out.exists():
        shutil.rmtree(out)
    if run_gates:
        run_public_gates(root)
    payload = build_payload(root)
    write_payload(root, payload)
    if run_gates:
        run_gate(root, [sys.executable, "scripts/privacy_scan.py", "."])
    return payload


def main() -> int:
    args = [arg for arg in sys.argv[1:] if arg != "--skip-gates"]
    run_gates = "--skip-gates" not in sys.argv[1:]
    root = Path(args[0]).resolve() if args else Path.cwd().resolve()
    payload = build(root, run_gates=run_gates)
    print(f"site_data_content: {payload['counts']['content']}")
    print(f"site_data_dir: {root / OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
