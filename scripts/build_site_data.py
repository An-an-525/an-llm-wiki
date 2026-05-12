#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any

OUT_DIR = Path("site-data")
PUBLIC_MARKDOWN_ROOTS = [Path("wiki"), Path("README.md"), Path("index.md"), Path("log.md")]
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$", re.MULTILINE)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
DATE_RE = re.compile(r"(?<!\d)((?:19|20)\d{2})[-_/年.]([01]\d)[-_/月.]([0-3]\d)(?:日)?(?!\d)")


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


def item_status(frontmatter: dict[str, Any]) -> list[str]:
    raw = as_list(frontmatter.get("status"))
    statuses = [status for status in raw if status in {"draft", "public", "featured", "recommended", "verified", "pending", "archived", "outdated"}]
    if frontmatter.get("status") == "active":
        statuses.append("public")
    if frontmatter.get("type") == "moc":
        statuses.append("featured")
    return sorted(set(statuses or ["public"]))


def classify_module(rel: str, frontmatter: dict[str, Any], title: str) -> str:
    haystack = f"{rel} {title} {' '.join(as_list(frontmatter.get('tags')))} {frontmatter.get('type', '')}".lower()
    if rel.startswith("wiki/projects/") or frontmatter.get("type") == "project":
        return "works"
    if "moc" in haystack or "路线" in haystack or "谱系" in haystack or "path" in haystack or "route" in haystack:
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


def build_item(root: Path, path: Path) -> dict[str, Any]:
    rel = path.relative_to(root).as_posix()
    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, body = parse_frontmatter(text)
    title = str(frontmatter.get("title") or first_heading(body) or path.stem).strip()
    summary = str(frontmatter.get("summary") or summary_from_body(body) or title).strip()
    tags = as_list(frontmatter.get("tags"))
    detected_dates = extract_dates(rel + "\n" + body)
    created = str(frontmatter.get("created") or (detected_dates[0] if detected_dates else "2026-05-12"))
    updated = str(frontmatter.get("updated") or created)
    slug = slug_for(path, root)
    module = classify_module(rel, frontmatter, title)
    links = extract_links(body)
    item = {
        "id": stable_id(rel),
        "title": title,
        "slug": slug,
        "summary": summary,
        "tags": tags,
        "status": item_status(frontmatter),
        "createdAt": created,
        "updatedAt": updated,
        "sourcePath": rel,
        "module": module,
        "category": str(frontmatter.get("category") or path.parent.name),
        "type": str(frontmatter.get("type") or content_type(rel, frontmatter, title)),
        "contentType": content_type(rel, frontmatter, title),
        "href": f"/content/{slug}",
        "contentLines": body.strip().splitlines(),
        "links": links,
        "sources": as_list(frontmatter.get("sources")),
    }
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
                "nextPlan": "",
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
    items = [build_item(root, path) for path in markdown_files(root)]
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
            "library": len(buckets.get("library", [])),
            "paths": len(buckets.get("paths", [])),
            "feed": len(buckets.get("feed", [])),
            "works": len(buckets.get("works", [])),
            "journal": len(buckets.get("journal", [])),
            "timeline": len(timeline),
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
            "summary": "一个从 Obsidian public wiki 编译出的公开资料库后端。",
            "body": "这里展示公开安全的资料、路径、项目、手记和年谱。私有资料、密钥线索、本地路径和 raw dump 不进入公开数据包。",
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
        "Generated public content data for the future archive frontend. Regenerate with `python scripts/build_site_data.py .`.\n"
        "This directory must contain only public-safe data compiled from `wiki/`, `README.md`, `index.md`, and `log.md`.\n",
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
