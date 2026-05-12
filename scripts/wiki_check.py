#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
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
REQUIRED_FILES = [
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "index.md",
    "log.md",
    "wiki/index.md",
    "manifests/raw_sources.csv",
    "manifests/publication_review.csv",
]
REQUIRED_WIKI_FRONTMATTER = {"title", "tags", "category", "type", "status", "created", "updated", "sources", "summary"}
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
FRONTMATTER_END_RE = re.compile(r"\n---\s*\n")


@dataclass(frozen=True)
class LinkFinding:
    source_path: str
    target: str
    line: int
    context: str


def iter_markdown(root: Path):
    for current, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith("00 - ")]
        for name in names:
            if name in IGNORE_FILES:
                continue
            if name.endswith(".md"):
                yield Path(current) / name


def has_frontmatter(text: str) -> bool:
    return text.startswith("---\n") and FRONTMATTER_END_RE.search(text[4:]) is not None


def frontmatter_block(text: str) -> str:
    if not has_frontmatter(text):
        return ""
    return text.split("\n---\n", 1)[0].strip("-\n")


def frontmatter_keys(text: str) -> set[str]:
    keys = set()
    for line in frontmatter_block(text).splitlines():
        if ":" in line and not line.startswith((" ", "-")):
            keys.add(line.split(":", 1)[0].strip())
    return keys


def _parse_inline_list(value: str) -> list[str]:
    value = value.strip()
    if not (value.startswith("[") and value.endswith("]")):
        return [value.strip("\"'")] if value else []
    inner = value[1:-1].strip()
    if not inner:
        return []
    return [item.strip().strip("\"'") for item in inner.split(",") if item.strip()]


def frontmatter_values(text: str, key: str) -> list[str]:
    block = frontmatter_block(text)
    if not block:
        return []
    lines = block.splitlines()
    values: list[str] = []
    for idx, line in enumerate(lines):
        if line.startswith(f"{key}:"):
            raw = line.split(":", 1)[1].strip()
            if raw:
                values.extend(_parse_inline_list(raw))
            cursor = idx + 1
            while cursor < len(lines) and lines[cursor].startswith("  - "):
                values.append(lines[cursor].split("- ", 1)[1].strip().strip("\"'"))
                cursor += 1
            break
    return [v for v in values if v]


def frontmatter_scalar(text: str, key: str) -> str:
    values = frontmatter_values(text, key)
    return values[0] if values else ""


def strip_code_fences(text: str) -> str:
    output: list[str] = []
    in_fence = False
    for line in text.splitlines(keepends=True):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            output.append("\n" if line.endswith("\n") else "")
            continue
        output.append("\n" if in_fence and line.endswith("\n") else ("" if in_fence else line))
    return "".join(output)


def normalize_target(raw: str) -> str:
    raw = raw.replace("\\|", "|")
    target = raw.split("|", 1)[0].split("#", 1)[0].strip()
    if target.endswith(".md"):
        target = target[:-3]
    return target.replace("\\", "/").strip("/")


def target_variants(path: Path, root: Path, text: str) -> set[str]:
    rel = path.relative_to(root).with_suffix("").as_posix()
    variants = {rel, path.stem}
    title = frontmatter_scalar(text, "title").strip("\"'")
    if title:
        variants.add(title)
    for alias in frontmatter_values(text, "aliases"):
        variants.add(alias)
    return {v.strip("/") for v in variants if v}


def build_target_index(root: Path, files: list[Path]) -> set[str]:
    targets: set[str] = set()
    for path in files:
        text = path.read_text(encoding="utf-8", errors="replace")
        targets.update(target_variants(path, root, text))
    return targets


