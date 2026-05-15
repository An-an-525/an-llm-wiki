#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

REPORT_JSON = Path("manifests/karpathy_alignment_report.json")
REPORT_CSV = Path("manifests/karpathy_alignment_findings.csv")

OFFICIAL_SOURCE_NOTE = Path("wiki/sources/karpathy-llm-wiki-pattern.md")
OFFICIAL_LAYER_NOTE = Path("wiki/synthesis/karpathy-official-wiki-layer.md")
ROOT_FILES = [
    Path("README.md"),
    Path("AGENTS.md"),
    Path("CLAUDE.md"),
    Path("index.md"),
    Path("log.md"),
    Path("wiki/index.md"),
    OFFICIAL_SOURCE_NOTE,
    OFFICIAL_LAYER_NOTE,
]
OFFICIAL_LINK = "[[wiki/sources/karpathy-llm-wiki-pattern]]"
LEGACY_STATUSES = {"migrated-needs-source-review", "archived", "outdated"}
DATE_SECTION_RE = re.compile(r"^## \[\d{4}-\d{2}-\d{2}\]", re.M)
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)


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


def parse_frontmatter(text: str) -> dict[str, Any]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    block = match.group(1)
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
    return data


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


def iter_public_pages(root: Path) -> list[Path]:
    wiki_root = root / "wiki"
    if not wiki_root.exists():
        return []
    return sorted(wiki_root.rglob("*.md"), key=lambda path: path.relative_to(root).as_posix())


def add_finding(rows: list[dict[str, str]], severity: str, gate: str, path: str, message: str) -> None:
    rows.append({"severity": severity, "gate": gate, "path": path, "message": message})


def write_report(root: Path, report: dict[str, Any], findings: list[dict[str, str]]) -> None:
    json_path = root / REPORT_JSON
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    csv_path = root / REPORT_CSV
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["severity", "gate", "path", "message"])
        writer.writeheader()
        writer.writerows(findings)


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    findings: list[dict[str, str]] = []

    for rel in ROOT_FILES:
        if not (root / rel).exists():
            add_finding(findings, "error", "required-files", rel.as_posix(), "Missing official-alignment file.")

    readme_text = (root / "README.md").read_text(encoding="utf-8", errors="replace") if (root / "README.md").exists() else ""
    wiki_index_text = (root / "wiki/index.md").read_text(encoding="utf-8", errors="replace") if (root / "wiki/index.md").exists() else ""
    claude_text = (root / "CLAUDE.md").read_text(encoding="utf-8", errors="replace") if (root / "CLAUDE.md").exists() else ""
    layer_text = (root / OFFICIAL_LAYER_NOTE).read_text(encoding="utf-8", errors="replace") if (root / OFFICIAL_LAYER_NOTE).exists() else ""
    log_text = (root / "log.md").read_text(encoding="utf-8", errors="replace") if (root / "log.md").exists() else ""

    if OFFICIAL_LINK not in readme_text:
        add_finding(findings, "error", "root-navigation", "README.md", "README should link the official Karpathy source note.")
    if OFFICIAL_LINK not in wiki_index_text:
        add_finding(findings, "error", "root-navigation", "wiki/index.md", "wiki/index.md should link the official Karpathy source note.")

    for marker in ["_raw/", "wiki/", "AGENTS.md", "CLAUDE.md", "index.md", "log.md"]:
        if marker not in claude_text:
            add_finding(findings, "error", "schema", "CLAUDE.md", f"Schema should mention `{marker}`.")

    if "private-wiki/" not in layer_text or "site-data/" not in layer_text:
        add_finding(findings, "warning", "documented-adaptations", OFFICIAL_LAYER_NOTE.as_posix(), "Official layer note should explain local private/public extensions.")
    if "编译产物" not in layer_text and "compiled" not in layer_text.lower():
        add_finding(findings, "warning", "documented-adaptations", OFFICIAL_LAYER_NOTE.as_posix(), "Official layer note should restate that wiki pages are compiled artifacts.")

    log_sections = len(DATE_SECTION_RE.findall(log_text))
    if log_sections == 0:
        add_finding(findings, "error", "append-only-log", "log.md", "log.md should contain dated append-only sections.")

    pages = iter_public_pages(root)
    active_pages: list[tuple[Path, dict[str, Any], str, str]] = []
    active_non_source_pages: list[tuple[Path, dict[str, Any], str, str]] = []
    provenance_pages = 0
    flat_project_pages = 0
    legacy_pages = 0

    for path in pages:
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        frontmatter = parse_frontmatter(text)
        statuses = set(as_list(frontmatter.get("status")))
        category = as_text(frontmatter.get("category"))
        page_type = as_text(frontmatter.get("type"))
        is_legacy = bool(statuses & LEGACY_STATUSES)
        if is_legacy:
            legacy_pages += 1
            continue
        active_pages.append((path, frontmatter, category, page_type))
        if "provenance:" in text or "^[inferred]" in text or "^[ambiguous]" in text:
            provenance_pages += 1
        if rel.startswith("wiki/projects/") and path.parent == root / "wiki" / "projects":
            flat_project_pages += 1
        if category != "source" and page_type != "source":
            active_non_source_pages.append((path, frontmatter, category, page_type))

    source_backed_pages = [item for item in active_non_source_pages if as_list(item[1].get("sources"))]
    source_gap_pages = [item for item in active_non_source_pages if not as_list(item[1].get("sources"))]
    if source_gap_pages:
        for path, _, _, _ in source_gap_pages[:20]:
            add_finding(findings, "warning", "source-coverage", path.relative_to(root).as_posix(), "Active public page has no listed sources.")
        if len(source_gap_pages) > 20:
            add_finding(findings, "warning", "source-coverage", "wiki/", f"{len(source_gap_pages) - 20} additional active public pages have no listed sources.")

    if active_pages and provenance_pages == 0:
        add_finding(findings, "warning", "provenance-markers", "wiki/", "No active public page uses provenance markers or provenance frontmatter.")

    severities = [row["severity"] for row in findings]
    errors = severities.count("error")
    warnings = severities.count("warning")
    report = {
        "vault": ".",
        "official_source_note": OFFICIAL_SOURCE_NOTE.as_posix(),
        "active_public_pages": len(active_pages),
        "active_non_source_pages": len(active_non_source_pages),
        "active_non_source_pages_with_sources": len(source_backed_pages),
        "active_pages_with_provenance_markers": provenance_pages,
        "flat_project_pages": flat_project_pages,
        "legacy_pages": legacy_pages,
        "log_sections": log_sections,
        "errors": errors,
        "warnings": warnings,
    }
    write_report(root, report, findings)

    print(f"vault: {root}")
    print(f"active_public_pages: {len(active_pages)}")
    print(f"active_non_source_pages: {len(active_non_source_pages)}")
    print(f"active_non_source_pages_with_sources: {len(source_backed_pages)}")
    print(f"active_pages_with_provenance_markers: {provenance_pages}")
    print(f"flat_project_pages: {flat_project_pages}")
    print(f"legacy_pages: {legacy_pages}")
    print(f"log_sections: {log_sections}")
    print(f"official_alignment_errors: {errors}")
    print(f"official_alignment_warnings: {warnings}")
    for row in findings[:80]:
        print(f"{row['severity'].upper()} {row['gate']} {row['path']} {row['message']}")
    if len(findings) > 80:
        print(f"WARN truncated {len(findings) - 80} additional findings")
    print(f"report_json: {root / REPORT_JSON}")
    print(f"report_csv: {root / REPORT_CSV}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