def link_line(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def iter_wikilink_findings(root: Path, files: list[Path], targets: set[str]) -> list[LinkFinding]:
    findings: list[LinkFinding] = []
    for path in files:
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        searchable = strip_code_fences(text)
        lines = searchable.splitlines()
        for match in WIKILINK_RE.finditer(searchable):
            target = normalize_target(match.group(1))
            if not target:
                continue
            if target in targets or Path(target).name in targets:
                continue
            line_number = link_line(searchable, match.start())
            context = lines[line_number - 1].strip() if line_number <= len(lines) else ""
            findings.append(LinkFinding(rel, match.group(1), line_number, context))
    return findings


def load_exceptions(root: Path) -> set[tuple[str, str]]:
    path = root / "manifests" / "wiki_check_exceptions.csv"
    if not path.exists():
        return set()
    exceptions: set[tuple[str, str]] = set()
    with path.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            source_path = (row.get("source_path") or "").strip()
            target = (row.get("target") or "").strip()
            if source_path and target:
                exceptions.add((source_path, target))
    return exceptions


def write_broken_links(root: Path, findings: list[LinkFinding]) -> None:
    path = root / "manifests" / "wiki_check_broken_links.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["source_path", "target", "line", "context"])
        writer.writeheader()
        for finding in findings:
            writer.writerow(
                {
                    "source_path": finding.source_path,
                    "target": finding.target,
                    "line": finding.line,
                    "context": finding.context,
                }
            )


def write_report(root: Path, report: dict[str, object]) -> None:
    path = root / "manifests" / "wiki_check_report.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    errors: list[str] = []
    frontmatter_warnings: list[str] = []

    for rel in REQUIRED_FILES:
        if not (root / rel).exists():
            errors.append(f"missing required file: {rel}")

    files = sorted(iter_markdown(root))
    targets = build_target_index(root, files)
    for path in files:
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        if rel.startswith("wiki/"):
            if not has_frontmatter(text):
                errors.append(f"missing frontmatter: {rel}")
            else:
                missing = REQUIRED_WIKI_FRONTMATTER - frontmatter_keys(text)
                if missing:
                    frontmatter_warnings.append(f"incomplete frontmatter: {rel} missing {', '.join(sorted(missing))}")

    findings = iter_wikilink_findings(root, files, targets)
    exceptions = load_exceptions(root)
    untriaged = [f for f in findings if (f.source_path, f.target) not in exceptions]
    exceptions_used = [f for f in findings if (f.source_path, f.target) in exceptions]

    write_broken_links(root, untriaged)
    report = {
        "vault": ".",
        "markdown_files_checked": len(files),
        "errors": len(errors),
        "frontmatter_warnings": len(frontmatter_warnings),
        "broken_wikilinks": len(findings),
        "untriaged_warnings": len(untriaged) + len(frontmatter_warnings),
        "exceptions_used": len(exceptions_used),
    }
    write_report(root, report)

    print(f"vault: {root}")
    print(f"markdown_files_checked: {len(files)}")
    print(f"errors: {len(errors)}")
    for error in errors:
        print(f"ERROR {error}")
    print(f"frontmatter_warnings: {len(frontmatter_warnings)}")
    for warning in frontmatter_warnings[:80]:
        print(f"WARN {warning}")
    if len(frontmatter_warnings) > 80:
        print(f"WARN truncated {len(frontmatter_warnings) - 80} additional frontmatter warnings")
    print(f"broken_wikilinks: {len(findings)}")
    print(f"untriaged_warnings: {len(untriaged) + len(frontmatter_warnings)}")
    print(f"exceptions_used: {len(exceptions_used)}")
    for finding in untriaged[:120]:
        print(f"WARN broken wikilink: {finding.source_path}:{finding.line} -> [[{finding.target}]]")
    if len(untriaged) > 120:
        print(f"WARN truncated {len(untriaged) - 120} additional untriaged broken links")
    print(f"report: {root / 'manifests' / 'wiki_check_report.json'}")
    print(f"broken_links_report: {root / 'manifests' / 'wiki_check_broken_links.csv'}")
    return 1 if errors or untriaged or frontmatter_warnings else 0


if __name__ == "__main__":
    raise SystemExit(main())
